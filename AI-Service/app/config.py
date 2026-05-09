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
    gemini_model: str = "gemini-2.5-flash"

    # Backend URL
    backend_url: str = "http://localhost:8080"

    # CORS
    allowed_origins: str = "http://localhost:4200,http://localhost:8080"

    # Rate limiting & retries
    gemini_max_concurrent: int = 2       # максимум одновременных запросов к Gemini
    gemini_max_retries: int = 4          # сколько раз повторять при 429/503
    gemini_retry_base_delay: float = 5.0 # начальная задержка между retry (секунды)

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
