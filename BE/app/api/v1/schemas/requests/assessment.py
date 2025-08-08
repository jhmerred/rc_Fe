from pydantic import BaseModel
from typing import Optional, Dict, Any, List
from app.models.enums import AssessmentType, AssessmentSessionStatus

class CreateAssessmentRequest(BaseModel):
    name: str
    description: Optional[str] = None
    type: AssessmentType
    group_id: int
    content: Optional[Dict[str, Any]] = None
    settings: Optional[Dict[str, Any]] = None

class UpdateAssessmentRequest(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    content: Optional[Dict[str, Any]] = None
    settings: Optional[Dict[str, Any]] = None
    is_active: Optional[bool] = None

class CreateSessionRequest(BaseModel):
    assessment_id: int
    user_ids: Optional[List[int]] = None  # None이면 그룹 전체

class UpdateSessionRequest(BaseModel):
    status: Optional[AssessmentSessionStatus] = None
    session_metadata: Optional[Dict[str, Any]] = None

class CreateChatRequest(BaseModel):
    message: str
    role: str = "user"  # user or assistant

class CreateResultRequest(BaseModel):
    session_id: int
    scores: Optional[Dict[str, Any]] = None
    analysis: Optional[Dict[str, Any]] = None
    feedback: Optional[str] = None