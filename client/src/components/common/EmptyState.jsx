import React from 'react';

export function EmptyState({ title = 'No Data Found', message = 'There are no records to display at this moment.', actionLabel, onAction }) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm max-w-md mx-auto my-8 transition-theme">
      <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-400 dark:text-slate-500 text-3xl font-semibold mb-4 border border-slate-100 dark:border-slate-700">
        📭
      </div>
      <h3 className="text-slate-800 dark:text-slate-100 font-bold text-lg mb-2">{title}</h3>
      <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">{message}</p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="bg-society-primary hover:bg-[#0b213b] text-white dark:text-slate-100 font-semibold text-sm px-5 py-2.5 rounded-lg shadow-md transition-all duration-200 hover:scale-102"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}

export default EmptyState;
