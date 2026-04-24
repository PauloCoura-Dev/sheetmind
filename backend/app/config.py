import json
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
    # Plain str to avoid pydantic_settings JSON-parsing before validators run
    BACKEND_CORS_ORIGINS: str = '["http://localhost:3000"]'

    @property
    def cors_origins(self) -> List[str]:
        v = self.BACKEND_CORS_ORIGINS.strip()
        if not v:
            return ["http://localhost:3000"]
        try:
            result = json.loads(v)
            return result if isinstance(result, list) else [result]
        except json.JSONDecodeError:
            return [o.strip() for o in v.split(",") if o.strip()]

    model_config = {"env_file": ".env"}


settings = Settings()
