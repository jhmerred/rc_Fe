from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class RefreshTokenResponse(BaseModel):
    id: int
    user_id: int
    jti: str
    expires_at: datetime
    is_active: bool
    device_info: Optional[str] = None
    ip_address: Optional[str] = None
    created_at: datetime
    updated_at: datetime

class TokenListResponse(BaseModel):
    tokens: List[RefreshTokenResponse]
    total: int
    skip: int
    limit: int

class TokenStatsResponse(BaseModel):
    total_tokens: int
    active_tokens: int
    expired_tokens: int