import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Function to scroll all scrollable containers to top
    const scrollToTop = () => {
      // Scroll window to top (for public routes like signin, signup, etc.)
      // Use multiple methods for maximum compatibility
      window.scrollTo(0, 0);
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'instant'
      });
      // Fallback for older browsers
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;

      // Scroll the main scrollable container (for protected routes with Layout)
      const mainElement = document.getElementById('main-scroll-container');
      if (mainElement) {
        mainElement.scrollTop = 0;
        mainElement.scrollTo({
          top: 0,
          left: 0,
          behavior: 'instant'
        });
      }

      // Fallback: Find any other scrollable containers and scroll them
      const scrollableContainers = document.querySelectorAll('[class*="overflow-y-auto"], [class*="overflow-auto"]');
      scrollableContainers.forEach((container) => {
        // Skip the main element as we already handled it
        if (container.id !== 'main-scroll-container') {
          container.scrollTop = 0;
          container.scrollTo({
            top: 0,
            left: 0,
            behavior: 'instant'
          });
        }
      });
    };

    // Immediate scroll (synchronous)
    scrollToTop();

    // Use requestAnimationFrame for next frame (ensures DOM is ready)
    requestAnimationFrame(() => {
      scrollToTop();
    });

    // Additional scroll after a small delay to handle lazy-loaded components
    // This ensures components loaded via Suspense are also scrolled
    const timeoutId1 = setTimeout(() => {
      scrollToTop();
    }, 10);

    const timeoutId2 = setTimeout(() => {
      scrollToTop();
    }, 50);

    // One more check after components are fully loaded (for lazy-loaded routes)
    const timeoutId3 = setTimeout(() => {
      scrollToTop();
    }, 150);

    // Final check for any edge cases
    const timeoutId4 = setTimeout(() => {
      scrollToTop();
    }, 300);

    return () => {
      clearTimeout(timeoutId1);
      clearTimeout(timeoutId2);
      clearTimeout(timeoutId3);
      clearTimeout(timeoutId4);
    };
  }, [pathname]);

  return null;
};

export default ScrollToTop;
