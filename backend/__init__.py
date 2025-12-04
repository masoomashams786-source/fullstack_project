from flask import Flask
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy import create_engine
from .models import Base, User, Note, Tag, RevokedToken
from .auth import auth_bp
from .notes import notes_bp

# -----------------------------
# Flask app
# -----------------------------
app = Flask(__name__)

app.config["JWT_SECRET_KEY"] = "f9b8c1e2d3a4b5c6f7e8d9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0"

# -----------------------------
# Database config
# -----------------------------
DATABASE_URL = "mysql+pymysql://root:mgh786%40$%40MEin@localhost/notes_app"
# The 'future=True' flag ensures we use the modern 2.0 style features.
engine = create_engine(DATABASE_URL, echo=False, future=True) 

# -----------------------------
# Modern SQLAlchemy Session Factory
# -----------------------------
# SessionLocal is the factory we call to create a new Session object.
SessionLocal = sessionmaker(bind=engine, expire_on_commit=False)

# -----------------------------
# Session Management Helper
# -----------------------------
def get_db():
    """Dependency for getting a database session. 
    It creates a new session and ensures it's closed, even if errors occur."""
    db = SessionLocal()
    try:
        # yield is used here to make this a generator (like a context manager)
        yield db
    finally:
        db.close()

app.register_blueprint(auth_bp)
app.register_blueprint(notes_bp)        

# -----------------------------
# Create tables if they don't exist
# -----------------------------
# Use engine.begin() for DDL operations (create tables)
with engine.begin() as conn:
    Base.metadata.create_all(conn)