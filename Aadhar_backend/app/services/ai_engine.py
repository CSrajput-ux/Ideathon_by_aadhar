import numpy as np

# 🔥 JUGAAD: Numpy ka naya version patch karne ke liye
if not hasattr(np, 'float'):
    np.float = float

import pandas as pd
import numpy as np
from sklearn.ensemble import IsolationForest
from prophet import Prophet
import datetime

# 🎯 CONFIGURATION (Standard Times in Minutes)
# Tumhare Algorithm ke hisaab se weights
TIME_WEIGHTS = {
    "enrol_0_5": 10,   # Child Enrollment (Tablet)
    "enrol_18_plus": 25, # Adult Enrollment (Iris/Fingerprint)
    "bio_update": 15,  # Mandatory Biometric Update
    "demo_update": 8   # Demographic Update (Address/Name)
}

OPERATOR_CAPACITY_MINS = 480  # 8 Hours * 60 Mins

class AIEngine:
    def __init__(self, data_records):
        """
        data_records: List of database objects (DailyAadhaarMetrics)
        """
        # Data ko DataFrame mein convert karo
        self.df = pd.DataFrame([
            {
                "ds": r.date,  # Date for Prophet
                "enrol_0_5": r.enrol_0_5,
                "enrol_18_plus": r.enrol_18_plus,
                "bio_update": r.bio_update_5_17 + r.bio_update_17_plus,
                "demo_update": r.demo_update_5_17 + r.demo_update_17_plus
            }
            for r in data_records
        ])
        
        # Date format fix karo
        self.df['ds'] = pd.to_datetime(self.df['ds'], dayfirst=True)
        
        # 1. ✅ Calculate Actual Workload (Minutes)
        self.df['y'] = (
            (self.df['enrol_0_5'] * TIME_WEIGHTS['enrol_0_5']) +
            (self.df['enrol_18_plus'] * TIME_WEIGHTS['enrol_18_plus']) +
            (self.df['bio_update'] * TIME_WEIGHTS['bio_update']) +
            (self.df['demo_update'] * TIME_WEIGHTS['demo_update'])
        )
        # Sort by date
        self.df = self.df.sort_values('ds')
        
        # ✅ Fix: Ensure daily frequency with 0 fill for missing days
        self.df = self.df.set_index('ds').asfreq('D').fillna(0).reset_index()

    def predict_next_7_days(self):
        """
        🔮 Prophet Algorithm se Future Workload Predict karega
        """
        if len(self.df) < 5:
            # Agar data kam hai, to simple Average return karo (Fallback)
            return self.df['y'].mean()

        try:
            # Prophet Model Setup
            m = Prophet(daily_seasonality=True, yearly_seasonality=False)
            m.fit(self.df[['ds', 'y']])
            
            # Future Dataframe (Next 7 Days)
            future = m.make_future_dataframe(periods=7)
            forecast = m.predict(future)
            
            # Sirf future ka average workload return karo
            next_week = forecast.tail(7)
            avg_predicted_workload = next_week['yhat'].mean()
            return max(0, avg_predicted_workload) # Negative nahi ho sakta
        except Exception as e:
            print(f"⚠️ Prophet Error: {e}")
            return self.df['y'].mean()

    def detect_anomalies(self):
        """
        🚨 Isolation Forest se 'Achanak Bheed' (Outliers) pakdega
        """
        if len(self.df) < 5:
            return "Normal"

        try:
            model = IsolationForest(contamination=0.1) # 10% data anomalous ho sakta hai
            self.df['anomaly'] = model.fit_predict(self.df[['y']])
            
            # Check karo kya last entry anomaly hai? (-1 means Anomaly)
            latest_status = self.df.iloc[-1]['anomaly']
            
            if latest_status == -1:
                # Agar workload average se bahut zyada hai -> High Spike
                if self.df.iloc[-1]['y'] > self.df['y'].mean():
                    return "High Surge Detected 🚨"
                else:
                    return "Unusual Drop 📉"
            return "Normal Flow"
        except:
            return "Normal Flow"

    def optimize_resources(self, predicted_workload):
        """
        ⚖️ Linear Logic se Counters Calculate karega
        """
        # Formula: Ceil(Workload / 480)
        required_counters = np.ceil(predicted_workload / OPERATOR_CAPACITY_MINS)
        return int(required_counters)

# Helper function to use easily
def get_ai_insights(metrics_list):
    engine = AIEngine(metrics_list)
    
    # 1. Forecast
    predicted_mins = engine.predict_next_7_days()
    
    # 2. Anomaly
    status = engine.detect_anomalies()
    
    # 3. Optimization
    counters = engine.optimize_resources(predicted_mins)
    
    return {
        "predicted_workload_hours": round(predicted_mins / 60, 1),
        "anomaly_status": status,
        "required_counters": counters,
        "efficiency_gap": "Analysis Complete" 
    }
