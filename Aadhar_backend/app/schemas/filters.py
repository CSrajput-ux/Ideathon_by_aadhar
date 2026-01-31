from pydantic import BaseModel
from typing import Optional, List

class RegionFilter(BaseModel):
    state: Optional[str] = None
    district: Optional[str] = None
    pincode: Optional[str] = None

class PredictionInput(BaseModel):
    pincode: str
    months_to_forecast: int = 3
