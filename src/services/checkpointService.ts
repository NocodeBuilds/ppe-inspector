
import { PPEType } from '@/types';
import { v4 as uuidv4 } from 'uuid';

interface Checkpoint {
  id: string;
  description: string;
  ppeType: PPEType;
  required: boolean;
}

// Define standard checkpoints for each PPE type
const harnesCheckpoints: Omit<Checkpoint, 'id'>[] = [
  {
    description: 'Check for cuts, tears, or fraying in the straps.',
    ppeType: 'Full Body Harness',
    required: true,
  },
  {
    description: 'Ensure buckles and D-rings are free from rust, cracks, or deformation.',
    ppeType: 'Full Body Harness',
    required: true,
  },
  {
    description: 'Verify stitching integrity—no loose threads or broken seams.',
    ppeType: 'Full Body Harness',
    required: true,
  },
  {
    description: 'Inspect webbing for chemical burns, discoloration, or brittleness.',
    ppeType: 'Full Body Harness',
    required: true,
  },
  {
    description: 'Ensure all adjustment points function smoothly and lock securely.',
    ppeType: 'Full Body Harness',
    required: true,
  },
];

const fallArresterCheckpoints: Omit<Checkpoint, 'id'>[] = [
  {
    description: 'Inspect rope/cable for wear, fraying, or kinks.',
    ppeType: 'Fall Arrester',
    required: true,
  },
  {
    description: 'Check the locking mechanism for smooth operation and proper engagement.',
    ppeType: 'Fall Arrester',
    required: true,
  },
  {
    description: 'Ensure the energy absorber is intact and has not been deployed.',
    ppeType: 'Fall Arrester',
    required: true,
  },
  {
    description: 'Verify carabiners and hooks for deformation, corrosion, or cracks.',
    ppeType: 'Fall Arrester',
    required: true,
  },
  {
    description: 'Ensure the device moves freely along the lifeline without obstruction.',
    ppeType: 'Fall Arrester',
    required: true,
  },
];

const lanyardCheckpoints: Omit<Checkpoint, 'id'>[] = [
  {
    description: 'Check for cuts, abrasions, or fraying on the lanyard material.',
    ppeType: 'Double Lanyard',
    required: true,
  },
  {
    description: 'Inspect snap hooks and carabiners for corrosion, cracks, or deformation.',
    ppeType: 'Double Lanyard',
    required: true,
  },
  {
    description: 'Verify stitching integrity—no loose or broken threads.',
    ppeType: 'Double Lanyard',
    required: true,
  },
  {
    description: 'Ensure the shock absorber has not been deployed or damaged.',
    ppeType: 'Double Lanyard',
    required: true,
  },
  {
    description: 'Confirm connectors properly lock/unlock without jamming.',
    ppeType: 'Double Lanyard',
    required: true,
  },
];

const helmetCheckpoints: Omit<Checkpoint, 'id'>[] = [
  {
    description: 'Inspect shell for cracks, dents, or excessive wear.',
    ppeType: 'Safety Helmet',
    required: true,
  },
  {
    description: 'Ensure suspension system is intact and properly adjusted.',
    ppeType: 'Safety Helmet',
    required: true,
  },
  {
    description: 'Check chin strap and buckle for strength and secure fastening.',
    ppeType: 'Safety Helmet',
    required: true,
  },
  {
    description: 'Look for UV degradation, discoloration, or brittleness.',
    ppeType: 'Safety Helmet',
    required: true,
  },
  {
    description: 'Verify manufacturing date and replace if past the recommended lifespan.',
    ppeType: 'Safety Helmet',
    required: true,
  },
];

