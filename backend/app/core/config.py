import os
from pathlib import Path
from typing import List
from pydantic_settings import BaseSettings

BASE_DIR = Path(__file__).resolve().parent.parent.parent
ROOT_DIR = BASE_DIR.parent

class Settings(BaseSettings):
    PROJECT_NAME: str = "ShilpAI"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    SECRET_KEY: str = os.getenv("SECRET_KEY", "shilpai_secure_production_secret_key_change_me_987654321")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    # Database - SQLite by default with easy swap to PostgreSQL via env var
    DATABASE_URL: str = os.getenv("DATABASE_URL", f"sqlite:///{BASE_DIR}/shilpai.db")
    
    # Upload and static file storage
    UPLOAD_DIR: str = os.getenv("UPLOAD_DIR", str(ROOT_DIR / "uploads"))
    
    # External AI APIs (Optional with deterministic smart fallbacks)
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    SPEECH_PROVIDER: str = os.getenv("SPEECH_PROVIDER", "browser")  # browser or whisper
    
    # CORS
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
        "*"
    ]

    class Config:
        case_sensitive = True
        env_file = ".env"
        extra = "ignore"

settings = Settings()

# Ensure upload subfolders exist
os.makedirs(os.path.join(settings.UPLOAD_DIR, "products"), exist_ok=True)
os.makedirs(os.path.join(settings.UPLOAD_DIR, "qrcodes"), exist_ok=True)
os.makedirs(os.path.join(settings.UPLOAD_DIR, "passports"), exist_ok=True)
os.makedirs(os.path.join(settings.UPLOAD_DIR, "enhanced"), exist_ok=True)
