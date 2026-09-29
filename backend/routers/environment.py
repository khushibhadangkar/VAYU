import json
import os
from fastapi import APIRouter, HTTPException

router = APIRouter()

DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "data")
DEMO_DATA_PATH = os.path.join(DATA_DIR, "demo_environment.json")

def load_demo_data():
    try:
        with open(DEMO_DATA_PATH, "r") as f:
            return json.load(f)
    except Exception as e:
        raise HTTPException(status_code=500, detail="Could not load demo data")

@router.get("/environment/current")
def get_current_environment(city: str = "Mumbai"):
    data = load_demo_data()
    # In a real app we'd filter by city, here we just return the demo data
    if data.get("city", "").lower() != city.lower():
        # Fallback if city mismatch
        data["city"] = city
        data["status"] = "DEMO_FALLBACK"
    return data

@router.get("/environment/timeline")
def get_environment_timeline(city: str = "Mumbai"):
    # Mocking timeline based on diurnal cycle from frontend
    return {
        "city": city,
        "status": "OBSERVED",
        "timeline": [
            {"timestamp": "06:00", "aqi": 184, "pm25": 78, "pm10": 128, "no2": 52, "so2": 9, "o3": 64, "temperature": 26, "wind_speed": 8, "status": "OBSERVED"},
            {"timestamp": "09:00", "aqi": 198, "pm25": 88, "pm10": 142, "no2": 68, "so2": 11, "o3": 78, "temperature": 29, "wind_speed": 10, "status": "OBSERVED"},
            {"timestamp": "12:00", "aqi": 168, "pm25": 68, "pm10": 112, "no2": 42, "so2": 8, "o3": 96, "temperature": 32, "wind_speed": 12, "status": "OBSERVED"},
            {"timestamp": "15:00", "aqi": 144, "pm25": 54, "pm10": 96, "no2": 36, "so2": 7, "o3": 110, "temperature": 33, "wind_speed": 15, "status": "OBSERVED"},
            {"timestamp": "18:00", "aqi": 182, "pm25": 76, "pm10": 124, "no2": 58, "so2": 9, "o3": 84, "temperature": 30, "wind_speed": 11, "status": "OBSERVED"},
            {"timestamp": "21:00", "aqi": 174, "pm25": 72, "pm10": 118, "no2": 48, "so2": 8, "o3": 72, "temperature": 28, "wind_speed": 9, "status": "OBSERVED"}
        ]
    }
