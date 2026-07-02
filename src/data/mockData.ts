
import { PPEItem, Inspection, InspectionCheckpoint, User, PPEType } from '@/types';

export const mockPPEItems: PPEItem[] = [
  {
    id: '1',
    serial_number: 'HLM-001',
    type: 'helmet',
    brand: 'SafetyFirst',
    model_number: 'SF-100',
    manufacturing_date: '2023-01-15',
    expiry_date: '2028-01-15',
    status: 'active',
    created_at: '2023-01-15T00:00:00Z',
    updated_at: '2023-01-15T00:00:00Z',
    next_inspection: '2024-04-15',
  },
  {
    id: '2',
    serial_number: 'HRN-002',
    type: 'harness',
    brand: 'SecureLife',
    model_number: 'SL-200',
    manufacturing_date: '2023-02-10',
    expiry_date: '2028-02-10',
    status: 'active',
    created_at: '2023-02-10T00:00:00Z',
    updated_at: '2023-02-10T00:00:00Z',
    next_inspection: '2024-05-10',
  },
  {
    id: '3',
    serial_number: 'RSP-003',
    type: 'respirator',
    brand: 'BreathEasy',
    model_number: 'BE-300',
    manufacturing_date: '2023-03-05',
    expiry_date: '2025-03-05',
    status: 'flagged',
    created_at: '2023-03-05T00:00:00Z',
    updated_at: '2023-03-05T00:00:00Z',
    next_inspection: '2024-06-05',
  },
  {
    id: '4',
    serial_number: 'GLV-004',
    type: 'gloves',
    brand: 'GripSafe',
    model_number: 'GS-400',
    manufacturing_date: '2023-04-20',
    expiry_date: '2024-04-20',
    status: 'expired',
    created_at: '2023-04-20T00:00:00Z',
    updated_at: '2023-04-20T00:00:00Z',
    next_inspection: '2024-07-20',
  },
  {
    id: '5',
    serial_number: 'BOT-005',
    type: 'boots',
    brand: 'StepSafe',
    model_number: 'SS-500',
    manufacturing_date: '2023-05-12',
    expiry_date: '2027-05-12',
    status: 'active',
    created_at: '2023-05-12T00:00:00Z',
    updated_at: '2023-05-12T00:00:00Z',
    next_inspection: '2024-08-12',
  },
  {
    id: '6',
    serial_number: 'EYE-006',
    type: 'eyewear',
    brand: 'ClearVision',
    model_number: 'CV-600',
    manufacturing_date: '2023-06-08',
    expiry_date: '2026-06-08',
    status: 'maintenance',
    created_at: '2023-06-08T00:00:00Z',
    updated_at: '2023-06-08T00:00:00Z',
    next_inspection: '2024-09-08',
  },
];

