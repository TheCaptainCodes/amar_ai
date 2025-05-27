-- Add note generation columns to companions table
ALTER TABLE companions
ADD COLUMN generate_notes BOOLEAN DEFAULT FALSE,
ADD COLUMN note_style VARCHAR(50),
ADD COLUMN notes_url VARCHAR(255); 