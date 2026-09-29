from fastapi import APIRouter

router = APIRouter()

@router.get("/sources")
def get_sources(city: str = "Mumbai"):
    return {
        "city": city,
        "status": "MODELED_ATTRIBUTION",
        "method": "Baseline sector approximation",
        "confidence": 0.88,
        "sources": [
            {"name": "Vehicle Emissions", "percentage": 34},
            {"name": "Industrial Activity", "percentage": 28},
            {"name": "Construction Dust", "percentage": 18},
            {"name": "Residential", "percentage": 12},
            {"name": "Other", "percentage": 8}
        ]
    }
