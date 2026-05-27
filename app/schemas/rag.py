from pydantic import BaseModel
from uuid import UUID


class RagRequest(BaseModel):
    dog_id: UUID
    question: str


class RagResponse(BaseModel):
    answer: str
