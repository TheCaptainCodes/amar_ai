-- Set the role to service_role
SET ROLE service_role;

-- Check if bucket exists before creating
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'notes') THEN
        -- Create a storage bucket for notes
        INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
        VALUES (
            'notes',
            'notes',
            false,
            52428800, -- 50MB file size limit
            ARRAY['application/pdf']
        );
    END IF;
END $$;

-- Enable RLS
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Authenticated users can upload notes" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can read notes" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own notes" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own notes" ON storage.objects;

-- Set up storage policies for the notes bucket
CREATE POLICY "Authenticated users can upload notes"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'notes' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can read notes"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'notes' AND auth.role() = 'authenticated');

-- Allow users to update their own notes
CREATE POLICY "Users can update their own notes"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'notes' AND auth.role() = 'authenticated')
WITH CHECK (bucket_id = 'notes' AND auth.role() = 'authenticated');

-- Allow users to delete their own notes
CREATE POLICY "Users can delete their own notes"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'notes' AND auth.role() = 'authenticated');

-- Reset the role
RESET ROLE; 