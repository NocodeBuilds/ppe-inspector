-- Complete schema replacement - Drop everything first
DROP TABLE IF EXISTS public.audit_log CASCADE;
DROP TABLE IF EXISTS public.flagged_issues CASCADE;
DROP TABLE IF EXISTS public.inspection_checkpoints CASCADE;
DROP TABLE IF EXISTS public.inspection_results CASCADE;
DROP TABLE IF EXISTS public.inspection_templates CASCADE;
DROP TABLE IF EXISTS public.inspections CASCADE;
DROP TABLE IF EXISTS public.notifications CASCADE;
DROP TABLE IF EXISTS public.offline_actions CASCADE;
DROP TABLE IF EXISTS public.ppe_items CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;
DROP TABLE IF EXISTS public.reports CASCADE;
DROP TABLE IF EXISTS public.user_settings CASCADE;

-- Drop any remaining views
DROP VIEW IF EXISTS public.expiring_equipment CASCADE;
DROP VIEW IF EXISTS public.upcoming_inspections CASCADE;
DROP VIEW IF EXISTS public.inspection_statistics CASCADE;

-- Drop functions
DROP FUNCTION IF EXISTS public.get_current_user_role() CASCADE;
DROP FUNCTION IF EXISTS public.update_modified_column() CASCADE;
DROP FUNCTION IF EXISTS public.update_equipment_inspection_dates() CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.update_updated_at_column() CASCADE;

