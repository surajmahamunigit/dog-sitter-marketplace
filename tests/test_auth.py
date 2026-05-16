import pytest


async def test_register_creates_user(client):

    response = await client.post(
        "/auth/register",
        json={
            "email": "owner@test.com",
            "name": "Test Owner",
            "password": "testpass123",
            "role": "owner",
        },
    )

    assert response.status_code == 201
    data = response.json()
    assert data["email"] == "owner@test.com"
    assert data["role"] == "owner"
    assert "password" not in data
    assert "password_hash" not in data


async def test_login_returns_jwt(client):

    # Register first
    await client.post(
        "/auth/register",
        json={
            "email": "login_test@test.com",
            "name": "Login User",
            "password": "testpass123",
            "role": "owner",
        },
    )

    # Then login
    response = await client.post(
        "/auth/login", json={"email": "login_test@test.com", "password": "testpass123"}
    )

    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
