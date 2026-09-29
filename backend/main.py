from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import health, environment

app = FastAPI(title="VAYU Environmental Intelligence API", version="0.1.0")

# CORS config to allow frontend on 127.0.0.1:5173 or localhost:5173
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://127.0.0.1:5173", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router, prefix="/api", tags=["Health"])
app.include_router(environment.router, prefix="/api", tags=["Environment"])

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
