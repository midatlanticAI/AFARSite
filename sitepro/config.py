from functools import lru_cache
from pydantic_settings import BaseSettings
from pydantic import Field, SecretStr


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

    # External tool integrations (optional)
    voicepro_base_url: str = Field("", env="VOICEPRO_BASE_URL")
    voicepro_safe_mode: bool = Field(True, env="VOICEPRO_SAFE_MODE")
    chatpro_base_url: str = Field("", env="CHATPRO_BASE_URL")
    repairpro_base_url: str = Field("", env="REPAIRPRO_BASE_URL")

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        extra = "ignore"


@lru_cache(maxsize=1)
def get_settings() -> Settings:  # FastAPI dependency helper
    return Settings() 