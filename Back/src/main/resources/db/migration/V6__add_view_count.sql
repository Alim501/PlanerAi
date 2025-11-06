-- Add view_count column to note table
ALTER TABLE note ADD COLUMN IF NOT EXISTS view_count INTEGER NOT NULL DEFAULT 0;
