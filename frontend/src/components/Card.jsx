/**
 * Card — reusable card component used across Features, Plans, and Roles sections.
 *
 * Props:
 *   icon        — emoji or JSX icon shown at the top
 *   title       — card heading
 *   description — body text
 *   buttonText  — optional CTA button label
 *   onButtonClick — optional click handler for the CTA
 *   highlight   — boolean, adds coral border + glow (used for "most popular" plan)
 *   badge       — optional badge text shown above the card (e.g. "MOST POPULAR")
 *   accentColor — Tailwind gradient classes for the icon background (optional)
 *   children    — optional extra content rendered below description
 */
export default function Card({
  icon,
  title,
  description,
  buttonText,
  onButtonClick,
  highlight = false,
  badge,
  accentColor = 'from-coral-500/20 to-coral-600/10',
  children,
}) {
  return (
    <div
      className={`
        relative flex flex-col rounded-2xl p-6
        border backdrop-blur-xl
        transition-all duration-300
        hover:-translate-y-1 hover:shadow-glow
        ${highlight
          ? 'border-coral-500/60 bg-secondary/30 shadow-glow'
          : 'border-secondary/30 bg-secondary/20 hover:border-coral-500/40'}
      `}
    >
      {/* Optional badge (e.g. MOST POPULAR) */}
      {badge && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
          <span className="bg-gradient-to-r from-coral-500 to-coral-600 text-white text-xs font-bold px-5 py-1.5 rounded-full shadow-coral whitespace-nowrap">
            {badge}
          </span>
        </div>
      )}

      {/* Icon */}
      {icon && (
        <div
          className={`
            w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-4
            bg-gradient-to-br ${accentColor}
            border border-coral-500/20
            group-hover:scale-110 transition-transform duration-300
          `}
        >
          {icon}
        </div>
      )}

      {/* Title */}
      <h3 className="text-lg font-bold text-white mb-2">{title}</h3>

      {/* Description */}
      {description && (
        <p className="text-fitpro-muted text-sm leading-relaxed flex-1">{description}</p>
      )}

      {/* Extra content slot */}
      {children && <div className="mt-4 flex-1">{children}</div>}

      {/* CTA Button */}
      {buttonText && (
        <button
          onClick={onButtonClick}
          className={`
            mt-6 w-full py-2.5 rounded-xl font-semibold text-sm
            transition-all duration-200
            ${highlight
              ? 'bg-coral-500 hover:bg-coral-600 text-white shadow-coral hover:shadow-lg'
              : 'border border-white/20 hover:border-coral-500 text-white hover:bg-coral-500/10'}
          `}
        >
          {buttonText}
        </button>
      )}
    </div>
  );
}
