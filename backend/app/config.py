from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List
import os

class Settings(BaseSettings):
    APP_NAME: str = "K TECH PRODUCTION AND INDUSTRIES"
    APP_VERSION: str = "1.0.0"
    ENVIRONMENT: str = "production"
    DEBUG: bool = True
    DATABASE_URL: str = None
    SECRET_KEY: str = "dev-secret-key"
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    ALLOWED_ORIGINS: List[str] = [
        "https://ktech-production.up.railway.app",
        "https://ktech-industries.up.railway.app",
        "http://localhost:3000",
        "http://*.railway.app",
    ]

    POSTGRES_HOST: str = "postgres.railway.internal"
    POSTGRES_PORT: int = 5432
    POSTGRES_USER: str = "postgres"
    POSTGRES_PASSWORD: str = ""
    POSTGRES_DB: str = "railway"

    MONGODB_URI: str = "mongodb://localhost:27017"
    MONGODB_DB: str = "electroshop"

    REDIS_URL: str = ""

    JWT_SECRET_KEY: str
    JWT_REFRESH_SECRET_KEY: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  
    ALGORITHMS: str = "HS256"

    AT_API_KEY: str = None
    AT_USERNAME: str = "sandbox"
    AT_SENDER_ID: str = "K-TECH"

    MPESA_CONSUMER_KEY: str = None
    MPESA_CONSUMER_SECRET: str = None
    MPESA_PASSKEY: str = None
    MPESA_SHORTCODE: str = "174379"
    MPESA_CALLBACK_URL: str = None
    MPESA_ENVIRONMENT: str = "sandbox"

    SMTP_HOST: str = "smtp.gmail.com"
    SMTP_PORT: int = 587
    SMTP_USER: str = None
    SMTP_PASSWORD: str = None
    SMTP_FROM_EMAIL: str = None

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