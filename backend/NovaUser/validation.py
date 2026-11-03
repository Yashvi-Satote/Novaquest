"""Shared request validation for NovaUser authentication."""

from __future__ import annotations

import re

EMAIL_RE = re.compile(
    r"^[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+"
    r"@[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?"
    r"(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?)+$"
)
CONTROL_RE = re.compile(r"[\x00-\x1f\x7f]")

MIN_PASSWORD_LENGTH = 8
MAX_PASSWORD_LENGTH = 72


class ValidationProblem(Exception):
    """A request validation failure with field-level messages."""

    def __init__(self, fields: dict[str, str], message: str = "Please correct the highlighted fields."):
        super().__init__(message)
        self.fields = fields
        self.message = message


def _payload_dict(payload) -> dict:
    if not isinstance(payload, dict):
        raise ValidationProblem({}, "Request body must be a JSON object.")
    return payload


def normalise_email(value) -> str:
    if not isinstance(value, str):
        return ""
    return value.strip().lower()


def validate_email(value, field: str = "email", errors: dict | None = None) -> str:
    errors = errors if errors is not None else {}
    email = normalise_email(value)
    if not email:
        errors[field] = "Email address is required."
    elif len(email) > 320:
        errors[field] = "Email address must be 320 characters or fewer."
    elif not EMAIL_RE.match(email):
        errors[field] = "Enter a valid email address."
    return email


def password_rule_errors(password: str) -> list[str]:
    problems = []
    if len(password) < MIN_PASSWORD_LENGTH:
        problems.append(f"at least {MIN_PASSWORD_LENGTH} characters")
    if len(password) > MAX_PASSWORD_LENGTH:
        problems.append(f"{MAX_PASSWORD_LENGTH} characters or fewer")
    if not re.search(r"[A-Z]", password):
        problems.append("an uppercase letter")
    if not re.search(r"[a-z]", password):
        problems.append("a lowercase letter")
    if not re.search(r"\d", password):
        problems.append("a number")
    return problems


def validate_password(password) -> tuple[str, str | None]:
    if password is None:
        return "", "Password is required."
    if not isinstance(password, str):
        return "", "Password must be a string."
    if len(password.encode("utf-8")) > MAX_PASSWORD_LENGTH:
        return password, f"Password must be {MAX_PASSWORD_LENGTH} bytes or fewer."
    problems = password_rule_errors(password)
    if problems:
        return password, "Password must include " + ", ".join(problems) + "."
    return password, None


def validate_registration(payload) -> dict:
    payload = _payload_dict(payload)
    errors: dict[str, str] = {}

    raw_name = payload.get("full_name", payload.get("fullName", ""))
    if not isinstance(raw_name, str):
        full_name = ""
        errors["full_name"] = "Full name must be a string."
    else:
        full_name = " ".join(raw_name.split())
        if len(full_name) < 2:
            errors["full_name"] = "Full name must be at least 2 characters."
        elif len(full_name) > 120:
            errors["full_name"] = "Full name must be 120 characters or fewer."
        elif CONTROL_RE.search(full_name):
            errors["full_name"] = "Full name contains unsupported characters."

    email = validate_email(payload.get("email"), errors=errors)
    password, password_error = validate_password(payload.get("password"))
    if password_error:
        errors["password"] = password_error

    if errors:
        raise ValidationProblem(errors)
    return {"full_name": full_name, "email": email, "password": password}


def validate_login(payload) -> dict:
    payload = _payload_dict(payload)
    errors: dict[str, str] = {}
    email = validate_email(payload.get("email"), errors=errors)

    password = payload.get("password")
    if not isinstance(password, str) or not password:
        errors["password"] = "Password is required."
    elif len(password.encode("utf-8")) > MAX_PASSWORD_LENGTH:
        errors["password"] = "Password is too long."

    if errors:
        raise ValidationProblem(errors)
    return {"email": email, "password": password}


def validate_firebase_exchange(payload) -> str:
    """Validate the body of ``POST /auth/firebase`` and return the ID token."""

    payload = _payload_dict(payload)
    token = payload.get("id_token", payload.get("idToken"))
    if not isinstance(token, str) or not token.strip():
        raise ValidationProblem(
            {"id_token": "A Firebase ID token is required."},
            "Firebase authentication could not be completed.",
        )
    if len(token) > 10_000:
        raise ValidationProblem(
            {"id_token": "The Firebase ID token is invalid."},
            "Firebase authentication could not be completed.",
        )
    return token.strip()
