import pytest
from unittest.mock import patch, MagicMock
from httpx import AsyncClient


async def _register_and_login(client: AsyncClient, email: str, role: str) -> str:
    await client.post(
        "/auth/register",
        json={
            "email": email,
            "password": "testpass123",
            "name": "Test User",
            "role": role,
        },
    )
    resp = await client.post(
        "/auth/login",
        json={"email": email, "password": "testpass123"},
    )
    return resp.json()["access_token"]


async def _get_user_id(client: AsyncClient, token: str) -> str:
    resp = await client.get("/users/me", headers={"Authorization": f"Bearer {token}"})
    return resp.json()["id"]


async def _create_completed_booking(
    client: AsyncClient,
    owner_token: str,
    sitter_token: str,
    sitter_id: str,
) -> dict:
    """Create a dog, booking, and advance it to completed."""
    owner_headers = {"Authorization": f"Bearer {owner_token}"}
    sitter_headers = {"Authorization": f"Bearer {sitter_token}"}

    # Create dog
    dog_resp = await client.post(
        "/dogs/",
        json={"name": "Rex", "breed": "Labrador", "age": 3, "weight": 30},
        headers=owner_headers,
    )
    dog_id = dog_resp.json()["id"]

    # Create booking
    booking_resp = await client.post(
        "/bookings/",
        json={
            "sitter_id": sitter_id,
            "dog_id": dog_id,
            "start_date": "2026-06-01",
            "end_date": "2026-06-03",
        },
        headers=owner_headers,
    )
    booking_id = booking_resp.json()["id"]

    # Advance to completed using the real sitter token
    await client.patch(
        f"/bookings/{booking_id}/status",
        json={"status": "confirmed"},
        headers=sitter_headers,
    )
    await client.patch(
        f"/bookings/{booking_id}/status",
        json={"status": "completed"},
        headers=sitter_headers,
    )

    return {"booking_id": booking_id, "sitter_id": sitter_id}


@pytest.mark.asyncio
async def test_create_review_happy_path(client: AsyncClient):
    owner_token = await _register_and_login(client, "reviewer1@test.com", "owner")
    sitter_token = await _register_and_login(client, "sitter1@test.com", "sitter")
    sitter_id = await _get_user_id(client, sitter_token)

    booking = await _create_completed_booking(
        client, owner_token, sitter_token, sitter_id
    )

    with patch("app.services.review_service.anthropic.Anthropic") as mock_anthropic:
        mock_client = MagicMock()
        mock_anthropic.return_value = mock_client
        mock_client.messages.create.return_value = MagicMock(
            content=[MagicMock(text="Great sitter, owners love them.")]
        )
        resp = await client.post(
            f"/reviews/?booking_id={booking['booking_id']}",
            json={"rating": 5, "body": "Excellent sitter!"},
            headers={"Authorization": f"Bearer {owner_token}"},
        )

    assert resp.status_code == 201
    data = resp.json()
    assert data["rating"] == 5
    assert data["body"] == "Excellent sitter!"


@pytest.mark.asyncio
async def test_duplicate_review_blocked(client: AsyncClient):
    owner_token = await _register_and_login(client, "reviewer2@test.com", "owner")
    sitter_token = await _register_and_login(client, "sitter2@test.com", "sitter")
    sitter_id = await _get_user_id(client, sitter_token)

    booking = await _create_completed_booking(
        client, owner_token, sitter_token, sitter_id
    )
    headers = {"Authorization": f"Bearer {owner_token}"}

    with patch("app.services.review_service.anthropic.Anthropic") as mock_anthropic:
        mock_client = MagicMock()
        mock_anthropic.return_value = mock_client
        mock_client.messages.create.return_value = MagicMock(
            content=[MagicMock(text="Great sitter.")]
        )
        # First review
        await client.post(
            f"/reviews/?booking_id={booking['booking_id']}",
            json={"rating": 4, "body": "Good sitter."},
            headers=headers,
        )
        # Second review — should fail
        resp = await client.post(
            f"/reviews/?booking_id={booking['booking_id']}",
            json={"rating": 3, "body": "Actually reconsidering."},
            headers=headers,
        )

    assert resp.status_code == 400
    assert "already reviewed" in resp.json()["detail"]


@pytest.mark.asyncio
async def test_ai_summary_generated_after_review(client: AsyncClient):
    owner_token = await _register_and_login(client, "reviewer3@test.com", "owner")
    sitter_token = await _register_and_login(client, "sitter3@test.com", "sitter")
    sitter_id = await _get_user_id(client, sitter_token)

    booking = await _create_completed_booking(
        client, owner_token, sitter_token, sitter_id
    )

    with patch("app.services.review_service.anthropic.Anthropic") as mock_anthropic:
        mock_client = MagicMock()
        mock_anthropic.return_value = mock_client
        mock_client.messages.create.return_value = MagicMock(
            content=[MagicMock(text="Owners consistently praise this sitter.")]
        )
        await client.post(
            f"/reviews/?booking_id={booking['booking_id']}",
            json={"rating": 5, "body": "Amazing with my dog!"},
            headers={"Authorization": f"Bearer {owner_token}"},
        )

    sitter_profile = await client.get(f"/sitters/{sitter_id}")
    assert (
        sitter_profile.json()["ai_summary"] == "Owners consistently praise this sitter."
    )
