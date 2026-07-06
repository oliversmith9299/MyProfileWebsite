from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    app_name: str = "Afnan Hany — AI Brand Platform API"
    debug: bool = False

    database_url: str = "postgresql+psycopg://afnan:afnan@localhost:5432/brandplatform"
    redis_url: str = "redis://localhost:6379/0"

    secret_key: str = "dev-only-secret"
    access_token_expire_minutes: int = 60
    admin_email: str = "afnanhany18@gmail.com"
    admin_password: str = "change-me"

    # Any OpenAI-compatible provider (OpenAI, DeepInfra, Together, …).
    # For DeepInfra: OPENAI_BASE_URL=https://api.deepinfra.com/v1/openai
    openai_api_key: str = ""
    openai_base_url: str = ""
    chat_model: str = "gpt-4o-mini"
    embedding_model: str = "text-embedding-3-small"
    embedding_dim: int = 1536
    rag_confidence_threshold: float = 0.32
    rag_top_k: int = 6

    resend_api_key: str = ""
    notify_email: str = "afnanhany18@gmail.com"
    from_email: str = "ai@afnanhany.dev"

    google_client_id: str = ""
    google_client_secret: str = ""
    github_client_id: str = ""
    github_client_secret: str = ""

    cors_origins: str = "http://localhost:3000"
    site_url: str = "http://localhost:3000"

    chat_rate_limit_per_minute: int = 20

    @property
    def cors_origin_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]

    @property
    def sqlalchemy_url(self) -> str:
        """Normalize managed-Postgres URLs (Railway/Heroku give postgres[ql]://)
        to SQLAlchemy's psycopg3 driver scheme."""
        url = self.database_url
        if url.startswith("postgres://"):
            return url.replace("postgres://", "postgresql+psycopg://", 1)
        if url.startswith("postgresql://"):
            return url.replace("postgresql://", "postgresql+psycopg://", 1)
        return url


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
