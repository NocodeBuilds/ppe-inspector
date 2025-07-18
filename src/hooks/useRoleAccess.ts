
import { useAuth } from '@/hooks/use-auth';

/**
 * Hook to check user role access permissions
 * Returns boolean flags for different role-based permissions
 */
export const useRoleAccess = () => {
  const { profile } = useAuth();
  
  return {
    // Admin role has all permissions
    isAdmin: profile?.role === 'admin',
    
    // Both admin and inspector roles can perform inspections
    canInspect: ['admin', 'inspector', 'user'].includes(profile?.role || ''),
    
    // Admin and user can add equipment
    canAddEquipment: ['admin', 'user'].includes(profile?.role || ''),
    
    // Any authenticated user with a role
    isUser: !!profile?.role,
  };
};
