"""
Configuration module for AI Service
"""
from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    """Application settings loaded from environment variables"""

    # Server Configuration
    host: str = "0.0.0.0"
    port: int = 8000

    # Google Gemini Configuration
    gemini_api_key: str = ""
    gemini_model: str = "gemini-2.0-flash"

    # Backend URL
    backend_url: str = "http://localhost:8080"

    # CORS
    allowed_origins: str = "http://localhost:4200,http://localhost:8080"

    # Logging
    log_level: str = "INFO"

    class Config:
        env_file = ".env"
        case_sensitive = False

    @property
    def cors_origins(self) -> list[str]:
        """Parse CORS origins from comma-separated string"""
        return [origin.strip() for origin in self.allowed_origins.split(",")]


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance"""
    return Settings()
