import os
from typing import List, Union

try:
    from pydantic_settings import BaseSettings
except ImportError:
    try:
        from pydantic import BaseSettings
    except ImportError:
        from pydantic import BaseModel
        class BaseSettings(BaseModel):
            pass

class Settings(BaseSettings):
    PROJECT_NAME: str = "MIRA Ops Intelligence"
    API_V1_STR: str = "/api"
    SECRET_KEY: str = "supersecret_jwt_key_for_mira_ops_prototype_change_in_production"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 480
    
    # Database - Default to SQLite file for zero-config testing if PostgreSQL not connected
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL", 
        "sqlite:///./mira_ops.db"
    )

    # LLM Keys
    ANTHROPIC_API_KEY: str = os.getenv("ANTHROPIC_API_KEY", "")
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")

    # CORS
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://*.vercel.app",
    ]

    class Config:
        case_sensitive = True
        env_file = ".env"

settings = Settings()

