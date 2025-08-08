from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from app.models.enums import UserRole

class UserResponse(BaseModel):
    id: int
    email: Optional[str] = None
    name: Optional[str] = None
    role: UserRole
    enduser_token: Optional[str] = None
    is_active: bool
    google_id: Optional[str] = None
    picture: Optional[str] = None
    created_at: datetime
    updated_at: datetime

class UserListResponse(BaseModel):
    users: List[UserResponse]
    total: int
    skip: int
    limit: int