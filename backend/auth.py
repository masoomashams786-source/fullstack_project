from flask import Blueprint, request, jsonify, current_app
from sqlalchemy import select, or_
from sqlalchemy.exc import IntegrityError
from datetime import datetime, timedelta
import bcrypt
from jose import jwt, JWTError, ExpiredSignatureError
from pydantic import ValidationError
from .database import get_db
from .models import User, RevokedToken
from .utils import get_user_id_from_token
from .schemas import SignupSchema
import json

auth_bp = Blueprint('auth', __name__)

# -----------------------------
# Helper: Authenticate JWT
# -----------------------------
def authenticate():
    """Validates JWT from Authorization header, returns user_id or error tuple."""
    with next(get_db()) as db:
        user_id_or_error = get_user_id_from_token(db)
        if isinstance(user_id_or_error, dict) and "error" in user_id_or_error:
            return jsonify(user_id_or_error), 401
        if isinstance(user_id_or_error, int):
            return user_id_or_error
        return jsonify({"error": "Unauthorized or missing token"}), 401


# -----------------------------
# Signup Route
# -----------------------------
@auth_bp.route('/auth/signup', methods=['POST'])
def signup():
    # 1️⃣ Get JSON payload
    data = request.get_json() or {}
    print("SIGNUP PAYLOAD:", data)  # Optional debug print

    # 2️⃣ Validate with Pydantic
    try:
        payload = SignupSchema(**data)
    except ValidationError as e:
        print("VALIDATION FAILED:", e.json())  # Optional debug print
        return jsonify({"errors": json.loads(e.json())}), 400

    username = payload.username.strip()
    email = payload.email.strip().lower()
    password = payload.password

    # 3️⃣ Get DB session
    db = next(get_db())

    try:
        # 4️⃣ Check if user already exists
        stmt = select(User).where(or_(User.username == username, User.email == email))
        existing_user = db.execute(stmt).scalars().first()
        if existing_user:
            print("USER EXISTS:", existing_user.username, existing_user.email)  # Optional
            return jsonify({"error": "Username or email already exists"}), 400

        # 5️⃣ Hash password
        hashed_password = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt())

        # 6️⃣ Create new user
        new_user = User(
            username=username,
            email=email,
            password=hashed_password.decode("utf-8")
        )
        db.add(new_user)
        db.commit()
        db.refresh(new_user)

        # 7️⃣ Return success response
        return jsonify({
            "message": "User created successfully",
            "user": new_user.to_dict()
        }), 201

    finally:
        db.close()

# -----------------------------
# Login Route
# -----------------------------
@auth_bp.route('/auth/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email', '').strip()
    password = data.get('password', '')

    if not email or not password:
        return jsonify({"error": "Missing required fields"}), 400

    with next(get_db()) as db:
        stmt = select(User).where(User.email == email)
        user = db.execute(stmt).scalars().first()

        if not user or not bcrypt.checkpw(password.encode('utf-8'), user.password.encode('utf-8')):
            return jsonify({"error": "Invalid email or password"}), 401

        payload = {
            "sub": str(user.id),
            "iat": datetime.utcnow(),
            "exp": datetime.utcnow() + timedelta(hours=1)
        }
        token = jwt.encode(payload, current_app.config["JWT_SECRET_KEY"], algorithm="HS256")
        return jsonify({"token": token, "user": user.to_dict()}), 200


# -----------------------------
# Logout Route
# -----------------------------
@auth_bp.route('/logout', methods=['POST'])
def logout():
    user_id = authenticate()
    if isinstance(user_id, tuple):
        return user_id

    auth_header = request.headers.get("Authorization", "")
    parts = auth_header.split(" ")
    if len(parts) != 2 or parts[0] != "Bearer":
        return jsonify({"error": "Invalid token format"}), 401
    token = parts[1]

    with next(get_db()) as db:
        stmt = select(RevokedToken).where(RevokedToken.token == token)
        existing_revocation = db.execute(stmt).scalars().first()
        if existing_revocation:
            return jsonify({"message": "Token already revoked (logged out)"}), 200

        revoked_token = RevokedToken(token=token)
        db.add(revoked_token)
        db.commit()
        return jsonify({"message": "Successfully logged out"}), 200


# -----------------------------
# Change Password Route
# -----------------------------
@auth_bp.route('/change-password', methods=['POST'])
def change_password():
    user_id = authenticate()
    if isinstance(user_id, tuple):
        return user_id

    data = request.get_json()
    old_password = data.get('old_password', '')
    new_password = data.get('new_password', '')

    # Validate new password like signup
    if len(new_password) < 8:
        return jsonify({"error": "New password must be at least 8 characters long."}), 400
    if not any(char.isupper() for char in new_password):
        return jsonify({"error": "New password must contain at least one capital letter."}), 400

    with next(get_db()) as db:
        stmt = select(User).where(User.id == user_id)
        user = db.execute(stmt).scalars().first()
        if not user:
            return jsonify({"error": "User not found"}), 404

        if not bcrypt.checkpw(old_password.encode('utf-8'), user.password.encode('utf-8')):
            return jsonify({"error": "Old password is incorrect"}), 401

        hashed_password = bcrypt.hashpw(new_password.encode('utf-8'), bcrypt.gensalt())
        user.password = hashed_password.decode('utf-8')
        db.commit()

        return jsonify({"message": "Password changed successfully"}), 200
