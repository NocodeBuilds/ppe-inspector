// Export types from the generated types file
export type { Database } from './types';

// Equipment type (maps to the equipment table)
export type Equipment = {
  id: string;
  organization_id: string;
  manufacturing_date: string;
  purchase_date?: string;
  status?: 'active' | 'inactive' | 'under_repair' | 'retired';
  last_inspection_date?: string;
  next_inspection_date?: string;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  notes?: string;
  name: string;
  type: string;
  model?: string;
  serial_number: string;
  manufacturer: string;
  location?: string;
  assigned_to?: string;
};

// PPE Item type (alias for Equipment for backward compatibility)
export type PPEItem = Equipment;

// Inspection type
export type Inspection = {
  id: string;
  organization_id: string;
  equipment_id: string;
  template_id: string;
  inspector_id: string;
  status?: 'draft' | 'in_progress' | 'completed' | 'cancelled';
  start_time?: string;
  completion_time?: string;
  flagged?: boolean;
  created_at?: string;
  updated_at?: string;
  inspector_name: string;
  flagged_reason?: string;
  result?: string;
  notes?: string;
};

// Inspection type enum
export type InspectionType = 'pre-use' | 'monthly' | 'quarterly';

// Profile type
export type Profile = {
  id: string;
  role?: 'inspector' | 'admin' | 'manager';
  organization_id?: string;
  created_at?: string;
  updated_at?: string;
  first_name?: string;
  last_name?: string;
  email: string;
  job_title?: string;
  department?: string;
  phone?: string;
  avatar_url?: string;
  bio?: string;
};