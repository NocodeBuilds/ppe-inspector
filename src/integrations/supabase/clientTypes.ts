
// Types defined locally since we don't have generated types yet

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

// Basic types for now - will be replaced with generated types
export type PPEItem = any;
export type Inspection = any;
export type InspectionResult = any;
export type InspectionCheckpoint = any;
export type Notification = any;

// Enum Types - defined locally for now
export type PPEStatus = 'active' | 'inactive' | 'under_repair' | 'retired' | 'flagged' | 'maintenance' | 'expired';
export type InspectionType = 'routine' | 'detailed' | 'emergency' | 'pre-use' | 'monthly' | 'quarterly';
export type AppRole = 'admin' | 'inspector' | 'user';

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
