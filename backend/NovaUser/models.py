"""SQLAlchemy models for NovaUser."""

from __future__ import annotations

import uuid
from datetime import datetime

from sqlalchemy import Boolean, CheckConstraint, DateTime, String, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from .database import Base


class User(Base):
    """A NovaUser account.

    Email addresses are normalised to lower case before they are stored and a
    database unique constraint prevents duplicate accounts even if two requests
    race with each other.
    """

    __tablename__ = "users"
    __table_args__ = (
        CheckConstraint("char_length(btrim(full_name)) >= 2", name="ck_users_full_name_length"),
        CheckConstraint("char_length(full_name) <= 120", name="ck_users_full_name_max"),
        CheckConstraint("email = lower(email)", name="ck_users_email_lowercase"),
        CheckConstraint("char_length(email) <= 320", name="ck_users_email_max"),
        CheckConstraint(
            "firebase_uid IS NULL OR char_length(firebase_uid) <= 128",
            name="ck_users_firebase_uid_max",
        ),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    full_name: Mapped[str] = mapped_column(String(120), nullable=False)
    email: Mapped[str] = mapped_column(String(320), nullable=False, unique=True)
    # Nullable because Firebase is the primary identity provider.  The column
    # remains for accounts created before the Firebase migration.
    password_hash: Mapped[str | None] = mapped_column(String(255), nullable=True)
    firebase_uid: Mapped[str | None] = mapped_column(
        String(128), nullable=True, unique=True
    )
    auth_provider: Mapped[str] = mapped_column(
        String(32), nullable=False, default="password", server_default="password"
    )
    email_verified: Mapped[bool] = mapped_column(
        Boolean, nullable=False, default=False, server_default="false"
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
        onupdate=func.now(),
    )

    def to_public_dict(self) -> dict:
        """Serialise the user without exposing the password hash."""

        return {
            "id": str(self.id),
            "full_name": self.full_name,
            "email": self.email,
            "auth_provider": self.auth_provider,
            "email_verified": bool(self.email_verified),
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }

    def __repr__(self) -> str:  # pragma: no cover - debugging aid
        return f"<User {self.email}>"
