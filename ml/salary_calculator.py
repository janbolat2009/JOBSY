import pandas as pd
import sys
import json
import os

BASE_PATH = os.path.dirname(os.path.abspath(__file__))
DATA_PATH = os.path.join(BASE_PATH, 'data', 'processed', 'salary_data.parquet')

def estimate_salary(title, city, experience_years):
    if not os.path.exists(DATA_PATH):
        return {"low": 400000, "high": 700000, "currency": "₸", "note": "Default values for Kazakhstan"}

    df = pd.read_parquet(DATA_PATH)
    
    mask = df['name'].str.contains(title, case=False, na=False)
    if not city:
        city = 'Астана'
    
    mask &= df['city'].str.contains(city, case=False, na=False)
    
    filtered = df[mask]
    
    if filtered.empty:
        filtered = df[df['name'].str.contains(title, case=False, na=False)]
    
    if filtered.empty:
        return {"low": 500000, "high": 800000, "currency": "₸", "note": "Market average KZT"}

    # Assuming original data in RUB, convert to KZT (approx 1:5)
    low = filtered['low'].median() * 5.2
    high = filtered['high'].median() * 5.2
    
    factor = 1.0 + (min(experience_years, 10) * 0.1)
    
    return {
        "low": int(low * factor) if not pd.isna(low) else 400000,
        "high": int(high * factor) if not pd.isna(high) else 700000,
        "currency": "₸"
    }

if __name__ == "__main__":
    try:
        data = json.load(sys.stdin)
        result = estimate_salary(data.get('title', ''), data.get('city', ''), data.get('experience_years', 0))
        print(json.dumps(result))
    except Exception as e:
        print(json.dumps({"error": str(e)}))
