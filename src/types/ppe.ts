
import { PPEStatus } from '@/integrations/supabase/client';

/**
 * Type for PPE Item data structure
 */
export interface PPEItem {
  id: string;
  serial_number: string;
  type: string;
  brand: string;
  model_number: string;
  manufacturing_date: string;
  expiry_date: string;
  status: PPEStatus;
  next_inspection?: string;
  last_inspection?: string;
  inspection_frequency?: string;
  image_url?: string;
  batch_number?: string;
  created_at: string;
  updated_at: string;
}
