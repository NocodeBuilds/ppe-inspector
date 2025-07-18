-- PPE Inspector Database Schema
-- Created: 2025-05-14
-- This script creates all tables, types, relationships, views, and security policies for the PPE Inspector application

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable full-text search
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- ********************************
-- CUSTOM TYPES
-- ********************************

-- PPE Types
CREATE TYPE ppe_type AS ENUM (
  'helmet',
  'harness',
  'lanyard',
  'gloves',
  'boots',
  'respirator',
  'ear_protection',
  'eye_protection',
  'high_vis',
  'other'
);

-- PPE Status
CREATE TYPE ppe_status AS ENUM (
  'active',
  'inactive',
  'flagged',
  'expired',
  'retired'
);

-- Inspection Types
CREATE TYPE inspection_type AS ENUM (
  'pre-use',
  'monthly',
  'quarterly'
);

-- Inspection Results
CREATE TYPE inspection_result AS ENUM (
  'pass',
  'fail',
  'pending'
);

-- ********************************
-- TABLES
-- ********************************

-- Organizations Table
CREATE TABLE IF NOT EXISTS organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  address TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  logo_url TEXT,
  settings JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Profiles Table (extends the auth.users table)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  email TEXT,
  organization_id UUID REFERENCES organizations,
  role TEXT CHECK (role IN ('admin', 'inspector', 'viewer')),
  employee_id TEXT,
  site_name TEXT,
  department TEXT,
  signature_url TEXT,
  settings JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- PPE Items Table
CREATE TABLE IF NOT EXISTS ppe_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations,
  type ppe_type NOT NULL,
  serial_number TEXT,
  brand TEXT,
  model_number TEXT,
  purchase_date DATE,
  manufacture_date DATE,
  expiry_date DATE,
  location TEXT,
  assigned_to UUID REFERENCES profiles,
  status ppe_status DEFAULT 'active',
  photo_url TEXT,
  last_inspection TIMESTAMP WITH TIME ZONE,
  next_inspection TIMESTAMP WITH TIME ZONE,
  qr_code TEXT UNIQUE,
  notes TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES profiles
);

-- PPE Type Specifications
CREATE TABLE IF NOT EXISTS ppe_type_specifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations,
  type ppe_type NOT NULL,
  inspection_frequency INTERVAL NOT NULL DEFAULT '1 month'::interval,
  lifespan INTERVAL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inspection Templates
CREATE TABLE IF NOT EXISTS inspection_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations,
  name TEXT NOT NULL,
  description TEXT,
  ppe_type ppe_type NOT NULL,
  version TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES profiles
);

