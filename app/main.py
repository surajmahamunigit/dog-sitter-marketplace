"""
Application entry point.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import (
    auth,
    care_instructions,
    users,
    dogs,
    sitters,
    bookings,
    payments,
    matches,
    rag,
    reviews,
)
from app.core.logging_config import setup_logging

logger = setup_logging("/pawsitter/api", "pawsitter.api")
logger.info("PawSitter API starting up")

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "https://d1m0s3pe7745hf.cloudfront.net",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(users.router)
app.include_router(dogs.router)
app.include_router(sitters.router)
app.include_router(bookings.router)
app.include_router(payments.router)
app.include_router(matches.router)
app.include_router(care_instructions.router)
app.include_router(rag.router)
app.include_router(reviews.router)


@app.get("/health")
def health():
    return {"status": "ok"}
