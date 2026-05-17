import pytest


@pytest.mark.asyncio
async def test_sitters_no_location_filter(client):
    """Get /sitters/ no params returns all sitters."""

    response = await client.get("/sitters/")

    assert response.status_code == 200
    sitters = response.json()
    assert isinstance(sitters, list)

    # distance_miles should not be present when location filter is used
    for sitter in sitters:
        assert sitter.get("distance_miles") is None


@pytest.mark.asyncio
async def test_sitters_with_location_filter(client):
    """GET /sitters/?lat=X&lng=Y returns sitters with distance_miles, sorted nearest-first."""

    # LA
    response = await client.get(
        "/sitters/",
        params={
            "lat": 34.0522,
            "lng": -118.2437,
            "radius": 25,
        },
    )

    assert response.status_code == 200
    sitters = response.json()
    assert isinstance(sitters, list)

    # Every returned sitters must have distance_miles field
    for sitter in sitters:
        assert sitter.get("distance_miles") is not None

    # Result is sorted nearest first
    distances = [s["distance_miles"] for s in sitters]
    assert distances == sorted(distances)
