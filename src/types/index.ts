
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

// Re-export types from ppe.ts
export type { PPEItem, PPEItemFormatted, PPEStatus } from './ppe';
export { formatPPEItem } from './ppe';

export interface InspectionCheckpoint {
  id: string;
  description: string;
  ppeType: PPEType;
  required: boolean;
}

export interface InspectionResult {
  id?: string;
  inspectionId?: string;
  checkpointId: string;
  checkpointDescription: string;
  passed: boolean | null;
  notes?: string;
  photoUrl?: string;
}

export interface Inspection {
  id?: string;
  ppeId: string;
  inspectionDate: string;
  inspectorName: string;
  passFail: boolean;
  notes?: string;
  nextInspectionDate?: string;
  signatureData?: string;
  results: InspectionResult[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'inspector' | 'user';
}

export interface ExtendedProfile {
  id: string;
  userId: string;
  employeeId?: string | null;
  siteName?: string | null;
  department?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface InspectionData {
  id: string;
  date: string;
  type: string;
  inspector_name: string;
  result: string;
  ppe_type: string;
  serial_number: string;
}

export type UserProfile = {
  id: string;
  email?: string | null;
  full_name?: string | null;
  avatar_url?: string | null;
  role?: 'admin' | 'inspector' | 'user' | null;
  employee_id?: string | null;
  site_name?: string | null;
  department?: string | null;
  employee_role?: string | null;
  createdAt?: string;
  updatedAt?: string;
};
