"""
Forecast Endpoint — GET /api/forecast?city=Mumbai

Returns a 24-hour AQI forecast using a diurnal baseline model.
Labelled MODEL_FORECAST — not AI/deep-learning.
For cities without specific calibration, DEMO_FALLBACK is returned.
"""

import math
from fastapi import APIRouter
from datetime import datetime, timezone

router = APIRouter()

# City baseline AQI + diurnal amplitude + trend
CITY_FORECAST_PARAMS = {
    "mumbai": {
        "baseline": 168,
        "amplitude": 28,    # typical diurnal swing
        "trend_24h": +8,    # AQI tends to worsen slightly overnight
        "phase_hours": 3,   # Peak offset from midnight in hours (3 → peak ~09:00)
        "status": "MODEL_FORECAST",
    },
    "delhincr": {
        "baseline": 248,
        "amplitude": 42,
        "trend_24h": +12,
        "phase_hours": 3,
        "status": "MODEL_FORECAST",
    },
    "delhi": {
        "baseline": 248,
        "amplitude": 42,
        "trend_24h": +12,
        "phase_hours": 3,
        "status": "MODEL_FORECAST",
    },
    "bengaluru": {
        "baseline": 78,
        "amplitude": 18,
        "trend_24h": -4,
        "phase_hours": 4,
        "status": "MODEL_FORECAST",
    },
    "bangalore": {
        "baseline": 78,
        "amplitude": 18,
        "trend_24h": -4,
        "phase_hours": 4,
        "status": "MODEL_FORECAST",
    },
}

FORECAST_HOURS = [0, 3, 6, 9, 12, 15, 18, 21, 24]


def diurnal_aqi(baseline: int, amplitude: int, trend_24h: int, phase_hours: int, hour: float) -> int:
    """
    Simple sinusoidal diurnal model:
    AQI(t) = baseline + amplitude * sin(2π(t - phase) / 24) + (trend * t / 24)
    Peak at t = phase + 6 (mid-morning peak typical for urban PM2.5).
    """
    angle = 2 * math.pi * (hour - phase_hours) / 24
    diurnal = amplitude * math.sin(angle)
    trend = trend_24h * hour / 24
    return max(20, round(baseline + diurnal + trend))


@router.get("/forecast")
def get_forecast(city: str = "Mumbai"):
    city_key = city.lower().replace(" ", "")

    params = None
    for key in CITY_FORECAST_PARAMS:
        if key in city_key or city_key in key:
            params = CITY_FORECAST_PARAMS[key]
            break

    if params is None:
        # Fallback for unknown cities
        return {
            "city": city,
            "status": "DEMO_FALLBACK",
            "metric": "AQI",
            "model": {
                "name": "VAYU Diurnal Baseline Forecast",
                "type": "Sinusoidal diurnal model",
                "note": "No calibrated parameters available for this city; using generic defaults",
            },
            "confidence": 0.50,
            "current": 150,
            "forecast": [
                {"time": f"+{h}h", "hour_offset": h, "value": 150, "status": "DEMO_FALLBACK"}
                for h in FORECAST_HOURS
            ],
        }

    now_hour = datetime.now(timezone.utc).hour
    current_aqi = diurnal_aqi(params["baseline"], params["amplitude"], params["trend_24h"], params["phase_hours"], now_hour)

    forecast_points = []
    for h in FORECAST_HOURS:
        hour = (now_hour + h) % 24
        val = diurnal_aqi(params["baseline"], params["amplitude"], params["trend_24h"], params["phase_hours"], hour)
        label = "Now" if h == 0 else f"+{h}h"
        forecast_points.append({
            "time": label,
            "hour_offset": h,
            "value": val,
            "status": params["status"],
        })

    return {
        "city": city,
        "status": params["status"],
        "metric": "AQI",
        "current": current_aqi,
        "model": {
            "name": "VAYU Diurnal Baseline Forecast",
            "type": "Sinusoidal diurnal model (seasonal mean + time-of-day pattern)",
            "note": "Not an AI or deep learning model. Parameterised from seasonal CPCB averages.",
        },
        "confidence": 0.78,
        "forecast": forecast_points,
        "assumptions": [
            "Diurnal pattern fitted from seasonal monthly average CPCB data",
            "24h trend is a linear approximation of overnight AQI drift",
            "No weather forecast input used; actual wind/rain changes will shift values",
        ],
    }
