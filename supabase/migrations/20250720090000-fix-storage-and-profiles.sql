
-- Create missing storage buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('ppe-images', 'ppe-images', true, 52428800, '{"image/*"}'),
  ('avatars', 'avatars', true, 10485760, '{"image/*"}'),
  ('inspection-photos', 'inspection-photos', true, 52428800, '{"image/*"}')
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for ppe-images bucket
CREATE POLICY "Anyone can view ppe images" ON storage.objects
  FOR SELECT USING (bucket_id = 'ppe-images');

CREATE POLICY "Authenticated users can upload ppe images" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'ppe-images' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update ppe images" ON storage.objects
  FOR UPDATE USING (bucket_id = 'ppe-images' AND auth.role() = 'authenticated');

CREATE POLICY "Users can delete ppe images" ON storage.objects
  FOR DELETE USING (bucket_id = 'ppe-images' AND auth.role() = 'authenticated');

-- Create storage policies for avatars bucket  
CREATE POLICY "Anyone can view avatars" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "Authenticated users can upload avatars" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update avatars" ON storage.objects
  FOR UPDATE USING (bucket_id = 'avatars' AND auth.role() = 'authenticated');

CREATE POLICY "Users can delete avatars" ON storage.objects
  FOR DELETE USING (bucket_id = 'avatars' AND auth.role() = 'authenticated');

-- Create storage policies for inspection-photos bucket
CREATE POLICY "Anyone can view inspection photos" ON storage.objects
  FOR SELECT USING (bucket_id = 'inspection-photos');

CREATE POLICY "Authenticated users can upload inspection photos" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'inspection-photos' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update inspection photos" ON storage.objects
  FOR UPDATE USING (bucket_id = 'inspection-photos' AND auth.role() = 'authenticated');

CREATE POLICY "Users can delete inspection photos" ON storage.objects
  FOR DELETE USING (bucket_id = 'inspection-photos' AND auth.role() = 'authenticated');

-- Fix ppe_items table to include missing columns
ALTER TABLE public.ppe_items 
ADD COLUMN IF NOT EXISTS first_use TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id);

-- Create a trigger to automatically create profile when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    'user'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Update RLS policies to be more permissive for better performance
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;
CREATE POLICY "Users can view all profiles" ON public.profiles
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can create own profiles" ON public.profiles;
CREATE POLICY "Users can create own profiles" ON public.profiles
  FOR INSERT WITH CHECK (id = auth.uid());

-- Make analytics accessible to all authenticated users
DROP POLICY IF EXISTS "Admin access only" ON public.reports;
CREATE POLICY "All users can view reports" ON public.reports
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "All users can create reports" ON public.reports
  FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND created_by = auth.uid());
