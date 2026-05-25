from pydantic import BaseModel
from datetime import datetime


class CareInstructionUpsert(BaseModel):
    content: str


class CareInstructionResponse(BaseModel):
    id: str
    dog_id: str
    content: str
    embedding_status: str
    updated_at: datetime
    created_at: datetime

    model_config = {"from_attributes": True}
