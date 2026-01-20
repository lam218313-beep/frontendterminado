import { useState, useEffect } from 'react';

/**
 * Custom hook to detect media query matches
 * @param query - CSS media query string (e.g., '(max-width: 768px)')
 * @returns boolean indicating if the query matches
 */
export const useMediaQuery = (query: string): boolean => {
    const [matches, setMatches] = useState(false);

    useEffect(() => {
        // Handle SSR case
        if (typeof window === 'undefined') return;

        const media = window.matchMedia(query);

        // Set initial value
        if (media.matches !== matches) {
            setMatches(media.matches);
        }

        // Create listener
        const listener = () => setMatches(media.matches);

        // Modern browsers
        if (media.addEventListener) {
            media.addEventListener('change', listener);
            return () => media.removeEventListener('change', listener);
        } else {
            // Fallback for older browsers
            media.addListener(listener);
            return () => media.removeListener(listener);
        }
    }, [matches, query]);

    return matches;
};

/**
 * Convenience hook to detect mobile devices (< 768px)
 */
export const useIsMobile = (): boolean => {
    return useMediaQuery('(max-width: 767px)');
};

/**
 * Convenience hook to detect tablet devices (768px - 1023px)
 */
export const useIsTablet = (): boolean => {
    return useMediaQuery('(min-width: 768px) and (max-width: 1023px)');
};

/**
 * Convenience hook to detect desktop devices (>= 1024px)
 */
export const useIsDesktop = (): boolean => {
    return useMediaQuery('(min-width: 1024px)');
};
