import {
  createClient as createSupabaseClient,
  SupabaseClient,
  SupabaseClientOptions,
} from '@supabase/supabase-js';

// Types for our database schema (can be expanded as needed)
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string | null;
          full_name: string | null;
          avatar_url: string | null;
          role: string | null;
          created_at: string;
          updated_at: string;
          employee_id: string | null;
          site_name: string | null;
          department: string | null;
          Employee_Role: string | null;
        };
        Insert: {
          id: string;
          email?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
          role?: string | null;
          created_at?: string;
          updated_at?: string;
          employee_id?: string | null;
          site_name?: string | null;
          department?: string | null;
          Employee_Role?: string | null;
        };
        Update: {
          id?: string;
          email?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
          role?: string | null;
          created_at?: string;
          updated_at?: string;
          employee_id?: string | null;
          site_name?: string | null;
          department?: string | null;
          Employee_Role?: string | null;
        };
      };
      ppe_items: {
        Row: {
          id: string;
          serial_number: string;
          type: string;
          brand: string;
          model_number: string;
          manufacturing_date: string | null;
          expiry_date: string | null;
          batch_number: string | null;
          status: string;
          image_url: string | null;
          created_at: string;
          updated_at: string;
          created_by: string | null;
          next_inspection: string | null;
          assigned_to: string | null;
          location: string | null;
        };
        Insert: {
          id?: string;
          serial_number: string;
          type: string;
          brand: string;
          model_number: string;
          manufacturing_date?: string | null;
          expiry_date?: string | null;
          batch_number?: string | null;
          status?: string;
          image_url?: string | null;
          created_at?: string;
          updated_at?: string;
          created_by?: string | null;
          next_inspection?: string | null;
          assigned_to?: string | null;
          location?: string | null;
        };
        Update: {
          id?: string;
          serial_number?: string;
          type?: string;
          brand?: string;
          model_number?: string;
          manufacturing_date?: string | null;
          expiry_date?: string | null;
          batch_number?: string | null;
          status?: string;
          image_url?: string | null;
          created_at?: string;
          updated_at?: string;
          created_by?: string | null;
          next_inspection?: string | null;
          assigned_to?: string | null;
          location?: string | null;
        };
      };
      inspections: {
        Row: {
          id: string;
          ppe_id: string;
          inspector_id: string;
          inspection_date: string;
          inspection_type: string;
          overall_result: string;
          notes: string | null;
          signature_url: string | null;
          created_at: string;
          updated_at: string;
          flagged: boolean;
          next_inspection_date: string | null;
        };
        Insert: {
          id?: string;
          ppe_id: string;
          inspector_id: string;
          inspection_date: string;
          inspection_type: string;
          overall_result: string;
          notes?: string | null;
          signature_url?: string | null;
          created_at?: string;
          updated_at?: string;
          flagged?: boolean;
          next_inspection_date?: string | null;
        };
        Update: {
          id?: string;
          ppe_id?: string;
          inspector_id?: string;
          inspection_date?: string;
          inspection_type?: string;
          overall_result?: string;
          notes?: string | null;
          signature_url?: string | null;
          created_at?: string;
          updated_at?: string;
          flagged?: boolean;
          next_inspection_date?: string | null;
        };
      };
      inspection_results: {
        Row: {
          id: string;
          inspection_id: string;
          checkpoint_id: string;
          passed: boolean;
          notes: string | null;
          photo_url: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          inspection_id: string;
          checkpoint_id: string;
          passed: boolean;
          notes?: string | null;
          photo_url?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          inspection_id?: string;
          checkpoint_id?: string;
          passed?: boolean;
          notes?: string | null;
          photo_url?: string | null;
          created_at?: string;
        };
      };
      inspection_checkpoints: {
        Row: {
          id: string;
          description: string;
          ppe_type: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          description: string;
          ppe_type: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          description?: string;
          ppe_type?: string;
          created_at?: string;
        };
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          message: string;
          read: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          message: string;
          read?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          message?: string;
          read?: boolean;
          created_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      app_role: 'admin' | 'user' | 'inspector';
      ppe_status: 'active' | 'expired' | 'out_of_service' | 'pending_repair';
      inspection_type: 'pre-use' | 'monthly' | 'quarterly';
    };
  };
};

// Supabase URL and anon key from environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase environment variables are missing. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.');
}

// Default client options
const defaultOptions: SupabaseClientOptions<'public'> = {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  global: {
    headers: {
      'x-application-name': 'ppe-inspector'
    }
  }
};

// Create a singleton client instance
let client: SupabaseClient<Database> | null = null;

/**
 * Creates a Supabase client with enhanced options
 * @param customOptions Optional custom client options
 * @returns Supabase client instance
 */
export function createClient(customOptions: Partial<SupabaseClientOptions<'public'>> = {}): SupabaseClient<Database> {
  // If client already exists, return it
  if (client) return client;

  const options = { ...defaultOptions, ...customOptions };
  
  // Create new client
  client = createSupabaseClient<Database>(
    supabaseUrl,
    supabaseAnonKey,
    options
  );
  
  return client;
}

/**
 * Reset the client (useful for testing or when auth changes)
 */
export function resetClient(): void {
  client = null;
}
