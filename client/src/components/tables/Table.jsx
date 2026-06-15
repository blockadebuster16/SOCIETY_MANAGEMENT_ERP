import React from 'react';

function Table({ headers, children }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900 transition-theme">
      <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800 text-left text-sm text-slate-700 dark:text-slate-350">
        <thead className="bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-semibold uppercase text-xs tracking-wider">
          <tr>
            {headers.map((header, idx) => (
              <th key={idx} scope="col" className="px-6 py-3">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
          {children}
        </tbody>
      </table>
    </div>
  );
}

export default Table;
