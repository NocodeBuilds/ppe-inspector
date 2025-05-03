
// src/types/ppe.ts

// Define the structure for a PPE item based on usage in components
export interface PPEItem {
  id: string;
  serial_number: string;
  type: string;
  brand?: string;
  model_number?: string;
  manufacturing_date?: string;
  expiry_date?: string;
  status: PPEStatus;
  image_url?: string;
  next_inspection?: string | null;
  last_inspection?: string | null;
  inspection_frequency?: string;
  batch_number?: string;
  created_at: string;
  updated_at: string;
  
  // Properties with different casing
  serialNumber: string;
  modelNumber: string;
  manufacturingDate: string;
  expiryDate: string;
  nextInspection: string;
  lastInspection: string;
  createdAt: string;
  updatedAt: string;
}

// For new instances where we want to create PPE items
export interface PPECreateInput {
  type: string;
  serial_number: string;
  brand: string;
  model_number: string;
  manufacturing_date: string;
  expiry_date: string;
  batch_number?: string;
  first_use?: string;
  imageFile?: File;
}

// Defining PPE status as an enum type for better type safety
export type PPEStatus = 'active' | 'expired' | 'flagged' | 'due' | 'inspected' | 'out-of-service' | 'maintenance';

// Profile type definition
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
  created_at?: string;
  updated_at?: string;
  
  // Properties with different casing
  createdAt: string;
  updatedAt: string;
  fullName: string;
  avatarUrl: string;
  employeeId: string;
  siteName: string;
  employeeRole: string;
}

// Notification type
export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  read: boolean;
  created_at: string;
  
  // Camel case alias
  createdAt: string;
}

// Defining variant types for notifications and toast
export type NotificationVariant = 'default' | 'destructive' | 'success' | 'warning' | 'error';
export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface InspectionCheckpoint {
  id: string;
  description: string;
  passed: boolean | null;
  notes: string | null;
  photo_url?: string | null;
}

// Interface for complete inspection details
export interface InspectionDetails {
  id: string;
  date: string;
  type: string;
  overall_result: string;
  notes: string | null;
  signature_url: string | null;
  inspector_id: string;
  inspector_name: string;
  ppe_type: string;
  ppe_serial: string;
  ppe_brand: string;
  ppe_model: string;
  site_name: string;
  manufacturing_date: string | null;
  expiry_date: string | null;
  batch_number: string;
  checkpoints: InspectionCheckpoint[];
  photoUrl?: string | null;
}
