-- Set the role to supabase_admin
SET ROLE supabase_admin;

-- Disable RLS for storage.objects
ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;

-- Make the notes bucket public
UPDATE storage.buckets
SET public = true
WHERE id = 'notes';

-- Reset the role
RESET ROLE; 