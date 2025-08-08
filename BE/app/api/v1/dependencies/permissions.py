from typing import List
from fastapi import Depends, HTTPException, status
from sqlmodel import Session
from app.core.database import get_session
from app.models.user import User
from app.models.enums import UserRole
from app.api.v1.dependencies.auth import get_current_active_user

def require_role(allowed_roles: List[UserRole]):
    def role_checker(current_user: User = Depends(get_current_active_user)):
        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"권한이 없습니다. 필요한 역할: {', '.join(allowed_roles)}"
            )
        return current_user
    return role_checker

def require_admin():
    return require_role([UserRole.ADMIN])

def require_hr_or_admin():
    return require_role([UserRole.HR, UserRole.ADMIN])

def require_admin_or_self(user_id: int):
    def checker(current_user: User = Depends(get_current_active_user)):
        if current_user.role != UserRole.ADMIN and current_user.id != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Admin 권한이 필요하거나 본인만 접근 가능합니다"
            )
        return current_user
    return checker

def require_hr_for_group(group_id: int):
    def checker(
        current_user: User = Depends(get_current_active_user),
        session: Session = Depends(get_session)
    ):
        from app.services.group import GroupService
        
        if current_user.role == UserRole.ADMIN:
            return current_user
        
        if current_user.role != UserRole.HR:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="HR 또는 Admin 권한이 필요합니다"
            )
        
        # HR의 경우 해당 그룹의 멤버인지 확인
        service = GroupService(session)
        if not service.is_group_member(group_id, current_user.id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="해당 그룹의 멤버만 접근 가능합니다"
            )
        
        return current_user
    return checker