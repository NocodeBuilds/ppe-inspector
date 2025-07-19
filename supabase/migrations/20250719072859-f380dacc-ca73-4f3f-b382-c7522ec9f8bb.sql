-- Fix critical database-frontend mismatches

-- 1. Add missing columns to profiles table to match frontend expectations
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS full_name TEXT GENERATED ALWAYS AS (
  CASE 
    WHEN first_name IS NOT NULL AND last_name IS NOT NULL THEN first_name || ' ' || last_name
    WHEN first_name IS NOT NULL THEN first_name
    WHEN last_name IS NOT NULL THEN last_name
    ELSE NULL
  END
) STORED;

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS employee_id TEXT,
ADD COLUMN IF NOT EXISTS site_name TEXT,
ADD COLUMN IF NOT EXISTS "Employee_Role" TEXT;

-- 2. Create missing notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info' CHECK (type IN ('info', 'warning', 'success', 'error')),
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- 3. Create security definer function to prevent RLS recursion
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT 
LANGUAGE SQL 
SECURITY DEFINER 
STABLE
SET search_path = public, auth
AS $$
  SELECT role::text FROM public.profiles WHERE id = auth.uid();
$$;

-- 4. Fix profiles RLS policies to prevent infinite recursion
DROP POLICY IF EXISTS "view_organization_profiles" ON public.profiles;

CREATE POLICY "view_organization_profiles" 
ON public.profiles 
FOR SELECT 
USING (
  organization_id IN (
    SELECT p.organization_id 
    FROM public.profiles p 
    WHERE p.id = auth.uid()
  )
  OR public.get_current_user_role() = 'admin'
);

-- 5. Create RLS policies for notifications
CREATE POLICY "Users can view their own notifications"
ON public.notifications 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own notifications"
ON public.notifications 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
ON public.notifications 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notifications"
ON public.notifications 
FOR DELETE 
USING (auth.uid() = user_id);

-- 6. Create trigger for notifications updated_at
CREATE TRIGGER update_notifications_updated_at
  BEFORE UPDATE ON public.notifications
  FOR EACH ROW
  EXECUTE FUNCTION public.update_modified_column();

-- 7. Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON public.notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);

-- 8. Add realtime for notifications
ALTER TABLE public.notifications REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;