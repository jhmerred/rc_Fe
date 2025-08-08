from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session
from typing import List, Optional
from datetime import datetime

from app.core.database import get_session
from app.models.user import User
from app.models.enums import UserRole, AssessmentStatus, AssessmentSessionStatus
from app.api.v1.dependencies import get_current_active_user
from app.api.v1.dependencies.groups import require_group_admin, require_group_member
from app.api.v1.schemas.requests.assessment import (
    CreateAssessmentRequest, UpdateAssessmentRequest, 
    CreateSessionRequest, UpdateSessionRequest,
    CreateChatRequest, CreateResultRequest
)
from app.api.v1.schemas.responses.assessment import (
    AssessmentResponse, AssessmentListResponse,
    AssessmentSessionResponse, SessionListResponse,
    AssessmentResultResponse, AssessmentChatResponse,
    ChatListResponse, AssessmentStatsResponse
)
from app.services.assessment import AssessmentService
from app.services.group import GroupService

router = APIRouter(prefix="/assessments", tags=["assessments"])

@router.post("/", response_model=AssessmentResponse)
async def create_assessment(
    assessment_data: CreateAssessmentRequest,
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session)
):
    """평가 생성 (Admin 또는 그룹 관리자)"""
    group_service = GroupService(session)
    
    # Admin이거나 해당 그룹의 관리자만 가능
    if current_user.role != UserRole.ADMIN and not group_service.is_group_admin(assessment_data.group_id, current_user.id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins or group admins can create assessments"
        )
    
    service = AssessmentService(session)
    assessment = service.create(
        name=assessment_data.name,
        description=assessment_data.description,
        type=assessment_data.type,
        group_id=assessment_data.group_id,
        created_by_id=current_user.id,
        content=assessment_data.content,
        settings=assessment_data.settings
    )
    
    return AssessmentResponse(
        id=assessment.id,
        name=assessment.name,
        description=assessment.description,
        type=assessment.type,
        group_id=assessment.group_id,
        created_by_id=assessment.created_by_id,
        content=assessment.content,
        settings=assessment.settings,
        is_active=assessment.is_active,
        created_at=assessment.created_at,
        updated_at=assessment.updated_at
    )

@router.get("/", response_model=AssessmentListResponse)
async def list_assessments(
    skip: int = 0,
    limit: int = 100,
    group_id: Optional[int] = None,
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session)
):
    """평가 목록 조회"""
    service = AssessmentService(session)
    group_service = GroupService(session)
    
    if group_id:
        # 특정 그룹의 평가 조회 (그룹 멤버만 가능)
        if current_user.role != UserRole.ADMIN and not group_service.is_group_member(group_id, current_user.id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You are not a member of this group"
            )
        assessments = service.get_by_group(group_id, skip, limit)
    else:
        # Admin은 모든 평가, 그 외는 자신이 속한 그룹의 평가만
        if current_user.role == UserRole.ADMIN:
            assessments = service.get_all(skip, limit)
        else:
            # 사용자가 속한 그룹들의 평가 조회
            from app.models.group import GroupMember
            members = session.query(GroupMember).filter_by(user_id=current_user.id).all()
            group_ids = [m.group_id for m in members]
            
            assessments = []
            for gid in group_ids:
                assessments.extend(service.get_by_group(gid))
    
    total = len(assessments)
    
    return AssessmentListResponse(
        assessments=[AssessmentResponse(
            id=a.id,
            name=a.name,
            description=a.description,
            type=a.type,
            group_id=a.group_id,
            created_by_id=a.created_by_id,
            content=a.content,
            settings=a.settings,
            is_active=a.is_active,
            created_at=a.created_at,
            updated_at=a.updated_at
        ) for a in assessments[skip:skip+limit]],
        total=total,
        skip=skip,
        limit=limit
    )

@router.get("/{assessment_id}", response_model=AssessmentResponse)
async def get_assessment(
    assessment_id: int,
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session)
):
    """평가 상세 조회"""
    service = AssessmentService(session)
    assessment = service.get_by_id(assessment_id)
    
    if not assessment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Assessment not found"
        )
    
    # 권한 확인
    group_service = GroupService(session)
    if current_user.role != UserRole.ADMIN and not group_service.is_group_member(assessment.group_id, current_user.id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not a member of this group"
        )
    
    return AssessmentResponse(
        id=assessment.id,
        name=assessment.name,
        description=assessment.description,
        type=assessment.type,
        group_id=assessment.group_id,
        created_by_id=assessment.created_by_id,
        content=assessment.content,
        settings=assessment.settings,
        is_active=assessment.is_active,
        created_at=assessment.created_at,
        updated_at=assessment.updated_at
    )

@router.put("/{assessment_id}", response_model=AssessmentResponse)
async def update_assessment(
    assessment_id: int,
    assessment_data: UpdateAssessmentRequest,
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session)
):
    """평가 수정"""
    service = AssessmentService(session)
    assessment = service.get_by_id(assessment_id)
    
    if not assessment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Assessment not found"
        )
    
    # 권한 확인
    group_service = GroupService(session)
    if current_user.role != UserRole.ADMIN and not group_service.is_group_admin(assessment.group_id, current_user.id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins or group admins can update assessments"
        )
    
    updated = service.update(assessment_id, **assessment_data.dict(exclude_unset=True))
    
    return AssessmentResponse(
        id=updated.id,
        name=updated.name,
        description=updated.description,
        type=updated.type,
        group_id=updated.group_id,
        created_by_id=updated.created_by_id,
        content=updated.content,
        settings=updated.settings,
        is_active=updated.is_active,
        created_at=updated.created_at,
        updated_at=updated.updated_at
    )

