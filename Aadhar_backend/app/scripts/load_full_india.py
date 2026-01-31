import pandas as pd
import random
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.db.session import SessionLocal, engine
from app.models import models

# 1. Database Wapas Banao
models.Base.metadata.create_all(bind=engine)

def load_full_india_data():
    db: Session = SessionLocal()
    print("🚀 Starting Full India Data Load...")

    try:
        # 2. Existing Pincodes check kar lo (Taaki dobara add na ho)
        existing_pincodes = set(
            row[0] for row in db.query(models.RegionStats.pincode).all()
        )
        print(f"ℹ️ Database mein pehle se {len(existing_pincodes)} pincodes hain.")

        # File read
        df = pd.read_csv("pincode-dataset.csv")
        df.columns = [c.strip().lower() for c in df.columns]

        batch_data = []
        count = 0
        skipped = 0

        print(f"📊 Found {len(df)} pincodes in CSV. Processing...")

        for index, row in df.iterrows():
            try:
                # Pincode safai
                pincode = str(row.get('pincode', '')).replace('.0', '').strip()
                
                # --- DUPLICATE CHECK ---
                if pincode in existing_pincodes:
                    skipped += 1
                    continue
                
                existing_pincodes.add(pincode) # Set mein add karo taaki isi loop mein dobara na aaye

                district = row.get('district', 'Unknown').title()
                state = row.get('statename', 'Unknown').title()

                if len(pincode) < 6: continue

                # Fake Data Generation
                estimated_population = random.randint(5000, 80000)
                saturation_random = random.choice([0.45, 0.60, 0.75, 0.90, 0.98])
                aadhaar_generated = int(estimated_population * saturation_random)
                
                pending = estimated_population - aadhaar_generated
                saturation_percentage = (aadhaar_generated / estimated_population) * 100
                
                demand_score = 0
                if saturation_percentage < 70: demand_score = random.randint(80, 100)
                elif saturation_percentage < 90: demand_score = random.randint(50, 79)
                else: demand_score = random.randint(10, 49)

                region = models.RegionStats(
                    state=state,
                    district=district,
                    pincode=pincode,
                    total_population=estimated_population,
                    aadhaar_generated=aadhaar_generated,
                    pending_enrolments=pending,
                    saturation_percentage=saturation_percentage,
                    demand_score=demand_score
                )
                
                batch_data.append(region)
                count += 1
                
                # Batch Save (Fast)
                if len(batch_data) >= 5000:
                    db.bulk_save_objects(batch_data)
                    db.commit()
                    batch_data = []
                    print(f"✅ Saved {count} records...")

            except Exception:
                continue

        # Bacha hua data save
        if batch_data:
            db.bulk_save_objects(batch_data)
            db.commit()

        print(f"🎉 GRAND SUCCESS! Added: {count}, Skipped (Duplicates): {skipped}")

    except Exception as e:
        print(f"❌ Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    load_full_india_data()