export const mockCheckpoints: InspectionCheckpoint[] = [
  // Helmet checkpoints
  { id: '1', ppe_type: 'helmet', description: 'Check for cracks in shell', required: true, created_at: '2023-01-01T00:00:00Z' },
  { id: '2', ppe_type: 'helmet', description: 'Inspect suspension system', required: true, created_at: '2023-01-01T00:00:00Z' },
  { id: '3', ppe_type: 'helmet', description: 'Verify chin strap integrity', required: false, created_at: '2023-01-01T00:00:00Z' },
  { id: '4', ppe_type: 'helmet', description: 'Check for proper fit', required: true, created_at: '2023-01-01T00:00:00Z' },

  // Harness checkpoints
  { id: '5', ppe_type: 'harness', description: 'Inspect webbing for cuts or fraying', required: true, created_at: '2023-01-01T00:00:00Z' },
  { id: '6', ppe_type: 'harness', description: 'Check hardware for corrosion', required: true, created_at: '2023-01-01T00:00:00Z' },
  { id: '7', ppe_type: 'harness', description: 'Verify stitching integrity', required: true, created_at: '2023-01-01T00:00:00Z' },
  { id: '8', ppe_type: 'harness', description: 'Test buckle functionality', required: true, created_at: '2023-01-01T00:00:00Z' },

  // Respirator checkpoints
  { id: '9', ppe_type: 'respirator', description: 'Check mask seal integrity', required: true, created_at: '2023-01-01T00:00:00Z' },
  { id: '10', ppe_type: 'respirator', description: 'Inspect filter condition', required: true, created_at: '2023-01-01T00:00:00Z' },
  { id: '11', ppe_type: 'respirator', description: 'Verify valve operation', required: true, created_at: '2023-01-01T00:00:00Z' },
  { id: '12', ppe_type: 'respirator', description: 'Check strap elasticity', required: false, created_at: '2023-01-01T00:00:00Z' },

  // Gloves checkpoints
  { id: '13', ppe_type: 'gloves', description: 'Inspect for punctures or tears', required: true, created_at: '2023-01-01T00:00:00Z' },
  { id: '14', ppe_type: 'gloves', description: 'Check for chemical degradation', required: true, created_at: '2023-01-01T00:00:00Z' },
  { id: '15', ppe_type: 'gloves', description: 'Verify proper sizing', required: false, created_at: '2023-01-01T00:00:00Z' },
  { id: '16', ppe_type: 'gloves', description: 'Test grip capability', required: false, created_at: '2023-01-01T00:00:00Z' },

  // Boots checkpoints
  { id: '17', ppe_type: 'boots', description: 'Inspect sole for wear patterns', required: true, created_at: '2023-01-01T00:00:00Z' },
  { id: '18', ppe_type: 'boots', description: 'Check upper material integrity', required: true, created_at: '2023-01-01T00:00:00Z' },
  { id: '19', ppe_type: 'boots', description: 'Verify lacing system', required: false, created_at: '2023-01-01T00:00:00Z' },
  { id: '20', ppe_type: 'boots', description: 'Test steel toe protection', required: true, created_at: '2023-01-01T00:00:00Z' },

  // Eyewear checkpoints
  { id: '21', ppe_type: 'eyewear', description: 'Check lens for scratches', required: true, created_at: '2023-01-01T00:00:00Z' },
  { id: '22', ppe_type: 'eyewear', description: 'Inspect frame integrity', required: true, created_at: '2023-01-01T00:00:00Z' },
  { id: '23', ppe_type: 'eyewear', description: 'Verify side shield attachment', required: false, created_at: '2023-01-01T00:00:00Z' },
  { id: '24', ppe_type: 'eyewear', description: 'Check anti-fog coating', required: false, created_at: '2023-01-01T00:00:00Z' },

  // Vest checkpoints
  { id: '25', ppe_type: 'vest', description: 'Inspect reflective tape condition', required: true, created_at: '2023-01-01T00:00:00Z' },
  { id: '26', ppe_type: 'vest', description: 'Check fabric for tears', required: true, created_at: '2023-01-01T00:00:00Z' },
  { id: '27', ppe_type: 'vest', description: 'Verify closure mechanism', required: true, created_at: '2023-01-01T00:00:00Z' },
  { id: '28', ppe_type: 'vest', description: 'Test visibility in low light', required: false, created_at: '2023-01-01T00:00:00Z' },
];

export const mockInspections: Inspection[] = [
  {
    id: '1',
    ppe_id: '1',
    inspector_id: 'user-1',
    date: '2024-01-15T10:00:00Z',
    type: 'monthly',
    overall_result: 'pass',
    notes: 'All components in good condition',
    created_at: '2024-01-15T10:00:00Z',
  },
  {
    id: '2',
    ppe_id: '3',
    inspector_id: 'user-1',
    date: '2024-01-20T14:30:00Z',
    type: 'quarterly',
    overall_result: 'fail',
    notes: 'Filter replacement required',
    created_at: '2024-01-20T14:30:00Z',
  },
];

export const mockUsers: User[] = [
  {
    id: 'user-1',
    email: 'inspector@company.com',
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-01T00:00:00Z',
  },
];

// Helper functions
export const getUpcomingInspections = (items: PPEItem[]) => {
  const now = new Date();
  const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  
  return items.filter(item => {
    if (!item.next_inspection) return false;
    const nextInspection = new Date(item.next_inspection);
    return nextInspection >= now && nextInspection <= thirtyDaysFromNow;
  });
};

export const getExpiringPPE = (items: PPEItem[]) => {
  const now = new Date();
  const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  
  return items.filter(item => {
    const expiryDate = new Date(item.expiry_date);
    return expiryDate >= now && expiryDate <= thirtyDaysFromNow;
  });
};

export const getFlaggedPPE = (items: PPEItem[]) => {
  return items.filter(item => item.status === 'flagged');
};
