import asyncio
import json
import logging
import threading
from uuid import UUID

import boto3

from app.core.config import (
    AWS_REGION,
    SQS_EMBEDDING_QUEUE_URL,
    SQS_REVIEW_SUMMARY_QUEUE_URL,
)
from app.core.database import AsyncSessionLocal
from app.services.embedding_service import index_care_instructions
from app.services.review_service import _regenerate_ai_summary

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(threadName)s %(message)s",
)
logger = logging.getLogger(__name__)

sqs = boto3.client("sqs", region_name=AWS_REGION)


async def _run_embedding(care_instruction_id: str) -> None:
    async with AsyncSessionLocal() as db:
        await index_care_instructions(db, care_instruction_id)


async def _run_review_summary(sitter_id: UUID) -> None:
    async with AsyncSessionLocal() as db:
        await _regenerate_ai_summary(db, sitter_id)


def poll_embedding_queue() -> None:
    logger.info("Embedding worker started")
    while True:
        try:
            response = sqs.receive_message(
                QueueUrl=SQS_EMBEDDING_QUEUE_URL,
                MaxNumberOfMessages=1,
                WaitTimeSeconds=20,
            )
            for message in response.get("Messages", []):
                body = json.loads(message["Body"])
                care_instruction_id = body["care_instruction_id"]
                try:
                    asyncio.run(_run_embedding(care_instruction_id))
                    sqs.delete_message(
                        QueueUrl=SQS_EMBEDDING_QUEUE_URL,
                        ReceiptHandle=message["ReceiptHandle"],
                    )
                    logger.info(
                        "Embedding complete: care_instruction_id=%s",
                        care_instruction_id,
                    )
                except Exception as e:
                    logger.error(
                        "Embedding failed: care_instruction_id=%s error=%s",
                        care_instruction_id,
                        e,
                    )
        except Exception as e:
            logger.error("Polling error (embedding): %s", e)


def poll_review_summary_queue() -> None:
    logger.info("Review summary worker started")
    while True:
        try:
            response = sqs.receive_message(
                QueueUrl=SQS_REVIEW_SUMMARY_QUEUE_URL,
                MaxNumberOfMessages=1,
                WaitTimeSeconds=20,
            )
            for message in response.get("Messages", []):
                body = json.loads(message["Body"])
                sitter_id = UUID(body["sitter_id"])
                try:
                    asyncio.run(_run_review_summary(sitter_id))
                    sqs.delete_message(
                        QueueUrl=SQS_REVIEW_SUMMARY_QUEUE_URL,
                        ReceiptHandle=message["ReceiptHandle"],
                    )
                    logger.info("AI summary complete: sitter_id=%s", sitter_id)
                except Exception as e:
                    logger.error(
                        "AI summary failed: sitter_id=%s error=%s", sitter_id, e
                    )
        except Exception as e:
            logger.error("Polling error (review summary): %s", e)


if __name__ == "__main__":
    t1 = threading.Thread(
        target=poll_embedding_queue, name="embedding-worker", daemon=True
    )
    t2 = threading.Thread(
        target=poll_review_summary_queue, name="review-worker", daemon=True
    )
    t1.start()
    t2.start()
    t1.join()
    t2.join()