@router.delete("/{assessment_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_assessment(
    assessment_id: int,
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session)
):
    """평가 삭제"""
    service = AssessmentService(session)
    assessment = service.get_by_id(assessment_id)
    
    if not assessment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Assessment not found"
        )
    
    # Admin만 가능
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can delete assessments"
        )
    
    service.delete(assessment_id)

# Session 관련 엔드포인트
@router.post("/{assessment_id}/sessions", response_model=List[AssessmentSessionResponse])
async def create_sessions(
    assessment_id: int,
    session_data: CreateSessionRequest,
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session)
):
    """평가 세션 생성"""
    service = AssessmentService(session)
    assessment = service.get_by_id(assessment_id)
    
    if not assessment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Assessment not found"
        )
    
    # 권한 확인
    group_service = GroupService(session)
    if current_user.role != UserRole.ADMIN and not group_service.is_group_admin(assessment.group_id, current_user.id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins or group admins can create sessions"
        )
    
    # 대상 사용자 결정
    if session_data.user_ids:
        user_ids = session_data.user_ids
    else:
        # 그룹 전체 멤버
        members = group_service.get_members(assessment.group_id)
        user_ids = [m.user_id for m in members if m.user.role == UserRole.ENDUSER]
    
    # 세션 생성
    sessions = []
    for user_id in user_ids:
        # 이미 세션이 있는지 확인
        if not service.exists_session(assessment_id, user_id):
            session_obj = service.create_session(
                assessment_id=assessment_id,
                user_id=user_id,
                status=AssessmentSessionStatus.NOT_STARTED
            )
            sessions.append(session_obj)
    
    return [AssessmentSessionResponse(
        id=s.id,
        assessment_id=s.assessment_id,
        user_id=s.user_id,
        status=s.status,
        started_at=s.started_at,
        completed_at=s.completed_at,
        session_metadata=s.session_metadata,
        created_at=s.created_at,
        updated_at=s.updated_at
    ) for s in sessions]

@router.get("/{assessment_id}/sessions", response_model=SessionListResponse)
async def list_sessions(
    assessment_id: int,
    skip: int = 0,
    limit: int = 100,
    status: Optional[AssessmentSessionStatus] = None,
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session)
):
    """평가 세션 목록 조회"""
    service = AssessmentService(session)
    assessment = service.get_by_id(assessment_id)
    
    if not assessment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Assessment not found"
        )
    
    # 권한 확인
    group_service = GroupService(session)
    if current_user.role != UserRole.ADMIN and not group_service.is_group_member(assessment.group_id, current_user.id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not a member of this group"
        )
    
    if status:
        sessions = service.get_sessions_by_status(status, skip, limit)
        sessions = [s for s in sessions if s.assessment_id == assessment_id]
    else:
        sessions = service.get_sessions_by_assessment(assessment_id, skip, limit)
    
    total = service.count_sessions_by_assessment(assessment_id)
    
    return SessionListResponse(
        sessions=[AssessmentSessionResponse(
            id=s.id,
            assessment_id=s.assessment_id,
            user_id=s.user_id,
            status=s.status,
            started_at=s.started_at,
            completed_at=s.completed_at,
            session_metadata=s.session_metadata,
            created_at=s.created_at,
            updated_at=s.updated_at
        ) for s in sessions],
        total=total,
        skip=skip,
        limit=limit
    )

@router.get("/sessions/my", response_model=SessionListResponse)
async def list_my_sessions(
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session)
):
    """내 평가 세션 목록 조회"""
    service = AssessmentService(session)
    sessions = service.get_sessions_by_user(current_user.id, skip, limit)
    total = len(sessions)  # 실제로는 count 쿼리 필요
    
    return SessionListResponse(
        sessions=[AssessmentSessionResponse(
            id=s.id,
            assessment_id=s.assessment_id,
            user_id=s.user_id,
            status=s.status,
            started_at=s.started_at,
            completed_at=s.completed_at,
            session_metadata=s.session_metadata,
            created_at=s.created_at,
            updated_at=s.updated_at
        ) for s in sessions],
        total=total,
        skip=skip,
        limit=limit
    )

@router.get("/{assessment_id}/stats", response_model=AssessmentStatsResponse)
async def get_assessment_stats(
    assessment_id: int,
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session)
):
    """평가 통계 조회"""
    service = AssessmentService(session)
    assessment = service.get_by_id(assessment_id)
    
    if not assessment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Assessment not found"
        )
    
    # 권한 확인
    group_service = GroupService(session)
    if current_user.role != UserRole.ADMIN and not group_service.is_group_admin(assessment.group_id, current_user.id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins or group admins can view stats"
        )
    
    # 통계 계산
    sessions = service.get_sessions_by_assessment(assessment_id, limit=10000)
    total = len(sessions)
    completed = len([s for s in sessions if s.status == AssessmentSessionStatus.COMPLETED])
    in_progress = len([s for s in sessions if s.status == AssessmentSessionStatus.IN_PROGRESS])
    not_started = len([s for s in sessions if s.status == AssessmentSessionStatus.NOT_STARTED])
    
    # 평균 완료 시간 계산
    completion_times = []
    for s in sessions:
        if s.status == AssessmentSessionStatus.COMPLETED and s.completed_at and s.started_at:
            duration = (s.completed_at - s.started_at).total_seconds() / 60  # 분 단위
            completion_times.append(duration)
    
    avg_time = sum(completion_times) / len(completion_times) if completion_times else None
    
    return AssessmentStatsResponse(
        total_sessions=total,
        completed_sessions=completed,
        in_progress_sessions=in_progress,
        not_started_sessions=not_started,
        average_completion_time=avg_time
    )