# app/schemas/match.py

from pydantic import BaseModel
from uuid import UUID


class MatchRequest(BaseModel):
    dog_id: UUID


class SitterMatch(BaseModel):
    sitter_id: UUID
    rank: int
    reasoning: str
    sitter_name: str
    nightly_rate: int | None = None
    distance_miles: float | None = None


class MatchResponse(BaseModel):
    dog_id: UUID
    matches: list[SitterMatch]
    match_id: UUID
