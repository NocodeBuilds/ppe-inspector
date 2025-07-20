
-- Ensure the ppe_items table has all required columns
ALTER TABLE public.ppe_items 
ADD COLUMN IF NOT EXISTS first_use TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id);

-- Update the batch_number column to be integer if it's text
ALTER TABLE public.ppe_items 
ALTER COLUMN batch_number TYPE INTEGER USING batch_number::integer;

-- Create missing storage buckets if they don't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('ppe-images', 'ppe-images', true, 52428800, '{"image/*"}'),
  ('avatars', 'avatars', true, 10485760, '{"image/*"}'),
  ('inspection-photos', 'inspection-photos', true, 52428800, '{"image/*"}')
ON CONFLICT (id) DO NOTHING;

-- Create comprehensive storage policies for ppe-images bucket
DROP POLICY IF EXISTS "Anyone can view ppe images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload ppe images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update ppe images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete ppe images" ON storage.objects;

CREATE POLICY "Public Access" ON storage.objects
  FOR SELECT USING (bucket_id = 'ppe-images');

CREATE POLICY "Authenticated Upload" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'ppe-images' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated Update" ON storage.objects
  FOR UPDATE USING (bucket_id = 'ppe-images' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated Delete" ON storage.objects
  FOR DELETE USING (bucket_id = 'ppe-images' AND auth.role() = 'authenticated');

-- Similar policies for other buckets
CREATE POLICY "Public Avatar Access" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "Avatar Upload" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.role() = 'authenticated');

CREATE POLICY "Avatar Update" ON storage.objects
  FOR UPDATE USING (bucket_id = 'avatars' AND auth.role() = 'authenticated');

CREATE POLICY "Avatar Delete" ON storage.objects
  FOR DELETE USING (bucket_id = 'avatars' AND auth.role() = 'authenticated');

CREATE POLICY "Public Inspection Photo Access" ON storage.objects
  FOR SELECT USING (bucket_id = 'inspection-photos');

CREATE POLICY "Inspection Photo Upload" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'inspection-photos' AND auth.role() = 'authenticated');

CREATE POLICY "Inspection Photo Update" ON storage.objects
  FOR UPDATE USING (bucket_id = 'inspection-photos' AND auth.role() = 'authenticated');

CREATE POLICY "Inspection Photo Delete" ON storage.objects
  FOR DELETE USING (bucket_id = 'inspection-photos' AND auth.role() = 'authenticated');
