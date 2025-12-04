# backend/utils.py

from flask import request, jsonify, current_app
from jose import jwt, JWTError, ExpiredSignatureError
# Import necessary 2.0 components
from sqlalchemy import select
from sqlalchemy.orm import Session

# Correct relative import
from .models import RevokedToken 


def get_user_id_from_token(db: Session):
    """
    Decodes the JWT and checks if it's revoked.
    
    Args:
        db: The active SQLAlchemy 2.0 session.

    Returns:
        int: The user ID (sub) if the token is valid.
        dict: An error dictionary if the token is invalid or revoked.
    """
    # 1. Read Authorization header
    auth_header = request.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        return {"error": "Missing or invalid token format"}

    # 2. Extract the token
    token = auth_header.split(" ")[1]

    # 3. SQLAlchemy 2.0 check if token is revoked
    # MODERN QUERY: db.execute(select(...)).scalar_one_or_none()
    stmt = select(RevokedToken).where(RevokedToken.token == token)
    revoked = db.execute(stmt).scalar_one_or_none()

    if revoked:
        return {"error": "Token has been revoked"}

    # 4. Decode token
    try:
        payload = jwt.decode(token, current_app.config["JWT_SECRET_KEY"], algorithms=["HS256"])
        return int(payload["sub"])

    except ExpiredSignatureError:
        return {"error": "Token has expired"}

    except JWTError:
        return {"error": "Invalid token"}