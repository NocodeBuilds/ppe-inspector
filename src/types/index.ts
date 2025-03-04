
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

export type PPEStatus =
  | 'active'
  | 'expired'
  | 'flagged'
  | 'due'
  | 'inspected'
  | 'out-of-service';

export interface PPEItem {
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
  latestInspection?: any;
}

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
  passed: boolean;
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
  location?: string | null;
  department?: string | null;
  bio?: string | null;
  createdAt?: string;
  updatedAt?: string;
}
