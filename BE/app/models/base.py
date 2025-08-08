from datetime import datetime
from sqlmodel import SQLModel, Field
from sqlalchemy.sql import func

class TimestampMixin(SQLModel):
    created_at: datetime = Field(
        default_factory=datetime.utcnow,
        sa_column_kwargs={
            "nullable": False,
            "server_default": func.now()
        }
    )
    updated_at: datetime = Field(
        default_factory=datetime.utcnow,
        sa_column_kwargs={
            "nullable": False,
            "server_default": func.now(),
            "onupdate": func.now()
        }
    )
