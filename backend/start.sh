#!/bin/sh
set -e

echo "[startup] Running alembic migrations..."
alembic upgrade head
echo "[startup] Alembic done. Starting uvicorn on port ${PORT:-8000}..."
exec uvicorn app.main:app --host 0.0.0.0 --port "${PORT:-8000}" --log-level info
