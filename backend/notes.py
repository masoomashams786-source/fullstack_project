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

@notes_bp.route('/notes', methods=["POST"])
def create_note():
    user_id = authenticate()
    if isinstance(user_id, tuple):
        return user_id

    data = request.get_json()
    title = data.get("title", "").strip()
    content = data.get("content", "").strip()
    tag_ids = data.get("tag_ids", [])  # NEW: list of tag IDs

    if not title:
        return jsonify({"error": "Title is required"}), 400

    with next(get_db()) as db:
        note = Note(title=title, content=content, user_id=user_id)

        # Add tags if provided
        if tag_ids:
            stmt = select(Tag).where(Tag.id.in_(tag_ids), Tag.user_id == user_id)
            tags = db.execute(stmt).scalars().all()
            note.tags = tags

        db.add(note)
        db.commit()

        return jsonify({"message": "Note created", "note": note.to_dict()}), 201

# archivedNotes = notes.filter(note => note.is_archived)
@notes_bp.route('/notes', methods=['GET'])
def get_notes():
    user_id = authenticate()
    if isinstance(user_id, tuple): 
        return user_id  

    try:
        with next(get_db()) as db:
            stmt = (
                select(Note)
                .where(Note.user_id == user_id, Note.is_archived == False, Note.is_deleted == False)
                .options(joinedload(Note.tags))  # eager-load tags
                .order_by(desc(Note.created_at))
            )
            
            notes = db.execute(stmt).unique().scalars().all()

            return jsonify({
                "success": True,
                "notes": [n.to_dict() for n in notes]
            }), 200
    except Exception as e:
        return jsonify({
            "success": False,
            "error": "Failed to fetch notes",
            "details": str(e)
        }), 500


@notes_bp.route('/notes/archived', methods=['GET'])
def get_archived_notes():
    """Return all archived notes for the authenticated user."""
    user_id = authenticate()
    if isinstance(user_id, tuple):
        return user_id

    try:
        with next(get_db()) as db:
            stmt = (
                select(Note)
                .where(Note.user_id == user_id, Note.is_archived == True, Note.is_deleted == False)
                .options(joinedload(Note.tags))
                .order_by(desc(Note.created_at))
            )

            notes = db.execute(stmt).unique().scalars().all()

            return jsonify({
                "success": True,
                "notes": [n.to_dict() for n in notes]
            }), 200
    except Exception as e:
        return jsonify({
            "success": False,
            "error": "Failed to fetch archived notes",
            "details": str(e)
        }), 500


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


@notes_bp.route('/notes/<int:note_id>/archive', methods=['PUT'])
def archive_note(note_id):
    """Mark a note as archived for the authenticated user."""
    user_id = authenticate()
    if isinstance(user_id, tuple):
        return user_id

    try:
        with next(get_db()) as db:
            stmt = select(Note).where(Note.id == note_id, Note.user_id == user_id)
            note = db.execute(stmt).scalars().first()

            if not note:
                return jsonify({"success": False, "error": "Note not found"}), 404

            if note.is_archived:
                return jsonify({
                    "success": False,
                    "error": "Note is already archived"
                }), 400

            note.is_archived = True
            note.updated_at = datetime.utcnow()
            db.commit()

            return jsonify({
                "success": True,
                "message": "Note archived successfully",
                "note": note.to_dict()
            }), 200
    except Exception as e:
        return jsonify({
            "success": False,
            "error": "Failed to archive note",
            "details": str(e)
        }), 500


@notes_bp.route('/notes/<int:note_id>/unarchive', methods=['PUT'])
def unarchive_note(note_id):
    """Mark a note as not archived (move back to active notes)."""
    user_id = authenticate()
    if isinstance(user_id, tuple):
        return user_id

    try:
        with next(get_db()) as db:
            stmt = select(Note).where(Note.id == note_id, Note.user_id == user_id)
            note = db.execute(stmt).scalars().first()

            if not note:
                return jsonify({"success": False, "error": "Note not found"}), 404

            if not note.is_archived:
                return jsonify({
                    "success": False,
                    "error": "Note is already active"
                }), 400

            note.is_archived = False
            note.updated_at = datetime.utcnow()
            db.commit()

            return jsonify({
                "success": True,
                "message": "Note unarchived successfully",
                "note": note.to_dict()
            }), 200
    except Exception as e:
        return jsonify({
            "success": False,
            "error": "Failed to unarchive note",
            "details": str(e)
        }), 500

@notes_bp.route('/notes/<int:note_id>', methods=['DELETE'])
def delete_note(note_id):
    """Soft delete a note (move to trash)."""
    user_id = authenticate()
    if isinstance(user_id, tuple):
        return user_id

    try:
        with next(get_db()) as db:
            stmt = select(Note).where(Note.id == note_id, Note.user_id == user_id)
            note = db.execute(stmt).scalars().first()

            if not note:
                return jsonify({"success": False, "error": "Note not found"}), 404

            if note.is_deleted:
                return jsonify({
                    "success": False,
                    "error": "Note is already in trash"
                }), 400

            note.is_deleted = True
            note.updated_at = datetime.utcnow()
            db.commit()

            return jsonify({
                "success": True,
                "message": "Note moved to trash successfully",
                "note": note.to_dict()
            }), 200
    except Exception as e:
        return jsonify({
            "success": False,
            "error": "Failed to delete note",
            "details": str(e)
        }), 500
    


