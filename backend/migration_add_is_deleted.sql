-- Migration script to add is_deleted column to note table
-- Run this in your MySQL client if the automatic migration doesn't work
-- 
-- Usage: 
--   mysql -u root -p notes_app < migration_add_is_deleted.sql
--   OR run this SQL directly in your MySQL client

-- Add the is_deleted column
-- Note: If the column already exists, this will fail with an error
-- That's OK - just ignore the error and continue
ALTER TABLE note
ADD COLUMN is_deleted BOOLEAN NOT NULL DEFAULT FALSE;

