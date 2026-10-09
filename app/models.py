from datetime import datetime

from pydantic import BaseModel

from sqlalchemy import Column, String, Integer, Float, DateTime

from app.database import Base


class Trade(BaseModel):

    trade_id: str
    client: str
    symbol: str
    quantity: int
    price: float
    timestamp: datetime


class TradeDB(Base):

    __tablename__ = "trades"

    trade_id = Column(String, primary_key=True)
    client = Column(String, nullable=False)
    symbol = Column(String, nullable=False)
    quantity = Column(Integer, nullable=False)
    price = Column(Float, nullable=False)
    timestamp = Column(DateTime, nullable=False)