from pydantic import BaseModel
from typing import Optional
from app.models.enums import GroupMemberRole

class CreateGroupRequest(BaseModel):
    name: str
    description: Optional[str] = None

class UpdateGroupRequest(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    is_active: Optional[bool] = None

class AddGroupMemberRequest(BaseModel):
    user_id: int
    role: GroupMemberRole = GroupMemberRole.MEMBER

class UpdateGroupMemberRequest(BaseModel):
    role: GroupMemberRole