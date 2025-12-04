from flask import Blueprint, request, jsonify
from sqlalchemy import select, or_
from datetime import datetime, timedelta
import bcrypt
from jose import jwt
from . import get_db, app 
from .models import User, RevokedToken
from .utils import get_user_id_from_token

def authenticate():
    """Authenticates the JWT and returns user_id or a Flask error tuple."""
    with next(get_db()) as db:
        user_id_or_error = get_user_id_from_token(db)
        
        if isinstance(user_id_or_error, dict) and "error" in user_id_or_error:
            return jsonify(user_id_or_error), 401
        
        if isinstance(user_id_or_error, int):
            return user_id_or_error
            
        return jsonify({"error": "Unauthorized or missing token"}), 401
    
auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/signup', methods=['POST'])
def signup():
    data = request.get_json()
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')

    if not username or not email or not password:
        return jsonify({"error": "Missing required fields"}), 400
    
    # ... (All validation checks from routes.py remain here) ...
    if len(username) < 3 or len(username) > 20:
        return jsonify({"error": "Username must be between 3 and 20 characters."}), 400
    if len(password) < 8:
        return jsonify({"error": "Password must be at least 8 characters long."}), 400
    if not any(char.isupper() for char in password):
        return jsonify({"error": "Password must contain at least one capital letter."}), 400
    if '@' not in email or '.' not in email or email.count('@') > 1:
        return jsonify({"error": "The email format is invalid."}), 400

    with next(get_db()) as db:
        stmt = select(User).where(or_(User.username == username, User.email == email))
        existing_user = db.execute(stmt).scalars().first() 

        if existing_user:
            return jsonify({"error": "Username or email already exists"}), 400

        hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
        new_user = User(username=username, email=email, password=hashed_password.decode('utf-8'))

        db.add(new_user)
        db.commit()
        # 🌟 Clean serialization is not necessary here, but we can return the user object
        # return jsonify({"message": "User created successfully", "user": new_user.to_dict()}), 201 
        return jsonify({"message": "User created successfully"}), 201


@auth_bp.route("/login", methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

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
        token = jwt.encode(payload, app.config["JWT_SECRET_KEY"], algorithm="HS256")
        return jsonify({"token": token}), 200
    

@auth_bp.route('/logout', methods=['POST'])
def logout():
    user_id = authenticate()
    if isinstance(user_id, tuple): return user_id

    auth_header = request.headers.get("Authorization", "")
    token = auth_header.split(" ")[1]

    with next(get_db()) as db:
        stmt = select(RevokedToken).where(RevokedToken.token == token)
        existing_revocation = db.execute(stmt).scalars().first()
        
        if existing_revocation:
            return jsonify({"message": "Token already revoked (logged out)"}), 200
            
        revoked_token = RevokedToken(token=token)
        db.add(revoked_token)
        db.commit()
        return jsonify({"message": "Successfully logged out"}), 200 


@auth_bp.route('/change-password', methods=['POST'])
def change_password():
    user_id = authenticate()
    if isinstance(user_id, tuple): return user_id

    data = request.get_json()
    old_password = data.get('old_password')
    new_password = data.get('new_password')
    
    # ... (Validation checks remain here) ...

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