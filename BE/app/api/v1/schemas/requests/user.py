from pydantic import BaseModel
from typing import Optional
from app.models.enums import UserRole

class CreateHRRequest(BaseModel):
    email: str
    group_id: int

class CreateEnduserRequest(BaseModel):
    name: str
    group_id: int

class UpdateUserRequest(BaseModel):
    email: Optional[str] = None
    name: Optional[str] = None
    picture: Optional[str] = None
    is_active: Optional[bool] = None
    role: Optional[UserRole] = None

def get_user_filters(
    role: Optional[UserRole] = None,
    is_active: Optional[bool] = None,
    skip: int = 0,
    limit: int = 100
) -> dict:
    return {
        "role": role,
        "is_active": is_active,
        "skip": skip,
        "limit": limit
    }