from fastapi import APIRouter

router = APIRouter()

@router.get("/forecast")
def get_forecast(city: str = "Mumbai"):
    return {
        "city": city,
        "metric": "AQI",
        "current": 168,
        "status": "MODEL_FORECAST",
        "model": {
            "name": "VAYU Baseline Forecast",
            "type": "time-series baseline"
        },
        "confidence": 0.82,
        "forecast": [
            {"time": "Now", "value": 168},
            {"time": "6h", "value": 182},
            {"time": "12h", "value": 174},
            {"time": "18h", "value": 198},
            {"time": "24h", "value": 184}
        ]
    }
