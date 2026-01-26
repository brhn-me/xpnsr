
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from uuid import UUID

from src.core.database import get_session
from src.auth.router import get_current_user
from src.auth.models import User
from . import service, schemas
from .models import TaxSettings

router = APIRouter()

@router.get("/summary", response_model=schemas.TaxSummary)
async def get_tax_summary(
    year: int = Query(..., ge=2000, le=3000),
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    return await service.calculate_summary(session, current_user.id, year)

@router.get("/brackets", response_model=List[schemas.TaxBracketResponse])
async def get_tax_brackets(
    year: int = Query(..., ge=2000, le=3000),
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    return await service.get_brackets(session, current_user.id, year)

@router.post("/brackets", response_model=schemas.TaxBracketResponse)
async def create_tax_bracket(
    bracket: schemas.TaxBracketCreate,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    return await service.create_bracket(session, bracket, current_user.id)

# --- Phase 13 Endpoints ---

@router.get("/settings", response_model=TaxSettings)
async def get_tax_settings(
    year: int = Query(..., ge=2000, le=3000),
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    return await service.get_settings(session, current_user.id, year)

@router.put("/settings", response_model=TaxSettings)
async def update_tax_settings(
    settings: schemas.TaxSettingsUpdate,
    year: int = Query(..., ge=2000, le=3000),
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    return await service.update_settings(session, current_user.id, year, settings)

@router.get("/exemptions", response_model=List[UUID])
async def get_exemptions(
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    return await service.get_exempt_categories(session, current_user.id)

@router.post("/exemptions", response_model=bool)
async def toggle_exemption(
    exemption: schemas.TaxExemptionCreate,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    return await service.toggle_exemption(session, current_user.id, exemption)

# TPS Update using Transaction Service? Or direct here?
# Since we are bypassing Transaction Router/Service to just update this field as requested generally.
# But ideally we should use transaction service. However, let's keep it simple here.
from src.transactions.models import Transaction

@router.put("/transactions/{transaction_id}/tps", response_model=dict)
async def update_transaction_tps(
    transaction_id: UUID,
    amount: float,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    trans = await session.get(Transaction, transaction_id)
    if not trans or trans.user_id != current_user.id:
         raise HTTPException(status_code=404, detail="Transaction not found")
    
    trans.tax_deducted_at_source = amount
    session.add(trans)
    await session.commit()
    return {"ok": True}

@router.get("/filing/{year}", response_model=schemas.TaxFilingRead | None)
async def get_filing(
    year: int,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    return await service.get_filing(session, current_user.id, year)

@router.post("/filing/{year}", response_model=schemas.TaxFilingRead)
async def create_filing(
    filing: schemas.TaxFilingCreate,
    year: int,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    return await service.create_or_update_filing(session, current_user.id, year, filing)
