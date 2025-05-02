
import type { Database } from './types';

// Define enum types for better type-safety
export type PPEStatus = 'active' | 'expired' | 'flagged' | 'due' | 'inspected' | 'out-of-service' | 'maintenance';
export type InspectionType = 'pre-use' | 'monthly' | 'quarterly';
export type AppRole = 'admin' | 'inspector' | 'user';
export type NotificationType = 'success' | 'error' | 'warning' | 'info';

// Re-export common types that are used across the app
export interface Profile {
  id: string;
  email?: string | null;
  full_name?: string | null;
  avatar_url?: string | null;
  role?: string | null;
  employee_id?: string | null;
  site_name?: string | null;
  department?: string | null;
  employee_role?: string | null;
  signature?: string | null;
  mobile?: string | null;
  created_at: string;
  updated_at: string;
}

export interface PPEItem {
  id: string;
  serial_number: string;
  type: string;
  brand: string;
  model_number: string;
  manufacturing_date: string;
  expiry_date: string;
  status: PPEStatus;
  image_url?: string;
  next_inspection?: string | null;
  last_inspection?: string | null;
  inspection_frequency?: string;
  batch_number?: string;
  created_at: string;
  updated_at: string;
}

export interface Inspection {
  id: string;
  ppe_id: string;
  inspector_id: string;
  date: string;
  type: InspectionType;
  result: string;
  overall_result: string;
  signature_url?: string | null;
  notes?: string | null;
  images?: string[] | null;
  created_at: string;
  updated_at: string;
}

export interface InspectionResult {
  id: string;
  inspection_id: string;
  checkpoint_id: string;
  passed: boolean | null;
  notes?: string | null;
  photo_url?: string | null;
  created_at: string;
  updated_at: string;
}

export interface InspectionCheckpoint {
  id: string;
  description: string;
  ppe_type: string;
  required: boolean;
  category?: string;
  reference_photo_url?: string;
  guidance_notes?: string;
  order_num?: number;
  created_at: string;
  updated_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  created_at: string;
}
