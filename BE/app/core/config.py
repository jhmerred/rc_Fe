import os
from typing import Optional
from dotenv import load_dotenv

# .env 파일 로드
load_dotenv()

class Settings:
    # JWT Settings
    SECRET_KEY: str = os.getenv("SECRET_KEY", "your-secret-key-here-change-in-production")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 30
    
    # Google OAuth Settings
    GOOGLE_CLIENT_ID: str = os.getenv("GOOGLE_CLIENT_ID", "")
    GOOGLE_CLIENT_SECRET: str = os.getenv("GOOGLE_CLIENT_SECRET", "")
    GOOGLE_REDIRECT_URI: str = os.getenv("GOOGLE_REDIRECT_URI", "https://ec2-13-209-6-117.ap-northeast-2.compute.amazonaws.com/api/v1/auth/google/callback")
    
    # App Settings
    APP_NAME: str = "FastAPI Google OAuth"
    API_PREFIX: str = "/api/v1"
    
    # Frontend URL (for CORS)
    FRONTEND_URL: str = os.getenv("FRONTEND_URL", "https://ec2-13-209-6-117.ap-northeast-2.compute.amazonaws.com")
    
    # Database Settings
    DATABASE_URL: str = os.getenv("DATABASE_URL", "mysql+pymysql://root:1tkddydwkdql@localhost:3306/qpin")
    
    # OpenAI Settings
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "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")
    OPENAI_MODEL: str = os.getenv("OPENAI_MODEL", "gpt-4-turbo-preview")
    OPENAI_MAX_TOKENS: int = int(os.getenv("OPENAI_MAX_TOKENS", "2000"))
    OPENAI_TEMPERATURE: float = float(os.getenv("OPENAI_TEMPERATURE", "0.7"))

settings = Settings()