import { useScrollAnimation } from '../hooks/useScrollAnimation';

const colors = {
  coral:  { bg: 'bg-coral-500/10', border: 'border-coral-500/20', text: 'text-coral-400', icon: 'text-coral-500' },
  green:  { bg: 'bg-green-500/10', border: 'border-green-500/20', text: 'text-green-400', icon: 'text-green-500' },
  blue:   { bg: 'bg-blue-500/10', border: 'border-blue-500/20', text: 'text-blue-400', icon: 'text-blue-500' },
  yellow: { bg: 'bg-yellow-500/10', border: 'border-yellow-500/20', text: 'text-yellow-400', icon: 'text-yellow-500' },
  purple: { bg: 'bg-purple-500/10', border: 'border-purple-500/20', text: 'text-purple-400', icon: 'text-purple-500' },
};

export default function StatCard({ title, value, icon, color = 'coral', subtitle, trend }) {
  const ref = useScrollAnimation();
  const colorStyle = colors[color];

  return (
    <div 
      ref={ref}
      className="scroll-fade-in relative overflow-hidden p-6 rounded-xl border border-secondary/30 bg-secondary/20 backdrop-blur-xl shadow-glass-sm transition-all duration-300 hover:border-coral-500/40 hover:shadow-glow hover:-translate-y-1 group"
    >
      {/* Icon with glassmorphism effect */}
      <div className={`w-14 h-14 rounded-xl ${colorStyle.bg} ${colorStyle.border} border flex items-center justify-center text-2xl flex-shrink-0 mb-4 transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg`}>
        <span className={colorStyle.icon}>{icon}</span>
      </div>

      {/* Content */}
      <div className="space-y-1">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">{title}</p>
        <p className="text-3xl font-bold bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">{value}</p>
        
        {subtitle && (
          <p className="text-xs text-gray-500 mt-2 line-clamp-2 group-hover:text-gray-400 transition-colors">{subtitle}</p>
        )}

        {trend && (
          <div className={`flex items-center gap-1 text-xs font-semibold mt-3 ${trend > 0 ? 'text-green-400' : 'text-red-400'}`}>
            <span className={`transition-transform group-hover:scale-110 ${trend > 0 ? '' : 'rotate-180'}`}>
              ↑
            </span>
            <span>{Math.abs(trend)}% this month</span>
          </div>
        )}
      </div>

      {/* Animated background glow on hover */}
      <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" 
           style={{
            background: 'radial-gradient(circle at top right, rgba(233, 216, 166, 0.14) 0%, transparent 70%)',
           }}>
      </div>
    </div>
  );
}