-- Checkpoint Groups
CREATE TABLE IF NOT EXISTS checkpoint_groups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  template_id UUID REFERENCES inspection_templates ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  display_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Checkpoints
CREATE TABLE IF NOT EXISTS checkpoints (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  template_id UUID REFERENCES inspection_templates ON DELETE CASCADE,
  group_id UUID REFERENCES checkpoint_groups,
  description TEXT NOT NULL,
  guidance TEXT,
  display_order INT NOT NULL DEFAULT 0,
  required BOOLEAN DEFAULT TRUE,
  photo_required BOOLEAN DEFAULT FALSE,
  notes_required BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inspections Table
CREATE TABLE IF NOT EXISTS inspections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ppe_id UUID REFERENCES ppe_items ON DELETE CASCADE,
  inspector_id UUID REFERENCES profiles,
  template_id UUID REFERENCES inspection_templates,
  type inspection_type NOT NULL,
  date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  overall_result inspection_result DEFAULT 'pending',
  notes TEXT,
  signature_url TEXT,
  location TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inspection Results
CREATE TABLE IF NOT EXISTS inspection_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  inspection_id UUID REFERENCES inspections ON DELETE CASCADE,
  checkpoint_id UUID REFERENCES checkpoints,
  passed BOOLEAN,
  notes TEXT,
  photo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inspection Photos
CREATE TABLE IF NOT EXISTS inspection_photos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  inspection_id UUID REFERENCES inspections ON DELETE CASCADE,
  result_id UUID REFERENCES inspection_results,
  url TEXT NOT NULL,
  caption TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT CHECK (type IN ('info', 'warning', 'alert')),
  read BOOLEAN DEFAULT FALSE,
  action_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ********************************
-- VIEWS
-- ********************************

-- View for upcoming inspections
CREATE OR REPLACE VIEW upcoming_inspections AS
SELECT 
  p.id AS ppe_id,
  p.serial_number,
  p.type,
  p.brand,
  p.model_number,
  p.next_inspection,
  p.status,
  p.assigned_to,
  prof.full_name AS assigned_to_name,
  CASE 
    WHEN p.next_inspection <= NOW() + INTERVAL '3 days' THEN 'urgent'
    WHEN p.next_inspection <= NOW() + INTERVAL '7 days' THEN 'soon'
    ELSE 'scheduled'
  END AS urgency,
  (SELECT MAX(i.date) FROM inspections i WHERE i.ppe_id = p.id) AS last_inspection_date,
  (SELECT i.overall_result FROM inspections i WHERE i.ppe_id = p.id ORDER BY i.date DESC LIMIT 1) AS last_result
FROM 
  ppe_items p
LEFT JOIN 
  profiles prof ON p.assigned_to = prof.id
WHERE 
  p.status = 'active' AND 
  p.next_inspection IS NOT NULL
ORDER BY 
  p.next_inspection ASC;

-- View for expiring equipment
CREATE OR REPLACE VIEW expiring_equipment AS
SELECT 
  p.id,
  p.type,
  p.serial_number,
  p.brand,
  p.model_number,
  p.expiry_date,
  p.status,
  p.assigned_to,
  prof.full_name AS assigned_to_name,
  CASE 
    WHEN p.expiry_date <= CURRENT_DATE + INTERVAL '30 days' THEN 'urgent'
    WHEN p.expiry_date <= CURRENT_DATE + INTERVAL '90 days' THEN 'warning'
    ELSE 'normal'
  END AS urgency,
  (CURRENT_DATE - p.expiry_date) AS days_until_expiry
FROM 
  ppe_items p
LEFT JOIN 
  profiles prof ON p.assigned_to = prof.id
WHERE 
  p.expiry_date IS NOT NULL AND
  p.status = 'active'
ORDER BY 
  p.expiry_date ASC;

-- View for inspection statistics
CREATE OR REPLACE VIEW inspection_statistics AS
SELECT
  DATE_TRUNC('month', i.date) AS month,
  i.type,
  i.overall_result,
  COUNT(*) AS count,
  AVG(EXTRACT(EPOCH FROM (i.updated_at - i.created_at))) AS avg_duration_seconds
FROM
  inspections i
GROUP BY
  DATE_TRUNC('month', i.date),
  i.type,
  i.overall_result
ORDER BY
  month DESC,
  i.type;

-- ********************************
-- INDEXES
-- ********************************

-- PPE Items
CREATE INDEX idx_ppe_items_organization ON ppe_items(organization_id);
CREATE INDEX idx_ppe_items_type ON ppe_items(type);
CREATE INDEX idx_ppe_items_status ON ppe_items(status);
CREATE INDEX idx_ppe_items_next_inspection ON ppe_items(next_inspection);
CREATE INDEX idx_ppe_items_assigned_to ON ppe_items(assigned_to);
CREATE INDEX idx_ppe_items_serial_number ON ppe_items(serial_number);
CREATE INDEX idx_ppe_items_qr_code ON ppe_items(qr_code);

-- Inspections
CREATE INDEX idx_inspections_ppe_id ON inspections(ppe_id);
CREATE INDEX idx_inspections_inspector_id ON inspections(inspector_id);
CREATE INDEX idx_inspections_date ON inspections(date);
CREATE INDEX idx_inspections_type ON inspections(type);
CREATE INDEX idx_inspections_result ON inspections(overall_result);

-- Inspection Results
CREATE INDEX idx_inspection_results_inspection_id ON inspection_results(inspection_id);
CREATE INDEX idx_inspection_results_checkpoint_id ON inspection_results(checkpoint_id);

-- ********************************
-- FUNCTIONS
-- ********************************

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to create a notification when an inspection is overdue
CREATE OR REPLACE FUNCTION create_overdue_inspection_notification()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.next_inspection < NOW() AND (OLD.next_inspection IS NULL OR OLD.next_inspection >= NOW()) THEN
    INSERT INTO notifications (
      user_id,
      title,
      message,
      type,
      action_url
    )
    SELECT 
      p.id,
      'Inspection Overdue',
      'Inspection for ' || NEW.type || ' (Serial: ' || NEW.serial_number || ') is now overdue',
      'warning',
      '/equipment/' || NEW.id
    FROM profiles p
    WHERE 
      p.role IN ('admin', 'inspector') AND
      (p.organization_id = NEW.organization_id OR NEW.assigned_to = p.id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ********************************
-- TRIGGERS
-- ********************************

-- Update timestamps
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON profiles
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ppe_items_updated_at
BEFORE UPDATE ON ppe_items
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_inspection_templates_updated_at
BEFORE UPDATE ON inspection_templates
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_inspections_updated_at
BEFORE UPDATE ON inspections
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Create notifications for overdue inspections
CREATE TRIGGER create_overdue_inspection_notification
AFTER UPDATE ON ppe_items
FOR EACH ROW
EXECUTE FUNCTION create_overdue_inspection_notification();

-- ********************************
-- ROW LEVEL SECURITY POLICIES
-- ********************************

-- Enable RLS on all tables
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE ppe_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE ppe_type_specifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE inspection_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE checkpoint_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE checkpoints ENABLE ROW LEVEL SECURITY;
ALTER TABLE inspections ENABLE ROW LEVEL SECURITY;
ALTER TABLE inspection_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE inspection_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Organizations policies
CREATE POLICY "Users can view their own organization" 
ON organizations FOR SELECT 
USING (
  id IN (
    SELECT organization_id FROM profiles WHERE id = auth.uid()
  )
);

CREATE POLICY "Only admins can insert organizations" 
ON organizations FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Only admins can update organizations" 
ON organizations FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND role = 'admin' AND organization_id = id
  )
);

