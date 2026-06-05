import pytest
from unittest.mock import patch, MagicMock
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from app.services.embedding_service import index_care_instructions
from tests.conftest import TEST_DATABASE_URL
from app.services.embedding_service import chunk_text
from tests.conftest import set_booking_status


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
    response = await client.post(
        "/auth/login",
        json={"email": email, "password": "testpass123"},
    )
    return response.json()["access_token"]


def test_chunk_text_produces_chunks():
    """Chunking returns a non-empty list with no empty strings."""
    text = """Feed Bella half a cup of dry kibble twice a day.

She has a chicken allergy so avoid any chicken-based treats.

She takes one Apoquel pill hidden in peanut butter every morning.

Make sure she has fresh water available at all times.

She gets a 30 minute walk every afternoon."""

    chunks = chunk_text(text)

    assert len(chunks) > 0
    assert all(len(c) > 0 for c in chunks)


@pytest.mark.asyncio
async def test_rag_requires_active_booking(client: AsyncClient):
    """Sitter without a booking for the dog gets 403."""
    sitter_token = await _register_and_login(
        client, "ragtest_sitter@test.com", "sitter"
    )

    response = await client.post(
        "/rag/ask",
        json={
            "dog_id": "00000000-0000-0000-0000-000000000001",
            "question": "How much food?",
        },
        headers={"Authorization": f"Bearer {sitter_token}"},
    )

    assert response.status_code == 403
    assert "No active booking" in response.json()["detail"]


@pytest.mark.asyncio
async def test_rag_requires_completed_embeddings(client: AsyncClient):
    """Returns 400 when care instructions exist but embeddings are pending."""
    owner_token = await _register_and_login(client, "ragtest_owner2@test.com", "owner")
    sitter_token = await _register_and_login(
        client, "ragtest_sitter2@test.com", "sitter"
    )

    owner_me = await client.get(
        "/users/me", headers={"Authorization": f"Bearer {owner_token}"}
    )
    sitter_me = await client.get(
        "/users/me", headers={"Authorization": f"Bearer {sitter_token}"}
    )
    owner_id = owner_me.json()["id"]
    sitter_id = sitter_me.json()["id"]

    dog_resp = await client.post(
        "/dogs/",
        json={"name": "TestDog", "breed": "Lab", "age": 3, "weight": 50},
        headers={"Authorization": f"Bearer {owner_token}"},
    )
    dog_id = dog_resp.json()["id"]

    booking_resp = await client.post(
        "/bookings/",
        json={
            "sitter_id": sitter_id,
            "dog_id": dog_id,
            "start_date": "2026-08-01",
            "end_date": "2026-08-03",
        },
        headers={"Authorization": f"Bearer {owner_token}"},
    )
    booking_id = booking_resp.json()["id"]

    # Simulate Stripe webhook
    await set_booking_status(booking_id, "pending")

    await client.patch(
        f"/bookings/{booking_id}/status",
        json={"status": "confirmed"},
        headers={"Authorization": f"Bearer {sitter_token}"},
    )

    # test_rag_requires_completed_embeddings
    with patch("app.services.care_instruction_service.send_message"):
        await client.post(
            f"/care-instructions/{dog_id}",
            json={"content": "Feed him once a day."},
            headers={"Authorization": f"Bearer {owner_token}"},
        )
    response = await client.post(
        "/rag/ask",
        json={"dog_id": dog_id, "question": "How much food?"},
        headers={"Authorization": f"Bearer {sitter_token}"},
    )

    assert response.status_code == 400
    assert "still being processed" in response.json()["detail"]


@pytest.mark.asyncio
async def test_rag_returns_answer(client: AsyncClient):
    """Happy path: correct booking + completed embeddings -> answer returned."""
    owner_token = await _register_and_login(client, "ragtest_owner@test.com", "owner")
    sitter_token = await _register_and_login(
        client, "ragtest_sitter@test.com", "sitter"
    )

    owner_me = await client.get(
        "/users/me", headers={"Authorization": f"Bearer {owner_token}"}
    )
    sitter_me = await client.get(
        "/users/me", headers={"Authorization": f"Bearer {sitter_token}"}
    )
    owner_id = owner_me.json()["id"]
    sitter_id = sitter_me.json()["id"]

    dog_response = await client.post(
        "/dogs/",
        json={"name": "MockDog", "breed": "Poodle", "age": 2, "weight": 20},
        headers={"Authorization": f"Bearer {owner_token}"},
    )
    dog_id = dog_response.json()["id"]

    booking_response = await client.post(
        "/bookings/",
        json={
            "sitter_id": sitter_id,
            "dog_id": dog_id,
            "start_date": "2026-09-01",
            "end_date": "2026-09-03",
        },
        headers={"Authorization": f"Bearer {owner_token}"},
    )
    booking_id = booking_response.json()["id"]

    # Simulate Stripe webhook
    await set_booking_status(booking_id, "pending")

    await client.patch(
        f"/bookings/{booking_id}/status",
        json={"status": "completed"},
        headers={"Authorization": f"Bearer {sitter_token}"},
    )

    fake_embedding = [0.1] * 1536
    mock_embed_response = MagicMock()
    mock_embed_response.data = [MagicMock(embedding=fake_embedding)]

    with patch("app.services.care_instruction_service.send_message"):
        ci_resp = await client.post(
            f"/care-instructions/{dog_id}",
            json={"content": "feed macdog once a day at 6pm"},
            headers={"Authorization": f"Bearer {owner_token}"},
        )
    care_instruction_id = ci_resp.json()["id"]

    engine = create_async_engine(TEST_DATABASE_URL)
    SeedSession = sessionmaker(bind=engine, class_=AsyncSession, expire_on_commit=False)
    with patch("app.services.embedding_service.openai_client") as mock_openai:
        mock_openai.embeddings.create.return_value = mock_embed_response
        async with SeedSession() as db:
            await index_care_instructions(db, str(care_instruction_id))
    await engine.dispose()

    mock_claude_response = MagicMock()
    mock_claude_response.content = [MagicMock(text="Feed MockDog once a day at noon.")]

    with (
        patch("app.services.embedding_service.openai_client") as mock_openai,
        patch("app.services.rag_service.anthropic_client") as mock_anthropic,
    ):
        mock_openai.embeddings.create.return_value = mock_embed_response
        mock_anthropic.messages.create.return_value = mock_claude_response

        response = await client.post(
            "/rag/ask",
            json={"dog_id": dog_id, "question": "When does MockDog eat?"},
            headers={"Authorization": f"Bearer {sitter_token}"},
        )

    assert response.status_code == 200
    assert "answer" in response.json()
    assert len(response.json()["answer"]) > 0
