import React from 'react';

export function LoadingSpinner({ size = 'medium', text = 'Loading...', fullPage = false }) {
  const sizeClasses = {
    small: 'h-6 w-6 border-2',
    medium: 'h-10 w-10 border-4',
    large: 'h-16 w-16 border-4'
  };

  const spinner = (
    <div className="flex flex-col items-center justify-center p-8 gap-3">
      <div className={`animate-spin rounded-full border-t-society-secondary border-r-transparent border-b-society-primary border-l-transparent ${sizeClasses[size]}`}></div>
      {text && <p className="text-slate-500 dark:text-slate-400 font-medium text-sm animate-pulse">{text}</p>}
    </div>
  );

  if (fullPage) {
    return (
      <div className="fixed inset-0 bg-slate-50/80 dark:bg-slate-950/80 backdrop-blur-sm z-[9999] flex items-center justify-center">
        {spinner}
      </div>
    );
  }

  return spinner;
}

export default LoadingSpinner;
