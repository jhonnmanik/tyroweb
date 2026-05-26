from flask import Blueprint, request, jsonify, redirect
from flask_login import login_user, logout_user, login_required, current_user
from flask_bcrypt import Bcrypt
from flask_dance.contrib.google import make_google_blueprint, google
from flask_dance.consumer import oauth_authorized
from database.db import db
from database.models import User
import os

auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")
bcrypt  = Bcrypt()

google_bp = make_google_blueprint(
    client_id=os.getenv("GOOGLE_CLIENT_ID"),
    client_secret=os.getenv("GOOGLE_CLIENT_SECRET"),
    scope=["openid", "email", "profile"],
    
)


@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json()

    username = (data.get("username") or "").strip()
    email    = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""

    if not username or not email or not password:
        return jsonify({"success": False, "message": "Semua field wajib diisi."}), 400

    if len(password) < 6:
        return jsonify({"success": False, "message": "Password minimal 6 karakter."}), 400

    if User.query.filter_by(username=username).first():
        return jsonify({"success": False, "message": "Username sudah digunakan."}), 409

    if User.query.filter_by(email=email).first():
        return jsonify({"success": False, "message": "Email sudah terdaftar."}), 409

    hashed_pw = bcrypt.generate_password_hash(password).decode("utf-8")
    user = User(username=username, email=email, password=hashed_pw)
    db.session.add(user)
    db.session.commit()

    return jsonify({"success": True, "message": "Registrasi berhasil! Silakan login."}), 201


@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json()

    identifier = (data.get("identifier") or "").strip()
    password   = data.get("password") or ""

    if not identifier or not password:
        return jsonify({"success": False, "message": "Identifier dan password wajib diisi."}), 400

    user = (
        User.query.filter_by(username=identifier).first() or
        User.query.filter_by(email=identifier).first()
    )

    if not user or not user.password:
        return jsonify({"success": False, "message": "Akun ini terdaftar via Google. Gunakan Sign in with Google."}), 401

    if not bcrypt.check_password_hash(user.password, password):
        return jsonify({"success": False, "message": "Username/email atau password salah."}), 401

    login_user(user, remember=data.get("remember", False))

    return jsonify({
        "success": True,
        "message": f"Selamat datang, {user.username}!",
        "user": {"id": user.id, "username": user.username, "email": user.email},
    })


@auth_bp.route("/logout", methods=["POST"])
@login_required
def logout():
    logout_user()
    return jsonify({"success": True, "message": "Berhasil logout."})


@auth_bp.route("/me", methods=["GET"])
def me():
    if current_user.is_authenticated:
        return jsonify({
            "logged_in": True,
            "user": {
                "id":       current_user.id,
                "username": current_user.username,
                "email":    current_user.email,
            },
        })
    return jsonify({"logged_in": False}), 200

@oauth_authorized.connect_via(google_bp)
def google_logged_in(blueprint, token):
    if not token:
        return False

    resp = blueprint.session.get("/oauth2/v2/userinfo")
    if not resp.ok:
        return False

    info      = resp.json()
    google_id = info["id"]
    email     = info["email"].lower()
    name      = info.get("name", email.split("@")[0])

    user = User.query.filter_by(google_id=google_id).first()

    if not user:
        user = User.query.filter_by(email=email).first()
        if user:
            user.google_id = google_id
        else:
            username = name.replace(" ", "").lower()
            base, counter = username, 1
            while User.query.filter_by(username=username).first():
                username = f"{base}{counter}"
                counter += 1
            user = User(username=username, email=email, google_id=google_id)
            db.session.add(user)

    db.session.commit()
    login_user(user, remember=True)

    return False