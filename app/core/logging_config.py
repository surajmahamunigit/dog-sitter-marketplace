"""CloudWatch logging configuration via watchtower."""

import logging

import boto3
import watchtower

from app.core.config import AWS_REGION


def setup_logging(log_group: str, service_name: str) -> logging.Logger:
    """
    Configure a logger with stdout + CloudWatch handlers.

    Args:
        log_group: CloudWatch log group name (e.g. "/pawsitter/api")
        service_name: Logger name (e.g. "pawsitter.api")

    Returns:
        Configured logger instance
    """
    logger = logging.getLogger(service_name)
    logger.setLevel(logging.INFO)

    # Prevent duplicate handlers when FastAPI reloads (--reload flag)
    if logger.handlers:
        return logger

    formatter = logging.Formatter(
        "%(asctime)s | %(name)s | %(levelname)s | %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S",
    )

    # Handler 1: stdout — logs appear in terminal + Fly's log viewer
    stream_handler = logging.StreamHandler()
    stream_handler.setFormatter(formatter)
    logger.addHandler(stream_handler)

    # Handler 2: CloudWatch — same logs ship to AWS
    try:
        cw_handler = watchtower.CloudWatchLogHandler(
            log_group_name=log_group,
            boto3_client=boto3.client("logs", region_name=AWS_REGION),
        )
        cw_handler.setFormatter(formatter)
        logger.addHandler(cw_handler)
        logger.info("CloudWatch logging enabled → %s", log_group)
    except Exception as e:
        logger.warning("CloudWatch logging unavailable: %s", e)

    return logger
