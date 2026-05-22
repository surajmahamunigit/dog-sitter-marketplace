import json
import re
import time
from uuid import UUID

import anthropic
from sqlalchemy import text, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core import config
from app.models.user import User
from app.models.dog import Dog
from app.models.match import Match


#  helpers


def _parse_json_response(raw: str) -> dict:

    cleaned = re.sub(r"```json\s*|\s*```", "", raw).strip()
    return json.loads(cleaned)


def _build_sitter_block(sitter_row) -> str:
    """Turn one pre-filter result row into a readable text block for the prompt."""

    sp = sitter_row.sitter_profile or {}
    rate_dollars = (sp.get("nightly_rate", 0) or 0) // 100
    distance = (
        f"{sitter_row.distance_miles:.1f} miles"
        if sitter_row.distance_miles
        else "unknown"
    )

    return (
        f"Sitter ID: {sitter_row.id}\n"
        f"Name: {sitter_row.name}\n"
        f"Experience: {sp.get('experience_years', 'unknown')} years\n"
        f"Nightly rate: ${rate_dollars}\n"
        f"Accepted dog sizes: {', '.join(sp.get('accepted_dog_sizes', []))}\n"
        f"Accepts puppies: {sp.get('accepts_puppies', False)}\n"
        f"Accepts senior dogs: {sp.get('accepts_senior_dogs', False)}\n"
        f"Accepts special needs: {sp.get('accepts_special_needs', False)}\n"
        f"Has yard: {sp.get('has_yard', False)}\n"
        f"Other pets in home: {sp.get('has_other_pets', False)}\n"
        f"Smoke-free home: {sp.get('smoke_free_home', False)}\n"
        f"Bio: {sitter_row.bio or 'No bio provided'}\n"
        f"Distance: {distance}"
    )


def _build_dog_block(dog: Dog) -> str:
    """Turn a dog record into a readable text block for the prompt."""

    dp = dog.dog_profile or {}

    return (
        f"Name: {dog.name}\n"
        f"Breed: {dog.breed}\n"
        f"Age: {dog.age} years\n"
        f"Weight: {dog.weight} lbs\n"
        f"Size: {dp.get('size', 'unknown')}\n"
        f"Energy level: {dp.get('energy_level', 'unknown')}\n"
        f"Temperament: {', '.join(dp.get('temperament', []))}\n"
        f"Good with other dogs: {dp.get('good_with_other_dogs', 'unknown')}\n"
        f"Good with cats: {dp.get('good_with_cats', 'unknown')}\n"
        f"Good with children: {dp.get('good_with_children', 'unknown')}\n"
        f"House trained: {dp.get('house_trained', 'unknown')}\n"
        f"Special needs: {', '.join(dp.get('special_needs', [])) or 'none'}\n"
        f"Medical notes: {dp.get('medical_notes', 'none')}\n"
        f"Vaccination status: {dp.get('vaccination_status', 'unknown')}"
    )


#  pre-filter query

PREFILTER_SQL = text("""
    SELECT
        u.id,
        u.name,
        u.bio,
        u.location,
        u.sitter_profile,
        3959 * acos(
            cos(radians(:owner_lat)) * cos(radians((u.location->>'lat')::float))
            * cos(radians((u.location->>'lng')::float) - radians(:owner_lng))
            + sin(radians(:owner_lat)) * sin(radians((u.location->>'lat')::float))
        ) AS distance_miles
    FROM users u
    WHERE
        u.role = 'sitter'
        AND u.location IS NOT NULL
        AND u.sitter_profile IS NOT NULL
        AND u.sitter_profile->'accepted_dog_sizes' @> to_jsonb(ARRAY[:dog_size]::text[])
        AND (
            :is_puppy = false
            OR u.sitter_profile @> '{"accepts_puppies": true}'::jsonb
        )
        AND (
            :is_senior = false
            OR u.sitter_profile @> '{"accepts_senior_dogs": true}'::jsonb
        )
        AND (
            :has_special_needs = false
            OR u.sitter_profile @> '{"accepts_special_needs": true}'::jsonb
        )
        AND 3959 * acos(
            cos(radians(:owner_lat)) * cos(radians((u.location->>'lat')::float))
            * cos(radians((u.location->>'lng')::float) - radians(:owner_lng))
            + sin(radians(:owner_lat)) * sin(radians((u.location->>'lat')::float))
        ) <= :radius_miles
    ORDER BY distance_miles ASC
    LIMIT 10
""")


