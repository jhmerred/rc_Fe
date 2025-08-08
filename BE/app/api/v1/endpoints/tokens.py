from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session
from typing import List

from app.core.database import get_session
from app.models.user import User
from app.models.enums import UserRole
from app.api.v1.dependencies import get_current_active_user
from app.api.v1.dependencies.permissions import require_admin
from app.api.v1.schemas.responses.token import RefreshTokenResponse, TokenListResponse, TokenStatsResponse
from app.services.token import TokenService

router = APIRouter(prefix="/tokens", tags=["tokens"])

@router.get("/", response_model=TokenListResponse)
async def list_tokens(
    skip: int = 0,
    limit: int = 100,
    active_only: bool = True,
    session: Session = Depends(get_session),
    current_user: User = Depends(require_admin())
):
    """토큰 목록 조회 (Admin만)"""
    
    service = TokenService(session)
    
    if active_only:
        tokens = service.get_active_tokens(skip, limit)
    else:
        tokens = service.get_all(skip, limit)
    
    total = len(tokens)  # 실제로는 전체 카운트 쿼리 필요
    
    return TokenListResponse(
        tokens=[RefreshTokenResponse(
            id=token.id,
            user_id=token.user_id,
            jti=token.jti,
            expires_at=token.expires_at,
            is_active=token.is_active,
            device_info=token.device_info,
            ip_address=token.ip_address,
            created_at=token.created_at,
            updated_at=token.updated_at
        ) for token in tokens],
        total=total,
        skip=skip,
        limit=limit
    )

@router.get("/my", response_model=TokenListResponse)
async def list_my_tokens(
    skip: int = 0,
    limit: int = 100,
    active_only: bool = True,
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session)
):
    """내 토큰 목록 조회"""
    service = TokenService(session)
    tokens = service.get_user_tokens(current_user.id, active_only, skip, limit)
    total = service.count_user_tokens(current_user.id, active_only)
    
    return TokenListResponse(
        tokens=[RefreshTokenResponse(
            id=token.id,
            user_id=token.user_id,
            jti=token.jti,
            expires_at=token.expires_at,
            is_active=token.is_active,
            device_info=token.device_info,
            ip_address=token.ip_address,
            created_at=token.created_at,
            updated_at=token.updated_at
        ) for token in tokens],
        total=total,
        skip=skip,
        limit=limit
    )

@router.get("/stats", response_model=TokenStatsResponse)
async def get_token_stats(
    session: Session = Depends(get_session),
    current_user: User = Depends(require_admin())
):
    """토큰 통계 조회 (Admin만)"""
    
    service = TokenService(session)
    
    # 간단한 통계 (실제로는 더 효율적인 쿼리 필요)
    all_tokens = service.get_all(limit=10000)
    active_tokens = [t for t in all_tokens if t.is_active]
    expired_tokens = [t for t in all_tokens if not t.is_active]
    
    return TokenStatsResponse(
        total_tokens=len(all_tokens),
        active_tokens=len(active_tokens),
        expired_tokens=len(expired_tokens)
    )

@router.delete("/{token_id}", status_code=status.HTTP_204_NO_CONTENT)
async def revoke_token(
    token_id: int,
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session)
):
    """토큰 폐기"""
    service = TokenService(session)
    token = service.get_by_id(token_id)
    
    if not token:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Token not found"
        )
    
    # 본인 토큰이거나 Admin만 가능
    if token.user_id != current_user.id and current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only revoke your own tokens or be an admin"
        )
    
    service.update(token_id, is_active=False)

@router.delete("/jti/{jti}", status_code=status.HTTP_204_NO_CONTENT)
async def revoke_token_by_jti(
    jti: str,
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session)
):
    """JTI로 토큰 폐기"""
    service = TokenService(session)
    token = service.get_by_jti(jti)
    
    if not token:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Token not found"
        )
    
    # 본인 토큰이거나 Admin만 가능
    if token.user_id != current_user.id and current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only revoke your own tokens or be an admin"
        )
    
    service.revoke_refresh_token(jti)

@router.post("/revoke-all", status_code=status.HTTP_204_NO_CONTENT)
async def revoke_all_my_tokens(
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session)
):
    """내 모든 토큰 폐기"""
    service = TokenService(session)
    count = service.revoke_all_user_tokens(current_user.id)
    
    return {"message": f"Revoked {count} tokens"}

@router.post("/cleanup", response_model=dict)
async def cleanup_expired_tokens(
    session: Session = Depends(get_session),
    current_user: User = Depends(require_admin())
):
    """만료된 토큰 정리 (Admin만)"""
    
    service = TokenService(session)
    count = service.cleanup_expired_tokens()
    
    return {"cleaned_up": count, "message": f"Cleaned up {count} expired tokens"}