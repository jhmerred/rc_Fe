from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session
from typing import List, Optional

from app.core.database import get_session
from app.models.user import User
from app.models.group import Group, GroupMember
from app.models.enums import UserRole, GroupMemberRole
from app.api.v1.dependencies import get_current_active_user
from app.api.v1.dependencies.groups import require_group_admin, require_group_member
from app.api.v1.dependencies.permissions import require_admin
from app.api.v1.schemas.requests.group import CreateGroupRequest, UpdateGroupRequest, AddGroupMemberRequest, UpdateGroupMemberRequest
from app.api.v1.schemas.responses.group import GroupResponse, GroupListResponse, GroupMemberResponse, GroupWithMembersResponse
from app.services.group import GroupService

router = APIRouter(prefix="/groups", tags=["groups"])

@router.post("/", response_model=GroupResponse)
async def create_group(
    group_data: CreateGroupRequest,
    session: Session = Depends(get_session),
    current_user: User = Depends(require_admin())
):
    """Admin이 새 그룹 생성"""
    
    service = GroupService(session)
    group = service.create(
        name=group_data.name,
        description=group_data.description,
        created_by_id=current_user.id
    )
    
    return GroupResponse(
        id=group.id,
        name=group.name,
        description=group.description,
        is_active=group.is_active,
        created_by_id=group.created_by_id,
        created_at=group.created_at,
        updated_at=group.updated_at
    )

@router.get("/", response_model=GroupListResponse)
async def list_groups(
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session)
):
    """그룹 목록 조회"""
    service = GroupService(session)
    
    # Admin은 모든 그룹, 그 외는 자신이 속한 그룹만
    if current_user.role == UserRole.ADMIN:
        groups = service.get_all(skip, limit)
        total = len(groups)  # 실제로는 count 쿼리 필요
    else:
        # 사용자가 속한 그룹 조회
        members = session.query(GroupMember).filter_by(user_id=current_user.id).all()
        group_ids = [m.group_id for m in members]
        groups = [service.get_by_id(gid) for gid in group_ids]
        groups = [g for g in groups if g is not None]
        total = len(groups)
    
    return GroupListResponse(
        groups=[GroupResponse(
            id=group.id,
            name=group.name,
            description=group.description,
            is_active=group.is_active,
            created_by_id=group.created_by_id,
            created_at=group.created_at,
            updated_at=group.updated_at
        ) for group in groups],
        total=total,
        skip=skip,
        limit=limit
    )

@router.get("/{group_id}", response_model=GroupWithMembersResponse)
async def get_group(
    group_id: int,
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session)
):
    """그룹 상세 조회"""
    service = GroupService(session)
    group = service.get_by_id(group_id)
    
    if not group:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Group not found"
        )
    
    # Admin이거나 그룹 멤버만 조회 가능
    if current_user.role != UserRole.ADMIN and not service.is_group_member(group_id, current_user.id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not a member of this group"
        )
    
    # 멤버 정보 가져오기
    members = service.get_members(group_id)
    member_responses = []
    
    for member in members:
        if member.user:
            member_responses.append(GroupMemberResponse(
                id=member.id,
                user_id=member.user_id,
                group_id=member.group_id,
                role=member.role,
                user_name=member.user.name,
                user_email=member.user.email,
                created_at=member.created_at
            ))
    
    return GroupWithMembersResponse(
        id=group.id,
        name=group.name,
        description=group.description,
        is_active=group.is_active,
        created_by_id=group.created_by_id,
        created_at=group.created_at,
        updated_at=group.updated_at,
        members=member_responses,
        member_count=len(member_responses)
    )

