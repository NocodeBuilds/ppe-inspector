
import type { Database } from './types';
import { Tables, Enums } from './types';

// Re-export common types that are used across the app
export type Profile = {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  role: AppRole | null;
  created_at: string;
  updated_at: string;
  // Profile fields directly in profiles table
  employee_id: string | null;
  site_name: string | null;
  department: string | null;
  Employee_Role: string | null;
  email: string | null;
};

export type PPEItem = Tables<'ppe_items'>;
export type Inspection = Tables<'inspections'>;
export type InspectionResult = Tables<'inspection_results'>;
export type InspectionCheckpoint = Tables<'inspection_checkpoints'>;
export type Notification = Tables<'notifications'>;

// Enum Types
export type PPEStatus = Enums<'ppe_status'>;
export type InspectionType = Enums<'inspection_type'>;
export type AppRole = Enums<'app_role'>;

// String-based types (for compatibility with existing code)
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
