"""Security hardening test suite for Novaquest Phase 1.

Verifies:
1. Model-serving path traversal and containment checks.
2. CORS trusted origin configuration and rejection of wildcard with credentials.
3. Safe query parameter validation (bounds checking, integer conversion, rejection of malformed inputs).
4. Flask debug configuration (safe by default).
5. Request size limits (MAX_CONTENT_LENGTH) and 413 handling.
6. Rate limiting middleware and 429 responses.
7. Elimination of hardcoded developer machine paths.
"""
from __future__ import annotations

import io
import os
import sys
import tempfile
from pathlib import Path
import pytest

ROOT = Path(__file__).resolve().parents[2]
BACKEND = ROOT / "backend"
for entry in (str(ROOT), str(BACKEND)):
    if entry not in sys.path:
        sys.path.insert(0, entry)

from NovaBase.app import (
    app,
    get_trusted_cors_origins,
    SimpleRateLimiter,
    POSSIBLE_MODELS_DIRS,
    ALLOWED_MODEL_EXTENSIONS,
    ALLOWED_SORTS,
    rate_limiter,
)


@pytest.fixture
def client():
    """Test client configured for security testing."""
    app.config.update(
        TESTING=True,
        TEST_RATE_LIMIT=False,
    )
    with app.test_client() as test_client:
        yield test_client


# ============================================================================
# 1. PATH TRAVERSAL AND MODEL SERVING SECURITY TESTS
# ============================================================================

def test_model_serving_path_traversal_dot_dot_in_model_name(client):
    """Negative test: Traversing directories via model_name must return 400 or 404."""
    traversal_payloads = [
        "/api/models/../voyager.glb",
        "/api/models/..%2f/voyager.glb",
        "/api/models/..%2f..%2f/voyager.glb",
        "/api/models/%2e%2e/voyager.glb",
        "/api/models/..%5c/voyager.glb",
    ]
    for path in traversal_payloads:
        response = client.get(path, follow_redirects=True)
        # Must be 400 (Bad Request from validation) or 404 (not found by routing), NEVER 200 or 500
        assert response.status_code in (400, 404), f"Payload '{path}' returned {response.status_code}"
        if response.status_code == 400:
            data = response.get_json()
            assert "error" in data


def test_model_serving_path_traversal_dot_dot_in_filename(client):
    """Negative test: Traversing directories via filename must be rejected with 400 or 404."""
    traversal_filenames = [
        "/api/models/voyager/..%2f..%2fapp.py",
        "/api/models/voyager/..%2f..%2f..%2fetc%2fpasswd",
        "/api/models/voyager/..%5c..%5cwindows%5cwin.ini",
        "/api/models/voyager/%2e%2e%2fvoyager.glb",
        "/api/models/voyager/....//voyager.glb",
    ]
    for path in traversal_filenames:
        response = client.get(path, follow_redirects=True)
        assert response.status_code in (400, 404), f"Payload '{path}' returned {response.status_code}"
        if response.status_code == 400:
            data = response.get_json()
            assert "error" in data


def test_model_serving_rejects_special_characters_and_null_bytes(client):
    """Negative test: Filenames and model names with invalid characters or null bytes must return 400."""
    invalid_paths = [
        "/api/models/voyager%00/voyager.glb",
        "/api/models/voyager/voyager%00.glb",
        "/api/models/voyager/voyager;rm.glb",
        "/api/models/voyager/voyager|dir.glb",
        "/api/models/voyager/voyager`id`.glb",
        "/api/models/voyager/voyager$HOME.glb",
        "/api/models/voyager/voyager space.glb",
    ]
    for path in invalid_paths:
        response = client.get(path)
        assert response.status_code == 400, f"Payload '{path}' returned {response.status_code}"
        data = response.get_json()
        assert "error" in data


def test_model_serving_rejects_unsupported_extensions(client):
    """Negative test: Only 3D model and texture extensions are permitted."""
    unsupported_files = [
        "/api/models/voyager/app.py",
        "/api/models/voyager/config.env",
        "/api/models/voyager/database.db",
        "/api/models/voyager/secret.key",
        "/api/models/voyager/exploit.sh",
        "/api/models/voyager/malware.exe",
    ]
    for path in unsupported_files:
        response = client.get(path)
        assert response.status_code == 400, f"Path '{path}' returned {response.status_code}"
        data = response.get_json()
        assert "not permitted" in data.get("error", "").lower() or "extension" in data.get("error", "").lower()


