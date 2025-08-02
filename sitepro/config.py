from functools import lru_cache
from pydantic import BaseSettings, Field, SecretStr


class Settings(BaseSettings):
    """Application configuration loaded from environment variables or .env file."""

    # MongoDB
    mongo_uri: str = Field("mongodb://localhost:27017", env="MONGO_URI")
    mongo_db: str = Field("sitepro", env="MONGO_DB")

    # Redis (for idempotency + event bus)
    redis_uri: str = Field("redis://localhost:6379/0", env="REDIS_URI")

    # Diagnostic fee (USD) – will eventually come from pricing service
    diagnostic_fee: float = Field(90.0, env="DIAGNOSTIC_FEE")

    # OAuth / JWT
    jwt_secret: SecretStr = Field("CHANGE_ME", env="JWT_SECRET")

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


@lru_cache(maxsize=1)
def get_settings() -> Settings:  # FastAPI dependency helper
    return Settings() 