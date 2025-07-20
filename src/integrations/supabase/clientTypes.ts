
// Updated types to match new schema structure

export type Profile = {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  role: AppRole;
  employee_id: string | null;
  site_name: string | null;
  department: string | null;
  Employee_Role: string | null;
  created_at: string;
  updated_at: string;
};

export type PPEItem = {
  id: string;
  serial_number: string;
  type: string;
  brand: string | null;
  model_number: string | null;
  manufacturing_date: string | null;
  expiry_date: string | null;
  batch_number: string | null;
  status: PPEStatus;
  image_url: string | null;
  first_use: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  next_inspection: string | null;
  assigned_to: string | null;
};

export type Inspection = {
  id: string;
  ppe_id: string;
  inspector_id: string;
  date: string;
  type: InspectionType;
  overall_result: string;
  notes: string | null;
  signature_url: string | null;
  created_at: string;
  updated_at: string;
};

export type InspectionResult = {
  id: string;
  inspection_id: string;
  checkpoint_id: string | null;
  description: string | null;
  passed: boolean | null;
  notes: string | null;
  photo_url: string | null;
  created_at: string;
  updated_at: string;
};

export type InspectionCheckpoint = {
  id: string;
  template_id: string | null;
  ppe_type: string;
  description: string;
  order: number | null;
  required: boolean;
  created_at: string;
  updated_at: string;
};

export type Notification = {
  id: string;
  user_id: string;
  type: string | null;
  message: string | null;
  is_read: boolean;
  created_at: string;
};

// Enum Types
export type PPEStatus = 'active' | 'inactive' | 'under_repair' | 'retired' | 'flagged' | 'maintenance' | 'expired';
export type InspectionType = 'routine' | 'detailed' | 'emergency' | 'pre-use' | 'monthly' | 'quarterly';
export type AppRole = 'admin' | 'inspector' | 'user';

export type PPEType =
  | 'Full Body Harness'
  | 'Fall Arrester'
  | 'Double Lanyard'
  | 'Safety Helmet'
  | 'Safety Boots'
  | 'Safety Gloves'
  | 'Safety Goggles'
  | 'Ear Protection'
  | 'Respirator'
  | 'Safety Vest'
  | 'Face Shield'
  | string;
