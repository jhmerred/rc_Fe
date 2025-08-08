from fastapi import Depends, HTTPException, status
from sqlmodel import Session
from app.core.database import get_session
from app.models.user import User
from app.models.enums import UserRole
from app.api.v1.dependencies.auth import get_current_active_user
from app.services.group import GroupService

def require_group_admin(group_id: int):
    def admin_checker(
        current_user: User = Depends(get_current_active_user),
        session: Session = Depends(get_session)
    ):
        service = GroupService(session)
        if current_user.role != UserRole.ADMIN and not service.is_group_admin(group_id, current_user.id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only admins or group admins can perform this action"
            )
        return current_user
    return admin_checker

def require_group_member(group_id: int):
    def member_checker(
        current_user: User = Depends(get_current_active_user),
        session: Session = Depends(get_session)
    ):
        service = GroupService(session)
        if current_user.role != UserRole.ADMIN and not service.is_group_member(group_id, current_user.id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You are not a member of this group"
            )
        return current_user
    return member_checker