from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from .models import Base

# -----------------------------
# Database config
# -----------------------------
DATABASE_URL = "mysql+pymysql://root:mgh786%40$%40MEin@localhost/notes_app"


engine = create_engine(DATABASE_URL, echo=False, future=True)

# Modern SQLAlchemy Session Factory
SessionLocal = sessionmaker(bind=engine, expire_on_commit=False)


def get_db():
    """Yield a database session and close it automatically."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


with engine.begin() as conn:
    Base.metadata.create_all(conn)
