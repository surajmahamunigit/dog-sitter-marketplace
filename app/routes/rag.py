from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import require_sitter
from app.core.jwt import TokenData
from app.schemas.rag import RagRequest, RagResponse
from app.services.rag_service import ask_rag


router = APIRouter(prefix="/rag", tags=["rag"])


@router.post("/ask", response_model=RagResponse)
async def ask_care_instructions(
    request: RagRequest,
    token: TokenData = Depends(require_sitter),
    db: AsyncSession = Depends(get_db),
):
    try:
        answer = await ask_rag(
            db=db,
            sitter_id=token.user_id,
            dog_id=request.dog_id,
            question=request.question,
        )
        return RagResponse(answer=answer)
    except ValueError as e:
        message = str(e)
        if "No active booking" in message:
            raise HTTPException(status_code=403, detail=message)
        raise HTTPException(status_code=400, detail=message)
