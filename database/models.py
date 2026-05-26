from flask_login import UserMixin
from datetime import datetime
from database.db import db


class User(UserMixin, db.Model):
    __tablename__ = "users"

    id         = db.Column(db.Integer, primary_key=True)
    username   = db.Column(db.String(80), unique=True, nullable=False)
    email      = db.Column(db.String(120), unique=True, nullable=False)
    password   = db.Column(db.String(256), nullable=True)  # nullable untuk user Google
    google_id  = db.Column(db.String(100), unique=True, nullable=True)  # ← baru
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    quiz_results = db.relationship("QuizResult", backref="user", lazy=True)


class QuizResult(db.Model):
    __tablename__ = "quiz_results"

    id         = db.Column(db.Integer, primary_key=True)
    user_id    = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    category   = db.Column(db.String(50), nullable=False)
    score      = db.Column(db.Integer, nullable=False)
    total      = db.Column(db.Integer, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id":         self.id,
            "category":   self.category,
            "score":      self.score,
            "total":      self.total,
            "percentage": round((self.score / self.total) * 100, 1) if self.total else 0,
            "created_at": self.created_at.strftime("%Y-%m-%d %H:%M"),
        }


class LeaderboardEntry(db.Model):
    __tablename__ = "leaderboard"

    id         = db.Column(db.Integer, primary_key=True)
    user_id    = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    username   = db.Column(db.String(80), nullable=False)
    category   = db.Column(db.String(50), nullable=False)
    score      = db.Column(db.Integer, nullable=False)
    total      = db.Column(db.Integer, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    __table_args__ = (
        db.UniqueConstraint("user_id", "category", name="uq_user_category"),
    )

    def to_dict(self):
        return {
            "username":   self.username,
            "category":   self.category,
            "score":      self.score,
            "total":      self.total,
            "percentage": round((self.score / self.total) * 100, 1) if self.total else 0,
        }