"""Defaults and validation for per-user NovaQuest game settings."""

from __future__ import annotations

from copy import deepcopy

DEFAULT_GAME_SETTINGS = {
    "audio": {
        "masterVolume": 80,
        "musicVolume": 70,
        "sfxVolume": 85,
        "ambienceEnabled": True,
        "uiSoundsEnabled": True,
        "muted": False,
    },
    "graphics": {
        "qualityPreset": "High",
        "particleDensity": "High",
        "cosmicGlow": True,
        "lensShimmer": True,
        "targetFps": "60",
    },
    "controls": {
        "invertY": False,
        "sensitivity": 5,
        "flightModel": "Assisted",
        "subtitles": True,
    },
}

QUALITY_PRESETS = ("Low", "Medium", "High", "Ultra")
PARTICLE_DENSITIES = ("Off", "Low", "High")
FLIGHT_MODELS = ("Assisted", "Realistic")
TARGET_FPS_OPTIONS = ("30", "60", "120", "144")

_SECTION_KEYS = {
    "audio": (
        "masterVolume",
        "musicVolume",
        "sfxVolume",
        "ambienceEnabled",
        "uiSoundsEnabled",
        "muted",
    ),
    "graphics": (
        "qualityPreset",
        "particleDensity",
        "cosmicGlow",
        "lensShimmer",
        "targetFps",
    ),
    "controls": ("invertY", "sensitivity", "flightModel", "subtitles"),
}


class SettingsValidationProblem(Exception):
    """A settings validation failure with field-level messages."""

    def __init__(self, fields: dict[str, str], message: str = "Please correct the highlighted settings."):
        super().__init__(message)
        self.fields = fields
        self.message = message


def create_default_settings() -> dict:
    """Return a fresh, mutable copy of the default settings."""

    return deepcopy(DEFAULT_GAME_SETTINGS)


def _valid_bool(value) -> bool:
    return isinstance(value, bool)


def _valid_volume(value) -> bool:
    return isinstance(value, int) and not isinstance(value, bool) and 0 <= value <= 100


def _valid_sensitivity(value) -> bool:
    return isinstance(value, int) and not isinstance(value, bool) and 1 <= value <= 10


def _valid_target_fps(value) -> bool:
    if isinstance(value, bool):
        return False
    if isinstance(value, int):
        value = str(value)
    return isinstance(value, str) and value in TARGET_FPS_OPTIONS


def _validate_value(section: str, key: str, value):
    """Return ``(normalised_value, error)`` for one setting."""

    if key in ("masterVolume", "musicVolume", "sfxVolume"):
        return (value, None) if _valid_volume(value) else (None, "Must be a whole number from 0 to 100.")
    if key in ("ambienceEnabled", "uiSoundsEnabled", "muted", "cosmicGlow", "lensShimmer", "invertY", "subtitles"):
        return (value, None) if _valid_bool(value) else (None, "Must be true or false.")
    if key == "sensitivity":
        return (value, None) if _valid_sensitivity(value) else (None, "Must be a whole number from 1 to 10.")
    if key == "qualityPreset":
        return (value, None) if value in QUALITY_PRESETS else (None, "Must be Low, Medium, High or Ultra.")
    if key == "particleDensity":
        return (value, None) if value in PARTICLE_DENSITIES else (None, "Must be Off, Low or High.")
    if key == "flightModel":
        return (value, None) if value in FLIGHT_MODELS else (None, "Must be Assisted or Realistic.")
    if key == "targetFps":
        if _valid_target_fps(value):
            return str(value), None
        return None, "Must be 30, 60, 120 or 144."
    return None, "Unknown setting."


def validate_settings(payload) -> dict:
    """Validate a ``PUT /settings/game`` body and merge it with defaults.

    Partial updates are accepted: any omitted setting keeps its default (or
    current persisted value when the caller sends a full snapshot).
    """

    if not isinstance(payload, dict):
        raise SettingsValidationProblem({}, "Request body must be a JSON object.")

    raw = payload.get("settings")
    if not isinstance(raw, dict):
        raise SettingsValidationProblem(
            {"settings": "Settings must be a JSON object."},
            "Settings could not be saved.",
        )

    errors: dict[str, str] = {}
    merged = create_default_settings()

    for section, value in raw.items():
        if section not in _SECTION_KEYS:
            errors[section] = "Unknown settings section."
            continue
        if not isinstance(value, dict):
            errors[section] = "Must be a JSON object."
            continue

        allowed = _SECTION_KEYS[section]
        for key, setting_value in value.items():
            if key not in allowed:
                errors[f"{section}.{key}"] = "Unknown setting."
                continue
            normalised, error = _validate_value(section, key, setting_value)
            if error:
                errors[f"{section}.{key}"] = error
            else:
                merged[section][key] = normalised

    if errors:
        raise SettingsValidationProblem(errors, "Settings could not be saved.")

    return merged


def normalise_settings(raw) -> dict:
    """Forgivingly merge stored/legacy settings with the current defaults."""

    merged = create_default_settings()
    if not isinstance(raw, dict):
        return merged

    for section, allowed in _SECTION_KEYS.items():
        stored = raw.get(section)
        if not isinstance(stored, dict):
            continue
        for key in allowed:
            if key not in stored:
                continue
            normalised, error = _validate_value(section, key, stored[key])
            if not error:
                merged[section][key] = normalised

    return merged
