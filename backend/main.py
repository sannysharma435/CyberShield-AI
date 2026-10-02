from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.api.url import router as url_router
from backend.api.media import router as media_router
from backend.api.scans import router as scans_router
from backend.api.email import router as email_router
from backend.api.password import router as password_router
from backend.api.system import router as system_router

app = FastAPI(
    title="CyberShield AI",
    description="AI-powered Cybersecurity Assistant",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

app.include_router(url_router)
app.include_router(media_router)
app.include_router(scans_router)
app.include_router(email_router)
app.include_router(password_router)
app.include_router(system_router)


@app.get("/")
def root():
    return {
        "name": "CyberShield AI",
        "status": "online",
        "message": "CyberShield AI backend is running"
    }


@app.get("/health")
def health():
    return {
        "status": "healthy"
    }