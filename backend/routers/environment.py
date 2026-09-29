"""
Environment Endpoint — GET /api/environment/current?city=Mumbai
                      GET /api/environment/timeline?city=Mumbai

Returns current observed environment data and diurnal timeline.
Mumbai data is the primary observed dataset.
Other cities return DEMO_FALLBACK with their approximate conditions.
"""

import json
import os
from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException

router = APIRouter()

DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "data")
DEMO_DATA_PATH = os.path.join(DATA_DIR, "demo_environment.json")


def load_demo_data():
    try:
        with open(DEMO_DATA_PATH, "r") as f:
            return json.load(f)
    except Exception:
        raise HTTPException(status_code=500, detail="Could not load demo data")


# Static per-city environment snapshots for cities we can serve
CITY_ENVIRONMENTS = {
    "mumbai": None,  # loaded from demo_environment.json (primary observed)
    "delhincr": {
        "city": "Delhi NCR",
        "timestamp": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "status": "DEMO_FALLBACK",
        "source": "demo/representative-estimates",
        "location": {"lat": 28.6448, "lon": 77.2167},
        "air_quality": {"aqi": 248, "pm25": 115, "pm10": 186, "no2": 82, "so2": 14, "o3": 52},
        "weather": {"temperature": 31, "humidity": 55, "wind_speed": 8, "wind_direction": "W"},
    },
    "delhi": {
        "city": "Delhi NCR",
        "timestamp": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "status": "DEMO_FALLBACK",
        "source": "demo/representative-estimates",
        "location": {"lat": 28.6448, "lon": 77.2167},
        "air_quality": {"aqi": 248, "pm25": 115, "pm10": 186, "no2": 82, "so2": 14, "o3": 52},
        "weather": {"temperature": 31, "humidity": 55, "wind_speed": 8, "wind_direction": "W"},
    },
    "bengaluru": {
        "city": "Bengaluru",
        "timestamp": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "status": "DEMO_FALLBACK",
        "source": "demo/representative-estimates",
        "location": {"lat": 12.9716, "lon": 77.5946},
        "air_quality": {"aqi": 78, "pm25": 28, "pm10": 56, "no2": 22, "so2": 4, "o3": 42},
        "weather": {"temperature": 24, "humidity": 68, "wind_speed": 15, "wind_direction": "SE"},
    },
    "bangalore": {
        "city": "Bengaluru",
        "timestamp": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "status": "DEMO_FALLBACK",
        "source": "demo/representative-estimates",
        "location": {"lat": 12.9716, "lon": 77.5946},
        "air_quality": {"aqi": 78, "pm25": 28, "pm10": 56, "no2": 22, "so2": 4, "o3": 42},
        "weather": {"temperature": 24, "humidity": 68, "wind_speed": 15, "wind_direction": "SE"},
    },
    "singapore": {
        "city": "Singapore",
        "timestamp": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "status": "DEMO_FALLBACK",
        "source": "demo/representative-estimates",
        "location": {"lat": 1.3521, "lon": 103.8198},
        "air_quality": {"aqi": 42, "pm25": 12, "pm10": 24, "no2": 18, "so2": 2, "o3": 38},
        "weather": {"temperature": 30, "humidity": 82, "wind_speed": 10, "wind_direction": "E"},
    },
    "london": {
        "city": "London",
        "timestamp": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "status": "DEMO_FALLBACK",
        "source": "demo/representative-estimates",
        "location": {"lat": 51.5074, "lon": -0.1278},
        "air_quality": {"aqi": 36, "pm25": 10, "pm10": 20, "no2": 28, "so2": 2, "o3": 34},
        "weather": {"temperature": 18, "humidity": 72, "wind_speed": 14, "wind_direction": "SW"},
    },
}

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

    # Special case: Mumbai uses the JSON file (primary observed data)
    if city_key == "mumbai":
        data = load_demo_data()
        data["timestamp"] = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
        return data

    for key in CITY_ENVIRONMENTS:
        if key in city_key or city_key in key:
            if CITY_ENVIRONMENTS[key] is not None:
                env = dict(CITY_ENVIRONMENTS[key])
                env["timestamp"] = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
                return env

    # Unknown city — generic fallback
    return {
        "city": city,
        "timestamp": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "status": "DEMO_FALLBACK",
        "source": "demo/generic-fallback",
        "location": {"lat": 0.0, "lon": 0.0},
        "air_quality": {"aqi": 80, "pm25": 32, "pm10": 60, "no2": 24, "so2": 4, "o3": 40},
        "weather": {"temperature": 25, "humidity": 65, "wind_speed": 10, "wind_direction": "N"},
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
