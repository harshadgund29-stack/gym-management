export default function LoadingSpinner({ text = 'Loading...', size = 'md', fullHeight = false }) {
  const sizeMap = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
  };

  return (
    <div className={`flex flex-col items-center justify-center gap-4 ${fullHeight ? 'min-h-screen' : 'py-20'}`}>
      {/* Spinner with glassmorphism backdrop */}
      <div className="relative">
        {/* Outer glow circle */}
        <div className={`${sizeMap[size]} rounded-full border-2 border-transparent border-t-coral-500 border-r-coral-500/50 animate-spin shadow-lg shadow-coral-500/20`}></div>
        
        {/* Inner pulsing dot */}
        <div className={`absolute inset-0 ${sizeMap[size]} rounded-full border-2 border-coral-500/20 animate-pulse`}></div>
      </div>

      {/* Loading text */}
      {text && (
        <div className="text-center">
          <p className="text-gray-400 text-sm font-medium">{text}</p>
          {/* Animated dots */}
          <div className="flex items-center justify-center gap-1 mt-2">
            <span className="w-1.5 h-1.5 bg-coral-500/60 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></span>
            <span className="w-1.5 h-1.5 bg-coral-500/60 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></span>
            <span className="w-1.5 h-1.5 bg-coral-500/60 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
          </div>
        </div>
      )}
    </div>
  );
}
