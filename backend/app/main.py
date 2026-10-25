import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.core.config import settings
from app.core.database import engine, Base
from app.seed.seed_data import seed_database

# Import routers
from app.api.v1 import (
    auth, products, catalog, pricing, buyers, inquiries,
    quotations, orders, passports, marketing, packaging,
    schemes, finances, feedback, clusters, ai_manager,
    notifications, admin
)

# Initialize database schema and initial data
Base.metadata.create_all(bind=engine)
try:
    seed_database()
except Exception as e:
    print(f"Notice: Seed check: {e}")

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="AI-Driven Market Linkage & Smart Cataloging Platform for Marginalized Artisans, Weavers, and Craft Clusters",
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url=f"{settings.API_V1_STR}/docs",
    redoc_url=f"{settings.API_V1_STR}/redoc"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files for uploads (product photos, enhanced studio images, QR codes)
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

# Include API Routers
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(products.router, prefix=settings.API_V1_STR)
app.include_router(catalog.router, prefix=settings.API_V1_STR)
app.include_router(pricing.router, prefix=settings.API_V1_STR)
app.include_router(buyers.router, prefix=settings.API_V1_STR)
app.include_router(inquiries.router, prefix=settings.API_V1_STR)
app.include_router(quotations.router, prefix=settings.API_V1_STR)
app.include_router(orders.router, prefix=settings.API_V1_STR)
app.include_router(passports.router, prefix=settings.API_V1_STR)
app.include_router(marketing.router, prefix=settings.API_V1_STR)
app.include_router(packaging.router, prefix=settings.API_V1_STR)
app.include_router(schemes.router, prefix=settings.API_V1_STR)
app.include_router(finances.router, prefix=settings.API_V1_STR)
app.include_router(feedback.router, prefix=settings.API_V1_STR)
app.include_router(clusters.router, prefix=settings.API_V1_STR)
app.include_router(ai_manager.router, prefix=settings.API_V1_STR)
app.include_router(notifications.router, prefix=settings.API_V1_STR)
app.include_router(admin.router, prefix=settings.API_V1_STR)

from fastapi.responses import FileResponse
from app.core.config import ROOT_DIR

@app.get(f"{settings.API_V1_STR}/health")
def api_health():
    return {
        "app": "ShilpAI API",
        "status": "online",
        "version": settings.VERSION,
        "docs_url": f"{settings.API_V1_STR}/docs",
        "description": "From Craft to Commerce — AI Business Manager for Artisans"
    }

from fastapi import Request

# Mount built React frontend if available
frontend_dist = os.path.join(ROOT_DIR, "frontend", "dist")
if os.path.exists(frontend_dist):
    assets_dir = os.path.join(frontend_dist, "assets")
    if os.path.exists(assets_dir):
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

    @app.get("/{full_path:path}")
    async def serve_spa(request: Request, full_path: str):
        if full_path.startswith("api") or full_path.startswith("uploads"):
            return api_health()
        # If client explicitly requests json on root
        if full_path == "" and "application/json" in request.headers.get("accept", ""):
            return api_health()
        file_path = os.path.join(frontend_dist, full_path)
        if os.path.isfile(file_path):
            return FileResponse(file_path)
        return FileResponse(os.path.join(frontend_dist, "index.html"))
else:
    @app.get("/")
    def root():
        return {
            "app": "ShilpAI API",
            "status": "online",
            "version": settings.VERSION,
            "docs_url": f"{settings.API_V1_STR}/docs",
            "description": "From Craft to Commerce — AI Business Manager for Artisans"
        }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
