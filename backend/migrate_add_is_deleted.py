
from sqlalchemy import text
from .database import engine

def migrate_add_is_deleted():
    """Add is_deleted column to note table if it doesn't exist."""
    try:
        with engine.begin() as conn:
            
            result = conn.execute(text("""
                SELECT COUNT(*) as count
                FROM information_schema.COLUMNS
                WHERE TABLE_SCHEMA = DATABASE()
                AND TABLE_NAME = 'note'
                AND COLUMN_NAME = 'is_deleted'
            """))
            
            count = result.fetchone()[0]
            
            if count == 0:
                # Column doesn't exist, add it
                conn.execute(text("""
                    ALTER TABLE note
                    ADD COLUMN is_deleted BOOLEAN NOT NULL DEFAULT FALSE
                """))
                print(" Successfully added 'is_deleted' column to 'note' table")
            else:
                print(" Column 'is_deleted' already exists in 'note' table")
                
    except Exception as e:
        print(f" Error during migration: {str(e)}")
        raise

if __name__ == "__main__":
    migrate_add_is_deleted()

