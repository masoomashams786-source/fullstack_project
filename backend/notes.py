# backend/notes.py

from flask import Blueprint, request, jsonify
from sqlalchemy import select, or_, desc, asc
from sqlalchemy.orm import joinedload 
from datetime import datetime, timedelta

# Import essentials from the main package and the authentication helper
from .database import get_db
from .models import Note, Tag
from .auth import authenticate # Import the helper from the new auth file


notes_bp = Blueprint('notes', __name__)

@notes_bp.route('/notes', methods=['POST'])
def create_note():
    user_id = authenticate()
    if isinstance(user_id, tuple): return user_id

    data = request.get_json()
    title = data.get('title')
    content = data.get('content', '')

    if not title:
        return jsonify({"error": "Title is required"}), 400

    with next(get_db()) as db:
        new_note = Note(title=title, content=content, user_id=user_id)
        db.add(new_note)
        db.commit()
        # Clean serialization
        return jsonify({"message": "Note created", "note": new_note.to_dict()}), 201


@notes_bp.route('/notes', methods=['GET'])
def get_notes():
    user_id = authenticate()
    if isinstance(user_id, tuple): 
        return user_id  

    with next(get_db()) as db:
        stmt = (
            select(Note)
            .where(Note.user_id == user_id, Note.is_archived == False)
            .options(joinedload(Note.tags))  # eager-load tags
            .order_by(desc(Note.created_at))
        )
        
        notes = db.execute(stmt).unique().scalars().all()

        return jsonify({
            "notes": [n.to_dict() for n in notes]
        }), 200



@notes_bp.route('/notes/<int:note_id>', methods=['GET'])
def get_note(note_id):
    user_id = authenticate()
    if isinstance(user_id, tuple): return user_id

    with next(get_db()) as db:
        stmt = (
            select(Note)
            .where(Note.id == note_id, Note.user_id == user_id)
            .options(joinedload(Note.tags))
        )
        note = db.execute(stmt).scalars().first()
        
        if not note:
            return jsonify({"error": "Note not found"}), 404

        # Clean serialization
        return jsonify({
            "note": note.to_dict()
        }), 200



@notes_bp.route('/notes/<int:note_id>', methods=['PUT'])
def update_note(note_id):
    user_id = authenticate()
    if isinstance(user_id, tuple):
        return user_id

    data = request.get_json()
    title = data.get('title')
    content = data.get('content')

    with next(get_db()) as db:
        
        stmt = select(Note).where(Note.id == note_id, Note.user_id == user_id)
        note = db.execute(stmt).scalars().first()

        if not note:
            return jsonify({"error": "Note not found"}), 404

        
        if title:
            note.title = title
        if content is not None:
            note.content = content

       
        note.updated_at = datetime.utcnow()

        db.commit()

        return jsonify({"message": "Note updated", "note": note.to_dict()}), 200
    

@notes_bp.route('/notes/<int:note_id>', methods=['DELETE'])
def delete_note(note_id):
    user_id = authenticate()
    if isinstance(user_id, tuple):
        return user_id

    with next(get_db()) as db:
        stmt = select(Note).where(Note.id == note_id, Note.user_id == user_id)
        note = db.execute(stmt).scalars().first()

        if not note:
            return jsonify({"error": "Note not found"}), 404

        db.delete(note)
        db.commit()

        return jsonify({"message": "Note deleted"}),200
        
        
        

