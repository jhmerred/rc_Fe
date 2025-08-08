from typing import Optional, List, TYPE_CHECKING
from sqlmodel import Field, Relationship
from app.models.base import TimestampMixin
from app.models.enums import UserRole

if TYPE_CHECKING:
    from app.models.group import GroupMember, Group
    from app.models.assessment import Assessment, AssessmentSession
    from app.models.token import RefreshToken

class User(TimestampMixin, table=True):
    __tablename__ = "users"
    
    id: Optional[int] = Field(default=None, primary_key=True)

    email: Optional[str] = Field(default=None, index=True, max_length=255)
    google_id: Optional[str] = Field(default=None, index=True, max_length=255)
    picture: Optional[str] = Field(default=None, max_length=500)

    name: Optional[str] = Field(default=None, max_length=100)
    is_active: bool = Field(default=True)
    role: UserRole = Field(default=UserRole.ENDUSER, max_length=20)

    enduser_token: Optional[str] = Field(default=None, max_length=255, index=True)
    
    # Relationships
    group_memberships: List["GroupMember"] = Relationship(back_populates="user", sa_relationship_kwargs={"cascade": "all, delete-orphan"})
    created_groups: List["Group"] = Relationship(back_populates="created_by")
    created_assessments: List["Assessment"] = Relationship(back_populates="created_by")
    assessment_sessions: List["AssessmentSession"] = Relationship(back_populates="user")
    refresh_tokens: List["RefreshToken"] = Relationship(back_populates="user", sa_relationship_kwargs={"cascade": "all, delete-orphan"})