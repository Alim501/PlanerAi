-- Create note_rating table for rating system
CREATE TABLE IF NOT EXISTS note_rating (
    id BIGSERIAL PRIMARY KEY,
    note_id BIGINT NOT NULL REFERENCES note(id) ON DELETE CASCADE,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    created_at TIMESTAMP,
    CONSTRAINT unique_user_note_rating UNIQUE (note_id, user_id)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_note_rating_note_id ON note_rating(note_id);
CREATE INDEX IF NOT EXISTS idx_note_rating_user_id ON note_rating(user_id);
