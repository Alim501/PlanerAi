-- Add AI analysis result fields to note table
ALTER TABLE note ADD COLUMN IF NOT EXISTS difficulty VARCHAR(50);
ALTER TABLE note ADD COLUMN IF NOT EXISTS language VARCHAR(10);
