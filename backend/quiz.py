from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user
from database.db import db
from database.models import QuizResult, LeaderboardEntry

quiz_bp = Blueprint("quiz", __name__, url_prefix="/api/quiz")

VALID_CATEGORIES = {"html", "css", "javascript"}


@quiz_bp.route("/submit", methods=["POST"])
@login_required
def submit_quiz():
    data = request.get_json()

    category = (data.get("category") or "").lower()
    score    = data.get("score")
    total    = data.get("total")

    if category not in VALID_CATEGORIES:
        return jsonify({"success": False, "message": "Kategori tidak valid."}), 400

    if score is None or total is None:
        return jsonify({"success": False, "message": "Score dan total wajib diisi."}), 400

    if not (0 <= score <= total):
        return jsonify({"success": False, "message": "Score tidak valid."}), 400

    result = QuizResult(
        user_id=current_user.id,
        category=category,
        score=int(score),
        total=int(total),
    )
    db.session.add(result)

    _update_leaderboard(current_user, category, int(score), int(total))

    db.session.commit()

    return jsonify({
        "success":    True,
        "message":    "Hasil quiz tersimpan.",
        "percentage": round((score / total) * 100, 1) if total else 0,
    })


@quiz_bp.route("/history", methods=["GET"])
@login_required
def quiz_history():
    category = request.args.get("category")

    query = QuizResult.query.filter_by(user_id=current_user.id)
    if category and category in VALID_CATEGORIES:
        query = query.filter_by(category=category)

    results = query.order_by(QuizResult.created_at.desc()).limit(20).all()

    return jsonify({
        "success": True,
        "history": [r.to_dict() for r in results],
    })


def _update_leaderboard(user, category, score, total):
    entry = LeaderboardEntry.query.filter_by(
        user_id=user.id, category=category
    ).first()

    if entry is None:
        entry = LeaderboardEntry(
            user_id=user.id,
            username=user.username,
            category=category,
            score=score,
            total=total,
        )
        db.session.add(entry)
    elif score > entry.score:
        entry.score    = score
        entry.total    = total
        entry.username = user.username