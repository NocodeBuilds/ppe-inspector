
import { useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

type AuthSessionHook = {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
};

/**
 * Hook to manage Supabase authentication session
 * Handles session initialization and auth state changes
 */
export const useAuthSession = (): AuthSessionHook => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log("Setting up auth session listener");
    
    const setupAuth = async () => {
      try {
        // Get initial session
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          throw error;
        }
        
        console.log("Initial session:", data?.session ? "Found" : "None");
        setSession(data.session);
        setUser(data.session?.user ?? null);
      } catch (error) {
        console.error("Error getting session:", error);
      } finally {
        // Ensure we always set loading to false after initial check
        setIsLoading(false);
      }
      
      // Subscribe to auth changes
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          console.log("Auth state changed:", event);
          setSession(session);
          setUser(session?.user ?? null);
        }
      );
      
      return () => {
        subscription.unsubscribe();
      };
    };
    
    setupAuth();
  }, []);

  return { session, user, isLoading };
};
