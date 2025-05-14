import { useState, useEffect } from 'react';

/**
 * Custom hook to check if a media query matches
 * @param query The media query to check
 * @returns Whether the media query matches
 */
export function useMediaQuery(query: string): boolean {
  // Initialize with the current match state if possible
  const [matches, setMatches] = useState<boolean>(() => {
    // Check for window to support SSR
    if (typeof window !== 'undefined') {
      return window.matchMedia(query).matches;
    }
    return false;
  });

  useEffect(() => {
    // Return early if no window (SSR)
    if (typeof window === 'undefined') {
      return;
    }

    // Create media query list
    const mediaQueryList = window.matchMedia(query);
    
    // Update state based on changes
    const updateMatches = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    // Set initial value
    setMatches(mediaQueryList.matches);

    // Add listener for changes
    if (mediaQueryList.addEventListener) {
      // Modern browsers
      mediaQueryList.addEventListener('change', updateMatches);
      return () => {
        mediaQueryList.removeEventListener('change', updateMatches);
      };
    } else {
      // Older browsers (Safari < 14)
      // @ts-ignore - For backwards compatibility
      mediaQueryList.addListener(updateMatches);
      return () => {
        // @ts-ignore - For backwards compatibility
        mediaQueryList.removeListener(updateMatches);
      };
    }
  }, [query]);

  return matches;
}
