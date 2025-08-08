from sqlmodel import Session, select, func
from typing import Optional, Dict, Any, List
from app.models.user import User
from app.models.enums import UserRole

class UserService:
    def __init__(self, session: Session):
        self.session = session
    
    def get_by_id(self, user_id: int) -> Optional[User]:
        """ID로 사용자 조회"""
        return self.session.get(User, user_id)
    
    def get_by_email(self, email: str) -> Optional[User]:
        """이메일로 사용자 조회"""
        return self.session.exec(select(User).where(User.email == email)).first()

    def get_by_enduser_token(self, enduser_token: str) -> Optional[User]:
        """엔드유저 토큰으로 사용자 조회"""
        return self.session.exec(select(User).where(User.enduser_token == enduser_token)).first()
    
    def get_by_google_id(self, google_id: str) -> Optional[User]:
        """Google ID로 사용자 조회"""
        return self.session.exec(select(User).where(User.google_id == google_id)).first()
    
    def get_all(self, skip: int = 0, limit: int = 100) -> List[User]:
        """모든 사용자 조회"""
        return self.session.exec(
            select(User).offset(skip).limit(limit)
        ).all()
    
    def get_by_role(self, role: UserRole, skip: int = 0, limit: int = 100) -> List[User]:
        """역할별 사용자 조회"""
        return self.session.exec(
            select(User)
            .where(User.role == role)
            .offset(skip).limit(limit)
        ).all()
    
    def get_active_users(self, skip: int = 0, limit: int = 100) -> List[User]:
        """활성 사용자 조회"""
        return self.session.exec(
            select(User)
            .where(User.is_active == True)
            .offset(skip).limit(limit)
        ).all()
    
    def create(self, **user_data) -> User:
        """사용자 생성"""
        user = User(**user_data)
        self.session.add(user)
        self.session.commit()
        self.session.refresh(user)
        return user
    
    def update(self, user_id: int, **update_data) -> Optional[User]:
        """사용자 정보 업데이트"""
        user = self.get_by_id(user_id)
        if not user:
            return None
        
        for field, value in update_data.items():
            if hasattr(user, field) and value is not None:
                setattr(user, field, value)
        
        self.session.add(user)
        self.session.commit()
        self.session.refresh(user)
        return user
    
    def delete(self, user_id: int) -> bool:
        """사용자 삭제"""
        user = self.get_by_id(user_id)
        if not user:
            return False
        
        self.session.delete(user)
        self.session.commit()
        return True
    
    def deactivate(self, user_id: int) -> Optional[User]:
        """사용자 비활성화"""
        return self.update(user_id, is_active=False)
    
    def activate(self, user_id: int) -> Optional[User]:
        """사용자 활성화"""
        return self.update(user_id, is_active=True)
    
    def count_by_role(self, role: UserRole) -> int:
        """역할별 사용자 수"""
        result = self.session.exec(
            select(func.count(User.id)).where(User.role == role)
        ).one()
        return result
    
    def exists_by_email(self, email: str) -> bool:
        """이메일 존재 여부 확인"""
        return self.get_by_email(email) is not None
    
    def get_or_create_by_google(self, email: str, name: str, google_id: str, picture: str | None = None) -> User:
        """Google OAuth로 사용자 조회 또는 생성"""
        user = self.get_by_email(email)
        
        if not user:
            # 새 사용자 생성 (임시로 ADMIN 권한 부여)
            user = User(
                email=email,
                name=name,
                google_id=google_id,
                picture=picture,
                role=UserRole.ADMIN
            )
            self.session.add(user)
        else:
            # 기존 사용자 정보 업데이트
            user.name = name
            user.google_id = google_id
            if picture:
                user.picture = picture
            self.session.add(user)
        
        self.session.commit()
        self.session.refresh(user)
        return user
    
    def update_enduser_token(self, user_id: int, enduser_token: Optional[str]) -> Optional[User]:
        """사용자의 엔드유저 토큰 업데이트"""
        user = self.get_by_id(user_id)
        if user:
            user.enduser_token = enduser_token
            self.session.add(user)
            self.session.commit()
            self.session.refresh(user)
        return user