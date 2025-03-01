
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const supabaseUrl = 'https://oapfjmyyfuopajayrxzw.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9hcGZqbXl5ZnVvcGFqYXlyeHp3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA3NjEzOTcsImV4cCI6MjA1NjMzNzM5N30.ln7r0soXRMrjmOSY69za1GQkq4H-aW9tGvBI0O81T1U';

export const supabase = createClient<Database>(supabaseUrl, supabaseKey);

export type Profile = {
  id: string;
  full_name: string | null;
  role: 'admin' | 'inspector' | 'user';
  avatar_url: string | null;
};

export type PPEItem = {
  id: string;
  serial_number: string;
  type: string;
  brand: string;
  model_number: string;
  manufacturing_date: string;
  expiry_date: string;
  status: 'active' | 'expired' | 'maintenance' | 'flagged';
  image_url: string | null;
  last_inspection: string | null;
  next_inspection: string | null;
};

export type InspectionCheckpoint = {
  id: string;
  ppe_type: string;
  description: string;
};

export type Inspection = {
  id: string;
  ppe_id: string;
  inspector_id: string;
  type: 'pre-use' | 'monthly' | 'quarterly';
  date: string;
  overall_result: string;
  signature_url: string | null;
  notes: string | null;
};

export type InspectionResult = {
  id: string;
  inspection_id: string;
  checkpoint_id: string;
  passed: boolean;
  notes: string | null;
  photo_url: string | null;
};
