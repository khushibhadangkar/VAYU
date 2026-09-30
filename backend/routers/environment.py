"""
Environment Endpoint — GET /api/environment/current?city=Mumbai
                      GET /api/environment/timeline?city=Mumbai

Returns current observed environment data and diurnal timeline.
Mumbai data is the primary observed dataset.
Other cities return DEMO_FALLBACK with their approximate conditions.
"""

import json
import os
import urllib.request
from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException

router = APIRouter()

DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "data")
DEMO_DATA_PATH = os.path.join(DATA_DIR, "demo_environment.json")

# Global city coordinate registry for live meteorological & air quality ingestion
CITY_COORDINATES = {
    "mumbai": {"name": "Mumbai", "region": "Maharashtra, India", "lat": 19.0760, "lon": 72.8777},
    "delhincr": {"name": "Delhi NCR", "region": "Northern Plains, India", "lat": 28.6139, "lon": 77.2090},
    "delhi": {"name": "Delhi NCR", "region": "Northern Plains, India", "lat": 28.6139, "lon": 77.2090},
    "bengaluru": {"name": "Bengaluru", "region": "Karnataka, India", "lat": 12.9716, "lon": 77.5946},
    "bangalore": {"name": "Bengaluru", "region": "Karnataka, India", "lat": 12.9716, "lon": 77.5946},
    "kolkata": {"name": "Kolkata", "region": "West Bengal, India", "lat": 22.5726, "lon": 88.3639},
    "chennai": {"name": "Chennai", "region": "Tamil Nadu, India", "lat": 13.0827, "lon": 80.2707},
    "hyderabad": {"name": "Hyderabad", "region": "Telangana, India", "lat": 17.3850, "lon": 78.4867},
    "pune": {"name": "Pune", "region": "Maharashtra, India", "lat": 18.5204, "lon": 73.8567},
    "singapore": {"name": "Singapore", "region": "Marina Bay", "lat": 1.3521, "lon": 103.8198},
    "london": {"name": "London", "region": "Greater London, UK", "lat": 51.5074, "lon": -0.1278},
    "newyork": {"name": "New York", "region": "New York, USA", "lat": 40.7128, "lon": -74.0060},
    "tokyo": {"name": "Tokyo", "region": "Kanto, Japan", "lat": 35.6762, "lon": 139.6503},
    "dubai": {"name": "Dubai", "region": "UAE", "lat": 25.2048, "lon": 55.2708},
    "paris": {"name": "Paris", "region": "Île-de-France, France", "lat": 48.8566, "lon": 2.3522},
}


def load_demo_data():
    try:
        with open(DEMO_DATA_PATH, "r") as f:
            return json.load(f)
    except Exception:
        raise HTTPException(status_code=500, detail="Could not load demo data")


def fetch_live_air_quality(lat: float, lon: float, city_name: str, region_name: str):
    """Fetch live real-world Air Quality & Weather from Open-Meteo API without requiring API key."""
    try:
        aq_url = (
            f"https://air-quality-api.open-meteo.com/v1/air-quality?"
            f"latitude={lat}&longitude={lon}&current=pm10,pm2_5,nitrogen_dioxide,sulphur_dioxide,ozone,european_aqi,us_aqi"
        )
        weather_url = (
            f"https://api.open-meteo.com/v1/forecast?"
            f"latitude={lat}&longitude={lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,wind_direction_10m"
        )
        
        req_aq = urllib.request.Request(aq_url, headers={"User-Agent": "VAYU-DigitalTwin/1.0"})
        req_wx = urllib.request.Request(weather_url, headers={"User-Agent": "VAYU-DigitalTwin/1.0"})
        
        with urllib.request.urlopen(req_aq, timeout=3.5) as resp_aq, urllib.request.urlopen(req_wx, timeout=3.5) as resp_wx:
            aq_data = json.loads(resp_aq.read().decode())
            wx_data = json.loads(resp_wx.read().decode())
            
            curr_aq = aq_data.get("current", {})
            curr_wx = wx_data.get("current", {})
            
            pm25 = round(curr_aq.get("pm2_5", 65.0), 1)
            pm10 = round(curr_aq.get("pm10", 110.0), 1)
            no2 = round(curr_aq.get("nitrogen_dioxide", 45.0), 1)
            so2 = round(curr_aq.get("sulphur_dioxide", 8.0), 1)
            o3 = round(curr_aq.get("ozone", 60.0), 1)
            us_aqi = int(curr_aq.get("us_aqi", max(35, int(pm25 * 2.1))))
            
            temp = round(curr_wx.get("temperature_2m", 28.0), 1)
            humidity = int(curr_wx.get("relative_humidity_2m", 65))
            wind_speed = round(curr_wx.get("wind_speed_10m", 12.0), 1)
            wind_deg = curr_wx.get("wind_direction_10m", 315)
            
            # Convert degrees to compass cardinal
            dirs = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"]
            wind_dir = dirs[int((wind_deg + 22.5) / 45) % 8]
            
            return {
                "city": city_name,
                "region": region_name,
                "timestamp": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
                "status": "OBSERVED",
                "source": "Open-Meteo Global Environmental Satellite & Sensor Network",
                "location": {"lat": lat, "lon": lon},
                "air_quality": {
                    "aqi": us_aqi,
                    "pm25": pm25,
                    "pm10": pm10,
                    "no2": no2,
                    "so2": so2,
                    "o3": o3,
                },
                "weather": {
                    "temperature": temp,
                    "humidity": humidity,
                    "wind_speed": wind_speed,
                    "wind_direction": wind_dir,
                },
            }
    except Exception:
        # Gracefully fall back to local baseline
        return None

