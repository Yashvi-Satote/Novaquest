"""
NovaQuest Flask Blueprint
Provides endpoints for Chapter 1 3D lunar map data, Surveyor 1 historical lore,
environmental telemetry, and investigation milestones.
"""

from flask import Blueprint, jsonify, request
from .chapter1_service import chapter1_service

novaquest_bp = Blueprint("novaquest", __name__, url_prefix="/api/novaquest")


@novaquest_bp.route("/chapter1/overview", methods=["GET"])
def get_chapter1_overview():
    """Returns Chapter 1 environment, historical coordinates, and mission parameters."""
    return jsonify({
        "success": True,
        "data": chapter1_service.get_chapter_overview()
    })


@novaquest_bp.route("/chapter1/poi", methods=["GET"])
def get_chapter1_pois():
    """Returns points of interest with 3D coordinates on the lunar map."""
    category = request.args.get("category")
    pois = chapter1_service.get_pois()
    if category:
        pois = [p for p in pois if p.get("category") == category]

    return jsonify({
        "success": True,
        "count": len(pois),
        "data": pois
    })


@novaquest_bp.route("/chapter1/poi/<poi_id>", methods=["GET"])
def get_poi_detail(poi_id: str):
    """Returns detailed lore and inspection data for a specific POI."""
    poi = chapter1_service.get_poi_by_id(poi_id)
    if not poi:
        return jsonify({"success": False, "error": f"POI '{poi_id}' not found"}), 404

    return jsonify({
        "success": True,
        "data": poi
    })


@novaquest_bp.route("/chapter1/telemetry", methods=["GET"])
def get_eva_telemetry():
    """Returns real-time EVA suit telemetry for Captain Arin Rao."""
    return jsonify({
        "success": True,
        "telemetry": chapter1_service.get_telemetry_snapshot()
    })


@novaquest_bp.route("/chapter1/investigate", methods=["POST"])
def record_investigation():
    """Records an inspection event performed by the player on the lunar surface."""
    payload = request.get_json(silent=True) or {}
    poi_id = payload.get("poi_id")
    target = payload.get("target")

    poi = chapter1_service.get_poi_by_id(poi_id) if poi_id else None

    return jsonify({
        "success": True,
        "recorded": {
            "poi_id": poi_id,
            "target": target,
            "verified": bool(poi),
            "message": f"Telemetry entry cataloged for {poi_id or 'unknown point'}."
        }
    })
