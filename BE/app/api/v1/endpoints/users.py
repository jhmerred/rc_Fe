from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from typing import List, Optional

from app.core.database import get_session
from app.core.security import create_enduser_token
from app.models.user import User
from app.models.enums import UserRole
from app.models.group import Group, GroupMember
from app.models.enums import GroupMemberRole
from app.api.v1.dependencies import get_current_active_user
from app.api.v1.dependencies.permissions import require_admin, require_admin_or_self, require_hr_or_admin
from app.api.v1.schemas.requests.user import CreateHRRequest, CreateEnduserRequest, UpdateUserRequest, get_user_filters
from app.api.v1.schemas.responses.user import UserResponse, UserListResponse
from app.services.user import UserService
from app.services.group import GroupService

router = APIRouter(prefix="/users", tags=["users"])

@router.post("/hr", response_model=UserResponse)
async def create_hr(
    hr_data: CreateHRRequest,
    session: Session = Depends(get_session),
    current_user: User = Depends(require_admin())
):
    """Admin이 HR 생성"""
    
    # 그룹 확인
    group = session.get(Group, hr_data.group_id)
    if not group:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Group not found"
        )
    
    # 이메일 중복 확인
    user_service = UserService(session)
    existing_user = user_service.get_by_email(hr_data.email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User with this email already exists"
        )
    
    # HR 사용자 생성
    hr_user = User(
        email=hr_data.email,
        role=UserRole.HR
    )
    session.add(hr_user)
    session.commit()
    session.refresh(hr_user)
    
    # HR을 그룹의 관리자로 추가
    group_service = GroupService(session)
    group_service.add_member(hr_data.group_id, hr_user.id, GroupMemberRole.ADMIN)
    
    return UserResponse(
        id=hr_user.id,
        email=hr_user.email,
        name=hr_user.name,
        role=hr_user.role,
        is_active=hr_user.is_active,
        created_at=hr_user.created_at,
        updated_at=hr_user.updated_at
    )

@router.post("/enduser", response_model=UserResponse)
async def create_enduser(
    enduser_data: CreateEnduserRequest,
    session: Session = Depends(get_session),
    current_user: User = Depends(require_hr_or_admin())
):
    """Admin 또는 HR이 Enduser 생성"""
    
    # 그룹 확인
    group = session.get(Group, enduser_data.group_id)
    if not group:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Group not found"
        )
    
    # HR의 경우 자신이 속한 그룹에만 enduser 추가 가능
    if current_user.role == UserRole.HR:
        group_service = GroupService(session)
        if not group_service.is_group_admin(enduser_data.group_id, current_user.id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="HR can only add enduser to their own group"
            )
    
    # 토큰 생성
    enduser_token = create_enduser_token(enduser_data.name)
    
    # Enduser 생성
    enduser = User(
        name=enduser_data.name,
        role=UserRole.ENDUSER,
        enduser_token=enduser_token
    )
    session.add(enduser)
    session.commit()
    session.refresh(enduser)
    
    # 그룹 멤버로 추가
    group_service = GroupService(session)
    group_service.add_member(enduser_data.group_id, enduser.id, GroupMemberRole.MEMBER)
    
    return UserResponse(
        id=enduser.id,
        email=enduser.email,
        name=enduser.name,
        role=enduser.role,
        enduser_token=enduser.enduser_token,
        is_active=enduser.is_active,
        created_at=enduser.created_at,
        updated_at=enduser.updated_at
    )

@router.get("/me", response_model=UserResponse)
async def get_current_user_info(
    current_user: User = Depends(get_current_active_user)
):
    """현재 로그인한 사용자 정보 조회"""
    return UserResponse(
        id=current_user.id,
        email=current_user.email,
        name=current_user.name,
        role=current_user.role,
        enduser_token=current_user.enduser_token,
        is_active=current_user.is_active,
        google_id=current_user.google_id,
        picture=current_user.picture,
        created_at=current_user.created_at,
        updated_at=current_user.updated_at
    )

