"""
Scenario Engine — POST /api/scenario

Applies deterministic, documented reduction coefficients to a baseline AQI.
Results are labelled SCENARIO and come with explicit assumptions.
No claim of real-world causal certainty is made.
"""

from fastapi import APIRouter
from pydantic import BaseModel, Field

router = APIRouter()

# Baseline AQI values by city (OBSERVED or best available estimate)
CITY_BASELINES = {
    "mumbai": 168,
    "delhincr": 248,
    "delhi": 248,
    "bengaluru": 78,
    "bangalore": 78,
    "singapore": 42,
    "london": 36,
}

# Reduction coefficients — fraction of AQI reduced per 1% of intervention
# These are modelled estimates based on sectoral contribution weights
COEFFICIENTS = {
    "electric_fleet_pct": {
        # Vehicle emissions ≈ 34% of AQI; electric fleet replaces tailpipe emissions
        # Coefficient: 0.34 * 0.012 ≈ 0.0041 per 1% fleet transition → ~0.69 AQI per 1%
        "aqi_per_pct": 0.69,
        "description": "Electric vehicle fleet transition reduces tailpipe PM2.5 and NOx",
        "pollutant": "PM2.5, NOx",
        "sector": "vehicle_emissions",
    },
    "dust_suppression_pct": {
        # Construction dust ≈ 18% of AQI; suppression reduces PM10 and coarse PM
        # Coefficient: 0.18 * 0.012 ≈ 0.0022 → ~0.43 AQI per 1%
        "aqi_per_pct": 0.43,
        "description": "Water mist cannons, windbreaks, and site coverings reduce coarse particulate",
        "pollutant": "PM10, PM2.5",
        "sector": "construction",
    },
    "industrial_offpeak_pct": {
        # Industrial ≈ 28% of AQI; off-peak shift spreads emissions across nocturnal conditions
        # Nocturnal dispersion reduces effective ground-level concentration by ~60% of shifted load
        # Coefficient: 0.28 * 0.012 * 0.6 ≈ 0.002 → ~0.54 AQI per 1%
        "aqi_per_pct": 0.54,
        "description": "Rerouting industrial peaks to off-peak hours reduces inversion-layer accumulation",
        "pollutant": "SO2, PM2.5, NOx",
        "sector": "industrial",
    },
}

MAX_TOTAL_REDUCTION_PCT = 0.65  # Cap: no scenario can claim more than 65% total reduction


class ScenarioRequest(BaseModel):
    city: str = Field(default="Mumbai", description="Target city name")
    electric_fleet_pct: float = Field(default=0.0, ge=0, le=100, description="% of vehicle fleet electrified")
    dust_suppression_pct: float = Field(default=0.0, ge=0, le=100, description="% of construction sites with suppression")
    industrial_offpeak_pct: float = Field(default=0.0, ge=0, le=100, description="% of industrial load shifted to off-peak")


@router.post("/scenario")
def run_scenario(request: ScenarioRequest):
    city_key = request.city.lower().replace(" ", "")
    baseline_aqi = CITY_BASELINES.get(city_key, 168)

    # Calculate raw reduction from each intervention
    fleet_reduction = request.electric_fleet_pct * COEFFICIENTS["electric_fleet_pct"]["aqi_per_pct"]
    dust_reduction = request.dust_suppression_pct * COEFFICIENTS["dust_suppression_pct"]["aqi_per_pct"]
    industrial_reduction = request.industrial_offpeak_pct * COEFFICIENTS["industrial_offpeak_pct"]["aqi_per_pct"]

    total_raw_reduction = fleet_reduction + dust_reduction + industrial_reduction

    # Cap total reduction at MAX_TOTAL_REDUCTION_PCT of baseline
    max_allowed_reduction = baseline_aqi * MAX_TOTAL_REDUCTION_PCT
    capped = total_raw_reduction > max_allowed_reduction
    effective_reduction = min(total_raw_reduction, max_allowed_reduction)

    scenario_aqi = max(30, round(baseline_aqi - effective_reduction))
    pct_change = round((effective_reduction / baseline_aqi) * 100, 1)

    # AQI category
    def aqi_category(aqi: int) -> str:
        if aqi <= 50: return "Good"
        if aqi <= 100: return "Satisfactory"
        if aqi <= 200: return "Moderate"
        if aqi <= 300: return "Poor"
        if aqi <= 400: return "Very Poor"
        return "Severe"

    interventions = []
    if request.electric_fleet_pct > 0:
        interventions.append({
            "type": "electric_fleet_pct",
            "value": request.electric_fleet_pct,
            "label": f"Electric Fleet {request.electric_fleet_pct:.0f}%",
            "aqi_reduction": round(fleet_reduction, 1),
            **{k: v for k, v in COEFFICIENTS["electric_fleet_pct"].items() if k != "aqi_per_pct"},
        })
    if request.dust_suppression_pct > 0:
        interventions.append({
            "type": "dust_suppression_pct",
            "value": request.dust_suppression_pct,
            "label": f"Dust Suppression {request.dust_suppression_pct:.0f}%",
            "aqi_reduction": round(dust_reduction, 1),
            **{k: v for k, v in COEFFICIENTS["dust_suppression_pct"].items() if k != "aqi_per_pct"},
        })
    if request.industrial_offpeak_pct > 0:
        interventions.append({
            "type": "industrial_offpeak_pct",
            "value": request.industrial_offpeak_pct,
            "label": f"Industrial Off-Peak Shift {request.industrial_offpeak_pct:.0f}%",
            "aqi_reduction": round(industrial_reduction, 1),
            **{k: v for k, v in COEFFICIENTS["industrial_offpeak_pct"].items() if k != "aqi_per_pct"},
        })

    return {
        "city": request.city,
        "status": "SCENARIO",
        "baseline_aqi": baseline_aqi,
        "scenario_aqi": scenario_aqi,
        "aqi_reduction": round(effective_reduction, 1),
        "pct_change": pct_change,
        "capped": capped,
        "baseline_category": aqi_category(baseline_aqi),
        "scenario_category": aqi_category(scenario_aqi),
        "interventions": interventions,
        "assumptions": [
            "Sectoral contribution weights based on CPCB sector-apportionment estimates for Indian metros",
            "Reduction coefficients are linear first-order approximations; actual non-linear atmospheric effects are not modelled",
            "Maximum plausible total reduction is capped at 65% of baseline to prevent unrealistic projections",
            "Industrial off-peak dispersal assumes nocturnal mixing height > 200m and wind speed > 4 m/s",
            "This is a SCENARIO model — results are illustrative, not real-world predictions",
        ],
        "model": "VAYU Deterministic Scenario Engine v1.0",
    }