const bootsCheckpoints: Omit<Checkpoint, 'id'>[] = [
  {
    description: 'Inspect the outer sole for wear, cuts, or loss of grip.',
    ppeType: 'Safety Boots',
    required: true,
  },
  {
    description: 'Check the toe cap for dents, cracks, or deformation.',
    ppeType: 'Safety Boots',
    required: true,
  },
  {
    description: 'Ensure stitching and seams are intact with no loose threads.',
    ppeType: 'Safety Boots',
    required: true,
  },
  {
    description: 'Look for water damage, mold, or foul odor inside.',
    ppeType: 'Safety Boots',
    required: true,
  },
  {
    description: 'Verify insole is comfortable, properly fitted, and undamaged.',
    ppeType: 'Safety Boots',
    required: true,
  },
];

const glovesCheckpoints: Omit<Checkpoint, 'id'>[] = [
  {
    description: 'Inspect for holes, cuts, or tears in the glove material.',
    ppeType: 'Safety Gloves',
    required: true,
  },
  {
    description: 'Check stitching and seams for durability and wear.',
    ppeType: 'Safety Gloves',
    required: true,
  },
  {
    description: 'Ensure gloves provide proper grip without excessive wear.',
    ppeType: 'Safety Gloves',
    required: true,
  },
  {
    description: 'Verify resistance to chemicals, heat, or electrical hazards.',
    ppeType: 'Safety Gloves',
    required: true,
  },
  {
    description: 'Confirm flexibility and comfort for hand movement without restriction.',
    ppeType: 'Safety Gloves',
    required: true,
  },
];

const gogglesCheckpoints: Omit<Checkpoint, 'id'>[] = [
  {
    description: 'Check lenses for scratches, cracks, or fogging.',
    ppeType: 'Safety Goggles',
    required: true,
  },
  {
    description: 'Ensure the frame is intact with no broken or missing parts.',
    ppeType: 'Safety Goggles',
    required: true,
  },
  {
    description: 'Verify the elastic band or arms fit securely without slipping.',
    ppeType: 'Safety Goggles',
    required: true,
  },
  {
    description: 'Ensure anti-fog and anti-scratch coatings are effective.',
    ppeType: 'Safety Goggles',
    required: true,
  },
  {
    description: 'Clean lenses properly to maintain clear visibility.',
    ppeType: 'Safety Goggles',
    required: true,
  },
];

const earProtectionCheckpoints: Omit<Checkpoint, 'id'>[] = [
  {
    description: 'Check earplugs/earmuffs for dirt, cracks, or deformation.',
    ppeType: 'Ear Protection',
    required: true,
  },
  {
    description: 'Ensure headband/frame of earmuffs is not loose or broken.',
    ppeType: 'Ear Protection',
    required: true,
  },
  {
    description: 'Verify cushions provide a snug fit without excessive wear.',
    ppeType: 'Ear Protection',
    required: true,
  },
  {
    description: 'Inspect noise reduction ratings and compliance markings.',
    ppeType: 'Ear Protection',
    required: true,
  },
  {
    description: 'Ensure hygiene by cleaning or replacing as per guidelines.',
    ppeType: 'Ear Protection',
    required: true,
  },
];

// Combine all checkpoints for easy lookup
const checkpointMap = {
  'Full Body Harness': harnesCheckpoints,
  'Fall Arrester': fallArresterCheckpoints,
  'Double Lanyard': lanyardCheckpoints,
  'Safety Helmet': helmetCheckpoints,
  'Safety Boots': bootsCheckpoints,
  'Safety Gloves': glovesCheckpoints,
  'Safety Goggles': gogglesCheckpoints,
  'Ear Protection': earProtectionCheckpoints,
};

export const getStandardCheckpoints = (ppeType: PPEType): Omit<Checkpoint, 'id'>[] => {
  return checkpointMap[ppeType] || [];
};

export const getAllPPETypes = (): PPEType[] => {
  return [
    'Full Body Harness',
    'Fall Arrester',
    'Double Lanyard',
    'Safety Helmet',
    'Safety Boots',
    'Safety Gloves',
    'Safety Goggles',
    'Ear Protection'
  ];
};

export const getAllCheckpoints = (): Omit<Checkpoint, 'id'>[] => {
  return Object.values(checkpointMap).flat();
};
