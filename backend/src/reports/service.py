from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, case, extract
from src.transactions.models import Transaction
from src.categories.models import Category, TransactionType
from datetime import datetime, timedelta
from typing import Optional
import uuid

class ReportService:
    def _make_naive(self, dt: Optional[datetime]) -> Optional[datetime]:
        if dt and dt.tzinfo:
            return dt.replace(tzinfo=None)
        return dt

    async def get_summary(self, session: AsyncSession, user_id: uuid.UUID, start_date: Optional[datetime], end_date: Optional[datetime]):
        start_date = self._make_naive(start_date)
        end_date = self._make_naive(end_date)
        
        query = select(
            func.sum(
                case(
                    (Transaction.type == TransactionType.INCOME, Transaction.amount),
                    else_=0
                )
            ).label("total_income"),
            func.sum(
                case(
                    (Transaction.type == TransactionType.EXPENSE, Transaction.amount),
                    else_=0
                )
            ).label("total_expense")
        ).where(Transaction.user_id == user_id)

        if start_date:
            query = query.where(Transaction.date >= start_date)
        if end_date:
            query = query.where(Transaction.date <= end_date)

        result = await session.execute(query)
        row = result.one()
        
        income = row.total_income or 0.0
        expense = row.total_expense or 0.0
        balance = income - expense
        
        # Savings rate
        savings_rate = 0.0
        if income > 0:
            savings_rate = ((income - expense) / income) * 100

        return {
            "total_balance": balance,
            "total_income": income,
            "total_expense": expense,
            "savings_rate": savings_rate
        }

    async def get_time_series(self, session: AsyncSession, user_id: uuid.UUID, start_date: datetime, end_date: datetime, period: str = "daily"):
        start_date = self._make_naive(start_date)
        end_date = self._make_naive(end_date)

        # We'll group by date. For simplicity/portability, simple date truncation.
        # SQLite/Postgres differences in date truncation are annoying in raw SQL, 
        # but SQLAlchemy 'func.date' usually works for YYYY-MM-DD.
        
        date_col = func.date(Transaction.date)
        
        query = select(
            date_col.label("date_label"),
            func.sum(
                case((Transaction.type == TransactionType.INCOME, Transaction.amount), else_=0)
            ).label("income"),
            func.sum(
                case((Transaction.type == TransactionType.EXPENSE, Transaction.amount), else_=0)
            ).label("expense")
        ).where(
            Transaction.user_id == user_id,
            Transaction.date >= start_date,
            Transaction.date <= end_date
        ).group_by(date_col).order_by(date_col)

        result = await session.execute(query)
        rows = result.all()
        
        # Transform map
        data = []
        for r in rows:
            data.append({
                "date": r.date_label,
                "income": r.income or 0.0,
                "expense": r.expense or 0.0
            })
            
        return data

    async def get_category_pie(self, session: AsyncSession, user_id: uuid.UUID, tx_type: TransactionType, start_date: Optional[datetime], end_date: Optional[datetime]):
        start_date = self._make_naive(start_date)
        end_date = self._make_naive(end_date)
        
        # Aliases for self-join
        from sqlalchemy.orm import aliased
        ParentCategory = aliased(Category)

        # Coalesce: if parent exists, use parent title, else use category title
        primary_title = func.coalesce(ParentCategory.title, Category.title).label("primary_title")

        query = select(
            primary_title,
            func.sum(Transaction.amount).label("value")
        ).join(Category, Transaction.category_id == Category.id)\
         .outerjoin(ParentCategory, Category.parent_category_id == ParentCategory.id)\
         .where(
             Transaction.user_id == user_id,
             Transaction.type == tx_type
         )

        if start_date:
            query = query.where(Transaction.date >= start_date)
        if end_date:
            query = query.where(Transaction.date <= end_date)

        query = query.group_by(primary_title).order_by(func.sum(Transaction.amount).desc())

        result = await session.execute(query)
        rows = result.all()

        return [{"name": r.primary_title, "value": r.value or 0.0} for r in rows]

report_service = ReportService()
