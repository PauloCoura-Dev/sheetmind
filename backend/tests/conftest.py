import os

# app.services importa o pipeline, que lê as configurações na importação.
# Valores falsos bastam: nenhum teste conecta no banco nem chama a API.
os.environ.setdefault("DATABASE_URL", "postgresql+asyncpg://test:test@localhost:5432/test")
os.environ.setdefault("SECRET_KEY", "test")
os.environ.setdefault("ANTHROPIC_API_KEY", "test")
