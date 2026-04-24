from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from app.config import settings
from app.database import engine
from app.routers import auth, uploads, analyses


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Reset uploads stuck in pending/processing (server restarted mid-task)
    async with engine.begin() as conn:
        await conn.execute(
            text(
                "UPDATE uploads SET status='failed', "
                "error_message='Servidor reiniciado durante o processamento' "
                "WHERE status IN ('pending', 'processing')"
            )
        )
    yield


app = FastAPI(title="SheetMind API", version="0.1.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_origin_regex=r"https://.*\.railway\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/v1/auth", tags=["auth"])
app.include_router(uploads.router, prefix="/api/v1/uploads", tags=["uploads"])
app.include_router(analyses.router, prefix="/api/v1/analyses", tags=["analyses"])


@app.get("/api/v1/health")
async def health():
    return {"status": "ok", "version": "0.1.0"}
