
// Updated types to match new schema structure

export type Profile = {
  id: string;
  updated_at?: string | null;
  username?: string | null;
  full_name?: string | null;
  avatar_url?: string | null;
  website?: string | null;
};

export type PPEItem = {
  id: string;
  created_at: string;
  updated_at: string;
  serial_number: string;
  batch_number?: number | null;
  type: string;
  brand: string;
  model_number?: string | null;
  manufacturing_date: string;
  expiry_date: string;
  first_use?: string | null;
  image_url?: string | null;
  status: PPEStatus;
  created_by?: string | null;
  assigned_to?: string | null;
  last_inspection?: string | null;
  next_inspection?: string | null;
};

export type Inspection = {
  id: string;
  created_at: string;
  ppe_id: string;
  inspector_id: string;
  date: string;
  type: InspectionType;
  overall_result: string;
  notes?: string | null;
  signature_url?: string | null;
};

export type InspectionResult = {
  id: string;
  created_at: string;
  inspection_id: string;
  checkpoint_id: string;
  passed?: boolean | null;
  notes?: string | null;
  photo_url?: string | null;
};

export type InspectionCheckpoint = {
  id: string;
  created_at: string;
  ppe_type: string;
  description: string;
  required: boolean;
};

export type Notification = {
  id: string;
  user_id: string;
  type: string | null;
  message: string | null;
  is_read: boolean;
  created_at: string;
};

// Enum Types - matching the database enums
export type PPEStatus = 'active' | 'flagged' | 'expired' | 'retired';
export type InspectionType = 'pre-use' | 'monthly' | 'quarterly' | 'annual';
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
