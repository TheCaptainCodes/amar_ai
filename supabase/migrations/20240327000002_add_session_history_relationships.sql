-- Set the role to service_role
SET ROLE service_role;

-- Add foreign key constraint to session_history table
ALTER TABLE session_history
ADD CONSTRAINT fk_session_history_companion
FOREIGN KEY (companion_id)
REFERENCES companions(id)
ON DELETE CASCADE;

-- Add foreign key constraint for user_id if not already present
ALTER TABLE session_history
ADD CONSTRAINT fk_session_history_user
FOREIGN KEY (user_id)
REFERENCES auth.users(id)
ON DELETE CASCADE;

-- Reset the role
RESET ROLE; 