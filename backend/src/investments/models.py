
import uuid
from sqlalchemy import Column, String, Float, Boolean, ForeignKey, Date, Integer, Enum as SqEnum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import enum
from ..database import Base

class InvestmentType(str, enum.Enum):
    FD = "FD" # Fixed Deposit
    BONDS = "BONDS"
    DPS = "DPS" # Pension Scheme
    STOCK = "STOCK"
    TRADING = "TRADING"

class InvestmentStatus(str, enum.Enum):
    ACTIVE = "ACTIVE"
    MATURED = "MATURED"
    CLOSED = "CLOSED"

class Investment(Base):
    __tablename__ = "investment"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("user.id"), nullable=False)
    account_id = Column(UUID(as_uuid=True), ForeignKey("account.id"), nullable=True) # Optional source/linked account
    
    title = Column(String, nullable=False)
    type = Column(SqEnum(InvestmentType), nullable=False)
    
    principal_amount = Column(Float, nullable=False)
    current_value = Column(Float, nullable=False) # Needs manual update or logic to update
    
    interest_rate = Column(Float, default=0.0) # Annual percentage
    interest_amount = Column(Float, default=0.0) # Projected or Actual
    
    start_date = Column(Date, nullable=False)
    maturity_date = Column(Date, nullable=True) # Stocks might not have maturity
    tenure_months = Column(Integer, default=0)
    
    auto_renew = Column(Boolean, default=False)
    tax_rate = Column(Float, default=0.0) # Tax on profits/interest
    tax_amount = Column(Float, default=0.0) # Calculated Tax
    
    status = Column(SqEnum(InvestmentStatus), default=InvestmentStatus.ACTIVE, nullable=False)

    account = relationship("Account")
