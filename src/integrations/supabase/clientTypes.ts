
import type { Database } from './types';
import { Tables, Enums } from './types';

// Re-export common types that are used across the app
export type Profile = Tables<'profiles'>;
export type PPEItem = Tables<'ppe_items'>;
export type Inspection = Tables<'inspections'>;
export type InspectionResult = Tables<'inspection_results'>;
export type InspectionCheckpoint = Tables<'inspection_checkpoints'>;
export type ExtendedProfile = Tables<'extended_profiles'>;
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