-- Create UUID extension if not exists
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Users & Authentication
CREATE TABLE public.profiles (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    email text UNIQUE NOT NULL,
    full_name text,
    employee_role text,
    department text,
    site_name text,
    avatar_url text,
    is_admin boolean DEFAULT false,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- 2. PPE Inventory
CREATE TABLE public.ppe_items (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    serial_number text UNIQUE NOT NULL,
    type text NOT NULL,
    brand text,
    model_number text,
    batch_number text,
    manufacturing_date date,
    expiry_date date,
    status text DEFAULT 'active',
    image_url text,
    next_inspection date,
    assigned_to uuid REFERENCES public.profiles(id),
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- 3. Inspection Templates & Checklists
CREATE TABLE public.inspection_templates (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    name text NOT NULL,
    ppe_type text NOT NULL,
    description text,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE public.inspection_checkpoints (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    template_id uuid REFERENCES public.inspection_templates(id) ON DELETE CASCADE,
    ppe_type text NOT NULL,
    description text NOT NULL,
    "order" integer,
    required boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- 4. Inspections & Results
CREATE TABLE public.inspections (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    ppe_id uuid REFERENCES public.ppe_items(id) ON DELETE SET NULL,
    inspector_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
    date timestamp with time zone NOT NULL,
    type text NOT NULL,
    overall_result text NOT NULL,
    notes text,
    signature_url text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE public.inspection_results (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    inspection_id uuid REFERENCES public.inspections(id) ON DELETE CASCADE,
    checkpoint_id uuid REFERENCES public.inspection_checkpoints(id) ON DELETE SET NULL,
    description text,
    passed boolean,
    notes text,
    photo_url text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- 5. Reports & Analytics
CREATE TABLE public.reports (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    type text NOT NULL,
    generated_by uuid REFERENCES public.profiles(id),
    generated_at timestamp with time zone DEFAULT now(),
    file_url text,
    related_inspection_ids jsonb,
    parameters jsonb
);

-- 6. Flagged Issues
CREATE TABLE public.flagged_issues (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    ppe_id uuid REFERENCES public.ppe_items(id) ON DELETE SET NULL,
    inspection_id uuid REFERENCES public.inspections(id) ON DELETE SET NULL,
    checkpoint_id uuid REFERENCES public.inspection_checkpoints(id) ON DELETE SET NULL,
    reported_by uuid REFERENCES public.profiles(id),
    status text DEFAULT 'open',
    description text,
    photo_url text,
    created_at timestamp with time zone DEFAULT now(),
    resolved_at timestamp with time zone
);

-- 7. Notifications
CREATE TABLE public.notifications (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id uuid REFERENCES public.profiles(id),
    type text,
    message text,
    is_read boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now()
);

-- 8. Offline Actions
CREATE TABLE public.offline_actions (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id uuid REFERENCES public.profiles(id),
    action_type text,
    payload jsonb,
    status text DEFAULT 'pending',
    timestamp timestamp with time zone DEFAULT now()
);

-- 9. Audit Log
CREATE TABLE public.audit_log (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id uuid REFERENCES public.profiles(id),
    action text,
    entity text,
    entity_id uuid,
    details jsonb,
    timestamp timestamp with time zone DEFAULT now()
);

-- 10. User Settings
CREATE TABLE public.user_settings (
    user_id uuid PRIMARY KEY REFERENCES public.profiles(id),
    dark_mode boolean DEFAULT true,
    push_notifications boolean DEFAULT true,
    offline_mode boolean DEFAULT false,
    auto_update boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ppe_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inspection_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inspection_checkpoints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inspections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inspection_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flagged_issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offline_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for single-tenant architecture
-- Profiles
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (id = auth.uid());

-- PPE Items
CREATE POLICY "Users can view all ppe items" ON public.ppe_items FOR SELECT USING (true);
CREATE POLICY "Users can create ppe items" ON public.ppe_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update ppe items" ON public.ppe_items FOR UPDATE USING (true);

-- Inspection Templates
CREATE POLICY "Users can view templates" ON public.inspection_templates FOR SELECT USING (true);
CREATE POLICY "Admins can manage templates" ON public.inspection_templates FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
);

-- Inspection Checkpoints
CREATE POLICY "Users can view checkpoints" ON public.inspection_checkpoints FOR SELECT USING (true);
CREATE POLICY "Admins can manage checkpoints" ON public.inspection_checkpoints FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
);

-- Inspections
CREATE POLICY "Users can view all inspections" ON public.inspections FOR SELECT USING (true);
CREATE POLICY "Users can create inspections" ON public.inspections FOR INSERT WITH CHECK (inspector_id = auth.uid());
CREATE POLICY "Users can update own inspections" ON public.inspections FOR UPDATE USING (inspector_id = auth.uid());

-- Inspection Results
CREATE POLICY "Users can view inspection results" ON public.inspection_results FOR SELECT USING (
  inspection_id IN (SELECT id FROM public.inspections)
);
CREATE POLICY "Users can create inspection results" ON public.inspection_results FOR INSERT WITH CHECK (
  inspection_id IN (SELECT id FROM public.inspections WHERE inspector_id = auth.uid())
);
CREATE POLICY "Users can update inspection results" ON public.inspection_results FOR UPDATE USING (
  inspection_id IN (SELECT id FROM public.inspections WHERE inspector_id = auth.uid())
);

-- Reports
CREATE POLICY "Users can view all reports" ON public.reports FOR SELECT USING (true);
CREATE POLICY "Users can create reports" ON public.reports FOR INSERT WITH CHECK (generated_by = auth.uid());

-- Flagged Issues
CREATE POLICY "Users can view all flagged issues" ON public.flagged_issues FOR SELECT USING (true);
CREATE POLICY "Users can create flagged issues" ON public.flagged_issues FOR INSERT WITH CHECK (reported_by = auth.uid());
CREATE POLICY "Users can update flagged issues" ON public.flagged_issues FOR UPDATE USING (true);

-- Notifications
CREATE POLICY "Users can view own notifications" ON public.notifications FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can create own notifications" ON public.notifications FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own notifications" ON public.notifications FOR UPDATE USING (user_id = auth.uid());

-- Offline Actions
CREATE POLICY "Users can manage own offline actions" ON public.offline_actions FOR ALL USING (user_id = auth.uid());

-- Audit Log
CREATE POLICY "Users can view audit log" ON public.audit_log FOR SELECT USING (true);
CREATE POLICY "System can create audit entries" ON public.audit_log FOR INSERT WITH CHECK (true);

-- User Settings
CREATE POLICY "Users can manage own settings" ON public.user_settings FOR ALL USING (user_id = auth.uid());

-- Create indexes for performance
CREATE INDEX idx_ppe_items_status ON public.ppe_items(status);
CREATE INDEX idx_ppe_items_type ON public.ppe_items(type);
CREATE INDEX idx_ppe_items_assigned_to ON public.ppe_items(assigned_to);
CREATE INDEX idx_inspections_ppe_id ON public.inspections(ppe_id);
CREATE INDEX idx_inspections_inspector_id ON public.inspections(inspector_id);
CREATE INDEX idx_inspections_date ON public.inspections(date);
CREATE INDEX idx_inspection_results_inspection_id ON public.inspection_results(inspection_id);
CREATE INDEX idx_flagged_issues_status ON public.flagged_issues(status);
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_is_read ON public.notifications(is_read);

-- Create trigger function for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_ppe_items_updated_at BEFORE UPDATE ON public.ppe_items FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_inspection_templates_updated_at BEFORE UPDATE ON public.inspection_templates FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_inspection_checkpoints_updated_at BEFORE UPDATE ON public.inspection_checkpoints FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_inspections_updated_at BEFORE UPDATE ON public.inspections FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_inspection_results_updated_at BEFORE UPDATE ON public.inspection_results FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_user_settings_updated_at BEFORE UPDATE ON public.user_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();