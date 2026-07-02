
import { PPEStatus } from './index';

// Define the structure for a PPE item based on the new database schema
export interface PPEItem {
  id: string;
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
  created_at: string;
  updated_at: string;
}
