from sqlalchemy import ForeignKey, Table, Integer, String, Text, DateTime, Column
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship
from datetime import datetime


class Base(DeclarativeBase):
    pass

# Association table for many-to-many relationship between Notes and Tags
note_tags = Table(
    'note_tags',
    Base.metadata,
    Column('note_id', Integer, ForeignKey('note.id'), primary_key=True),
    Column('tag_id', Integer, ForeignKey('tag.id'), primary_key=True)
)

class User(Base):
    __tablename__ = "user"

    id: Mapped[int] = mapped_column(primary_key=True)
    username: Mapped[str] = mapped_column(String(80), unique=True, nullable=False)
    email: Mapped[str] = mapped_column(String(120), unique=True, nullable=False)
    password: Mapped[str] = mapped_column(String(256), nullable=False) 

    notes: Mapped[list["Note"]] = relationship("Note", back_populates="user")
    tags: Mapped[list["Tag"]] = relationship("Tag", back_populates="user")

    def to_dict(self, include_notes=False):
        data = {
            "id": self.id,
            "username": self.username,
            "email": self.email,
        }
        if include_notes and self.notes:
            data['notes'] = [n.to_dict() for n in self.notes]
        
        return data


class Note(Base):
    __tablename__ = "note"

    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    content: Mapped[str | None] = mapped_column(Text, nullable=True)
    user_id: Mapped[int] = mapped_column(ForeignKey('user.id'), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow) 

    is_archived: Mapped[bool] = mapped_column(default=False, nullable=False)

    user: Mapped["User"] = relationship("User", back_populates="notes")
    tags: Mapped[list["Tag"]] = relationship("Tag", secondary=note_tags, back_populates="notes")

    def to_dict(self):
        """Converts Note object to a dictionary for API response."""
        return {
            "id": self.id,
            "title": self.title,
            "content": self.content,
            "user_id": self.user_id,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
            "is_archived": self.is_archived,
            
            "tags": [t.to_dict() for t in self.tags]
        }


class Tag(Base):
    __tablename__ = "tag"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey('user.id'), nullable=False)
    name: Mapped[str] = mapped_column(String(50), nullable=False)
    user : Mapped["User"] = relationship("User", back_populates="tags")
    notes: Mapped[list["Note"]] = relationship("Note", secondary=note_tags, back_populates="tags")

    def to_dict(self):
        """Converts Tag object to a dictionary for API response."""
        return {
            "id": self.id,
            "name": self.name
        }


class RevokedToken(Base):
    __tablename__ = "revoked_token"

    id: Mapped[int] = mapped_column(primary_key=True)
    token: Mapped[str] = mapped_column(String(500), unique=True, nullable=False)
    revoked_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)