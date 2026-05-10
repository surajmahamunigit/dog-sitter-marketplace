"""
Security  primitives
All the password hashing and security flows through this module.
The rest of the codebase calls hash_password() and verify_password()
without knowing or caring what algorithm is underneath
"""

from passlib.context import CryptContext


pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(plaintext: str):
    """Hash a plaintext password for database storage"""

    return pwd_context.hash(plaintext)


def verify_password(plaintext: str, stored_hash: str) -> bool:
    """Verify a plaintext against a stored hash."""

    return pwd_context.verify(plaintext, stored_hash)
