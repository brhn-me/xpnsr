from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from src.core.database import get_session
from src.core.deps import get_current_user
from src.auth.models import User
from src.reports.service import report_service
from src.categories.models import TransactionType
from datetime import datetime, timedelta
from typing import Optional, List

router = APIRouter()

@router.get("/summary")
async def get_summary(
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session)
):
    return await report_service.get_summary(session, current_user.id, start_date, end_date)

@router.get("/time-series")
async def get_time_series(
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    period: str = "daily",
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session)
):
    if not start_date:
        start_date = datetime.utcnow() - timedelta(days=30)
    if not end_date:
        end_date = datetime.utcnow()

    return await report_service.get_time_series(session, current_user.id, start_date, end_date, period)

@router.get("/category-pie")
async def get_category_pie(
    type: TransactionType,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_session)
):
    return await report_service.get_category_pie(session, current_user.id, type, start_date, end_date)
