from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from src.core.database import engine, init_db
from src.core.config import settings
from src.auth.router import router as auth_router
from src.auth.service import create_default_user
from src.categories.router import router as categories_router
from src.categories.service import ensure_defaults
from src.transactions.router import router as transactions_router
from src.reports.router import router as reports_router
from src.recurring.router import router as recurring_router
from src.accounts.router import router as accounts_router
from src.investments.router import router as investments_router
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.asyncio import AsyncSession

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize DB tables
    await init_db()
    # Ensure defaults on startup
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    async with async_session() as session:
        await create_default_user(session)
        await ensure_defaults(session)
    yield

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    lifespan=lifespan
)

# CORS
origins = [
    "http://localhost:5173", # Vite
    "http://localhost:5174", # Vite fallback
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router, prefix=f"{settings.API_V1_STR}/auth", tags=["auth"])
app.include_router(categories_router, prefix=f"{settings.API_V1_STR}/categories", tags=["categories"])
app.include_router(transactions_router, prefix=f"{settings.API_V1_STR}/transactions", tags=["transactions"])
app.include_router(reports_router, prefix=f"{settings.API_V1_STR}/reports", tags=["reports"])
app.include_router(recurring_router, prefix=f"{settings.API_V1_STR}/recurring", tags=["recurring"])
app.include_router(accounts_router, prefix=f"{settings.API_V1_STR}/accounts", tags=["accounts"])
app.include_router(investments_router, prefix=f"{settings.API_V1_STR}/investments", tags=["investments"])

@app.get("/")
async def root():
    return {"message": "Welcome to xpnsr API"}
