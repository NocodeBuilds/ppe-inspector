
import { PPEStatus } from './index';

// Define the structure for a PPE item based on usage in components
export interface PPEItem {
  id: string;
  serial_number?: string; // From database
  serialNumber?: string;  // Mapped name
  type: string;
  brand?: string;
  model_number?: string; // From database
  modelNumber?: string;  // Mapped name
  manufacturing_date?: string; // From database
  manufacturingDate?: string;  // Mapped name
  expiry_date?: string; // From database
  expiryDate?: string;  // Mapped name
  status: PPEStatus; // Using consistent status type
  image_url?: string; // From database
  imageUrl?: string;  // Mapped name
  next_inspection?: string | null; // From database
  nextInspection?: string | null;  // Mapped name
  created_at: string; // From database
  createdAt?: string;  // Mapped name
  updated_at: string; // From database
  updatedAt?: string;  // Mapped name
  first_use?: string | null; // From database
  created_by?: string | null; // From database
  batch_number?: string | null; // From database
  assigned_to?: string | null; // From database
}
