import { useEffect } from 'react';

/**
 * ScrollAnimationProvider - Initializes scroll animations on mount
 * Automatically adds "visible" class to elements with scroll animation classes when they come into view
 */
export default function ScrollAnimationProvider({ children }) {
  useEffect(() => {
    // Create Intersection Observer for scroll animations
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Add visible class to trigger animation
            entry.target.classList.add('visible');
            // Stop observing after animation triggers (optional, for performance)
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px',
      }
    );

    // Observe all elements with animation classes
    const animatedElements = document.querySelectorAll(
      '.scroll-fade-in, .scroll-slide-in, .scroll-scale-in'
    );

    animatedElements.forEach((el) => {
      observer.observe(el);
    });

    return () => {
      animatedElements.forEach((el) => {
        observer.unobserve(el);
      });
    };
  }, []);

  return children;
}
