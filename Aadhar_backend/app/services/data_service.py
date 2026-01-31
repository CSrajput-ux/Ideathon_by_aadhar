from sqlalchemy.orm import Session
from app.models.models import AadhaarCenter

class DataService:
    def get_all_centers(self, db: Session):
        return db.query(AadhaarCenter).all()
        
    def get_centers_by_district(self, db: Session, district: str):
        return db.query(AadhaarCenter).filter(AadhaarCenter.district == district).all()

data_service = DataService()
