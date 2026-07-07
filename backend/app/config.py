from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List


class Settings(BaseSettings):
    APP_NAME: str = "K TECH PRODUCTION AND INDUSTRIES"
    APP_VERSION: str = "1.0.0"
    ENVIRONMENT: str = "production"
    DEBUG: bool = True
    DATABASE_URL: str = "postgresql+asyncpg://postgres:Mankaloko@localhost:5432/electroshop"
    SECRET_KEY: str = "dev-secret-key"
    HOST: str = "0.0.0.0"
    PORT: int = 8000

    POSTGRES_HOST: str = "localhost"
    POSTGRES_PORT: int = 5432
    POSTGRES_USER: str = "postgres"
    POSTGRES_PASSWORD: str = "Mankaloko"
    POSTGRES_DB: str = "electroshop"

    MONGODB_URI: str = "mongodb://localhost:27017"
    MONGODB_DB: str = "electroshop"

    REDIS_URL: str = "redis://localhost:6379/0"

    JWT_SECRET_KEY: str = "dev-jwt-secret"
    JWT_REFRESH_SECRET_KEY: str = "dev-refresh-secret"

    AT_API_KEY: str = "dummy"
    AT_USERNAME: str = "sandbox"
    AT_SENDER_ID: str = "ElectroShop"

    MPESA_CONSUMER_KEY: str = "dummy"
    MPESA_CONSUMER_SECRET: str = "dummy"
    MPESA_PASSKEY: str = "dummy"
    MPESA_SHORTCODE: str = "dummy"
    MPESA_CALLBACK_URL: str = "https://example.com"
    MPESA_ENVIRONMENT: str = "sandbox"

    SMTP_HOST: str = "smtp.gmail.com"
    SMTP_PORT: int = 587
    SMTP_USER: str = "dummy"
    SMTP_PASSWORD: str = "dummy"
    SMTP_FROM_EMAIL: str = "dummy@example.com"

    ALLOWED_ORIGINS: List[str] = ["*"]

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

    @property
    def is_production(self) -> bool:
        return self.ENVIRONMENT == "production"

    @property
    def is_development(self) -> bool:
        return self.ENVIRONMENT == "development"

    @property
    def is_testing(self) -> bool:
        return self.ENVIRONMENT == "testing"


settings = Settings()