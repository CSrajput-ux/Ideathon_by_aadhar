from sqlalchemy.orm import Session
from app.models.models import RegionStats # Ensure correct import
from app.schemas.response import RecommendationResponse

class RecommendationService:
    def analyze_gap(self, db: Session, pincode: str) -> RecommendationResponse:
        region = db.query(RegionStats).filter(RegionStats.pincode == pincode).first()
        
        if not region:
            return None
            
        priority = "Low"
        action = "No Action Needed"
        reason = "Sufficient coverage"

        # Logic: Low Saturation + High Population = High Priority
        if region.saturation_percentage < 70 and region.total_population > 10000:
            priority = "High"
            action = "Open New Center Immediately"
            reason = f"Saturation is only {region.saturation_percentage}% with high population."
        elif region.saturation_percentage < 85:
            priority = "Medium"
            action = "Organize Enrolment Camp"
            reason = "Moderate gap detected."

        return RecommendationResponse(
            pincode=pincode,
            priority=priority,
            suggested_action=action,
            reason=reason
        )

recommendation_service = RecommendationService()
