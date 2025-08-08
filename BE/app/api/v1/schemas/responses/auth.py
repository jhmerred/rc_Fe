from pydantic import BaseModel
from typing import Optional

class TokenResponse(BaseModel):
    access_token: str
    refresh_token: Optional[str] = None
    token_type: str = "bearer"

class AuthCheckResponse(BaseModel):
    authenticated: bool
    user_id: int
    name: Optional[str] = None