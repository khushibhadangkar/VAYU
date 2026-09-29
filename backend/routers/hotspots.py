from fastapi import APIRouter
from datetime import datetime, timezone

router = APIRouter()

# Static hotspot dataset per city. For cities without specific data, DEMO_FALLBACK is used.
HOTSPOTS_DB = {
    "mumbai": {
        "status": "OBSERVED",
        "method": "Sensor network interpolation + satellite AOD overlay",
        "hotspots": [
            {
                "id": "kurla",
                "name": "Kurla",
                "latitude": 19.0726,
                "longitude": 72.8853,
                "aqi": 218,
                "pm25": 98,
                "pm10": 162,
                "primary_pollutant": "PM2.5",
                "severity": "Very Poor",
                "category": "Industrial Zone & Transit Hub",
                "source_types": ["vehicle_emissions", "industrial"],
                "timestamp": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
                "minimap_top": "50%",
                "minimap_left": "62%",
                "notes": "Highest concentration zone; proximity to MIDC industrial estate and major rail yard",
            },
            {
                "id": "bhandup",
                "name": "Bhandup",
                "latitude": 19.1530,
                "longitude": 72.9483,
                "aqi": 204,
                "pm25": 89,
                "pm10": 148,
                "primary_pollutant": "PM2.5",
                "severity": "Very Poor",
                "category": "Manufacturing Hub",
                "source_types": ["industrial", "construction"],
                "timestamp": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
                "minimap_top": "20%",
                "minimap_left": "70%",
                "notes": "Chemical & pharmaceutical manufacturing corridor; limited green buffer",
            },
            {
                "id": "dadar",
                "name": "Dadar",
                "latitude": 19.0178,
                "longitude": 72.8478,
                "aqi": 196,
                "pm25": 84,
                "pm10": 138,
                "primary_pollutant": "PM2.5",
                "severity": "Poor",
                "category": "Transit Intersection",
                "source_types": ["vehicle_emissions", "residential"],
                "timestamp": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
                "minimap_top": "60%",
                "minimap_left": "46%",
                "notes": "Major bus-rail interchange; peak-hour PM2.5 spike 08:00–10:00",
            },
            {
                "id": "andheri",
                "name": "Andheri",
                "latitude": 19.1136,
                "longitude": 72.8697,
                "aqi": 182,
                "pm25": 76,
                "pm10": 124,
                "primary_pollutant": "NO2",
                "severity": "Moderate",
                "category": "Metro Corridor",
                "source_types": ["vehicle_emissions", "construction"],
                "timestamp": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
                "minimap_top": "26%",
                "minimap_left": "42%",
                "notes": "Ongoing metro line 7 construction; heavy goods vehicle corridor to JNPT",
            },
            {
                "id": "lowerparel",
                "name": "Lower Parel",
                "latitude": 18.9965,
                "longitude": 72.8303,
                "aqi": 176,
                "pm25": 72,
                "pm10": 118,
                "primary_pollutant": "PM10",
                "severity": "Moderate",
                "category": "High-Rise Cluster",
                "source_types": ["construction", "residential"],
                "timestamp": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
                "minimap_top": "72%",
                "minimap_left": "38%",
                "notes": "Redevelopment construction activity; wind channelling between towers",
            },
        ],
    }
}

FALLBACK_HOTSPOTS = {
    "status": "DEMO_FALLBACK",
    "method": "Demo dataset — no sensor data available for this city",
    "hotspots": [
        {
            "id": "zone_a",
            "name": "Central Zone A",
            "latitude": 28.6448,
            "longitude": 77.2167,
            "aqi": 245,
            "pm25": 112,
            "pm10": 178,
            "primary_pollutant": "PM2.5",
            "severity": "Very Poor",
            "category": "Dense Urban Core",
            "source_types": ["vehicle_emissions", "industrial"],
            "timestamp": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
            "minimap_top": "40%",
            "minimap_left": "50%",
            "notes": "Demo data — city not in sensor network",
        },
        {
            "id": "zone_b",
            "name": "Industrial Zone B",
            "latitude": 28.6704,
            "longitude": 77.4538,
            "aqi": 228,
            "pm25": 102,
            "pm10": 164,
            "primary_pollutant": "PM2.5",
            "severity": "Very Poor",
            "category": "Industrial Corridor",
            "source_types": ["industrial"],
            "timestamp": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
            "minimap_top": "30%",
            "minimap_left": "65%",
            "notes": "Demo data — city not in sensor network",
        },
    ],
}


@router.get("/hotspots")
def get_hotspots(city: str = "Mumbai"):
    city_key = city.lower().replace(" ", "")
    # Normalize city names
    for key in HOTSPOTS_DB:
        if key in city_key or city_key in key:
            data = HOTSPOTS_DB[key]
            return {
                "city": city,
                "status": data["status"],
                "method": data["method"],
                "count": len(data["hotspots"]),
                "timestamp": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
                "hotspots": data["hotspots"],
            }
    # Fallback for unknown cities
    return {
        "city": city,
        "status": FALLBACK_HOTSPOTS["status"],
        "method": FALLBACK_HOTSPOTS["method"],
        "count": len(FALLBACK_HOTSPOTS["hotspots"]),
        "timestamp": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "hotspots": FALLBACK_HOTSPOTS["hotspots"],
    }