@router.get("/", response_model=UserListResponse)
async def list_users(
    filters: dict = Depends(get_user_filters),
    session: Session = Depends(get_session),
    current_user: User = Depends(require_admin())
):
    """사용자 목록 조회 (Admin만)"""
    user_service = UserService(session)
    
    # 필터 적용
    if filters["role"]:
        users = user_service.get_by_role(filters["role"], filters["skip"], filters["limit"])
        total = user_service.count_by_role(filters["role"])
    elif filters["is_active"] is not None:
        if filters["is_active"]:
            users = user_service.get_active_users(filters["skip"], filters["limit"])
        else:
            users = user_service.get_all(filters["skip"], filters["limit"])
            users = [u for u in users if not u.is_active]
        total = len(users)
    else:
        users = user_service.get_all(filters["skip"], filters["limit"])
        total = len(users)  # 실제로는 전체 카운트 쿼리 필요
    
    return UserListResponse(
        users=[UserResponse(
            id=user.id,
            email=user.email,
            name=user.name,
            role=user.role,
            enduser_token=user.enduser_token,
            is_active=user.is_active,
            google_id=user.google_id,
            picture=user.picture,
            created_at=user.created_at,
            updated_at=user.updated_at
        ) for user in users],
        total=total,
        skip=filters["skip"],
        limit=filters["limit"]
    )

@router.get("/{user_id}", response_model=UserResponse)
async def get_user(
    user_id: int,
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session)
):
    """사용자 상세 조회"""
    # 본인이거나 Admin만 가능
    if current_user.id != user_id and current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only view your own profile or be an admin"
        )
    
    user_service = UserService(session)
    user = user_service.get_by_id(user_id)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return UserResponse(
        id=user.id,
        email=user.email,
        name=user.name,
        role=user.role,
        enduser_token=user.enduser_token,
        is_active=user.is_active,
        google_id=user.google_id,
        picture=user.picture,
        created_at=user.created_at,
        updated_at=user.updated_at
    )

@router.put("/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: int,
    user_data: UpdateUserRequest,
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session)
):
    """사용자 정보 수정"""
    # 본인이거나 Admin만 가능
    if current_user.id != user_id and current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only update your own profile or be an admin"
        )
    
    # role 변경은 Admin만 가능
    if user_data.role and current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can change user roles"
        )
    
    user_service = UserService(session)
    updated_user = user_service.update(user_id, **user_data.dict(exclude_unset=True))
    
    if not updated_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return UserResponse(
        id=updated_user.id,
        email=updated_user.email,
        name=updated_user.name,
        role=updated_user.role,
        enduser_token=updated_user.enduser_token,
        is_active=updated_user.is_active,
        google_id=updated_user.google_id,
        picture=updated_user.picture,
        created_at=updated_user.created_at,
        updated_at=updated_user.updated_at
    )

@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(
    user_id: int,
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session)
):
    """사용자 삭제 (Admin만)"""
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can delete users"
        )
    
    # 자기 자신은 삭제 불가
    if current_user.id == user_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete yourself"
        )
    
    user_service = UserService(session)
    if not user_service.delete(user_id):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

@router.post("/{user_id}/deactivate", response_model=UserResponse)
async def deactivate_user(
    user_id: int,
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session)
):
    """사용자 비활성화 (Admin만)"""
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can deactivate users"
        )
    
    user_service = UserService(session)
    user = user_service.deactivate(user_id)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return UserResponse(
        id=user.id,
        email=user.email,
        name=user.name,
        role=user.role,
        enduser_token=user.enduser_token,
        is_active=user.is_active,
        google_id=user.google_id,
        picture=user.picture,
        created_at=user.created_at,
        updated_at=user.updated_at
    )

@router.post("/{user_id}/activate", response_model=UserResponse)
async def activate_user(
    user_id: int,
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session)
):
    """사용자 활성화 (Admin만)"""
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can activate users"
        )
    
    user_service = UserService(session)
    user = user_service.activate(user_id)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return UserResponse(
        id=user.id,
        email=user.email,
        name=user.name,
        role=user.role,
        enduser_token=user.enduser_token,
        is_active=user.is_active,
        google_id=user.google_id,
        picture=user.picture,
        created_at=user.created_at,
        updated_at=user.updated_at
    )