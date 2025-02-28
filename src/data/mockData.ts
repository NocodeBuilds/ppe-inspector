
import { PPEItem, InspectionCheckpoint, InspectionResult, User, PPEType } from '@/types';

// Mock PPE Items
export const ppeItems: PPEItem[] = [
  {
    id: '1',
    serialNumber: 'FBH-001',
    type: 'Full Body Harness',
    brand: 'SafetyFirst',
    modelNumber: 'H-2000',
    manufacturingDate: '2023-01-15',
    expiryDate: '2025-01-15',
    status: 'active',
    lastInspection: '2023-10-15',
    nextInspection: '2024-01-15',
  },
  {
    id: '2',
    serialNumber: '0123',
    type: 'Safety Helmet',
    brand: 'HeadGuard',
    modelNumber: 'HG-500',
    manufacturingDate: '2022-06-10',
    expiryDate: '2024-12-30',
    status: 'expired',
    lastInspection: '2023-09-20',
    nextInspection: '2023-12-20',
  },
  {
    id: '3',
    serialNumber: '123',
    type: 'Full Body Harness',
    brand: 'SafetyFirst',
    modelNumber: 'H-3000',
    manufacturingDate: '2022-03-10',
    expiryDate: '2024-12-30',
    status: 'expired',
    lastInspection: '2023-09-10',
    nextInspection: '2023-12-10',
  },
  {
    id: '4',
    serialNumber: '54321',
    type: 'Full Body Harness',
    brand: 'HarnessPlus',
    modelNumber: 'HP-100',
    manufacturingDate: '2023-02-20',
    expiryDate: '2024-12-30',
    status: 'expired',
    lastInspection: '2023-10-20',
    nextInspection: '2023-12-20',
  },
  {
    id: '5',
    serialNumber: '4321',
    type: 'Full Body Harness',
    brand: 'HighSafety',
    modelNumber: 'HS-200',
    manufacturingDate: '2023-05-15',
    expiryDate: '2026-05-15',
    status: 'active',
    lastInspection: '2023-11-15',
    nextInspection: '2025-02-08',
  },
  {
    id: '6',
    serialNumber: '3214',
    type: 'Ear Protection',
    brand: 'SoundGuard',
    modelNumber: 'SG-300',
    manufacturingDate: '2023-06-10',
    expiryDate: '2026-06-10',
    status: 'active',
    lastInspection: '2023-11-10',
    nextInspection: '2025-02-09',
  },
];

