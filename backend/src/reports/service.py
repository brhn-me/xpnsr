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

        # Grouping by date based on period
        if period == "monthly":
            date_col = func.date_trunc('month', Transaction.date)
        elif period == "weekly":
            date_col = func.date_trunc('week', Transaction.date)
        else: # daily
            date_col = func.date_trunc('day', Transaction.date)
        
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
                "date": r.date_label, # This will be a datetime matching the truncate start
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

    async def get_yearly_summary(self, session: AsyncSession, user_id: uuid.UUID, year: int):
        start_date = datetime(year, 1, 1)
        # End of year is start of next year minus 1 microsecond, or just use < next year start
        end_date = datetime(year, 12, 31, 23, 59, 59)
        
        return await self.get_time_series(session, user_id, start_date, end_date, period="monthly")

    async def get_category_trends(self, session: AsyncSession, user_id: uuid.UUID, year: int, limit: int = 5):
        start_date = datetime(year, 1, 1)
        end_date = datetime(year, 12, 31, 23, 59, 59)
        
        # 1. Get Top Categories by total expense in the year
        # Aliases for self-join to resolve parent properly
        from sqlalchemy.orm import aliased
        ParentCategory = aliased(Category)
        
        # Coalesce: if parent exists, use parent title, else use category title. 
        # This groups specific subcategories under their main parent.
        primary_title_col = func.coalesce(ParentCategory.title, Category.title).label("primary_title")
        
        top_cats_query = select(
            primary_title_col,
            func.sum(Transaction.amount).label("total")
        ).join(Category, Transaction.category_id == Category.id)\
         .outerjoin(ParentCategory, Category.parent_category_id == ParentCategory.id)\
         .where(
             Transaction.user_id == user_id,
             Transaction.type == TransactionType.EXPENSE,
             Transaction.date >= start_date,
             Transaction.date <= end_date
         ).group_by(primary_title_col).order_by(func.sum(Transaction.amount).desc()).limit(limit)
         
        top_cats_res = await session.execute(top_cats_query)
        top_categories = [row.primary_title for row in top_cats_res.all()]
        
        if not top_categories:
            return []

        # 2. Get Monthly Data for these categories
        date_col = func.date_trunc('month', Transaction.date).label("month")
        
        trends_query = select(
            date_col,
            primary_title_col,
            func.sum(Transaction.amount).label("amount")
        ).join(Category, Transaction.category_id == Category.id)\
         .outerjoin(ParentCategory, Category.parent_category_id == ParentCategory.id)\
         .where(
             Transaction.user_id == user_id,
             Transaction.type == TransactionType.EXPENSE,
             Transaction.date >= start_date,
             Transaction.date <= end_date,
             primary_title_col.in_(top_categories)
         ).group_by(date_col, primary_title_col).order_by(date_col)
         
        trends_res = await session.execute(trends_query)
        rows = trends_res.all()
        
        # Transform into list of { month: "...", Category1: 100, Category2: 200 }
        # Initialize map with all months? Or just rely on data present. 
        # Recharts works better with consistent keys, but we can handle sparsely.
        
        # Structure: { "2024-01-01": { "Food": 100 }, "2024-02-01": { "Food": 150 } }
        temp_map = {}
        
        for r in rows:
            m_str = r.month.isoformat() if r.month else ""
            if m_str not in temp_map:
                temp_map[m_str] = {"date": m_str}
            temp_map[m_str][r.primary_title] = r.amount or 0.0
            
        result = list(temp_map.values())
        # Ensure it's sorted by date
        result.sort(key=lambda x: x["date"])
        
        return {
            "categories": top_categories,
            "data": result
        }

    async def get_daily_activity(self, session: AsyncSession, user_id: uuid.UUID, year: int):
        start_date = datetime(year, 1, 1)
        end_date = datetime(year, 12, 31, 23, 59, 59)
        
        # Group by day
        date_col = func.date_trunc('day', Transaction.date).label("day")
        
        query = select(
            date_col,
            func.count(Transaction.id).label("count"),
            func.sum(Transaction.amount).label("total_amount")
        ).where(
            Transaction.user_id == user_id,
            Transaction.type == TransactionType.EXPENSE, # Focus on spending
            Transaction.date >= start_date,
            Transaction.date <= end_date
        ).group_by(date_col).order_by(date_col)
        
        result = await session.execute(query)
        rows = result.all()
        
        return [
            {
                "date": r.day.strftime('%Y-%m-%d') if r.day else "",
                "count": r.count,
                "amount": r.total_amount or 0.0
            }
            for r in rows
        ]

report_service = ReportService()
