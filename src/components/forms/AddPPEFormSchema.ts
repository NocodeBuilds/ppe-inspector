import { z } from 'zod';
import { PPEType } from '@/integrations/supabase/client';

export const addPPEFormSchema = z.object({
  type: z.string()
    .min(1, { message: 'PPE type is required' }),
  
  serialNumber: z.string()
    .min(1, { message: 'Serial number is required' }),
  
  brand: z.string()
    .min(1, { message: 'Brand is required' }),
  
  modelNumber: z.string()
    .min(1, { message: 'Model number is required' }),
  
  manufacturingDate: z.string()
    .min(1, { message: 'Manufacturing date is required' }),
});

export type AddPPEFormValues = z.infer<typeof addPPEFormSchema>;

export const defaultFormValues: AddPPEFormValues = {
  type: '',
  serialNumber: '',
  brand: '',
  modelNumber: '',
  manufacturingDate: '',
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
