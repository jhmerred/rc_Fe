from sqlalchemy import event
from sqlmodel import Session
from datetime import datetime
from app.models.base import TimestampMixin

@event.listens_for(Session, "before_flush")
def auto_update_updated_at(session, flush_context, instances):
    for obj in session.dirty:
        if isinstance(obj, TimestampMixin):
            obj.updated_at = datetime.utcnow()