-- Profiles policies
CREATE POLICY "Users can view profiles in their organization" 
ON profiles FOR SELECT 
USING (
  organization_id IN (
    SELECT organization_id FROM profiles WHERE id = auth.uid()
  ) OR id = auth.uid()
);

CREATE POLICY "Users can update their own profile" 
ON profiles FOR UPDATE 
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

CREATE POLICY "New users can insert their own profile" 
ON profiles FOR INSERT 
WITH CHECK (id = auth.uid());

-- PPE Items policies
CREATE POLICY "Users can view PPE items in their organization" 
ON ppe_items FOR SELECT 
USING (
  organization_id IN (
    SELECT organization_id FROM profiles WHERE id = auth.uid()
  )
);

CREATE POLICY "Inspectors and admins can insert PPE items" 
ON ppe_items FOR INSERT 
WITH CHECK (
  organization_id IN (
    SELECT organization_id FROM profiles 
    WHERE id = auth.uid() AND role IN ('inspector', 'admin')
  )
);

CREATE POLICY "Inspectors and admins can update PPE items" 
ON ppe_items FOR UPDATE 
USING (
  organization_id IN (
    SELECT organization_id FROM profiles 
    WHERE id = auth.uid() AND role IN ('inspector', 'admin')
  )
);

CREATE POLICY "Only admins can delete PPE items" 
ON ppe_items FOR DELETE 
USING (
  organization_id IN (
    SELECT organization_id FROM profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Inspection Templates policies
CREATE POLICY "Users can view inspection templates in their organization" 
ON inspection_templates FOR SELECT 
USING (
  organization_id IN (
    SELECT organization_id FROM profiles WHERE id = auth.uid()
  )
);

CREATE POLICY "Inspectors and admins can insert templates" 
ON inspection_templates FOR INSERT 
WITH CHECK (
  organization_id IN (
    SELECT organization_id FROM profiles 
    WHERE id = auth.uid() AND role IN ('inspector', 'admin')
  )
);

CREATE POLICY "Only admins can update templates" 
ON inspection_templates FOR UPDATE 
USING (
  organization_id IN (
    SELECT organization_id FROM profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Checkpoints policies
CREATE POLICY "Users can view checkpoints" 
ON checkpoints FOR SELECT 
USING (
  template_id IN (
    SELECT id FROM inspection_templates WHERE organization_id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
  )
);

CREATE POLICY "Inspectors and admins can insert checkpoints" 
ON checkpoints FOR INSERT 
WITH CHECK (
  template_id IN (
    SELECT id FROM inspection_templates 
    WHERE organization_id IN (
      SELECT organization_id FROM profiles 
      WHERE id = auth.uid() AND role IN ('inspector', 'admin')
    )
  )
);

-- Inspections policies
CREATE POLICY "Users can view inspections in their organization" 
ON inspections FOR SELECT 
USING (
  ppe_id IN (
    SELECT id FROM ppe_items WHERE organization_id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
  )
);

CREATE POLICY "Inspectors and admins can insert inspections" 
ON inspections FOR INSERT 
WITH CHECK (
  inspector_id = auth.uid() AND 
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND role IN ('inspector', 'admin')
  )
);

CREATE POLICY "Users can view inspection results in their organization" 
ON inspection_results FOR SELECT 
USING (
  inspection_id IN (
    SELECT id FROM inspections WHERE ppe_id IN (
      SELECT id FROM ppe_items WHERE organization_id IN (
        SELECT organization_id FROM profiles WHERE id = auth.uid()
      )
    )
  )
);

-- Notifications policies
CREATE POLICY "Users can only view their own notifications" 
ON notifications FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Users can update their own notifications" 
ON notifications FOR UPDATE 
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- ********************************
-- SAMPLE DATA (for testing)
-- ********************************

-- Create a test organization
INSERT INTO organizations (name, contact_email)
VALUES ('Demo Organization', 'admin@demo.com');

-- Create demo admin user (with specific UUID for consistency)
INSERT INTO profiles (id, full_name, email, organization_id, role)
VALUES 
  ('00000000-0000-0000-0000-000000000001', 'Demo Admin', 'admin@demo.com', 
   (SELECT id FROM organizations WHERE name = 'Demo Organization'), 
   'admin');

-- Create test PPE items
INSERT INTO ppe_items (
  organization_id, type, serial_number, brand, model_number, 
  purchase_date, manufacture_date, expiry_date, location, 
  status, qr_code
)
VALUES
  (
    (SELECT id FROM organizations WHERE name = 'Demo Organization'),
    'helmet', 'H123456', 'MSA', 'V-Gard 500', 
    '2023-01-15', '2022-12-01', '2026-12-01', 'Warehouse A', 
    'active', 'PPE-H123456'
  ),
  (
    (SELECT id FROM organizations WHERE name = 'Demo Organization'),
    'harness', 'HAR789012', 'FallTech', 'ComforTech', 
    '2023-03-10', '2023-02-15', '2025-02-15', 'Warehouse B', 
    'active', 'PPE-HAR789012'
  ),
  (
    (SELECT id FROM organizations WHERE name = 'Demo Organization'),
    'gloves', 'G345678', 'Ansell', 'HyFlex 11-840', 
    '2023-05-20', '2023-04-01', '2023-10-01', 'Warehouse A', 
    'active', 'PPE-G345678'
  );

-- Create a test inspection template
INSERT INTO inspection_templates (
  organization_id, name, description, ppe_type, version, is_active, created_by
)
VALUES (
  (SELECT id FROM organizations WHERE name = 'Demo Organization'),
  'Standard Helmet Inspection', 
  'Monthly inspection checklist for hard hats',
  'helmet',
  '1.0',
  TRUE,
  '00000000-0000-0000-0000-000000000001'
);

-- Create checkpoint groups and checkpoints
WITH template_id AS (
  SELECT id FROM inspection_templates 
  WHERE name = 'Standard Helmet Inspection' LIMIT 1
)
INSERT INTO checkpoint_groups (template_id, name, description, display_order)
VALUES
  ((SELECT id FROM template_id), 'Shell Integrity', 'Inspect the helmet shell for damage', 1),
  ((SELECT id FROM template_id), 'Suspension System', 'Inspect suspension components', 2),
  ((SELECT id FROM template_id), 'Additional Components', 'Inspect additional parts and accessories', 3);

-- Insert checkpoints
WITH groups AS (
  SELECT id, name, template_id FROM checkpoint_groups
)
INSERT INTO checkpoints (template_id, group_id, description, guidance, display_order, required, photo_required)
VALUES
  -- Shell Integrity group
  (
    (SELECT template_id FROM groups WHERE name = 'Shell Integrity' LIMIT 1),
    (SELECT id FROM groups WHERE name = 'Shell Integrity' LIMIT 1),
    'Shell is free from cracks, dents and gouges',
    'Look for any visible damage to the helmet shell',
    1, TRUE, TRUE
  ),
  (
    (SELECT template_id FROM groups WHERE name = 'Shell Integrity' LIMIT 1),
    (SELECT id FROM groups WHERE name = 'Shell Integrity' LIMIT 1),
    'Shell has no chemical damage or excessive fading',
    'Check for discoloration that could indicate chemical exposure or UV damage',
    2, TRUE, FALSE
  ),
  -- Suspension System group
  (
    (SELECT template_id FROM groups WHERE name = 'Suspension System' LIMIT 1),
    (SELECT id FROM groups WHERE name = 'Suspension System' LIMIT 1),
    'Headband is intact and adjusts properly',
    'Test adjustment mechanism to ensure it works smoothly',
    1, TRUE, FALSE
  ),
  (
    (SELECT template_id FROM groups WHERE name = 'Suspension System' LIMIT 1),
    (SELECT id FROM groups WHERE name = 'Suspension System' LIMIT 1),
    'Suspension straps are intact with no fraying',
    'Check all suspension straps for damage or wear',
    2, TRUE, TRUE
  ),
  -- Additional Components group
  (
    (SELECT template_id FROM groups WHERE name = 'Additional Components' LIMIT 1),
    (SELECT id FROM groups WHERE name = 'Additional Components' LIMIT 1),
    'Chin strap (if present) is secure and functional',
    'Test the chinstrap buckle and check condition of strap material',
    1, FALSE, FALSE
  ),
  (
    (SELECT template_id FROM groups WHERE name = 'Additional Components' LIMIT 1),
    (SELECT id FROM groups WHERE name = 'Additional Components' LIMIT 1),
    'Sweatband is clean and in good condition',
    'Check for excessive wear or contamination',
    2, FALSE, FALSE
  );
