
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
  status: string;
  image_url?: string;
  next_inspection?: string | null;
  last_inspection?: string | null;
  inspection_frequency?: string;
  batch_number?: string;
  created_at: string;
  updated_at: string;
  
  // Camel case aliases for compatibility with existing code
  get serialNumber(): string { return this.serial_number; }
  get modelNumber(): string { return this.model_number || ''; }
  get manufacturingDate(): string { return this.manufacturing_date || ''; }
  get expiryDate(): string { return this.expiry_date || ''; }
  get nextInspection(): string { return this.next_inspection || ''; }
  get createdAt(): string { return this.created_at; }
  get updatedAt(): string { return this.updated_at; }
}

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
  
  // Camel case aliases for compatibility with existing code
  get createdAt(): string { return this.created_at || ''; }
  get updatedAt(): string { return this.updated_at || ''; }
  get fullName(): string { return this.full_name || ''; }
  get avatarUrl(): string { return this.avatar_url || ''; }
  get employeeId(): string { return this.employee_id || ''; }
  get siteName(): string { return this.site_name || ''; }
  get employeeRole(): string { return this.employee_role || ''; }
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
  
  // Camel case aliases
  get createdAt(): string { return this.created_at; }
}
