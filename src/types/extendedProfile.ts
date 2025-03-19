
export interface ExtendedProfile {
  id: string;
  user_id: string;
  employee_id?: string | null;
  location?: string | null;
  department?: string | null;
  bio?: string | null;
  created_at?: string;
  updated_at?: string;
}
