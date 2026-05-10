"""
Application entry point.

"""

from fastapi import FastAPI

from app.routes.auth import router as auth_router


app = FastAPI(
    title="Dog Sitter Marketplace",
    description="Pet sitter marketplace with AI sitter matching and RAG chatbot",
    version="0.1.0",
)

app.include_router(auth_router)


@app.get("/health")
def health_check():
    """
    App healthcheck endpoint - Public endpoint
    """

    return {"status": "ok"}
