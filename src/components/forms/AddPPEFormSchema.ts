
import { z } from 'zod';
import { PPEType } from '@/types/index';

export const addPPEFormSchema = z.object({
  serialNumber: z.string()
    .min(3, { message: 'Serial number must be at least 3 characters' })
    .max(50, { message: 'Serial number must be 50 characters or less' }),
  
  type: z.string({ required_error: 'PPE type is required' }),
  
  brand: z.string()
    .min(2, { message: 'Brand must be at least 2 characters' })
    .max(50, { message: 'Brand must be 50 characters or less' }),
  
  modelNumber: z.string()
    .min(2, { message: 'Model number must be at least 2 characters' })
    .max(50, { message: 'Model number must be 50 characters or less' }),
  
  manufacturingDate: z.date({ required_error: 'Manufacturing date is required' }),
  
  expiryDate: z.date({ required_error: 'Expiry date is required' })
    .refine(date => date > new Date(), {
      message: 'Expiry date must be in the future',
    }),

  // Add new fields
  batchNumber: z.string().optional(),
  firstUseDate: z.date().optional()
});

export type AddPPEFormValues = z.infer<typeof addPPEFormSchema>;

export const defaultFormValues: Partial<AddPPEFormValues> = {
  serialNumber: '',
  brand: '',
  modelNumber: '',
  batchNumber: '',
};

// PPE types standardized across the application
export const ppeTypes: PPEType[] = [
  'Full Body Harness',
  'Fall Arrester',
  'Double Lanyard',
  'Safety Helmet',
  'Safety Boots',
  'Safety Gloves',
  'Safety Goggles',
  'Ear Protection',
  'Respirator',
  'Safety Vest',
  'Face Shield'
];
