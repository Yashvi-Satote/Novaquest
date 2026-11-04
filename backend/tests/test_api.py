"""Flask API contract tests for the 10-section payload."""
from __future__ import annotations

import pytest


@pytest.fixture(scope="module")
def client(seeded):
    from NovaBase.app import app

    app.config.update(TESTING=True)
    return app.test_client()


def test_health_endpoint(client):
    response = client.get("/api/health")
    assert response.status_code == 200
    payload = response.get_json()
    assert payload["status"] == "healthy"
    assert payload["spacecraft_records_count"] >= 1


def test_novabase_health_endpoint(client):
    response = client.get("/api/novabase/health")
    assert response.status_code == 200
    payload = response.get_json()
    assert payload["total_spacecraft"] >= 1
    assert "sections" in payload
    assert len(payload["sections"]) == 10
    assert payload["per_spacecraft"][0]["total_sections"] == 10


def test_detail_has_all_ten_sections(client):
    response = client.get("/api/hardware/surveyor-1")
    assert response.status_code == 200
    data = response.get_json()

    assert set(data["sections"].keys()) == {
        "what_is_it",
        "how_it_works",
        "why_important",
        "status",
        "imagery",
        "sources",
        "timeline",
        "stakeholders",
        "model",
        "people",
    }
    assert set(data["content"].keys()) == {
        "what_is_it",
        "how_it_works",
        "why_important",
        "status",
    }
    assert data["completeness"]["total_sections"] == 10
    assert len(data["timeline"]) >= 3
    assert len(data["stakeholders"]) >= 2
    assert len(data["people"]) == 10
    assert len(data["images"]) >= 1
    assert len(data["sources"]) >= 1
    assert len(data["models"]) >= 1
    assert data["license"]["text"]


def test_detail_people_are_ranked(client):
    data = client.get("/api/hardware/surveyor-1").get_json()
    ranks = [person["rank_order"] for person in data["people"]]
    assert ranks == list(range(1, 11))


def test_list_contract_unchanged(client):
    response = client.get("/api/hardware?limit=5")
    assert response.status_code == 200
    payload = response.get_json()
    assert {"items", "total", "page", "limit", "total_pages"} <= set(payload)
    assert payload["items"]


def test_unknown_slug_returns_404(client):
    response = client.get("/api/hardware/not-a-real-spacecraft")
    assert response.status_code == 404
