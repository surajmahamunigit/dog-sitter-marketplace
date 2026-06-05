import boto3
import json
import logging

from app.core.config import AWS_REGION

logger = logging.getLogger(__name__)

sqs_client = boto3.client("sqs", region_name=AWS_REGION)


def send_message(queue_url: str, body: dict) -> None:
    """Send a JSON message to an SQS queue."""
    try:
        sqs_client.send_message(
            QueueUrl=queue_url,
            MessageBody=json.dumps(body),
        )
        logger.info("SQS message sent to %s: %s", queue_url, body)
    except Exception as e:
        logger.error("Failed to send SQS message to %s: %s", queue_url, e)
        raise
