from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "xpnsr"
    API_V1_STR: str = "/api/v1"
    
    POSTGRES_USER: str
    POSTGRES_PASSWORD: str
    POSTGRES_DB: str
    DATABASE_URL: str | None = None
    
    SECRET_KEY: str = "changethis"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    FIRST_SUPERUSER: str = "test@example.com"
    FIRST_SUPERUSER_PASSWORD: str = "password"

    @property
    def ASYNC_DATABASE_URL(self) -> str:
        if self.DATABASE_URL:
            return self.DATABASE_URL
        return f"postgresql+asyncpg://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@localhost:5432/{self.POSTGRES_DB}"

    class Config:
        env_file = ".env"

settings = Settings()
