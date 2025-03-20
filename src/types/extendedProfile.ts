
// This type is maintained for backward compatibility
// All fields are now directly in the Profile type
export interface ExtendedProfile {
  id: string;
  user_id: string;
  employee_id?: string | null;
  site_name?: string | null;  // Updated from location to site_name
  department?: string | null;
  bio?: string | null;
  created_at?: string;
  updated_at?: string;
}
