from pydantic import field_validator
from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    DATABASE_URL: str

    @field_validator("DATABASE_URL", mode="before")
    @classmethod
    def normalize_db_url(cls, v: str) -> str:
        if isinstance(v, str) and v.startswith("postgresql://"):
            return v.replace("postgresql://", "postgresql+asyncpg://", 1)
        return v
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 10080  # 7 days
    ANTHROPIC_API_KEY: str
    UPLOAD_DIR: str = "/app/uploads"
    MAX_FILE_SIZE_MB: int = 20
    ENVIRONMENT: str = "development"
    BACKEND_CORS_ORIGINS: List[str] = ["http://localhost:3000"]

    model_config = {"env_file": ".env"}


settings = Settings()
