-- Add cached rating fields and view count to note table
ALTER TABLE note ADD COLUMN IF NOT EXISTS average_rating DOUBLE PRECISION;
ALTER TABLE note ADD COLUMN IF NOT EXISTS rating_count INTEGER DEFAULT 0;
ALTER TABLE note ADD COLUMN IF NOT EXISTS view_count INTEGER NOT NULL DEFAULT 0;
