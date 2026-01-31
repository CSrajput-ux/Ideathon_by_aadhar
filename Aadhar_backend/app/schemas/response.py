from pydantic import BaseModel
from typing import List, Optional

class CenterResponse(BaseModel):
    id: int
    name: str
    latitude: float
    longitude: float
    status: str
    
    class Config:
        from_attributes = True

class RecommendationResponse(BaseModel):
    pincode: str
    priority: str # High/Medium/Low
    suggested_action: str
    reason: str
