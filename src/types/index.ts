
export type PPEType = 
  | 'Full Body Harness'
  | 'Fall Arrester'
  | 'Double Lanyard'
  | 'Safety Helmet'
  | 'Safety Boots'
  | 'Safety Gloves'
  | 'Safety Goggles'
  | 'Ear Protection';

export type PPEStatus = 'active' | 'expired' | 'maintenance' | 'flagged';

export type InspectionType = 'pre-use' | 'monthly' | 'quarterly';

export interface PPEItem {
  id: string;
  serialNumber: string;
  type: PPEType;
  brand: string;
  modelNumber: string;
  manufacturingDate: string;
  expiryDate: string;
  status: PPEStatus;
  imageUrl?: string;
  lastInspection?: string;
  nextInspection?: string;
}

export interface InspectionCheckpoint {
  id: string;
  description: string;
  ppeType: PPEType;
}

export interface InspectionResult {
  id: string;
  ppeId: string;
  date: string;
  type: InspectionType;
  inspectorId: string;
  checkpoints: {
    checkpointId: string;
    passed: boolean;
    notes?: string;
  }[];
  signature?: string;
  photos?: string[];
  overall: 'pass' | 'fail';
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'inspector' | 'user';
  avatar?: string;
}

export interface DashboardCardProps {
  to: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  iconBgColor: string;
  className?: string;
  onClick?: () => void;
}

export interface ExtendedProfile {
  id?: string;
  user_id?: string;
  employee_id: string;
  location: string;
  department: string;
  bio: string;
  created_at?: string;
  updated_at?: string;
}

export interface CheckpointStatus {
  checkpointId: string;
  status: 'ok' | 'not-ok' | 'na';
  notes: string;
  photoUrl?: string;
}
