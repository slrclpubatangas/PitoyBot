interface AILoadingSpinnerProps {
  message?: string;
  size?: 'small' | 'medium' | 'large';
}

export default function AILoadingSpinner({ 
  message = "AI is thinking...", 
  size = 'medium' 
}: AILoadingSpinnerProps) {
  const sizeClasses = {
    small: 'scale-75',
    medium: 'scale-100', 
    large: 'scale-125'
  };

  return (
    <div className="ai-loading-container">
      <div className={`relative ${sizeClasses[size]}`}>
        {/* Central AI Brain */}
        <div className="ai-brain">
          {/* Orbiting particles */}
          <div className="ai-orbits">
            <div className="ai-orbit"></div>
            <div className="ai-orbit"></div>
            <div className="ai-orbit"></div>
          </div>
        </div>
        
        {/* Scanning line effect */}
        <div className="ai-scan-line"></div>
      </div>
      
      {/* Thinking dots */}
      <div className="ai-thinking-dots">
        <div className="ai-thinking-dot"></div>
        <div className="ai-thinking-dot"></div>
        <div className="ai-thinking-dot"></div>
      </div>
      
      {/* Loading message */}
      {message && (
        <p className="mt-4 text-sm font-medium animate-pulse" style={{ color: "var(--text-secondary)" }}>
          {message}
        </p>
      )}
    </div>
  );
}