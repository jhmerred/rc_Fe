from fastapi import APIRouter, Depends, HTTPException, Response, Cookie, Request, status
from fastapi.responses import RedirectResponse
from sqlmodel import Session, select
from datetime import timedelta
import httpx
from urllib.parse import urlencode
from typing import Optional

from app.core.database import get_session
from app.core.config import settings
from app.core.security import create_access_token, create_refresh_token, verify_refresh_token, verify_enduser_token
from app.models.user import User
from app.api.v1.dependencies import get_current_active_user
from app.api.v1.schemas.requests.auth import EnduserLoginRequest
from app.api.v1.schemas.responses.auth import TokenResponse, AuthCheckResponse
from app.services.user import UserService

router = APIRouter(prefix="/auth", tags=["auth"])

@router.get("/google")
async def google_login():
    """Google OAuth 로그인 시작"""
    params = {
        "client_id": settings.GOOGLE_CLIENT_ID,
        "redirect_uri": settings.GOOGLE_REDIRECT_URI,
        "response_type": "code",
        "scope": "email profile",
        "access_type": "offline",
        "prompt": "select_account"
    }
    url = f"https://accounts.google.com/o/oauth2/v2/auth?{urlencode(params)}"
    return RedirectResponse(url)

@router.get("/google/callback")
async def google_callback(
    code: str,
    session: Session = Depends(get_session)
):
    """Google OAuth 콜백 처리"""
    async with httpx.AsyncClient() as client:
        token_response = await client.post(
            "https://oauth2.googleapis.com/token",
            data={
                "code": code,
                "client_id": settings.GOOGLE_CLIENT_ID,
                "client_secret": settings.GOOGLE_CLIENT_SECRET,
                "redirect_uri": settings.GOOGLE_REDIRECT_URI,
                "grant_type": "authorization_code"
            }
        )
        
        if token_response.status_code != 200:
            raise HTTPException(status_code=400, detail="Failed to get access token")
        
        token_data = token_response.json()
        access_token = token_data["access_token"]
        
        user_response = await client.get(
            "https://www.googleapis.com/oauth2/v2/userinfo",
            headers={"Authorization": f"Bearer {access_token}"}
        )
        
        if user_response.status_code != 200:
            raise HTTPException(status_code=400, detail="Failed to get user info")
        
        user_data = user_response.json()
    
    user_service = UserService(session)
    user = user_service.get_or_create_by_google(
        email=user_data["email"],
        name=user_data.get("name", ""),
        google_id=user_data["id"],
        picture=user_data.get("picture", "")
    )
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={
            "sub": str(user.id),
            "role": user.role.value
        }, 
        expires_delta=access_token_expires
    )
    
    # 5. 리프레시 토큰 생성
    refresh_token_expires = timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    refresh_token, refresh_expires_at = create_refresh_token(
        session,
        data={"sub": str(user.id)},
        expires_delta=refresh_token_expires
    )
    
    # 6. 리프레시 토큰을 DB에 저장
    from app.models.token import RefreshToken
    from app.services.token import TokenService
    
    # JWT에서 JTI 추출
    payload = verify_refresh_token(refresh_token)
    jti = payload.get("jti")
    
    token_service = TokenService(session)
    token_service.create_refresh_token(
        user_id=user.id,
        jti=jti,
        expires_at=refresh_expires_at,
        device_info=code[:50],  # 임시로 code의 일부를 device info로 사용
        ip_address="127.0.0.1"  # 추후 실제 IP 주소로 변경
    )
    
    # 7. 프론트엔드로 리다이렉트 (액세스 토큰은 쿼리 파라미터로)
    frontend_url = f"{settings.FRONTEND_URL}/callback?token={access_token}"
    response = RedirectResponse(url=frontend_url)
    
    # 8. 리프레시 토큰은 HTTP-only 쿠키로 설정
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        secure=True,  # HTTPS에서만 전송
        samesite="lax",  # CSRF 방지
        max_age=settings.REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60  # 초 단위
    )
    
    return response

@router.post("/refresh")
async def refresh_token(
    refresh_token: Optional[str] = Cookie(None),
    session: Session = Depends(get_session)
):
    """리프레시 토큰으로 새 액세스 토큰 발급"""
    if not refresh_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token not provided"
        )
    
    # 리프레시 토큰 검증
    payload = verify_refresh_token(refresh_token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token"
        )
    
    # DB에서 리프레시 토큰 확인 (JTI로 검증)
    from app.services.token import TokenService
    token_service = TokenService(session)
    
    jti = payload.get("jti")
    if not jti:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token - missing JTI"
        )
    
    db_token = token_service.validate_refresh_token(jti)
    if not db_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token"
        )
    
    # 사용자 정보 조회
    user_id = payload.get("sub")
    try:
        user_id = int(user_id)
        user = session.get(User, user_id)
    except (ValueError, TypeError):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid user ID in token"
        )
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # 새 액세스 토큰 생성
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    new_access_token = create_access_token(
        data={
            "sub": str(user.id),
            "role": user.role.value
        },
        expires_delta=access_token_expires
    )
    
    return TokenResponse(access_token=new_access_token)

@router.post("/logout")
async def logout(
    refresh_token: Optional[str] = Cookie(None),
    session: Session = Depends(get_session),
    response: Response = Response()
):
    """로그아웃 (리프레시 토큰 폐기)"""
    if refresh_token:
        from app.services.token import TokenService
        token_service = TokenService(session)
        # 토큰에서 JTI 추출
        payload = verify_refresh_token(refresh_token)
        if payload and payload.get("jti"):
            token_service.revoke_refresh_token(payload.get("jti"))
    
    # 쿠키 삭제
    response.delete_cookie(key="refresh_token")
    
    return {"message": "Successfully logged out"}

@router.get("/check", response_model=AuthCheckResponse)
async def check_auth(current_user: User = Depends(get_current_active_user)):
    """인증 상태 확인"""
    return AuthCheckResponse(
        authenticated=True,
        user_id=current_user.id,
        name=current_user.name
    )

@router.post("/enduser/login")
async def enduser_login(
    login_data: EnduserLoginRequest,
    session: Session = Depends(get_session)
):
    """Enduser Token 로그인"""
    # 토큰 검증
    if not verify_enduser_token(login_data.token, login_data.name):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token or name"
        )
    
    # 사용자 조회
    user_service = UserService(session)
    user = user_service.get_by_enduser_token(login_data.token)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # 이름이 일치하는지 확인
    if user.name != login_data.name:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Name does not match"
        )
    
    # JWT 토큰 생성
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={
            "sub": str(user.id),
            "role": user.role.value
        },
        expires_delta=access_token_expires
    )
    
    # 리프레시 토큰 생성
    refresh_token_expires = timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    refresh_token, refresh_expires_at = create_refresh_token(
        session,
        data={"sub": str(user.id)},
        expires_delta=refresh_token_expires
    )
    
    # 리프레시 토큰을 DB에 저장
    payload = verify_refresh_token(refresh_token)
    jti = payload.get("jti")
    
    from app.services.token import TokenService
    token_service = TokenService(session)
    token_service.create_refresh_token(
        user_id=user.id,
        jti=jti,
        expires_at=refresh_expires_at,
        device_info="enduser_login",
        ip_address="127.0.0.1"
    )
    
    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token
    )