async def _run_prefilter(
    db: AsyncSession,
    owner: User,
    dog: Dog,
    radius_miles: float = 25.0,
) -> list:
    loc = owner.location or {}
    dp = dog.dog_profile or {}

    params = {
        "owner_lat": loc["lat"],
        "owner_lng": loc["lng"],
        "dog_size": dp.get("size", "medium"),
        "is_puppy": (dog.age or 0) < 1,
        "is_senior": (dog.age or 0) >= 9,
        "has_special_needs": bool(dp.get("special_needs")),
        "radius_miles": radius_miles,
    }

    result = await db.execute(PREFILTER_SQL, params)
    return result.fetchall()


#  main service function

SYSTEM_PROMPT = """You are a dog sitter matching assistant.

You will receive a dog's profile and a list of available sitters.
Your job is to rank the top 3 most compatible sitters for this dog.

You MUST respond with valid JSON only. No preamble, no explanation outside the JSON.
Use exactly this structure:

{
    "matches": [
        {
        "sitter_id": "<uuid string>",
        "rank": <integer 1-3>,
        "reasoning": "<2-3 sentences explaining why this sitter fits this dog>"
        }
    ]
}

Base your reasoning on compatibility signals: energy level, temperament,
special needs, sitter experience, home environment, and dog-friendliness.
Rank 1 is the best match."""


async def find_matches(
    db: AsyncSession,
    owner: User,
    dog_id: UUID,
) -> dict:

    #  1. load dog, verify ownership
    from sqlalchemy import select

    result = await db.execute(select(Dog).where(Dog.id == dog_id))
    dog = result.scalar_one_or_none()
    if not dog:
        raise ValueError("Dog not found")
    if dog.owner_id != owner.id:
        raise ValueError("You don't own this dog")

    #  2. pre-filter
    shortlist = await _run_prefilter(db, owner, dog)
    if not shortlist:
        raise ValueError(
            "No sitters found matching your dog's requirements in your area"
        )

    #  3. build prompt
    sitter_blocks = "\n\n".join(
        f"{i + 1}. {_build_sitter_block(s)}" for i, s in enumerate(shortlist)
    )
    user_message = (
        f"DOG PROFILE:\n{_build_dog_block(dog)}\n\nAVAILABLE SITTERS:\n{sitter_blocks}"
    )

    request_payload = {
        "dog_profile": dog.dog_profile,
        "sitter_count": len(shortlist),
    }

    #  4. call Claude
    client = anthropic.Anthropic(api_key=config.ANTHROPIC_API_KEY)
    start_ms = time.monotonic()

    try:
        response = client.messages.create(
            model="claude-sonnet-4-6",
            max_tokens=1000,
            temperature=0.2,
            system=SYSTEM_PROMPT,
            messages=[{"role": "user", "content": user_message}],
        )
        latency_ms = int((time.monotonic() - start_ms) * 1000)
        raw_text = response.content[0].text
        parsed = _parse_json_response(raw_text)

        #  5. persist success row
        match_row = Match(
            requester_id=owner.id,
            dog_id=dog.id,
            request_payload=request_payload,
            response_payload=parsed,
            model="claude-sonnet-4-6",
            input_tokens=response.usage.input_tokens,
            output_tokens=response.usage.output_tokens,
            latency_ms=latency_ms,
            status="success",
        )
        db.add(match_row)
        await db.commit()
        await db.refresh(match_row)

    except Exception as e:
        #  persist failure row
        latency_ms = int((time.monotonic() - start_ms) * 1000)
        match_row = Match(
            requester_id=owner.id,
            dog_id=dog.id,
            request_payload=request_payload,
            response_payload=None,
            model="claude-sonnet-4-6",
            input_tokens=None,
            output_tokens=None,
            latency_ms=latency_ms,
            status="failed",
            error_message=str(e),
        )
        db.add(match_row)
        await db.commit()
        raise ValueError(f"Matching failed: {e}")

    #  6. enrich + return
    sitter_lookup = {str(s.id): s for s in shortlist}
    enriched = []
    for m in parsed["matches"]:
        sitter = sitter_lookup.get(m["sitter_id"])
        sp = sitter.sitter_profile if sitter else {}
        enriched.append(
            {
                "sitter_id": m["sitter_id"],
                "rank": m["rank"],
                "reasoning": m["reasoning"],
                "sitter_name": sitter.name if sitter else "Unknown",
                "nightly_rate": sp.get("nightly_rate") if sp else None,
                "distance_miles": sitter.distance_miles if sitter else None,
            }
        )

    return {
        "dog_id": str(dog.id),
        "matches": enriched,
        "match_id": str(match_row.id),
    }
