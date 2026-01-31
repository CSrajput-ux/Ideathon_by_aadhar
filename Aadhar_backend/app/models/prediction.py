from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.sql import func
from app.db.base import Base

class PredictionLog(Base):
    __tablename__ = "prediction_logs"

    id = Column(Integer, primary_key=True, index=True)
    pincode = Column(String, index=True)
    predicted_demand = Column(Integer)
    confidence_score = Column(Float)
    prediction_date = Column(DateTime(timezone=True), server_default=func.now())
    algo_used = Column(String) # e.g., "LinearRegression"
