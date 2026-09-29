from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import health, environment, forecast, sources, hotspots, scenario, validation

app = FastAPI(
    title="VAYU Environmental Intelligence API",
    version="0.2.0",
    description=(
        "Backend API for the VAYU Urban Environmental Digital Twin. "
        "Provides observed environment data, baseline forecasts, modelled source attribution, "
        "hotspot listings, scenario simulation, and historical validation metrics."
    ),
)

# CORS config to allow frontend on 127.0.0.1:5173 or localhost:5173
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://127.0.0.1:5173", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router,      prefix="/api", tags=["Health"])
app.include_router(environment.router, prefix="/api", tags=["Environment"])
app.include_router(forecast.router,    prefix="/api", tags=["Forecast"])
app.include_router(sources.router,     prefix="/api", tags=["Sources"])
app.include_router(hotspots.router,    prefix="/api", tags=["Hotspots"])
app.include_router(scenario.router,    prefix="/api", tags=["Scenario"])
app.include_router(validation.router,  prefix="/api", tags=["Validation"])

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
