from pydantic import BaseModel

class EnduserLoginRequest(BaseModel):
    token: str
    name: str