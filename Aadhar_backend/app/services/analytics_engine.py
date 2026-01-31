from sqlalchemy.orm import Session
from app.models import models
from sqlalchemy import desc

def find_critical_gaps(db: Session, district_name: str = None):
    """
    Ye function pure dataset ko scan karke 'Red Zones' dhundega.
    Jahan Population > 10,000 hai lekin Saturation < 70% hai.
    """
    query = db.query(models.RegionStats)
    
    if district_name:
        query = query.filter(models.RegionStats.district == district_name)
    
    # Formula: Low Saturation + High Pending Enrolments = High Priority
    # Order by 'demand_score' jo humne load karte waqt calculate kiya tha
    critical_areas = query.order_by(desc(models.RegionStats.demand_score)).limit(10).all()
    
    results = []
    for area in critical_areas:
        results.append({
            "pincode": area.pincode,
            "district": area.district,
            "pending_enrolments": area.pending_enrolments,
            "saturation": f"{area.saturation_percentage:.2f}%",
            "recommendation": "IMMEDIATE ACTION REQUIRED: Open new center here.",
            "priority": "Critical"
        })
        
    return results

def predict_resource_allocation(db: Session, pincode: str):
    """
    Resource Optimization: Ek specific pincode ke liye kitni machines chahiye?
    """
    area = db.query(models.RegionStats).filter(models.RegionStats.pincode == pincode).first()
    
    if not area:
        return {"error": "Data not found"}
        
    # Logic: 1 Machine can handle 50 enrolments/day.
    # Target: Clear backlog in 3 months (90 days).
    daily_target = area.pending_enrolments / 90
    machines_needed = round(daily_target / 50) + 1 # Buffer
    
    return {
        "pincode": pincode,
        "backlog": area.pending_enrolments,
        "suggested_machines": machines_needed,
        "suggested_staff": machines_needed, # 1 Operator per machine
        "estimated_completion_days": 90
    }