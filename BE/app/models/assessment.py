from typing import Optional, List, TYPE_CHECKING
from datetime import datetime
from sqlmodel import Field, SQLModel, Relationship
from sqlalchemy import Column, String, Text, JSON
from app.models.base import TimestampMixin
from app.models.enums import AssessmentStatus, AssessmentSessionStatus, ChatRole

if TYPE_CHECKING:
    from app.models.user import User
    from app.models.group import Group

class Assessment(TimestampMixin, table=True):
    __tablename__ = "assessments"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    title: str = Field(sa_column=Column(String(200), nullable=False))
    description: Optional[str] = Field(default=None, sa_column=Column(Text))
    
    # 검사를 실시한 그룹과 관리자 정보
    group_id: int = Field(foreign_key="groups.id")
    created_by_id: int = Field(foreign_key="users.id")  # 검사를 생성한 그룹 관리자
    
    # 검사 설정
    status: AssessmentStatus = Field(default=AssessmentStatus.DRAFT, sa_column=Column(String(20), nullable=False))
    start_date: Optional[datetime] = Field(default=None)
    end_date: Optional[datetime] = Field(default=None)
    
    # 검사 내용 (JSON 형태로 저장 - 추후 확장 가능) ! ((현재 사용 x))
    content: Optional[dict] = Field(default=None, sa_column=Column(JSON))
    settings: Optional[dict] = Field(default=None, sa_column=Column(JSON))  # 시간제한, 재응시 가능 여부 등
    
    # Relationships
    group: Optional["Group"] = Relationship(back_populates="assessments")
    created_by: Optional["User"] = Relationship(back_populates="created_assessments")
    sessions: List["AssessmentSession"] = Relationship(back_populates="assessment", sa_relationship_kwargs={"cascade": "all, delete-orphan"})


class AssessmentSession(TimestampMixin, table=True):
    __tablename__ = "assessment_sessions"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    assessment_id: int = Field(foreign_key="assessments.id")
    user_id: int = Field(foreign_key="users.id")
    
    # 세션 상태 및 시간 정보
    status: AssessmentSessionStatus = Field(
        default=AssessmentSessionStatus.NOT_STARTED, 
        sa_column=Column(String(20), nullable=False)
    )
    started_at: Optional[datetime] = Field(default=None)
    completed_at: Optional[datetime] = Field(default=None)
    
    # 추가 메타데이터 ((현재 사용 x))
    session_metadata: Optional[dict] = Field(default=None, sa_column=Column(JSON))  # IP, 브라우저 정보 등
    
    # Relationships
    assessment: Optional[Assessment] = Relationship(back_populates="sessions")
    user: Optional["User"] = Relationship(back_populates="assessment_sessions")
    chats: List["AssessmentChat"] = Relationship(back_populates="session", sa_relationship_kwargs={"cascade": "all, delete-orphan"})
    result: Optional["AssessmentResult"] = Relationship(back_populates="session", sa_relationship_kwargs={"cascade": "all, delete-orphan", "uselist": False})
    
    class Config:
        # 한 사용자가 같은 검사를 여러 번 응시할 수 있도록 unique constraint 없음
        # 필요시 settings에서 제한 가능
        pass


class AssessmentResult(TimestampMixin, table=True):
    __tablename__ = "assessment_results"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    session_id: int = Field(foreign_key="assessment_sessions.id", unique=True)  # 한 세션당 하나의 결과
    
    # 종합 결과 ((현재 사용 x))
    final_score: Optional[float] = Field(default=None)  # 최종 점수
    category_scores: Optional[dict] = Field(default=None, sa_column=Column(JSON))  # 카테고리별 점수
    
    # 분석 결과 ((현재 사용 x))
    analysis: Optional[dict] = Field(default=None, sa_column=Column(JSON))  # 상세 분석 결과
    recommendations: Optional[dict] = Field(default=None, sa_column=Column(JSON))  # 추천사항
    
    # 리포트 관련
    report_generated: bool = Field(default=False)  # 리포트 생성 여부
    report_url: Optional[str] = Field(default=None, sa_column=Column(String(500)))  # 리포트 URL
    
    # Relationships
    session: Optional[AssessmentSession] = Relationship(back_populates="result")


class AssessmentChat(TimestampMixin, table=True):
    __tablename__ = "assessment_chats"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    session_id: int = Field(foreign_key="assessment_sessions.id")
    
    # 채팅 정보
    role: ChatRole = Field(sa_column=Column(String(20), nullable=False))
    content: str = Field(sa_column=Column(Text, nullable=False))
    
    # 순서 관리
    sequence_number: int = Field(nullable=False)  # 채팅 순서
    
    # 추가 정보 ((현재 사용 x))
    chat_metadata: Optional[dict] = Field(default=None, sa_column=Column(JSON))  # 응답 시간, 토큰 수 등
    
    # Relationships
    session: Optional[AssessmentSession] = Relationship(back_populates="chats")