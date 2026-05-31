import pytest
from datetime import date, timedelta
from tests.conftest import set_booking_status


async def _register_and_login(client, email, role):
    """Helper: register a user and return their JWT token."""
    await client.post(
        "/auth/register",
        json={
            "email": email,
            "name": f"Test {role.capitalize()}",
            "password": "testpass123",
            "role": role,
        },
    )
    response = await client.post(
        "/auth/login",
        json={
            "email": email,
            "password": "testpass123",
        },
    )
    return response.json()["access_token"]


async def test_create_booking_happy_path(client):
    # Set up: owner + sitter + dog
    owner_token = await _register_and_login(client, "owner_booking@test.com", "owner")
    sitter_token = await _register_and_login(
        client, "sitter_booking@test.com", "sitter"
    )

    # Get sitter's ID
    sitters_response = await client.get("/sitters/")
    sitter_id = sitters_response.json()[0]["id"]

    # Owner creates a dog
    dog_response = await client.post(
        "/dogs/",
        json={"name": "Rex", "breed": "Labrador", "age": 3, "weight": 30},
        headers={"Authorization": f"Bearer {owner_token}"},
    )
    dog_id = dog_response.json()["id"]

    # Owner creates a booking
    start = (date.today() + timedelta(days=7)).isoformat()
    end = (date.today() + timedelta(days=10)).isoformat()

    response = await client.post(
        "/bookings/",
        json={
            "sitter_id": sitter_id,
            "dog_id": dog_id,
            "start_date": start,
            "end_date": end,
        },
        headers={"Authorization": f"Bearer {owner_token}"},
    )

    assert response.status_code == 201
    data = response.json()
    assert data["status"] == "awaiting_payment"
    assert data["sitter_id"] == sitter_id
    assert data["dog_id"] == dog_id


async def test_booking_status_transition(client):
    # Set up: owner + sitter + dog + booking
    owner_token = await _register_and_login(client, "owner_status@test.com", "owner")
    sitter_token = await _register_and_login(client, "sitter_status@test.com", "sitter")

    sitters_response = await client.get("/sitters/")
    sitters = sitters_response.json()
    sitter = next(s for s in sitters if s["email"] == "sitter_status@test.com")
    sitter_id = sitter["id"]

    dog_response = await client.post(
        "/dogs/",
        json={"name": "Bella", "breed": "Poodle", "age": 2, "weight": 10},
        headers={"Authorization": f"Bearer {owner_token}"},
    )
    dog_id = dog_response.json()["id"]

    start = (date.today() + timedelta(days=14)).isoformat()
    end = (date.today() + timedelta(days=17)).isoformat()

    booking_response = await client.post(
        "/bookings/",
        json={
            "sitter_id": sitter_id,
            "dog_id": dog_id,
            "start_date": start,
            "end_date": end,
        },
        headers={"Authorization": f"Bearer {owner_token}"},
    )
    booking_id = booking_response.json()["id"]

    # Simulate Stripe webhook — advance awaiting_payment → pending
    await set_booking_status(booking_id, "pending")

    # Sitter confirms
    confirm_response = await client.patch(
        f"/bookings/{booking_id}/status",
        json={"status": "confirmed"},
        headers={"Authorization": f"Bearer {sitter_token}"},
    )
    assert confirm_response.status_code == 200
    assert confirm_response.json()["status"] == "confirmed"

    # Invalid transition: confirmed → pending should be rejected
    invalid_response = await client.patch(
        f"/bookings/{booking_id}/status",
        json={"status": "pending"},
        headers={"Authorization": f"Bearer {sitter_token}"},
    )
    assert invalid_response.status_code == 422
