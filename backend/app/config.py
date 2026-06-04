from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List

class Settings(BaseSettings):
    APP_NAME: str = "ElectroShop Kenya API"
    APP_VERSION: str = "1.0.0"
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/electroshop"
    SECRET_KEY: str
    HOST: str = "[IP_ADDRESS]"
    PORT: int = 8000

    POSTGRES_HOST: str = "localhost"
    POSTGRES_PORT: int = 5432
    POSTGRES_USER: str = "postgres"
    POSTGRES_PASSWORD: str = "postgres"
    POSTGRES_DB: str = "electroshop"

    MONGODB_URI: str = "mongodb://localhost:27017"
    MONGODB_DB: str = "electroshop"

    REDIS_URL: str = "redis://localhost:6379/0"

    JWT_SECRET_KEY: str
    JWT_REFRESH_SECRET_KEY: str

    AT_API_KEY: str
    AT_USERNAME: str = "sandbox"
    AT_SENDER_ID: str = "ElectroShop"

    MPESA_CONSUMER_KEY: str
    MPESA_CONSUMER_SECRET: str
    MPESA_PASSKEY: str
    MPESA_SHORTCODE: str
    MPESA_CALLBACK_URL: str
    MPESA_ENVIRONMENT: str = "sandbox"

    SMTP_HOST: str = "stmp.gmail.com"
    SMTP_PORT: int
    SMTP_USER: str
    SMTP_PASSWORD: str
    SMTP_FROM_EMAIL: str

    ALLOWED_ORIGINS: List[str] = []

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()