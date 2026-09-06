import time
import uuid
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.core.security import SecurityHeadersMiddleware
from app.config import settings
from app.database import init_db
from app.cache.redis_client import cache
from app.api.v1 import api_v1_router
from app.utils.logging import logger


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info(f"Starting {settings.APP_NAME} v{settings.APP_VERSION}...")
    await init_db()
    await cache.initialize()
    yield
    # Shutdown
    logger.info("Shutting down services...")
    await cache.close()


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Production-grade AI Asset Intelligence Agent backend for Binance Agent OS Hackathon.",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc"
)

# Security Headers and Rate Limiting
app.add_middleware(SecurityHeadersMiddleware)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def request_timing_and_logging(request: Request, call_next):
    request_id = str(uuid.uuid4())
    start_time = time.time()
    response = await call_next(request)
    duration_ms = round((time.time() - start_time) * 1000, 2)
    response.headers["X-Request-ID"] = request_id
    response.headers["X-Response-Time"] = f"{duration_ms}ms"
    return response


# Mount API routers
app.include_router(api_v1_router)


@app.get("/health", tags=["Health"])
async def health_check():
    return {
        "status": "healthy",
        "service": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "environment": settings.ENV
    }


@app.get("/", tags=["Root"])
async def root():
    return {
        "message": "Welcome to NetroBNB AI Asset Intelligence Agent API",
        "docs": "/docs",
        "chat_endpoint": f"{settings.API_V1_PREFIX}/chat",
        "assets_endpoint": f"{settings.API_V1_PREFIX}/assets"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
