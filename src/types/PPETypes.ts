
import { PPEStatus, InspectionType, PPEType } from '@/integrations/supabase/client';

// Frontend PPE model that matches the UI components
export interface ClientPPEItem {
  id: string;
  serialNumber: string;
  type: PPEType;
  brand: string;
  modelNumber: string;
  manufacturingDate: string;
  expiryDate: string;
  status: PPEStatus;
  imageUrl?: string | null;
  nextInspection?: string | null;
  createdAt: string;
  updatedAt: string;
  batchNumber?: string | null;
  firstUseDate?: string | null;
  latestInspection?: any;
}

// Updated inspection checkpoint to match database schema
export interface ClientInspectionCheckpoint {
  id: string;
  description: string;
  ppeType: string;
  required: boolean;
  category?: string | null;
  referencePhotoUrl?: string | null;
  guidanceNotes?: string | null;
  order: number;
}

export interface ClientInspectionResult {
  id?: string;
  inspectionId?: string;
  checkpointId: string;
  checkpointDescription: string;
  passed: boolean | null;
  notes?: string;
  photoUrl?: string;
}

export interface ClientInspection {
  id?: string;
  ppeId: string;
  inspectionDate: string;
  inspectorName: string;
  passFail: boolean;
  notes?: string;
  nextInspectionDate?: string;
  signatureData?: string;
  results: ClientInspectionResult[];
  type?: InspectionType;
}
