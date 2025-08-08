from typing import Optional, List, TYPE_CHECKING
from sqlmodel import Field, SQLModel, Relationship
from sqlalchemy import Column, String, UniqueConstraint
from app.models.base import TimestampMixin
from app.models.enums import GroupMemberRole

if TYPE_CHECKING:
    from app.models.user import User
    from app.models.assessment import Assessment

class Group(TimestampMixin, table=True):
    __tablename__ = "groups"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(sa_column=Column(String(100), nullable=False))
    description: Optional[str] = Field(default=None, sa_column=Column(String(500)))
    is_active: bool = Field(default=True)
    created_by_id: int = Field(foreign_key="users.id")
    
    # Relationships
    members: List["GroupMember"] = Relationship(back_populates="group", sa_relationship_kwargs={"cascade": "all, delete-orphan"})
    assessments: List["Assessment"] = Relationship(back_populates="group")
    created_by: Optional["User"] = Relationship(back_populates="created_groups")

class GroupMember(TimestampMixin, table=True):
    __tablename__ = "group_members"
    __table_args__ = (
        UniqueConstraint("user_id", "group_id", name="unique_user_group"),
        {"mysql_engine": "InnoDB"}
    )
    
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="users.id")
    group_id: int = Field(foreign_key="groups.id")
    role: GroupMemberRole = Field(default=GroupMemberRole.MEMBER, sa_column=Column(String(20), nullable=False))
    
    # Relationships
    user: Optional["User"] = Relationship(back_populates="group_memberships")
    group: Optional[Group] = Relationship(back_populates="members")