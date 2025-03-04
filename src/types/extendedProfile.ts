
export interface ExtendedProfile {
  id: string;
  userId: string;
  employeeId?: string | null;
  location?: string | null;
  department?: string | null;
  bio?: string | null;
  createdAt?: string;
  updatedAt?: string;
}
