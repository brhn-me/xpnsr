
import uuid
from sqlalchemy import Column, String, Float, Boolean, ForeignKey, Enum as SqEnum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import enum
from ..database import Base

class AccountType(str, enum.Enum):
    BANK = "BANK"
    MOBILE_WALLET = "MOBILE_WALLET"
    CASH = "CASH"
    INVESTMENT = "INVESTMENT" # Placeholder in case we need a dedicated investment account type

class Account(Base):
    __tablename__ = "account"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("user.id"), nullable=False)
    
    name = Column(String, nullable=False)
    type = Column(SqEnum(AccountType), nullable=False)
    currency = Column(String, default="USD", nullable=False)
    balance = Column(Float, default=0.0, nullable=False)
    interest_rate = Column(Float, default=0.0) # For savings accounts
    
    account_number = Column(String, nullable=True)
    bank_name = Column(String, nullable=True)
    branch_name = Column(String, nullable=True)

    is_active = Column(Boolean, default=True)

    # Relationships can be added here if needed, e.g. transactions
    # transactions = relationship("Transaction", back_populates="account")
