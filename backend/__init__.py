from flask import Flask
from .auth import auth_bp
from .notes import notes_bp
from .tags import tag_bp
from .models import Base
from .database import engine
from flask_cors import CORS

# -----------------------------
# Flask app
# -----------------------------
from flask_cors import CORS
 
app = Flask(__name__)
CORS(app)

CORS(
    app,
    resources={r"/api/*": {"origins": "*"}},
    supports_credentials=True
)



# Test route
@app.route("/ping")
def ping():
    return {"message": "pong from backend"}

app.config["JWT_SECRET_KEY"] = "f9b8c1e2d3a4b5c6f7e8d9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0"

# Register blueprints
app.register_blueprint(auth_bp, url_prefix="/api")
app.register_blueprint(notes_bp, url_prefix="/api")
app.register_blueprint(tag_bp, url_prefix="/api")

# Create tables
with engine.begin() as conn:
    Base.metadata.create_all(conn)
