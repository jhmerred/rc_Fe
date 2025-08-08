from fastapi import APIRouter
from app.api.v1.endpoints import auth, users, groups, tokens, assessments

api_router = APIRouter()

api_router.include_router(auth.router)
api_router.include_router(users.router)
api_router.include_router(groups.router)
api_router.include_router(tokens.router)
api_router.include_router(assessments.router)