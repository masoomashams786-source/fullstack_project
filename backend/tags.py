# backend/tags.py

from flask import Blueprint, request, jsonify
from sqlalchemy import select
from .database import get_db
from .models import Tag
from .auth import authenticate

tag_bp = Blueprint('tags', __name__)



@tag_bp.route('/tags', methods=['GET'])
def get_tags():
    user_id = authenticate()
    if isinstance(user_id, tuple):
        return user_id

    with next(get_db()) as db:
        stmt = select(Tag).where(Tag.user_id == user_id).order_by(Tag.name)
        tags = db.execute(stmt).scalars().all()

        return jsonify({"tags": [t.to_dict() for t in tags]}), 200



@tag_bp.route('/tags/<int:tag_id>', methods=['GET'])
def get_tag(tag_id):
    user_id = authenticate()
    if isinstance(user_id, tuple):
        return user_id

    with next(get_db()) as db:
        stmt = select(Tag).where(Tag.id == tag_id, Tag.user_id == user_id)
        tag = db.execute(stmt).scalars().first()

        if not tag:
            return jsonify({"error": "Tag not found"}), 404

        return jsonify({"tag": tag.to_dict()}), 200



@tag_bp.route('/tags', methods=['POST'])
def create_tag():
    user_id = authenticate()
    if isinstance(user_id, tuple):
        return user_id

    data = request.get_json()
    name = data.get('name', '').strip()
    if not name:
        return jsonify({"error": "Tag name is required"}), 400

    with next(get_db()) as db:
      
        stmt = select(Tag).where(Tag.name == name, Tag.user_id == user_id)
        if db.execute(stmt).scalars().first():
            return jsonify({"error": "Tag already exists"}), 400

        tag = Tag(name=name, user_id=user_id)
        db.add(tag)
        db.commit()

        return jsonify({"message": "Tag created", "tag": tag.to_dict()}), 201



@tag_bp.route('/tags/<int:tag_id>', methods=['PUT'])
def update_tag(tag_id):
    user_id = authenticate()
    if isinstance(user_id, tuple):
        return user_id

    data = request.get_json()
    name = data.get('name', '').strip()
    if not name:
        return jsonify({"error": "Tag name is required"}), 400

    with next(get_db()) as db:
        stmt = select(Tag).where(Tag.id == tag_id, Tag.user_id == user_id)
        tag = db.execute(stmt).scalars().first()

        if not tag:
            return jsonify({"error": "Tag not found"}), 404

       
        stmt_check = select(Tag).where(Tag.user_id == user_id, Tag.name == name, Tag.id != tag_id)
        if db.execute(stmt_check).scalars().first():
            return jsonify({"error": "Tag name already exists"}), 400

        tag.name = name
        db.commit()

        return jsonify({"message": "Tag updated", "tag": tag.to_dict()}), 200



@tag_bp.route('/tags/<int:tag_id>', methods=['DELETE'])
def delete_tag(tag_id):
    user_id = authenticate()
    if isinstance(user_id, tuple):
        return user_id

    with next(get_db()) as db:
        stmt = select(Tag).where(Tag.id == tag_id, Tag.user_id == user_id)
        tag = db.execute(stmt).scalars().first()

        if not tag:
            return jsonify({"error": "Tag not found"}), 404

        db.delete(tag)
        db.commit()

        return jsonify({"message": "Tag deleted"}), 200
