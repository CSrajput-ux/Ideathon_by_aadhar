from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.api import deps
from app.models import models
from app.services.ai_engine import get_ai_insights # ✅ Naya Import

router = APIRouter()

@router.get("/filters/states")
def get_all_states(db: Session = Depends(deps.get_db)):
    # Database se saare unique States nikal kar layega
    states = db.query(models.RegionStats.state).distinct().order_by(models.RegionStats.state).all()
    # List return karega: ["Delhi", "Maharashtra", "Uttar Pradesh", ...]
    return [s[0] for s in states]

@router.get("/filters/districts")
def get_districts(state_name: str, db: Session = Depends(deps.get_db)):
    # Jo state select kiya, sirf uske districts layega
    districts = db.query(models.RegionStats.district)\
                  .filter(models.RegionStats.state == state_name)\
                  .distinct().order_by(models.RegionStats.district).all()
    return [d[0] for d in districts]

@router.get("/filters/pincodes")
def get_pincodes(district_name: str, db: Session = Depends(deps.get_db)):
    # Jo district select kiya, uske pincodes layega
    pincodes = db.query(models.RegionStats.pincode)\
                 .filter(models.RegionStats.district == district_name)\
                 .distinct().order_by(models.RegionStats.pincode).all()
    return [p[0] for p in pincodes]

# ✅ NAYI API: Live Dashboard Stats ke liye
@router.get("/dashboard-stats")
def get_dashboard_stats(
    state: str = Query("All States"),
    district: str = Query("All Districts"),
    pincode: str = Query("All Pincodes"),
    year: str = Query("2025"),
    db: Session = Depends(deps.get_db)
):
    # 1. Base Query Banao
    query = db.query(models.DailyAadhaarMetrics)

    # 2. Filters Apply Karo (Jo user ne select kiya hai)
    if state != "All States":
        query = query.filter(models.DailyAadhaarMetrics.state == state)
    if district != "All Districts":
        query = query.filter(models.DailyAadhaarMetrics.district == district)
    if pincode != "All Pincodes":
        query = query.filter(models.DailyAadhaarMetrics.pincode == pincode)
    
    # Year Filter (Data mein Date column hai, usse extract karenge)
    # Simple logic: Start date aur End date filter
    start_date = f"{year}-01-01"
    end_date = f"{year}-12-31"
    query = query.filter(models.DailyAadhaarMetrics.date >= start_date)
    query = query.filter(models.DailyAadhaarMetrics.date <= end_date)

    # 3. Calculate Totals (Saare columns ka jod)
    # 0-5 Enrol + 18+ Enrol + Updates...
    total_enrolments = query.with_entities(
        func.sum(
            models.DailyAadhaarMetrics.enrol_0_5 + 
            models.DailyAadhaarMetrics.enrol_18_plus +
            models.DailyAadhaarMetrics.bio_update_5_17 +
            models.DailyAadhaarMetrics.bio_update_17_plus +
            models.DailyAadhaarMetrics.demo_update_5_17 +
            models.DailyAadhaarMetrics.demo_update_17_plus
        )
    ).scalar() or 0  # Agar null aaye to 0 maano

    # 4. Dummy Logic for Growth & Prediction (Hackathon ke liye)
    # Asli growth ke liye pichle saal ka data chahiye hota hai, abhi hum formula use karenge
    predicted_next_q = int(total_enrolments * 0.15) # 15% growth prediction
    growth_rate = 12.5 # Static rakh sakte ho ya random logic laga sakte ho

    # Priority Regions Count (Jahan load > 50 hai)
    # Ye thoda complex query hai, isliye abhi count distinct pincodes bhej dete hain
    high_priority_count = query.distinct(models.DailyAadhaarMetrics.pincode).count()

    return {
        "total_enrolments": total_enrolments,
        "growth_rate": f"+{growth_rate}%",
        "high_priority_regions": high_priority_count,
        "predicted_enrolments": predicted_next_q
    }