def test_model_serving_containment_and_valid_retrieval(client, monkeypatch, tmp_path):
    """Positive and negative containment test using a controlled mock models directory."""
    models_dir = tmp_path / "models"
    models_dir.mkdir()
    voyager_dir = models_dir / "voyager"
    voyager_dir.mkdir()

    # Legitimate model file inside model directory
    model_file = voyager_dir / "voyager.glb"
    model_file.write_bytes(b"glTF-binary-mock-data-content")

    # File outside models base directory (sibling directory)
    outside_dir = tmp_path / "secrets"
    outside_dir.mkdir()
    secret_file = outside_dir / "secret.glb"
    secret_file.write_bytes(b"super-secret-forbidden-data")

    # Monkeypatch MODELS_BASE_DIR to the controlled test directory
    monkeypatch.setattr("NovaBase.app.MODELS_BASE_DIR", str(models_dir))

    # 1. Positive test: Legitimate model file served successfully
    res = client.get("/api/models/voyager/voyager.glb")
    assert res.status_code == 200
    assert res.data == b"glTF-binary-mock-data-content"

    # 2. Negative test: Non-existent model folder returns 404
    res = client.get("/api/models/nonexistent/model.glb")
    assert res.status_code == 404

    # 3. Negative test: Non-existent file in valid model folder returns 404
    res = client.get("/api/models/voyager/missing.glb")
    assert res.status_code == 404

    # 4. Negative test: Attempt to reach outside directory via model name
    res = client.get("/api/models/../secrets/secret.glb")
    assert res.status_code in (400, 404)


def test_model_detail_rejects_invalid_characters(client):
    """Negative test: /api/models/<model_name> rejects directory traversal characters."""
    for invalid_name in ["..", "../voyager", "voyager%00", "voyager/sub"]:
        res = client.get(f"/api/models/{invalid_name}")
        assert res.status_code in (400, 404)


# ============================================================================
# 2. CORS SECURITY TESTS
# ============================================================================

def test_cors_never_allows_wildcard_with_credentials(monkeypatch):
    """Negative test: Wildcard '*' MUST never be in the trusted origins list."""
    monkeypatch.setenv("CORS_ORIGIN", "*")
    origins = get_trusted_cors_origins()
    assert "*" not in origins

    monkeypatch.setenv("CORS_ORIGINS", "*,https://trusted.novaquest.org,http://localhost:5173")
    origins2 = get_trusted_cors_origins()
    assert "*" not in origins2
    assert "https://trusted.novaquest.org" in origins2
    assert "http://localhost:5173" in origins2


def test_cors_headers_with_trusted_origin(client):
    """Positive test: Trusted origin receives explicit CORS header and credentials flag."""
    trusted_origin = "http://localhost:5173"
    response = client.get("/api/health", headers={"Origin": trusted_origin})
    assert response.headers.get("Access-Control-Allow-Origin") == trusted_origin
    assert response.headers.get("Access-Control-Allow-Credentials") == "true"


def test_cors_headers_rejects_untrusted_origin(client):
    """Negative test: Untrusted origin is not reflected in Access-Control-Allow-Origin."""
    untrusted_origin = "http://evil-attacker.example.com"
    response = client.get("/api/health", headers={"Origin": untrusted_origin})
    allow_origin = response.headers.get("Access-Control-Allow-Origin")
    assert allow_origin != untrusted_origin
    assert allow_origin != "*"


# ============================================================================
# 3. QUERY PARAMETER VALIDATION TESTS
# ============================================================================

def test_query_param_validation_rejects_non_integer_page(client):
    """Negative test: Non-integer page returns 400 Bad Request, not 500."""
    for endpoint in ["/api/hardware", "/api/spacecraft"]:
        res = client.get(f"{endpoint}?page=invalid_string")
        assert res.status_code == 400
        data = res.get_json()
        assert "error" in data
        assert "page" in data["error"].lower()


def test_query_param_validation_rejects_negative_or_zero_page(client):
    """Negative test: Page < 1 returns 400 Bad Request."""
    for bad_page in ["0", "-1", "-99"]:
        res = client.get(f"/api/hardware?page={bad_page}")
        assert res.status_code == 400
        data = res.get_json()
        assert "error" in data
        assert "at least 1" in data["error"].lower()


def test_query_param_validation_rejects_non_integer_limit(client):
    """Negative test: Non-integer limit returns 400 Bad Request."""
    res = client.get("/api/hardware?limit=foo_bar")
    assert res.status_code == 400
    data = res.get_json()
    assert "error" in data
    assert "limit" in data["error"].lower()


def test_query_param_validation_rejects_excessive_limit(client):
    """Negative test: Limit exceeding 150 returns 400 Bad Request."""
    for bad_limit in ["151", "1000", "999999"]:
        res = client.get(f"/api/hardware?limit={bad_limit}")
        assert res.status_code == 400
        data = res.get_json()
        assert "error" in data
        assert "not exceed 150" in data["error"].lower()


def test_query_param_validation_rejects_invalid_mission_id(client):
    """Negative test: Non-integer mission_id returns 400 Bad Request."""
    res = client.get("/api/hardware?mission_id=not_a_valid_id")
    assert res.status_code == 400
    data = res.get_json()
    assert "error" in data
    assert "mission_id" in data["error"].lower()


