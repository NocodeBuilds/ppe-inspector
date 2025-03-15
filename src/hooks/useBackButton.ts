
import { useEffect } from 'react';
import { useBackNavigation } from '@/components/layout/MainLayout';

/**
 * Hook to control back button visibility and navigation
 * 
 * @param show Whether to show the back button
 * @param destination Where to navigate when back button is clicked (path or -1 for history.back())
 */
export const useBackButton = (show: boolean = true, destination: string | number = -1) => {
  const { setShowBackButton, setBackTo } = useBackNavigation();
  
  useEffect(() => {
    // Set back button visibility and destination when component mounts
    setShowBackButton(show);
    setBackTo(destination);
    
    // Clean up when component unmounts
    return () => {
      setShowBackButton(false);
    };
  }, [show, destination, setShowBackButton, setBackTo]);
};

export default useBackButton;
