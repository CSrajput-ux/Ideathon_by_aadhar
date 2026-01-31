from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
# --- Correction is here (Sahi imports) ---
from app.db.base import Base
from app.db.session import engine
# -----------------------------------------
from app.api.endpoints import analytics

# Database Tables create kar dega start hote hi
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Aadhaar Enrolment Analytics")

# CORS (Frontend connect karne ke liye)
origins = [
    "http://localhost:5173",    # React/Vite Default
    "http://localhost:3000",    # React Default
    "http://127.0.0.1:5173",
    "*"                         # Sabke liye (Hackathon ke liye safe hai)
]

app.add_middleware(
    CORSMiddleware,

    allow_origins=origins,      # Yahan humne list pass ki hai
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routes Jodna
app.include_router(analytics.router, prefix="/api/v1", tags=["analytics"])

@app.get("/")
def root():
    return {"message": "Aadhaar Analytics API is Running!"}
