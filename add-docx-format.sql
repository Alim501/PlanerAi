-- Add DOCX format to note_format_check constraint

-- Drop old constraint
ALTER TABLE note DROP CONSTRAINT IF EXISTS note_format_check;

-- Add new constraint with DOCX
ALTER TABLE note ADD CONSTRAINT note_format_check
  CHECK (format IN ('TEXT', 'PDF', 'IMAGE', 'DOCX'));

-- Verify constraint
SELECT conname, pg_get_constraintdef(oid)
FROM pg_constraint
WHERE conname = 'note_format_check';