def test_query_param_validation_rejects_invalid_sort_by(client):
    """Negative test: Invalid sort_by parameter returns 400 Bad Request."""
    res = client.get("/api/hardware?sort_by=malicious_clause;--")
    assert res.status_code == 400
    data = res.get_json()
    assert "error" in data
    assert "sort_by" in data["error"].lower()


def test_search_endpoint_inherits_query_param_validation(client):
    """Negative test: Search endpoints validate pagination query parameters."""
    res = client.get("/api/hardware/search?page=xyz")
    assert res.status_code == 400
    res2 = client.get("/api/spacecraft/search?limit=9999")
    assert res2.status_code == 400


# ============================================================================
# 4. FLASK DEBUG PRODUCTION SETTINGS TESTS
# ============================================================================

def test_flask_debug_defaults_to_false():
    """Verify debug mode is disabled by default."""
    debug_raw = os.getenv("FLASK_DEBUG", "0").strip().lower()
    debug = debug_raw in {"1", "true", "yes"}
    # In test/production default without FLASK_DEBUG=1, debug must be False
    if "FLASK_DEBUG" not in os.environ:
        assert debug is False
    assert app.config.get("DEBUG") is False or os.getenv("FLASK_DEBUG") == "1"


# ============================================================================
# 5. REQUEST PAYLOAD SIZE LIMIT (MAX_CONTENT_LENGTH) TESTS
# ============================================================================

def test_max_content_length_is_configured():
    """Verify MAX_CONTENT_LENGTH is set to protect against memory exhaustion."""
    max_len = app.config.get("MAX_CONTENT_LENGTH")
    assert max_len is not None
    assert max_len > 0
    assert max_len <= 16 * 1024 * 1024  # Max 16MB


def test_payload_too_large_error_handler(client):
    """Test the 413 error handler response format."""
    from NovaBase.app import request_entity_too_large

    with app.test_request_context():
        resp, code = request_entity_too_large(None)
        assert code == 413
        assert "error" in resp.get_json()
        assert "maximum allowed size" in resp.get_json()["error"].lower()


# ============================================================================
# 6. RATE LIMITING TESTS
# ============================================================================

def test_rate_limiter_allows_requests_under_threshold():
    """Positive test: Requests within RPM rate threshold are allowed."""
    limiter = SimpleRateLimiter(requests_per_minute=10)
    for _ in range(10):
        allowed, retry_after = limiter.is_allowed("10.0.0.1")
        assert allowed is True
        assert retry_after == 0


def test_rate_limiter_throttles_excess_requests():
    """Negative test: Requests exceeding RPM threshold are throttled with 429."""
    limiter = SimpleRateLimiter(requests_per_minute=3)
    ip = "10.0.0.2"

    assert limiter.is_allowed(ip)[0] is True
    assert limiter.is_allowed(ip)[0] is True
    assert limiter.is_allowed(ip)[0] is True

    # 4th request must be rejected
    allowed, retry_after = limiter.is_allowed(ip)
    assert allowed is False
    assert retry_after > 0


def test_rate_limiter_ip_isolation():
    """Verify rate limits are tracked per client IP address."""
    limiter = SimpleRateLimiter(requests_per_minute=2)
    assert limiter.is_allowed("10.0.0.3")[0] is True
    assert limiter.is_allowed("10.0.0.3")[0] is True
    assert limiter.is_allowed("10.0.0.3")[0] is False

    # Different IP is not affected
    assert limiter.is_allowed("10.0.0.4")[0] is True


def test_rate_limit_middleware_returns_429(client, monkeypatch):
    """Test rate limit middleware returns HTTP 429 and Retry-After header."""
    app.config.update(TEST_RATE_LIMIT=True)
    rate_limiter.reset()

    # Set a tiny limit for this test
    monkeypatch.setattr(rate_limiter, "rpm", 2)

    headers = {"X-Forwarded-For": "203.0.113.50"}

    r1 = client.get("/api/health", headers=headers)
    assert r1.status_code == 200

    r2 = client.get("/api/health", headers=headers)
    assert r2.status_code == 200

    # 3rd request from same client exceeds threshold
    r3 = client.get("/api/health", headers=headers)
    assert r3.status_code == 429
    assert "Retry-After" in r3.headers
    assert "Rate limit exceeded" in r3.get_json()["error"]

    # Reset
    app.config.update(TEST_RATE_LIMIT=False)
    rate_limiter.reset()


# ============================================================================
# 7. HARDCODED MACHINE PATHS ELIMINATED
# ============================================================================

def test_no_hardcoded_developer_paths_in_models_config():
    """Verify developer machine paths are completely removed."""
    for path_str in POSSIBLE_MODELS_DIRS:
        assert "LENOVO" not in path_str
        assert "Users\\LENOVO" not in path_str