// Mock Inspection Checkpoints
export const inspectionCheckpoints: Record<PPEType, InspectionCheckpoint[]> = {
  'Full Body Harness': [
    { id: 'fbh-1', description: 'Check for cuts, frays, or wear on straps', ppeType: 'Full Body Harness' },
    { id: 'fbh-2', description: 'Inspect buckles and D-rings for cracks, deformation, or rust', ppeType: 'Full Body Harness' },
    { id: 'fbh-3', description: 'Verify the label, certification, and expiration date', ppeType: 'Full Body Harness' },
    { id: 'fbh-4', description: 'Test for proper adjustment and secure fit', ppeType: 'Full Body Harness' },
  ],
  'Fall Arrester': [
    { id: 'fa-1', description: 'Inspect the rope or line for wear, fraying, or knots', ppeType: 'Fall Arrester' },
    { id: 'fa-2', description: 'Test the locking mechanism for proper engagement and release', ppeType: 'Fall Arrester' },
    { id: 'fa-3', description: 'Check for cracks, dents, or rust on the device', ppeType: 'Fall Arrester' },
    { id: 'fa-4', description: 'Confirm certification and expiry details', ppeType: 'Fall Arrester' },
  ],
  'Double Lanyard': [
    { id: 'dl-1', description: 'Check webbing for cuts, burns, or chemical damage', ppeType: 'Double Lanyard' },
    { id: 'dl-2', description: 'Verify carabiners and hooks for cracks, rust, or deformation', ppeType: 'Double Lanyard' },
    { id: 'dl-3', description: 'Inspect shock absorber for any signs of deployment', ppeType: 'Double Lanyard' },
    { id: 'dl-4', description: 'Ensure labels and expiry information are intact', ppeType: 'Double Lanyard' },
  ],
  'Safety Helmet': [
    { id: 'sh-1', description: 'Inspect the shell for cracks, dents, or UV damage', ppeType: 'Safety Helmet' },
    { id: 'sh-2', description: 'Check suspension straps for tears, frays, or loss of elasticity', ppeType: 'Safety Helmet' },
    { id: 'sh-3', description: 'Verify the chin strap and buckle functionality', ppeType: 'Safety Helmet' },
    { id: 'sh-4', description: 'Confirm the helmet\'s certification and expiry date', ppeType: 'Safety Helmet' },
  ],
  'Safety Boots': [
    { id: 'sb-1', description: 'Inspect the sole for wear, cracks, or loss of tread', ppeType: 'Safety Boots' },
    { id: 'sb-2', description: 'Check the upper material for tears, cuts, or separation from the sole', ppeType: 'Safety Boots' },
    { id: 'sb-3', description: 'Test the toe cap for dents or deformation', ppeType: 'Safety Boots' },
    { id: 'sb-4', description: 'Ensure the insole is intact and the boot fits properly', ppeType: 'Safety Boots' },
  ],
  'Safety Gloves': [
    { id: 'sg-1', description: 'Inspect gloves for cuts, holes, or abrasion', ppeType: 'Safety Gloves' },
    { id: 'sg-2', description: 'Test gripping surface for wear or peeling', ppeType: 'Safety Gloves' },
    { id: 'sg-3', description: 'Check for proper fit and wrist elasticity', ppeType: 'Safety Gloves' },
    { id: 'sg-4', description: 'Verify chemical or electrical resistance as applicable', ppeType: 'Safety Gloves' },
  ],
  'Safety Goggles': [
    { id: 'sgo-1', description: 'Check the lens for scratches, cracks, or fogging', ppeType: 'Safety Goggles' },
    { id: 'sgo-2', description: 'Inspect the frame for damage or deformation', ppeType: 'Safety Goggles' },
    { id: 'sgo-3', description: 'Ensure the strap is adjustable and in good condition', ppeType: 'Safety Goggles' },
    { id: 'sgo-4', description: 'Confirm compliance with impact or chemical resistance standards', ppeType: 'Safety Goggles' },
  ],
  'Ear Protection': [
    { id: 'ep-1', description: 'Inspect earmuffs for cracks or damaged foam seals', ppeType: 'Ear Protection' },
    { id: 'ep-2', description: 'Check earplugs for cleanliness and elasticity (if reusable)', ppeType: 'Ear Protection' },
    { id: 'ep-3', description: 'Test for proper fit and secure placement', ppeType: 'Ear Protection' },
    { id: 'ep-4', description: 'Confirm compliance with required noise reduction ratings', ppeType: 'Ear Protection' },
  ],
};

// Mock Inspection Results
export const inspectionResults: InspectionResult[] = [
  {
    id: '1',
    ppeId: '1',
    date: '2023-10-15',
    type: 'monthly',
    inspectorId: '1',
    checkpoints: [
      { checkpointId: 'fbh-1', passed: true },
      { checkpointId: 'fbh-2', passed: true },
      { checkpointId: 'fbh-3', passed: true },
      { checkpointId: 'fbh-4', passed: true },
    ],
    overall: 'pass',
  },
  {
    id: '2',
    ppeId: '2',
    date: '2023-09-20',
    type: 'quarterly',
    inspectorId: '1',
    checkpoints: [
      { checkpointId: 'sh-1', passed: true },
      { checkpointId: 'sh-2', passed: false, notes: 'Suspension straps showing signs of wear' },
      { checkpointId: 'sh-3', passed: true },
      { checkpointId: 'sh-4', passed: true },
    ],
    overall: 'fail',
  },
];

// Mock Users
export const users: User[] = [
  {
    id: '1',
    name: 'John Smith',
    email: 'john@example.com',
    role: 'admin',
  },
  {
    id: '2',
    name: 'Jane Doe',
    email: 'jane@example.com',
    role: 'inspector',
  },
  {
    id: '3',
    name: 'Bob Johnson',
    email: 'bob@example.com',
    role: 'user',
  },
];

// Helper function to get upcoming inspections
export const getUpcomingInspections = () => {
  return ppeItems
    .filter(item => item.nextInspection && new Date(item.nextInspection) > new Date())
    .sort((a, b) => {
      if (a.nextInspection && b.nextInspection) {
        return new Date(a.nextInspection).getTime() - new Date(b.nextInspection).getTime();
      }
      return 0;
    });
};

// Helper function to get expiring PPE
export const getExpiringPPE = () => {
  return ppeItems
    .filter(item => item.status === 'expired' || 
            (new Date(item.expiryDate).getTime() - new Date().getTime()) < 30 * 24 * 60 * 60 * 1000); // Within 30 days
};

// Get PPE List by Type
export const getPPETypes = (): PPEType[] => [
  'Full Body Harness',
  'Fall Arrester',
  'Double Lanyard',
  'Safety Helmet',
  'Safety Boots',
  'Safety Gloves',
  'Safety Goggles',
  'Ear Protection'
];