def predict_resources(pincode: str, db: Session = Depends(deps.get_db)):
    # 1. Database se Data nikalo
    historical_data = db.query(models.DailyAadhaarMetrics)\
                        .filter(models.DailyAadhaarMetrics.pincode == pincode)\
                        .order_by(models.DailyAadhaarMetrics.date)\
                        .all()
    
    if not historical_data:
        return {
            "pincode": pincode,
            "status": "No Data",
            "priority": "Low",
            "predicted_workload_hours": 0,
            "required_counters": 0,
            "ai_insights": ["Data unavailable for this pincode."]
        }

    # 2. 🔥 AI ENGINE CALL KARO
    # Yeh Prophet, Isolation Forest aur Math sab handle karega
    ai_result = get_ai_insights(historical_data)
    
    # 3. Recommendation Text Generate Karo
    recommendations = []
    priority = "Normal"
    
    req_counters = ai_result['required_counters']
    status = ai_result['anomaly_status']
    workload = ai_result['predicted_workload_hours']

    # Logic: Agar 2 se zyada counter chahiye -> High Priority
    if req_counters > 2:
        priority = "Critical"
        recommendations.append(f"🔥 ACTION: Deploy {req_counters} active counters immediately.")
    elif req_counters > 1:
        priority = "High"
        recommendations.append(f"⚠️ Warning: Workload requires {req_counters} counters.")
    else:
        recommendations.append("✅ Status: Single counter is sufficient.")

    # Anomaly Logic
    if "Surge" in status:
        recommendations.append("🚨 ALERT: Sudden surge detected! Keep backup staff ready.")
        priority = "Critical"
    elif "Drop" in status:
        recommendations.append("📉 Insight: Demand dropped unusually. Check for center closure.")

    # Workload Breakdown Logic
    # Hum latest data check karke dekhenge ki kis type ka load zyada hai
    latest = historical_data[-1]
    new_enrols = latest.enrol_0_5 + latest.enrol_18_plus
    updates = latest.bio_update_5_17 + latest.bio_update_17_plus + latest.demo_update_5_17

    if new_enrols > updates:
        recommendations.append("👶 Focus: Deploy more Enrollment Kits (New Aadhaar).")
    else:
        recommendations.append("🔄 Focus: Setup 'Fast-Track Lane' for Updates.")

    return {
        "pincode": pincode,
        "priority": priority,
        "predicted_workload_hours": workload,
        "required_counters": req_counters,
        "anomaly_status": status,
        "ai_insights": recommendations
    }
    
    if not recent_data:
        return {"status": "No Data", "recommendation": "Data unavailable for this pincode."}

    # 2. Totals calculate karo
    avg_daily_workload = sum(d.total_workload_hours for d in recent_data) / len(recent_data)
    total_new_enrols = sum(d.enrol_0_5 + d.enrol_18_plus for d in recent_data)
    total_updates = sum(d.bio_update_17_plus + d.demo_update_17_plus for d in recent_data)

    # 3. AI RECOMMENDATION LOGIC 🧠
    recommendation = []
    priority = "Low"
    
    # Ek center din mein 8 ghante kaam karta hai.
    # Agar workload 12 ghante ka hai, toh 1.5 centers chahiye (yaani 2 centers).
    required_counters = round(avg_daily_workload / 8, 1)

    if required_counters > 1.5:
        priority = "Critical"
        recommendation.append(f"🔥 HIGH LOAD: Daily workload is {avg_daily_workload:.1f} hours.")
        recommendation.append(f"✅ ACTION: Open {int(required_counters)} active counters immediately.")
    
    if total_new_enrols > total_updates * 2:
        recommendation.append("👶 Focus: Deployment of Child Enrolment Kits needed.")
    elif total_updates > total_new_enrols * 2:
        recommendation.append("🔄 Focus: Setup 'Update-Only' fast-track lane.")

    return {
        "pincode": pincode,
        "priority": priority,
        "predicted_workload_hours": avg_daily_workload,
        "required_counters": required_counters,
        "ai_insights": recommendation
    }