@notes_bp.route("/notes/<int:note_id>/tags", methods=["POST", "OPTIONS"])
def add_tag_to_note(note_id):
    # Handle OPTIONS preflight request
    if request.method == "OPTIONS":
        return jsonify({"message": "OK"}), 200
    
    user_id = authenticate()
    if isinstance(user_id, tuple):
        return user_id

    data = request.get_json()
    tag_id = data.get("tag_id")

    if not tag_id:
        return jsonify({"error": "tag_id is required"}), 400

    with next(get_db()) as db:
        # Get note
        note = db.execute(
            select(Note).where(Note.id == note_id, Note.user_id == user_id)
        ).scalars().first()

        if not note:
            return jsonify({"error": "Note not found"}), 404

        # Get tag
        tag = db.execute(
            select(Tag).where(Tag.id == tag_id, Tag.user_id == user_id)
        ).scalars().first()

        if not tag:
            return jsonify({"error": "Tag not found"}), 404

        # Avoid duplicate
        if tag in note.tags:
            return jsonify({"error": "Tag already attached"}), 400

        note.tags.append(tag)
        db.commit()

        return jsonify({
            "message": "Tag attached to note",
            "tag": tag.to_dict()
        }), 200

@notes_bp.route("/notes/<int:note_id>/tags/<int:tag_id>", methods=["DELETE"])
def remove_tag_from_note(note_id, tag_id):
    user_id = authenticate()
    if isinstance(user_id, tuple):
        return user_id

    with next(get_db()) as db:
        note = db.execute(
            select(Note).where(Note.id == note_id, Note.user_id == user_id)
        ).scalars().first()
        if not note:
            return jsonify({"error": "Note not found"}), 404

        tag = db.execute(
            select(Tag).where(Tag.id == tag_id, Tag.user_id == user_id)
        ).scalars().first()
        if not tag:
            return jsonify({"error": "Tag not found"}), 404

        if tag not in note.tags:
            return jsonify({"error": "Tag not attached to this note"}), 400

        note.tags.remove(tag)
        db.commit()

        return jsonify({"message": "Tag detached from note"}), 200


@notes_bp.route('/notes/trash', methods=['GET'])
def get_trash_notes():
    """Return all deleted notes (in trash) for the authenticated user."""
    user_id = authenticate()
    if isinstance(user_id, tuple):
        return user_id

    try:
        with next(get_db()) as db:
            stmt = (
                select(Note)
                .where(Note.user_id == user_id, Note.is_deleted == True)
                .options(joinedload(Note.tags))
                .order_by(desc(Note.updated_at))
            )

            notes = db.execute(stmt).unique().scalars().all()

            return jsonify({
                "success": True,
                "notes": [n.to_dict() for n in notes]
            }), 200
    except Exception as e:
        return jsonify({
            "success": False,
            "error": "Failed to fetch trash notes",
            "details": str(e)
        }), 500


@notes_bp.route('/notes/<int:note_id>/recover', methods=['PUT'])
def recover_note(note_id):
    """Recover a note from trash (restore it)."""
    user_id = authenticate()
    if isinstance(user_id, tuple):
        return user_id

    try:
        with next(get_db()) as db:
            stmt = select(Note).where(Note.id == note_id, Note.user_id == user_id)
            note = db.execute(stmt).scalars().first()

            if not note:
                return jsonify({"success": False, "error": "Note not found"}), 404

            if not note.is_deleted:
                return jsonify({
                    "success": False,
                    "error": "Note is not in trash"
                }), 400

            note.is_deleted = False
            note.updated_at = datetime.utcnow()
            db.commit()

            return jsonify({
                "success": True,
                "message": "Note recovered successfully",
                "note": note.to_dict()
            }), 200
    except Exception as e:
        return jsonify({
            "success": False,
            "error": "Failed to recover note",
            "details": str(e)
        }), 500


@notes_bp.route('/notes/<int:note_id>/permanent', methods=['DELETE'])
def delete_note_permanent(note_id):
    """Permanently delete a note from trash."""
    user_id = authenticate()
    if isinstance(user_id, tuple):
        return user_id

    try:
        with next(get_db()) as db:
            stmt = select(Note).where(Note.id == note_id, Note.user_id == user_id)
            note = db.execute(stmt).scalars().first()

            if not note:
                return jsonify({"success": False, "error": "Note not found"}), 404

            if not note.is_deleted:
                return jsonify({
                    "success": False,
                    "error": "Note must be in trash before permanent deletion"
                }), 400

            db.delete(note)
            db.commit()

            return jsonify({
                "success": True,
                "message": "Note permanently deleted"
            }), 200
    except Exception as e:
        return jsonify({
            "success": False,
            "error": "Failed to permanently delete note",
            "details": str(e)
        }), 500

        

