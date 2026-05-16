import stripe
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core import config
from app.models.booking import Booking
from app.models.payment import Payment
from app.models.user import User


stripe.api_key = config.STRIPE_SECRET_KEY


async def create_checkout_session(booking_id: UUID, db: AsyncSession) -> str:

    # Fetch the booking - verify it exists and is still pending
    result = await db.execute(select(Booking).where(Booking.id == booking_id))
    booking = result.scalar_one_or_none()

    if booking is None:
        raise ValueError("Booking not found")
    if booking.status != "pending":
        raise ValueError("Booking is not in pending state")

    # Ask the Stripe to create the checkout session
    session = stripe.checkout.Session.create(
        payment_method_types=["card"],
        line_items=[
            {
                "price_data": {
                    "currency": "usd",
                    "product_data": {"name": f"Dog sitting booking #{booking.id}"},
                    "unit_amount": booking.total_price,
                },
                "quantity": 1,
            }
        ],
        mode="payment",
        success_url="http://localhost:5173/booking-confirmed",
        cancel_url="http://localhost:5173/booking-cancelled",
        metadata={"booking_id": str(booking.id)},
    )

    return session.url


async def handle_webhook(payload: bytes, sig_header: str, db: AsyncSession) -> None:

    # Verify the signature before touching the payload
    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, config.STRIPE_WEBHOOK_SECRET
        )
    except stripe.error.SignatureVerificationError:
        raise ValueError("Invalid webhook signature")

    # Handle the event type we care about
    if event["type"] != "checkout.session.completed":
        return

    session = event["data"]["object"]
    booking_id = session["metadata"]["booking_id"]
    stripe_payment_id = session["payment_intent"]

    # Fetch the booking
    result = await db.execute(select(Booking).where(Booking.id == UUID(booking_id)))
    booking = result.scalar_one_or_none()

    if not booking:
        raise ValueError(f"Booking {booking_id} not found")

    # Update booking status
    booking.status = "pending"

    # Create the payment row
    payment = Payment(
        booking_id=booking.id,
        amount=booking.total_price,
        status="completed",
        stripe_payment_id=stripe_payment_id,
    )
    db.add(payment)
    await db.commit()


async def create_connect_onboarding(sitter_id: UUID, db: AsyncSession) -> str:

    # Fetch the sitter
    result = await db.execute(select(User).where(User.id == sitter_id))
    sitter = result.scalar_one_or_none()

    if not sitter:
        raise ValueError("Sitter not found")

    # Create the Connect Express account for the sitter if they dont have one
    if not sitter.sitter_profile or not sitter.sitter_profile.get("stripe_account_id"):
        account = stripe.Account.create(type="express")

        # Store the Stripe account ID in the sitters profile
        sitter.sitter_profile = {
            **(sitter.sitter_profile or {}),
            "stripe_account_id": account.id,
        }
        await db.commit()

    stripe_account_id = sitter.sitter_profile["stripe_account_id"]

    # generate the onboarding URL
    account_link = stripe.AccountLink.create(
        account=stripe_account_id,
        refresh_url="http://localhost:3000/sitter/onboarding-refresh",
        return_url="http://localhost:3000/sitter/onboarding-complete",
        type="account_onboarding",
    )

    return account_link.url


async def refund_booking(booking_id: UUID, db: AsyncSession) -> int:

    # 1. Fetch the payment row for this booking
    result = await db.execute(select(Payment).where(Payment.booking_id == booking_id))
    payment = result.scalar_one_or_none()
    if not payment:
        raise ValueError("No payment found for this booking")
    if payment.status == "refunded":
        raise ValueError("Booking already refunded")

    # 2. Issue the refund via Stripe
    refund = stripe.Refund.create(payment_intent=payment.stripe_payment_id)

    # 3. Update payment status
    payment.status = "refunded"
    await db.commit()

    return refund.amount  # in cents
