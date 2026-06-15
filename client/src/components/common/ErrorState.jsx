import React from 'react';

export function ErrorState({ title = 'Something went wrong', message = 'An error occurred while loading this section.', onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center p-10 text-center bg-rose-50/50 rounded-xl border border-rose-100 max-w-md mx-auto my-8">
      <div className="w-14 h-14 bg-rose-100 rounded-full flex items-center justify-center text-rose-600 text-2xl font-bold mb-4 shadow-inner">
        ⚠
      </div>
      <h3 className="text-slate-800 font-bold text-lg mb-2">{title}</h3>
      <p className="text-slate-500 text-sm mb-6 max-w-xs">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="bg-rose-600 hover:bg-rose-700 text-white font-semibold text-sm px-5 py-2.5 rounded-lg shadow-sm transition-all duration-200"
        >
          Try Again
        </button>
      )}
    </div>
  );
}

export default ErrorState;
