# app/routes/payments.py

from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import require_auth, require_owner, require_sitter
from app.schemas.payment import (
    CheckoutSessionRequest,
    CheckoutSessionResponse,
    ConnectOnboardingResponse,
    RefundRequest,
    RefundResponse,
)
from app.services import payment_service

router = APIRouter(prefix="/payments", tags=["Payments"])


@router.post("/create-checkout-session", response_model=CheckoutSessionResponse)
async def create_checkout_session(
    data: CheckoutSessionRequest,
    current_user=Depends(require_owner),
    db: AsyncSession = Depends(get_db),
):

    try:
        url = await payment_service.create_checkout_session(data.booking_id, db)
        return CheckoutSessionResponse(checkout_url=url)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/webhook")
async def stripe_webhook(
    request: Request,
    db: AsyncSession = Depends(get_db),
):
    # Raw bytes — must reach signature verification untouched
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature")

    if not sig_header:
        raise HTTPException(status_code=400, detail="Missing Stripe signature")

    try:
        await payment_service.handle_webhook(payload, sig_header, db)
        return {"status": "ok"}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/connect/onboard", response_model=ConnectOnboardingResponse)
async def connect_onboard(
    current_user=Depends(require_sitter),
    db: AsyncSession = Depends(get_db),
):
    try:
        url = await payment_service.create_connect_onboarding(current_user.user_id, db)
        return ConnectOnboardingResponse(onboarding_url=url)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/refund", response_model=RefundResponse)
async def refund_booking(
    data: RefundRequest,
    current_user=Depends(require_owner),
    db: AsyncSession = Depends(get_db),
):
    try:
        amount = await payment_service.refund_booking(data.booking_id, db)
        return RefundResponse(refunded=True, amount=amount)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
