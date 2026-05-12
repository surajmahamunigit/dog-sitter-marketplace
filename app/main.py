"""
Application entry point.

"""

from fastapi import FastAPI

from app.routes import auth, users


app = FastAPI(
    title="Dog Sitter Marketplace",
    description="Pet sitter marketplace with AI sitter matching and RAG chatbot",
    version="0.1.0",
)

app.include_router(auth.router)
app.include_router(users.router)


@app.get("/health")
def health_check():
    """
    App healthcheck endpoint - Public endpoint
    """

    return {"status": "ok"}
