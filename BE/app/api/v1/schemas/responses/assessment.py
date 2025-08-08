from pydantic import BaseModel
from typing import Optional, Dict, Any, List
from datetime import datetime
from app.models.enums import AssessmentType, AssessmentSessionStatus

class AssessmentResponse(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    type: AssessmentType
    group_id: int
    created_by_id: int
    content: Optional[Dict[str, Any]] = None
    settings: Optional[Dict[str, Any]] = None
    is_active: bool
    created_at: datetime
    updated_at: datetime

class AssessmentListResponse(BaseModel):
    assessments: List[AssessmentResponse]
    total: int
    skip: int
    limit: int

class AssessmentSessionResponse(BaseModel):
    id: int
    assessment_id: int
    user_id: int
    status: AssessmentSessionStatus
    started_at: datetime
    completed_at: Optional[datetime] = None
    session_metadata: Optional[Dict[str, Any]] = None
    created_at: datetime
    updated_at: datetime

class SessionListResponse(BaseModel):
    sessions: List[AssessmentSessionResponse]
    total: int
    skip: int
    limit: int

class AssessmentResultResponse(BaseModel):
    id: int
    session_id: int
    scores: Optional[Dict[str, Any]] = None
    analysis: Optional[Dict[str, Any]] = None
    feedback: Optional[str] = None
    created_at: datetime
    updated_at: datetime

class AssessmentChatResponse(BaseModel):
    id: int
    session_id: int
    message: str
    role: str
    metadata: Optional[Dict[str, Any]] = None
    created_at: datetime

class ChatListResponse(BaseModel):
    chats: List[AssessmentChatResponse]
    total: int

class AssessmentStatsResponse(BaseModel):
    total_sessions: int
    completed_sessions: int
    in_progress_sessions: int
    not_started_sessions: int
    average_completion_time: Optional[float] = None