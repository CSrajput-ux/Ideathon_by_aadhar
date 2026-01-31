import pandas as pd
import glob
import os
from sqlalchemy.orm import Session
from app.db.session import SessionLocal, engine
from app.models import models

# Database initialize
models.Base.metadata.create_all(bind=engine)

def load_dataset():
    db: Session = SessionLocal()
    
    # Step 1: Pehle se moujood Pincodes ki list nikal lo
    # Taaki hum dobara same pincode add na karein (Crash se bachne ke liye)
    print("🔄 Fetching existing data to avoid duplicates...")
    existing_pincodes = set(
        flat_result[0] for flat_result in db.query(models.RegionStats.pincode).all()
    )
    print(f"✅ Found {len(existing_pincodes)} existing pincodes in database.")

    # Files dhundo
    csv_files = glob.glob("api_data_aadhar_biometric*.csv")
    if not csv_files:
        print("❌ Koi file nahi mili! Make sure files 'Aadhar_backend' folder mein hain.")
        return

    print(f"📂 Found {len(csv_files)} files. Starting processing...")
    
    total_added = 0
    skipped_count = 0
    
    for file_path in csv_files:
        print(f"🔄 Reading file: {file_path}...")
        try:
            # CSV Load karo
            df = pd.read_csv(file_path, low_memory=False)
            df.columns = [c.strip().lower() for c in df.columns]
            
            rows_to_add = []
            
            for index, row in df.iterrows():
                try:
                    # Pincode cleaning
                    pincode_raw = row.get('pincode', '')
                    pincode = str(pincode_raw).split('.')[0].strip()
                    
                    # --- CRITICAL CHECK ---
                    # Agar ye pincode pehle se DB mein hai ya abhi humne add kiya hai -> SKIP
                    if not pincode or len(pincode) < 6 or pincode in existing_pincodes:
                        skipped_count += 1
                        continue 
                    
                    # Add to tracking set immediately
                    existing_pincodes.add(pincode)

                    # Data Extraction
                    state = row.get('state', 'Unknown')
                    district = row.get('district', 'Unknown')
                    
                    bio_5 = row.get('bio_age_5', 0)
                    bio_17 = row.get('bio_age_17_', 0)
                    
                    def clean_int(val):
                        try:
                            return int(float(val))
                        except:
                            return 0

                    total_aadhaar = clean_int(bio_5) + clean_int(bio_17)
                    
                    # Population Logic
                    estimated_population = int(total_aadhaar * 1.3) if total_aadhaar > 0 else 5000
                    saturation = (total_aadhaar / estimated_population) * 100 if estimated_population > 0 else 0
                    pending = estimated_population - total_aadhaar
                    demand_score = (pending * 0.6) + ((100 - saturation) * 10)

                    # Object create karo
                    region = models.RegionStats(
                        state=state,
                        district=district,
                        pincode=pincode,
                        total_population=estimated_population,
                        aadhaar_generated=total_aadhaar,
                        pending_enrolments=pending,
                        saturation_percentage=saturation,
                        demand_score=demand_score
                    )
                    
                    db.add(region)
                    total_added += 1
                    
                    # Har 1000 records par save karo taaki RAM full na ho
                    if total_added % 1000 == 0:
                        db.commit()
                        print(f"   Saved {total_added} records so far...")

                except Exception as row_e:
                    continue

            # File khatam hone par final commit
            db.commit()
            print(f"✅ Finished file: {file_path}")

        except Exception as e:
            print(f"❌ Error reading file {file_path}: {e}")
            db.rollback() # Agar gadbad ho toh wapas peechle step par jao

    db.close()
    print(f"\n🎉 GRAND SUCCESS!")
    print(f"✅ Total New Pincodes Added: {total_added}")
    print(f"⏭️ Duplicates Skipped: {skipped_count}")

if __name__ == "__main__":
    load_dataset()