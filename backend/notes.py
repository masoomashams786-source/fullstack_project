# backend/notes.py

from flask import Blueprint, request, jsonify
from sqlalchemy import select, or_, desc, asc
from sqlalchemy.orm import joinedload 
from datetime import datetime, timedelta

# Import essentials from the main package and the authentication helper
from . import get_db
from .models import Note, Tag
from .auth import authenticate # Import the helper from the new auth file

# -----------------------------
# 📝 NOTES BLUEPRINT 📝
# -----------------------------
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
    if isinstance(user_id, tuple): return user_id

    with next(get_db()) as db:
        stmt = (
            select(Note)
            .where(Note.user_id == user_id, Note.is_archived == False)
            .options(joinedload(Note.tags))
            .order_by(desc(Note.created_at))
        )
        notes = db.execute(stmt).scalars().all() 

        # Clean serialization
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

# ... (All other note/tag routes like update_note, delete_note, search_notes,
# filter_notes, create_tag, get_tags, update_tag, delete_tag, add_tags_to_note,
# remove_tag_from_note, archive_note, unarchive_note, and get_archived_notes
# are moved here, with @app.route replaced by @notes_bp.route, and using to_dict()) ...