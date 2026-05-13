""" "Application Configuration"""

import os
from dotenv import load_dotenv


load_dotenv()


def _require(key: str) -> str:
    """Read required environment variable and fail fast"""

    value = os.getenv(key)
    if not value:
        raise RuntimeError(f"Missing required environment variable: {key}")
    return value


# JWT
SECRET_KEY = _require("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_DAYS = int(os.getenv("ACCESS_TOKEN_EXPIRE_DAYS", "30"))

# Database
DATABASE_URL = _require("DATABASE_URL")


# APP
APP_ENV = os.getenv("APP_ENV", "development")


# Stripe
STRIPE_SECRET_KEY = _require("STRIPE_SECRET_KEY")
STRIPE_WEBHOOK_SECRET = _require("STRIPE_WEBHOOK_SECRET")
STRIPE_CONNECT_CLIENT_ID = _require("STRIPE_CONNECT_CLIENT_ID")
