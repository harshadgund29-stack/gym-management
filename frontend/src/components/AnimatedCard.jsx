import { useScrollAnimation } from '../hooks/useScrollAnimation';

/**
 * AnimatedCard - Combines card styling with scroll-triggered animation
 * @param {React.ReactNode} children - Content to display inside the card
 * @param {string} animationType - 'fade', 'slide', or 'scale' (default: 'fade')
 * @param {string} className - Additional Tailwind classes
 * @param {boolean} glass - Use glassmorphism styling (default: false)
 * @param {object} style - Inline styles
 */
export default function AnimatedCard({ 
  children, 
  animationType = 'fade', 
  className = '',
  glass = false,
  style = {},
  onClick = null,
}) {
  const ref = useScrollAnimation();

  const animationClass = {
    fade: 'scroll-fade-in',
    slide: 'scroll-slide-in',
    scale: 'scroll-scale-in',
  }[animationType] || 'scroll-fade-in';

  const cardClasses = glass 
    ? 'glass rounded-xl p-6 border border-white/10'
    : 'card rounded-xl p-6';

  return (
    <div
      ref={ref}
      className={`${animationClass} ${cardClasses} ${className}`}
      style={style}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
