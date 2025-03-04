
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
    nextInspection: '2024-01-15',
    createdAt: '2023-01-01',
    updatedAt: '2023-10-15',
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
    nextInspection: '2023-12-20',
    createdAt: '2022-06-01',
    updatedAt: '2023-09-20',
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
    nextInspection: '2023-12-10',
    createdAt: '2022-03-01',
    updatedAt: '2023-09-10',
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
    nextInspection: '2023-12-20',
    createdAt: '2023-02-01',
    updatedAt: '2023-10-20',
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
    nextInspection: '2025-02-08',
    createdAt: '2023-05-01',
    updatedAt: '2023-11-15',
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
    nextInspection: '2025-02-09',
    createdAt: '2023-06-01',
    updatedAt: '2023-11-10',
  },
];

// Mock Inspection Checkpoints
export const inspectionCheckpoints: Record<PPEType, InspectionCheckpoint[]> = {
  'Full Body Harness': [
    { id: 'fbh-1', description: 'Check for cuts, frays, or wear on straps', ppeType: 'Full Body Harness', required: true },
    { id: 'fbh-2', description: 'Inspect buckles and D-rings for cracks, deformation, or rust', ppeType: 'Full Body Harness', required: true },
    { id: 'fbh-3', description: 'Verify the label, certification, and expiration date', ppeType: 'Full Body Harness', required: true },
    { id: 'fbh-4', description: 'Test for proper adjustment and secure fit', ppeType: 'Full Body Harness', required: true },
  ],
  'Fall Arrester': [
    { id: 'fa-1', description: 'Inspect the rope or line for wear, fraying, or knots', ppeType: 'Fall Arrester', required: true },
    { id: 'fa-2', description: 'Test the locking mechanism for proper engagement and release', ppeType: 'Fall Arrester', required: true },
    { id: 'fa-3', description: 'Check for cracks, dents, or rust on the device', ppeType: 'Fall Arrester', required: true },
    { id: 'fa-4', description: 'Confirm certification and expiry details', ppeType: 'Fall Arrester', required: true },
  ],
  'Double Lanyard': [
    { id: 'dl-1', description: 'Check webbing for cuts, burns, or chemical damage', ppeType: 'Double Lanyard', required: true },
    { id: 'dl-2', description: 'Verify carabiners and hooks for cracks, rust, or deformation', ppeType: 'Double Lanyard', required: true },
    { id: 'dl-3', description: 'Inspect shock absorber for any signs of deployment', ppeType: 'Double Lanyard', required: true },
    { id: 'dl-4', description: 'Ensure labels and expiry information are intact', ppeType: 'Double Lanyard', required: true },
  ],
  'Safety Helmet': [
    { id: 'sh-1', description: 'Inspect the shell for cracks, dents, or UV damage', ppeType: 'Safety Helmet', required: true },
    { id: 'sh-2', description: 'Check suspension straps for tears, frays, or loss of elasticity', ppeType: 'Safety Helmet', required: true },
    { id: 'sh-3', description: 'Verify the chin strap and buckle functionality', ppeType: 'Safety Helmet', required: true },
    { id: 'sh-4', description: 'Confirm the helmet\'s certification and expiry date', ppeType: 'Safety Helmet', required: true },
  ],
  'Safety Boots': [
    { id: 'sb-1', description: 'Inspect the sole for wear, cracks, or loss of tread', ppeType: 'Safety Boots', required: true },
    { id: 'sb-2', description: 'Check the upper material for tears, cuts, or separation from the sole', ppeType: 'Safety Boots', required: true },
    { id: 'sb-3', description: 'Test the toe cap for dents or deformation', ppeType: 'Safety Boots', required: true },
    { id: 'sb-4', description: 'Ensure the insole is intact and the boot fits properly', ppeType: 'Safety Boots', required: true },
  ],
  'Safety Gloves': [
    { id: 'sg-1', description: 'Inspect gloves for cuts, holes, or abrasion', ppeType: 'Safety Gloves', required: true },
    { id: 'sg-2', description: 'Test gripping surface for wear or peeling', ppeType: 'Safety Gloves', required: true },
    { id: 'sg-3', description: 'Check for proper fit and wrist elasticity', ppeType: 'Safety Gloves', required: true },
    { id: 'sg-4', description: 'Verify chemical or electrical resistance as applicable', ppeType: 'Safety Gloves', required: true },
  ],
  'Safety Goggles': [
    { id: 'sgo-1', description: 'Check the lens for scratches, cracks, or fogging', ppeType: 'Safety Goggles', required: true },
    { id: 'sgo-2', description: 'Inspect the frame for damage or deformation', ppeType: 'Safety Goggles', required: true },
    { id: 'sgo-3', description: 'Ensure the strap is adjustable and in good condition', ppeType: 'Safety Goggles', required: true },
    { id: 'sgo-4', description: 'Confirm compliance with impact or chemical resistance standards', ppeType: 'Safety Goggles', required: true },
  ],
  'Ear Protection': [
    { id: 'ep-1', description: 'Inspect earmuffs for cracks or damaged foam seals', ppeType: 'Ear Protection', required: true },
    { id: 'ep-2', description: 'Check earplugs for cleanliness and elasticity (if reusable)', ppeType: 'Ear Protection', required: true },
    { id: 'ep-3', description: 'Test for proper fit and secure placement', ppeType: 'Ear Protection', required: true },
    { id: 'ep-4', description: 'Confirm compliance with required noise reduction ratings', ppeType: 'Ear Protection', required: true },
  ],
};

// Mock Inspection Results - Replace with proper structure matching the interface
export const inspectionResults = [
  {
    id: '1',
    inspectionId: '101',
    ppeId: '1',
    inspectionDate: '2023-10-15',
    inspectorName: 'John Smith',
    results: [
      { checkpointId: 'fbh-1', checkpointDescription: 'Check for cuts, frays, or wear on straps', passed: true },
      { checkpointId: 'fbh-2', checkpointDescription: 'Inspect buckles and D-rings for cracks, deformation, or rust', passed: true },
      { checkpointId: 'fbh-3', checkpointDescription: 'Verify the label, certification, and expiration date', passed: true },
      { checkpointId: 'fbh-4', checkpointDescription: 'Test for proper adjustment and secure fit', passed: true },
    ],
    passFail: true,
  },
  {
    id: '2',
    inspectionId: '102',
    ppeId: '2',
    inspectionDate: '2023-09-20',
    inspectorName: 'Jane Doe',
    results: [
      { checkpointId: 'sh-1', checkpointDescription: 'Inspect the shell for cracks, dents, or UV damage', passed: true },
      { checkpointId: 'sh-2', checkpointDescription: 'Check suspension straps for tears, frays, or loss of elasticity', passed: false, notes: 'Suspension straps showing signs of wear' },
      { checkpointId: 'sh-3', checkpointDescription: 'Verify the chin strap and buckle functionality', passed: true },
      { checkpointId: 'sh-4', checkpointDescription: 'Confirm the helmet\'s certification and expiry date', passed: true },
    ],
    passFail: false,
  }
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

// We need to re-export the PPEType from our types so it can be imported from mockData
export type { PPEType };
