
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const supabaseUrl = 'https://oapfjmyyfuopajayrxzw.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9hcGZqbXl5ZnVvcGFqYXlyeHp3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA3NjEzOTcsImV4cCI6MjA1NjMzNzM5N30.ln7r0soXRMrjmOSY69za1GQkq4H-aW9tGvBI0O81T1U';

export const supabase = createClient<Database>(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

// Extend the Database type to include notifications table
declare module './types' {
  interface Database {
    public: {
      Tables: {
        notifications: {
          Row: {
            id: string;
            user_id: string;
            title: string;
            message: string;
            type: string;
            read: boolean;
            created_at: string;
          };
          Insert: {
            id?: string;
            user_id: string;
            title: string;
            message?: string;
            type?: string;
            read?: boolean;
            created_at?: string;
          };
          Update: {
            id?: string;
            user_id?: string;
            title?: string;
            message?: string;
            type?: string;
            read?: boolean;
            created_at?: string;
          };
        };
      };
    };
  }
}

export type Role = 'admin' | 'inspector' | 'user';
export type PPEStatus = 'active' | 'expired' | 'maintenance' | 'flagged';
export type InspectionType = 'pre-use' | 'monthly' | 'quarterly';
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
  | 'Face Shield';

export type Profile = {
  id: string;
  full_name: string | null;
  role: Role;
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
  status: PPEStatus;
  image_url: string | null;
  last_inspection: string | null;
  next_inspection: string | null;
  created_by?: string;
  created_at?: string;
  updated_at?: string;
};

export type InspectionCheckpoint = {
  id: string;
  ppe_type: string;
  description: string;
  created_at?: string;
};

export type Inspection = {
  id: string;
  ppe_id: string;
  inspector_id: string;
  type: InspectionType;
  date: string;
  overall_result: string;
  signature_url: string | null;
  notes: string | null;
  created_at?: string;
};

export type InspectionResult = {
  id: string;
  inspection_id: string;
  checkpoint_id: string;
  passed: boolean;
  notes: string | null;
  photo_url: string | null;
  created_at?: string;
};
