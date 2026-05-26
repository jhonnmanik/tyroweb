from flask import Flask, send_from_directory
from flask_login import LoginManager
from flask_migrate import Migrate
from config import Config
from database.db import db, init_db
from database.models import User
from backend.auth import auth_bp, bcrypt, google_bp
from backend.quiz import quiz_bp
from backend.leaderboard import leaderboard_bp
from dotenv import load_dotenv  # ← tambah
import os                        # ← tambah

load_dotenv()                    # ← tambah (sebelum create_app)

os.environ["OAUTHLIB_INSECURE_TRANSPORT"] = "1"  
os.environ["OAUTHLIB_RELAX_TOKEN_SCOPE"] = "1"

def create_app():
    app = Flask(
        __name__,
        static_folder="static",
        static_url_path="",
    )
    app.config.from_object(Config)

    os.environ["OAUTHLIB_INSECURE_TRANSPORT"] = "1"  
    os.environ["OAUTHLIB_RELAX_TOKEN_SCOPE"] = "1"  

    bcrypt.init_app(app)
    init_db(app)
    Migrate(app, db)

    # ... sisanya sama persis

    login_manager = LoginManager()
    login_manager.init_app(app)
    login_manager.login_view = "serve_login"

    @login_manager.user_loader
    def load_user(user_id):
        return User.query.get(int(user_id))

    @login_manager.unauthorized_handler
    def unauthorized():
        return {"success": False, "message": "Login diperlukan."}, 401

    app.register_blueprint(google_bp, url_prefix="/auth")
    app.register_blueprint(auth_bp)
    app.register_blueprint(quiz_bp)
    app.register_blueprint(leaderboard_bp)

    @app.route("/")
    def index():
        return send_from_directory("static", "index.html")

    @app.route("/login")
    def serve_login():
        return send_from_directory("static", "login.html")

    @app.route("/register")
    def serve_register():
        return send_from_directory("static", "register.html")

    @app.route("/<path:filename>")
    def serve_static(filename):
        return send_from_directory("static", filename)

    return app

    
if __name__ == "__main__":
    app = create_app()
    print("=" * 45)
    print("  TyroWeb Server Berjalan!")
    print("  URL : http://127.0.0.1:5000")
    print("=" * 45)
    app.run(debug=app.config["DEBUG"])