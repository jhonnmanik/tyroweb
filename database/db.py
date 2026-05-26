from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

def init_db(app):
    db.init_app(app)
    with app.app_context():
        from database.models import User, QuizResult, LeaderboardEntry
        db.create_all()
        print("[DB] Database siap digunakan.")