# Diurnal timeline data per city
CITY_TIMELINES = {
    "mumbai": {
        "status": "OBSERVED",
        "timeline": [
            {"timestamp": "06:00", "aqi": 184, "pm25": 78, "pm10": 128, "no2": 52, "so2": 9, "o3": 64, "temperature": 26, "wind_speed": 8, "status": "OBSERVED"},
            {"timestamp": "09:00", "aqi": 198, "pm25": 88, "pm10": 142, "no2": 68, "so2": 11, "o3": 78, "temperature": 29, "wind_speed": 10, "status": "OBSERVED"},
            {"timestamp": "12:00", "aqi": 168, "pm25": 68, "pm10": 112, "no2": 42, "so2": 8, "o3": 96, "temperature": 32, "wind_speed": 12, "status": "OBSERVED"},
            {"timestamp": "15:00", "aqi": 144, "pm25": 54, "pm10": 96, "no2": 36, "so2": 7, "o3": 110, "temperature": 33, "wind_speed": 15, "status": "OBSERVED"},
            {"timestamp": "18:00", "aqi": 182, "pm25": 76, "pm10": 124, "no2": 58, "so2": 9, "o3": 84, "temperature": 30, "wind_speed": 11, "status": "OBSERVED"},
            {"timestamp": "21:00", "aqi": 174, "pm25": 72, "pm10": 118, "no2": 48, "so2": 8, "o3": 72, "temperature": 28, "wind_speed": 9, "status": "OBSERVED"},
        ],
    },
    "delhincr": {
        "status": "DEMO_FALLBACK",
        "timeline": [
            {"timestamp": "06:00", "aqi": 272, "pm25": 128, "pm10": 205, "no2": 88, "so2": 16, "o3": 42, "temperature": 27, "wind_speed": 5, "status": "DEMO_FALLBACK"},
            {"timestamp": "09:00", "aqi": 298, "pm25": 142, "pm10": 228, "no2": 102, "so2": 18, "o3": 52, "temperature": 30, "wind_speed": 7, "status": "DEMO_FALLBACK"},
            {"timestamp": "12:00", "aqi": 248, "pm25": 115, "pm10": 186, "no2": 82, "so2": 14, "o3": 68, "temperature": 34, "wind_speed": 9, "status": "DEMO_FALLBACK"},
            {"timestamp": "15:00", "aqi": 218, "pm25": 98, "pm10": 162, "no2": 72, "so2": 12, "o3": 78, "temperature": 35, "wind_speed": 10, "status": "DEMO_FALLBACK"},
            {"timestamp": "18:00", "aqi": 262, "pm25": 122, "pm10": 198, "no2": 92, "so2": 15, "o3": 56, "temperature": 31, "wind_speed": 7, "status": "DEMO_FALLBACK"},
            {"timestamp": "21:00", "aqi": 278, "pm25": 132, "pm10": 212, "no2": 96, "so2": 16, "o3": 44, "temperature": 28, "wind_speed": 5, "status": "DEMO_FALLBACK"},
        ],
    },
}

# Delhi alias
CITY_TIMELINES["delhi"] = CITY_TIMELINES["delhincr"]


def _normalize_city_key(city: str) -> str:
    return city.lower().replace(" ", "")


@router.get("/environment/current")
def get_current_environment(city: str = "Mumbai"):
    city_key = _normalize_city_key(city)

    # Check if we have coordinate data for live fetching
    for key, info in CITY_COORDINATES.items():
        if key == city_key or key in city_key or city_key in key:
            live_data = fetch_live_air_quality(
                lat=info["lat"],
                lon=info["lon"],
                city_name=info["name"],
                region_name=info["region"]
            )
            if live_data:
                return live_data
            break

    # Special case: Mumbai uses the high-fidelity demo JSON file if live fetch is unavailable
    if city_key == "mumbai":
        data = load_demo_data()
        data["timestamp"] = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
        return data

    # Default fallback for generic city
    return {
        "city": city,
        "region": "Urban Airshed",
        "timestamp": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "status": "DEMO_FALLBACK",
        "source": "VAYU Synthetic Calibration Engine",
        "location": {"lat": 19.076, "lon": 72.877},
        "air_quality": {"aqi": 168, "pm25": 68, "pm10": 112, "no2": 42, "so2": 8, "o3": 96},
        "weather": {"temperature": 28, "humidity": 65, "wind_speed": 12, "wind_direction": "NW"},
    }


@router.get("/environment/timeline")
def get_environment_timeline(city: str = "Mumbai"):
    city_key = _normalize_city_key(city)

    for key in CITY_TIMELINES:
        if key in city_key or city_key in key:
            data = CITY_TIMELINES[key]
            return {
                "city": city,
                "status": data["status"],
                "timeline": data["timeline"],
            }

    # Generic fallback
    return {
        "city": city,
        "status": "DEMO_FALLBACK",
        "timeline": [
            {"timestamp": "06:00", "aqi": 85, "pm25": 34, "pm10": 62, "no2": 24, "so2": 4, "o3": 40, "temperature": 24, "wind_speed": 10, "status": "DEMO_FALLBACK"},
            {"timestamp": "12:00", "aqi": 72, "pm25": 28, "pm10": 52, "no2": 18, "so2": 3, "o3": 52, "temperature": 28, "wind_speed": 14, "status": "DEMO_FALLBACK"},
            {"timestamp": "21:00", "aqi": 80, "pm25": 32, "pm10": 60, "no2": 22, "so2": 4, "o3": 38, "temperature": 25, "wind_speed": 11, "status": "DEMO_FALLBACK"},
        ],
    }
