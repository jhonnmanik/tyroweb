from flask import Blueprint, request, jsonify
from database.models import LeaderboardEntry

leaderboard_bp = Blueprint("leaderboard", __name__, url_prefix="/api/leaderboard")

VALID_CATEGORIES = {"html", "css", "javascript"}


@leaderboard_bp.route("/", methods=["GET"])
def get_leaderboard():
    category = (request.args.get("category") or "").lower()
    limit    = min(int(request.args.get("limit", 10)), 50)

    if category and category not in VALID_CATEGORIES:
        return jsonify({"success": False, "message": "Kategori tidak valid."}), 400

    query = LeaderboardEntry.query

    if category:
        query = query.filter_by(category=category)

    entries = (
        query
        .order_by(LeaderboardEntry.score.desc())
        .limit(limit)
        .all()
    )

    return jsonify({
        "success":  True,
        "category": category or "all",
        "entries":  [e.to_dict() for e in entries],
    })


@leaderboard_bp.route("/all", methods=["GET"])
def get_all_categories():
    result = {}
    for cat in VALID_CATEGORIES:
        entries = (
            LeaderboardEntry.query
            .filter_by(category=cat)
            .order_by(LeaderboardEntry.score.desc())
            .limit(5)
            .all()
        )
        result[cat] = [e.to_dict() for e in entries]

    return jsonify({"success": True, "leaderboard": result})