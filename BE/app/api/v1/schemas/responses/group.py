from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from app.models.enums import GroupMemberRole

class GroupResponse(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    is_active: bool
    created_by_id: int
    created_at: datetime
    updated_at: datetime

class GroupListResponse(BaseModel):
    groups: List[GroupResponse]
    total: int
    skip: int
    limit: int

class GroupMemberResponse(BaseModel):
    id: int
    user_id: int
    group_id: int
    role: GroupMemberRole
    user_name: Optional[str] = None
    user_email: Optional[str] = None
    created_at: datetime

class GroupWithMembersResponse(GroupResponse):
    members: List[GroupMemberResponse] = []
    member_count: int = 0