import json
import pytest
from unittest.mock import MagicMock, patch


#  helpers


async def _register_and_login(client, email, role):
    await client.post(
        "/auth/register",
        json={
            "email": email,
            "password": "Test1234!",
            "name": "Test User",
            "role": role,
        },
    )
    r = await client.post("/auth/login", json={"email": email, "password": "Test1234!"})
    return r.json()["access_token"]


async def _create_dog(client, token):
    r = await client.post(
        "/dogs/",
        json={
            "name": "Max",
            "breed": "Labrador",
            "age": 2,
            "weight": 60,
            "dog_profile": {
                "size": "large",
                "energy_level": "high",
                "temperament": ["friendly"],
                "special_needs": [],
                "good_with_other_dogs": True,
                "good_with_cats": True,
                "good_with_children": True,
                "house_trained": True,
                "vaccination_status": "up_to_date",
            },
        },
        headers={"Authorization": f"Bearer {token}"},
    )
    return r.json()["id"]


def _fake_claude_response(sitter_ids: list[str]):
    matches = [
        {"sitter_id": sid, "rank": i + 1, "reasoning": f"Good match #{i + 1}"}
        for i, sid in enumerate(sitter_ids[:3])
    ]
    mock_response = MagicMock()
    mock_response.content = [MagicMock(text=json.dumps({"matches": matches}))]
    mock_response.usage.input_tokens = 500
    mock_response.usage.output_tokens = 150
    return mock_response


#  tests


@pytest.mark.asyncio
async def test_matching_requires_owner_location(client):
    """Owner without a saved location gets a 400 with a clear message."""
    token = await _register_and_login(client, "noloc@test.com", "owner")
    dog_id = await _create_dog(client, token)

    r = await client.post(
        "/matches/find",
        json={"dog_id": dog_id},
        headers={"Authorization": f"Bearer {token}"},
    )

    assert r.status_code == 400
    assert "location" in r.json()["detail"].lower()


@pytest.mark.asyncio
async def test_matching_rejects_wrong_dog_owner(client):
    """Owner cannot match against another owner's dog — gets 400."""
    token_a = await _register_and_login(client, "owner_a@test.com", "owner")
    token_b = await _register_and_login(client, "owner_b@test.com", "owner")

    await client.patch(
        "/users/me",
        json={"location": {"lat": 34.052, "lng": -118.243, "city": "Los Angeles"}},
        headers={"Authorization": f"Bearer {token_b}"},
    )

    dog_id = await _create_dog(client, token_a)

    r = await client.post(
        "/matches/find",
        json={"dog_id": dog_id},
        headers={"Authorization": f"Bearer {token_b}"},
    )

    assert r.status_code == 400
    assert "don't own" in r.json()["detail"].lower()


@pytest.mark.asyncio
async def test_matching_no_sitters_in_area(client):
    """Owner with location + dog but no sitters nearby gets a 400."""
    token = await _register_and_login(client, "nositter@test.com", "owner")
    dog_id = await _create_dog(client, token)

    await client.patch(
        "/users/me",
        json={"location": {"lat": 34.052, "lng": -118.243, "city": "Los Angeles"}},
        headers={"Authorization": f"Bearer {token}"},
    )

    r = await client.post(
        "/matches/find",
        json={"dog_id": dog_id},
        headers={"Authorization": f"Bearer {token}"},
    )

    assert r.status_code == 400
    assert "no sitters" in r.json()["detail"].lower()
