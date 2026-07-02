
-- Comprehensive Migration Script for PPE Inspector
-- Version: 1.0
-- Date: 2025-07-22

-- Step 1: Custom Types (Enums)
CREATE TYPE ppe_status AS ENUM ('active', 'flagged', 'expired', 'retired');
CREATE TYPE inspection_type AS ENUM ('pre-use', 'monthly', 'quarterly', 'annual');

-- Step 2: Tables

-- Profiles Table
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    updated_at TIMESTAMPTZ,
    username TEXT UNIQUE,
    full_name TEXT,
    avatar_url TEXT,
    website TEXT,
    CONSTRAINT username_length CHECK (char_length(username) >= 3)
);

-- PPE Items Table
CREATE TABLE public.ppe_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    serial_number TEXT NOT NULL,
    batch_number INTEGER,
    type TEXT NOT NULL,
    brand TEXT NOT NULL,
    model_number TEXT,
    manufacturing_date TIMESTAMPTZ NOT NULL,
    expiry_date TIMESTAMPTZ NOT NULL,
    first_use TIMESTAMPTZ,
    image_url TEXT,
    status ppe_status DEFAULT 'active' NOT NULL,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    assigned_to UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    last_inspection TIMESTAMPTZ,
    next_inspection TIMESTAMPTZ,
    UNIQUE(serial_number, batch_number)
);

-- Inspection Checkpoints Table
CREATE TABLE public.inspection_checkpoints (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    ppe_type TEXT NOT NULL,
    description TEXT NOT NULL,
    required BOOLEAN DEFAULT true NOT NULL,
    UNIQUE(ppe_type, description)
);

-- Inspections Table
CREATE TABLE public.inspections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    ppe_id UUID NOT NULL REFERENCES public.ppe_items(id) ON DELETE CASCADE,
    inspector_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
    date TIMESTAMPTZ NOT NULL,
    type inspection_type NOT NULL,
    overall_result TEXT NOT NULL,
    notes TEXT,
    signature_url TEXT
);

-- Inspection Results Table
CREATE TABLE public.inspection_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    inspection_id UUID NOT NULL REFERENCES public.inspections(id) ON DELETE CASCADE,
    checkpoint_id UUID NOT NULL REFERENCES public.inspection_checkpoints(id) ON DELETE CASCADE,
    passed BOOLEAN,
    notes TEXT,
    photo_url TEXT
);

-- Step 3: Storage Buckets

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
    ('ppe-images', 'ppe-images', true, 5242880, '{"image/jpeg","image/png","image/gif"}'),
    ('inspection-photos', 'inspection-photos', true, 5242880, '{"image/jpeg","image/png"}'),
    ('avatars', 'avatars', true, 1048576, '{"image/jpeg","image/png"}')
ON CONFLICT (id) DO NOTHING;


-- Step 4: Row-Level Security (RLS)

-- Enable RLS for all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ppe_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inspection_checkpoints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inspections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inspection_results ENABLE ROW LEVEL SECURITY;

-- Policies for 'profiles'
CREATE POLICY "Public profiles are viewable by everyone." ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile." ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update their own profile." ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Policies for 'ppe_items'
CREATE POLICY "Users can view all PPE items." ON public.ppe_items FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert PPE items." ON public.ppe_items FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Users can update their own or assigned PPE items." ON public.ppe_items FOR UPDATE USING (auth.uid() = created_by OR auth.uid() = assigned_to);
CREATE POLICY "Users can delete their own PPE items." ON public.ppe_items FOR DELETE USING (auth.uid() = created_by);

-- Policies for 'inspection_checkpoints'
CREATE POLICY "Checkpoints are viewable by everyone." ON public.inspection_checkpoints FOR SELECT USING (true);
CREATE POLICY "Authenticated users can add checkpoints." ON public.inspection_checkpoints FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Policies for 'inspections'
CREATE POLICY "Users can view their own inspections." ON public.inspections FOR SELECT USING (auth.uid() = inspector_id);
CREATE POLICY "Users can insert their own inspections." ON public.inspections FOR INSERT WITH CHECK (auth.uid() = inspector_id);

-- Policies for 'inspection_results'
CREATE POLICY "Users can view results for their own inspections." ON public.inspection_results FOR SELECT USING (
    (SELECT inspector_id FROM public.inspections WHERE id = inspection_id) = auth.uid()
);
CREATE POLICY "Users can insert results for their own inspections." ON public.inspection_results FOR INSERT WITH CHECK (
    (SELECT inspector_id FROM public.inspections WHERE id = inspection_id) = auth.uid()
);


-- Step 5: Storage Policies

-- Policies for 'ppe-images'
CREATE POLICY "PPE images are publicly readable." ON storage.objects FOR SELECT USING (bucket_id = 'ppe-images');
CREATE POLICY "Authenticated users can upload PPE images." ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'ppe-images' AND auth.role() = 'authenticated');
CREATE POLICY "Users can update their own PPE images." ON storage.objects FOR UPDATE USING (bucket_id = 'ppe-images' AND auth.uid() = owner);

-- Policies for 'inspection-photos'
CREATE POLICY "Inspection photos are publicly readable." ON storage.objects FOR SELECT USING (bucket_id = 'inspection-photos');
CREATE POLICY "Authenticated users can upload inspection photos." ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'inspection-photos' AND auth.role() = 'authenticated');

-- Policies for 'avatars'
CREATE POLICY "Avatars are publicly readable." ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
CREATE POLICY "Users can upload their own avatar." ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.uid() = owner);
CREATE POLICY "Users can update their own avatar." ON storage.objects FOR UPDATE USING (bucket_id = 'avatars' AND auth.uid() = owner);

-- End of script
