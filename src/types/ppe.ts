
import { PPEStatus as SupabasePPEStatus } from '@/integrations/supabase/client';

/**
 * Type for PPE status
 */
export type PPEStatus = SupabasePPEStatus;

/**
 * Type for PPE Item data structure - aligned with database schema
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

/**
 * Frontend-friendly version with camelCase properties
 */
export interface PPEItemFormatted {
  id: string;
  serialNumber: string;
  type: string;
  brand: string;
  modelNumber: string;
  manufacturingDate: string;
  expiryDate: string;
  status: PPEStatus;
  nextInspection?: string;
  lastInspection?: string;
  inspectionFrequency?: string;
  imageUrl?: string;
  batchNumber?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Format PPE item from snake_case (database) to camelCase (frontend)
 */
export function formatPPEItem(item: PPEItem): PPEItemFormatted {
  return {
    id: item.id,
    serialNumber: item.serial_number,
    type: item.type,
    brand: item.brand,
    modelNumber: item.model_number,
    manufacturingDate: item.manufacturing_date,
    expiryDate: item.expiry_date,
    status: item.status,
    nextInspection: item.next_inspection,
    lastInspection: item.last_inspection,
    inspectionFrequency: item.inspection_frequency,
    imageUrl: item.image_url,
    batchNumber: item.batch_number,
    createdAt: item.created_at,
    updatedAt: item.updated_at
  };
}
