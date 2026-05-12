from pydantic import BaseModel
from uuid import UUID


class CheckoutSessionRequest(BaseModel):
    booking_id: UUID


class CheckoutSessionResponse(BaseModel):
    checkout_url: str


class ConnectOnboardingResponse(BaseModel):
    onboarding_url: str


class RefundRequest(BaseModel):
    booking_id: UUID


class RefundResponse(BaseModel):
    refunded: bool
    amount: int
