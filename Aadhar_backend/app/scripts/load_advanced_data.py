import pandas as pd
import os
import glob
from sqlalchemy.orm import Session
from app.db.session import SessionLocal, engine
from app.models import models

# Database initialize
models.Base.metadata.create_all(bind=engine)

def load_category_files(keyword, root_folder="dataset"):
    """
    Ye function folder ke andar ghus kar saari milti-julti files (CSV/Excel)
    dhoondta hai aur unhe jod kar ek bada table bana deta hai.
    """
    print(f"🔍 Searching for '{keyword}' files in {root_folder}...")
    
    all_dfs = []
    # Recursive search (folder ke andar folder check karega)
    # Excel aur CSV dono dhoond rahe hain
    files = glob.glob(f"{root_folder}/**/*{keyword}*.*", recursive=True)
    
    found_files = [f for f in files if f.endswith('.csv') or f.endswith('.xlsx')]
    
    if not found_files:
        print(f"❌ No files found for {keyword}!")
        return None

    print(f"   Found {len(found_files)} chunks. Merging them...")

    for file_path in found_files:
        try:
            if file_path.endswith('.csv'):
                df = pd.read_csv(file_path, low_memory=False)
            elif file_path.endswith('.xlsx'):
                print(f"   Reading Excel file (thoda time lagega): {os.path.basename(file_path)}")
                df = pd.read_excel(file_path)
            
            # Column cleaning
            df.columns = [c.strip().lower() for c in df.columns]
            if 'pincode' in df.columns:
                df['pincode'] = df['pincode'].astype(str).str.replace('.0', '', regex=False)
                
            all_dfs.append(df)
        except Exception as e:
            print(f"   ⚠️ Error reading {file_path}: {e}")

    if all_dfs:
        # Saare tukdon ko jod do (Concatenate)
        combined_df = pd.concat(all_dfs, ignore_index=True)
        print(f"✅ {keyword.capitalize()} Data Ready: {len(combined_df)} rows.")
        return combined_df
    return None

def load_data():
    db = SessionLocal()
    print("🔥 Starting ULTIMATE Data Fusion...")

    try:
        # 1. Teeno Categories ka Data Jodo
        df_enrol = load_category_files("enrolment")
        df_bio = load_category_files("biometric")
        df_demo = load_category_files("demographic")

        if df_enrol is None or df_bio is None or df_demo is None:
            print("🚨 Stop: Kuch data missing hai. Structure check karo.")
            return

        print("\n🔄 Merging Datasets (Isme thoda waqt lag sakta hai)...")

        # 2. Merge Logic (Date + Location par jodo)
        # Pehle Enrolment aur Bio
        merged_df = pd.merge(
            df_enrol, df_bio, 
            on=['date', 'state', 'district', 'pincode'], 
            how='outer'
        ).fillna(0)

        # Phir Demographic
        final_df = pd.merge(
            merged_df, df_demo, 
            on=['date', 'state', 'district', 'pincode'], 
            how='outer'
        ).fillna(0)

        print(f"🤖 Calculating AI Workload for {len(final_df)} rows...")

        # 3. Workload Calculation & Saving
        batch_data = []
        count = 0
        
        for _, row in final_df.iterrows():
            # Pincode check
            if not row['pincode'] or str(row['pincode']).lower() == 'nan':
                continue

            # Safe value extraction function
            def get_val(col_name):
                try:
                    return int(float(row.get(col_name, 0)))
                except:
                    return 0

            # Values nikalo
            e_0_5 = get_val('age_0_5')
            e_5_17 = get_val('age_5_17')
            e_18 = get_val('age_18_greater')
            
            b_5_17 = get_val('bio_age_5_17')
            b_17 = get_val('bio_age_17_')
            
            d_5_17 = get_val('demo_age_5_17')
            d_17 = get_val('demo_age_17_')

            # AI Logic: New=20m, Bio=15m, Demo=8m
            workload_hours = ((e_0_5 + e_5_17 + e_18) * 20 + 
                              (b_5_17 + b_17) * 15 + 
                              (d_5_17 + d_17) * 8) / 60

            record = models.DailyAadhaarMetrics(
                date=str(row.get('date')),
                state=str(row.get('state', '')).title(),
                district=str(row.get('district', '')).title(),
                pincode=str(row.get('pincode')),
                
                enrol_0_5=e_0_5,
                enrol_5_17=e_5_17,
                enrol_18_plus=e_18,
                
                bio_update_5_17=b_5_17,
                bio_update_17_plus=b_17,
                
                demo_update_5_17=d_5_17,
                demo_update_17_plus=d_17,
                
                total_workload_hours=float(workload_hours)
            )
            batch_data.append(record)
            count += 1
            
            if len(batch_data) >= 5000:
                db.bulk_save_objects(batch_data)
                db.commit()
                batch_data = []
                print(f"   Saved {count} records...")

        if batch_data:
            db.bulk_save_objects(batch_data)
            db.commit()

        print("✅ MISSION ACCOMPLISHED! All data loaded.")

    except Exception as e:
        print(f"❌ Critical Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    load_data()
