from sqlalchemy import Column, Integer, String, Float, ForeignKey
from sqlalchemy.orm import relationship
from app.db.base import Base

class RegionStats(Base):
    """
    Ye table tumhare pure dataset ko store karegi.
    Har Pincode ka apna ek record hoga.
    """
    __tablename__ = "region_stats"
    
    id = Column(Integer, primary_key=True, index=True)
    state = Column(String, index=True)          # e.g., Rajasthan
    district = Column(String, index=True)       # e.g., Jaipur
    pincode = Column(String, unique=True, index=True) # e.g., 302001
    
    # Demographics Data (Jo tumhare dataset mein hai)
    total_population = Column(Integer)
    aadhaar_generated = Column(Integer)
    pending_enrolments = Column(Integer)        # Target Audience
    
    # Centers Info
    active_centers_count = Column(Integer, default=0)
    
    # Analytics Metrics (Hum calculate karenge)
    saturation_percentage = Column(Float)       # (Generated / Population) * 100
    demand_score = Column(Float)                # AI Score: Kahan center chahiye

class EnrolmentTrend(Base):
    """
    Time-series data store karne ke liye (Prediction ke liye zaroori).
    Example: Jan mein kitne bane, Feb mein kitne bane...
    """
    __tablename__ = "enrolment_trends"
    
    id = Column(Integer, primary_key=True)
    pincode = Column(String, ForeignKey("region_stats.pincode"))
    month_year = Column(String) # e.g., "2023-10"
    enrolment_count = Column(Integer)

class DailyAadhaarMetrics(Base):
    __tablename__ = "daily_aadhaar_metrics"

    id = Column(Integer, primary_key=True, index=True)
    date = Column(String, index=True)  # Format: DD-MM-YYYY
    state = Column(String, index=True)
    district = Column(String, index=True)
    pincode = Column(String, index=True)
    
    # 1. New Enrolments Breakdown
    enrol_0_5 = Column(Integer, default=0)
    enrol_5_17 = Column(Integer, default=0)
    enrol_18_plus = Column(Integer, default=0)
    
    # 2. Updates Breakdown
    bio_update_5_17 = Column(Integer, default=0)
    bio_update_17_plus = Column(Integer, default=0)
    demo_update_5_17 = Column(Integer, default=0)
    demo_update_17_plus = Column(Integer, default=0)

    # 3. Calculated Workload (AI Logic)
    # New Enrollment = 20 mins, Bio Update = 15 mins, Demo Update = 8 mins
    total_workload_hours = Column(Float, default=0.0)