import numpy as np
from sklearn.linear_model import LinearRegression

class AIService:
    def predict_demand(self, historical_data: list):
        # Mock logic agar data kam hai
        if not historical_data:
            return 0
            
        X = np.array(range(len(historical_data))).reshape(-1, 1)
        y = np.array(historical_data)
        
        model = LinearRegression()
        model.fit(X, y)
        
        # Next month prediction
        next_month = np.array([[len(historical_data) + 1]])
        prediction = model.predict(next_month)
        
        return max(0, int(prediction[0])) # Negative nahi ho sakta

ai_service = AIService()
