'use client';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  fullScreen?: boolean;
  text?: string;
  className?: string;
}

export default function LoadingSpinner({
  size = 'md',
  fullScreen = false,
  text,
  className = '',
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-2',
    lg: 'w-12 h-12 border-4',
  };

  const spinnerSize = sizeClasses[size];

  const spinner = (
    <div
      className={`inline-block animate-spin rounded-full border-solid border-t-transparent ${spinnerSize}`}
      style={{
        borderColor: 'var(--primary-blue)',
        borderTopColor: 'transparent',
      }}
      role="status"
      aria-label="Loading"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );

  if (fullScreen) {
    return (
      <div
        className={`flex flex-col items-center justify-center min-h-[400px] space-y-4 ${className}`}
      >
        {spinner}
        {text && (
          <p className="text-center" style={{ color: 'var(--text-secondary)' }}>
            {text}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className={`flex flex-col items-center justify-center py-8 space-y-3 ${className}`}>
      {spinner}
      {text && (
        <p className="text-center text-sm" style={{ color: 'var(--text-secondary)' }}>
          {text}
        </p>
      )}
    </div>
  );
}

