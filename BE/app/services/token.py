from typing import Optional, List
from datetime import datetime
from sqlmodel import Session, select, func
from app.models.token import RefreshToken
from app.models.user import User

class TokenService:
    def __init__(self, session: Session):
        self.session = session
    
    def get_by_id(self, token_id: int) -> Optional[RefreshToken]:
        """ID로 토큰 조회"""
        return self.session.get(RefreshToken, token_id)
    
    def get_by_jti(self, jti: str) -> Optional[RefreshToken]:
        """JTI로 토큰 조회"""
        return self.session.exec(
            select(RefreshToken).where(RefreshToken.jti == jti)
        ).first()
    
    def get_all(self, skip: int = 0, limit: int = 100) -> List[RefreshToken]:
        """모든 토큰 조회"""
        return self.session.exec(
            select(RefreshToken)
            .order_by(RefreshToken.created_at.desc())
            .offset(skip).limit(limit)
        ).all()
    
    def get_active_tokens(self, skip: int = 0, limit: int = 100) -> List[RefreshToken]:
        """활성 토큰 조회"""
        return self.session.exec(
            select(RefreshToken)
            .where(RefreshToken.is_active == True)
            .where(RefreshToken.expires_at > datetime.utcnow())
            .order_by(RefreshToken.created_at.desc())
            .offset(skip).limit(limit)
        ).all()
    
    def create(self, **token_data) -> RefreshToken:
        """토큰 생성"""
        token = RefreshToken(**token_data)
        self.session.add(token)
        self.session.commit()
        self.session.refresh(token)
        return token
    
    def update(self, token_id: int, **update_data) -> Optional[RefreshToken]:
        """토큰 정보 업데이트"""
        token = self.get_by_id(token_id)
        if not token:
            return None
        
        for field, value in update_data.items():
            if hasattr(token, field) and value is not None:
                setattr(token, field, value)
        
        self.session.add(token)
        self.session.commit()
        self.session.refresh(token)
        return token
    
    def delete(self, token_id: int) -> bool:
        """토큰 삭제"""
        token = self.get_by_id(token_id)
        if not token:
            return False
        
        self.session.delete(token)
        self.session.commit()
        return True
    
    def delete_by_jti(self, jti: str) -> bool:
        """JTI로 토큰 삭제"""
        token = self.get_by_jti(jti)
        if not token:
            return False
        
        self.session.delete(token)
        self.session.commit()
        return True
    
    def count_user_tokens(self, user_id: int, active_only: bool = True) -> int:
        """사용자별 토큰 수"""
        query = select(func.count()).select_from(RefreshToken).where(RefreshToken.user_id == user_id)
        if active_only:
            query = query.where(RefreshToken.is_active == True)
        return self.session.exec(query).one()
    
    def get_user_tokens(self, user_id: int, active_only: bool = True, skip: int = 0, limit: int = 100) -> List[RefreshToken]:
        """사용자별 토큰 조회"""
        query = select(RefreshToken).where(RefreshToken.user_id == user_id)
        if active_only:
            query = query.where(RefreshToken.is_active == True)
        query = query.order_by(RefreshToken.created_at.desc()).offset(skip).limit(limit)
        return self.session.exec(query).all()
    
    def exists_by_jti(self, jti: str) -> bool:
        """JTI 존재 여부 확인"""
        return self.get_by_jti(jti) is not None
    
    def create_refresh_token(
        self, 
        user_id: int, 
        jti: str, 
        expires_at: datetime,
        device_info: Optional[str] = None,
        ip_address: Optional[str] = None
    ) -> RefreshToken:
        """리프레시 토큰 생성 및 저장 (기존 메서드 호환성)"""
        return self.create(
            user_id=user_id,
            jti=jti,
            expires_at=expires_at,
            device_info=device_info,
            ip_address=ip_address,
            is_active=True
        )
    
    def get_refresh_token(self, jti: str) -> Optional[RefreshToken]:
        """JTI로 리프레시 토큰 조회 (기존 메서드 호환성)"""
        token = self.get_by_jti(jti)
        if token and token.is_active:
            return token
        return None
    
    def validate_refresh_token(self, jti: str) -> Optional[RefreshToken]:
        """리프레시 토큰 유효성 검사"""
        refresh_token = self.get_refresh_token(jti)
        
        if not refresh_token:
            return None
            
        # 만료 시간 확인
        if refresh_token.expires_at < datetime.utcnow():
            # 만료된 토큰은 비활성화
            refresh_token.is_active = False
            self.session.add(refresh_token)
            self.session.commit()
            return None
            
        return refresh_token
    
    def revoke_refresh_token(self, jti: str) -> bool:
        """리프레시 토큰 폐기 (기존 메서드 호환성)"""
        token = self.get_by_jti(jti)
        if token:
            return self.update(token.id, is_active=False) is not None
        return False
    
    def revoke_all_user_tokens(self, user_id: int) -> int:
        """사용자의 모든 리프레시 토큰 폐기"""
        tokens = self.session.exec(
            select(RefreshToken).where(
                RefreshToken.user_id == user_id,
                RefreshToken.is_active == True
            )
        ).all()
        
        count = 0
        for token in tokens:
            token.is_active = False
            self.session.add(token)
            count += 1
            
        self.session.commit()
        return count
    
    def get_user_active_tokens(self, user_id: int) -> List[RefreshToken]:
        """사용자의 활성 토큰 목록 조회 (기존 메서드 호환성)"""
        return self.get_user_tokens(user_id, active_only=True)
    
    def cleanup_expired_tokens(self) -> int:
        """만료된 토큰 정리"""
        expired_tokens = self.session.exec(
            select(RefreshToken).where(
                RefreshToken.expires_at < datetime.utcnow(),
                RefreshToken.is_active == True
            )
        ).all()
        
        count = 0
        for token in expired_tokens:
            token.is_active = False
            self.session.add(token)
            count += 1
            
        self.session.commit()
        return count