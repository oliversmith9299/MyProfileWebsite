from fastapi import APIRouter

from app.api.v1 import admin, auth, chat, content, engagement, oauth, questions

api_router = APIRouter(prefix="/api/v1")
api_router.include_router(auth.router)
api_router.include_router(oauth.router)
api_router.include_router(chat.router)
api_router.include_router(questions.router)
api_router.include_router(content.router)
api_router.include_router(engagement.router)
api_router.include_router(admin.router)
