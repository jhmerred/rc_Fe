from sqlmodel import Session, select
from typing import Optional, List
from app.models.group import Group, GroupMember
from app.models.enums import GroupMemberRole

class GroupService:
    def __init__(self, session: Session):
        self.session = session
    
    def get_by_id(self, group_id: int) -> Optional[Group]:
        return self.session.get(Group, group_id)
    
    def get_all(self, skip: int = 0, limit: int = 100) -> List[Group]:
        return self.session.exec(
            select(Group).offset(skip).limit(limit)
        ).all()
    
    def create(self, name: str, description: Optional[str], created_by_id: int) -> Group:
        group = Group(
            name=name,
            description=description,
            created_by_id=created_by_id
        )
        self.session.add(group)
        self.session.commit()
        self.session.refresh(group)
        return group
    
    def update(self, group_id: int, name: Optional[str] = None, description: Optional[str] = None) -> Optional[Group]:
        group = self.get_by_id(group_id)
        if not group:
            return None
        
        if name is not None:
            group.name = name
        if description is not None:
            group.description = description
        
        self.session.add(group)
        self.session.commit()
        self.session.refresh(group)
        return group
    
    def delete(self, group_id: int) -> bool:
        group = self.get_by_id(group_id)
        if not group:
            return False
        
        self.session.delete(group)
        self.session.commit()
        return True
    
    def add_member(self, group_id: int, user_id: int, role: GroupMemberRole = GroupMemberRole.MEMBER) -> Optional[GroupMember]:
        # 이미 멤버인지 확인
        existing = self.session.exec(
            select(GroupMember)
            .where(GroupMember.group_id == group_id)
            .where(GroupMember.user_id == user_id)
        ).first()
        
        if existing:
            return existing
        
        member = GroupMember(
            group_id=group_id,
            user_id=user_id,
            role=role
        )
        self.session.add(member)
        self.session.commit()
        self.session.refresh(member)
        return member
    
    def remove_member(self, group_id: int, user_id: int) -> bool:
        member = self.session.exec(
            select(GroupMember)
            .where(GroupMember.group_id == group_id)
            .where(GroupMember.user_id == user_id)
        ).first()
        
        if not member:
            return False
        
        self.session.delete(member)
        self.session.commit()
        return True
    
    def get_members(self, group_id: int) -> List[GroupMember]:
        return self.session.exec(
            select(GroupMember)
            .where(GroupMember.group_id == group_id)
        ).all()
    
    def is_group_member(self, group_id: int, user_id: int) -> bool:
        """사용자가 그룹의 멤버인지 확인"""
        member = self.session.exec(
            select(GroupMember)
            .where(GroupMember.group_id == group_id)
            .where(GroupMember.user_id == user_id)
        ).first()
        return member is not None
    
    def is_group_admin(self, group_id: int, user_id: int) -> bool:
        """사용자가 그룹의 관리자인지 확인"""
        member = self.session.exec(
            select(GroupMember)
            .where(GroupMember.group_id == group_id)
            .where(GroupMember.user_id == user_id)
            .where(GroupMember.role == GroupMemberRole.ADMIN)
        ).first()
        return member is not None