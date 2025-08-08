from typing import Optional
from datetime import datetime
from sqlmodel import Field, SQLModel, Relationship
from sqlalchemy import Column, String, DateTime, Boolean, Index
from app.models.base import TimestampMixin

class RefreshToken(TimestampMixin, table=True):
    __tablename__ = "refresh_tokens"
    __table_args__ = (
        Index("idx_refresh_jti", "jti"),
        Index("idx_user_id", "user_id"),
        {"mysql_engine": "InnoDB"}
    )
    
    id: Optional[int] = Field(default=None, primary_key=True)
    jti: str = Field(sa_column=Column(String(64), nullable=False, unique=True))

    # 토큰 정보
    user_id: int = Field(foreign_key="users.id")
    expires_at: datetime = Field(sa_column=Column(DateTime(timezone=True), nullable=False))
    is_active: bool = Field(default=True)
    
    # 디바이스/브라우저 정보 (여러 기기 관리용)
    device_info: Optional[str] = Field(default=None, sa_column=Column(String(200)))
    ip_address: Optional[str] = Field(default=None, sa_column=Column(String(45)))  # IPv6 지원
    
    # Relationships
    user: Optional["User"] = Relationship(back_populates="refresh_tokens")