@router.put("/{group_id}", response_model=GroupResponse)
async def update_group(
    group_id: int,
    group_data: UpdateGroupRequest,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_active_user)
):
    """그룹 정보 수정 (그룹 관리자만)"""
    service = GroupService(session)
    
    # 권한 확인
    if current_user.role != UserRole.ADMIN and not service.is_group_admin(group_id, current_user.id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins or group admins can update groups"
        )
    
    group = service.update(
        group_id,
        name=group_data.name,
        description=group_data.description
    )
    
    if not group:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Group not found"
        )
    
    return GroupResponse(
        id=group.id,
        name=group.name,
        description=group.description,
        is_active=group.is_active,
        created_by_id=group.created_by_id,
        created_at=group.created_at,
        updated_at=group.updated_at
    )

@router.delete("/{group_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_group(
    group_id: int,
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session)
):
    """그룹 삭제 (Admin만)"""
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can delete groups"
        )
    
    service = GroupService(session)
    if not service.delete(group_id):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Group not found"
        )

@router.get("/{group_id}/members", response_model=List[GroupMemberResponse])
async def list_group_members(
    group_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_active_user)
):
    """그룹 멤버 목록 조회 (그룹 멤버만)"""
    service = GroupService(session)
    
    # 권한 확인
    if current_user.role != UserRole.ADMIN and not service.is_group_member(group_id, current_user.id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not a member of this group"
        )
    
    members = service.get_members(group_id)
    
    return [
        GroupMemberResponse(
            id=member.id,
            user_id=member.user_id,
            group_id=member.group_id,
            role=member.role,
            user_name=member.user.name if member.user else None,
            user_email=member.user.email if member.user else None,
            created_at=member.created_at
        )
        for member in members
    ]

@router.post("/{group_id}/members", response_model=GroupMemberResponse)
async def add_group_member(
    group_id: int,
    member_data: AddGroupMemberRequest,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_active_user)
):
    """그룹에 멤버 추가 (그룹 관리자만)"""
    service = GroupService(session)
    
    # 권한 확인
    if current_user.role != UserRole.ADMIN and not service.is_group_admin(group_id, current_user.id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins or group admins can add members"
        )
    
    # 사용자 확인
    user = session.get(User, member_data.user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    member = service.add_member(group_id, member_data.user_id, member_data.role)
    
    return GroupMemberResponse(
        id=member.id,
        user_id=member.user_id,
        group_id=member.group_id,
        role=member.role,
        user_name=user.name,
        user_email=user.email,
        created_at=member.created_at
    )

@router.put("/{group_id}/members/{user_id}", response_model=GroupMemberResponse)
async def update_member_role(
    group_id: int,
    user_id: int,
    role_data: UpdateGroupMemberRequest,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_active_user)
):
    """멤버 역할 변경 (그룹 관리자만)"""
    service = GroupService(session)
    
    # 권한 확인
    if current_user.role != UserRole.ADMIN and not service.is_group_admin(group_id, current_user.id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins or group admins can update member roles"
        )
    
    # 자기 자신의 역할은 변경 불가
    if user_id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot change your own role"
        )
    
    # 멤버 찾기
    members = service.get_members(group_id)
    member = next((m for m in members if m.user_id == user_id), None)
    
    if not member:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Member not found in this group"
        )
    
    # 역할 업데이트
    member.role = role_data.role
    session.add(member)
    session.commit()
    session.refresh(member)
    
    return GroupMemberResponse(
        id=member.id,
        user_id=member.user_id,
        group_id=member.group_id,
        role=member.role,
        user_name=member.user.name if member.user else None,
        user_email=member.user.email if member.user else None,
        created_at=member.created_at
    )

@router.delete("/{group_id}/members/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_group_member(
    group_id: int,
    user_id: int,
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session)
):
    """그룹에서 멤버 제거"""
    service = GroupService(session)
    
    # 관리자이거나 본인인 경우만 가능
    is_admin = service.is_group_admin(group_id, current_user.id)
    is_self = user_id == current_user.id
    
    if not (is_admin or is_self):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only group admins or the member themselves can remove members"
        )
    
    if not service.remove_member(group_id, user_id):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Member not found in this group"
        )