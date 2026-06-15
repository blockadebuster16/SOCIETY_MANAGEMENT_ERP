import React from 'react';

function PaymentRow({ cycle, amount, dueDate, status, paidDate }) {
  const statusColors = {
    SUCCESS: 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-400',
    PENDING: 'bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-400',
    FAILED: 'bg-rose-100 dark:bg-rose-950/40 text-rose-800 dark:text-rose-400'
  };

  return (
    <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/40 border-b border-slate-200 dark:border-slate-800 transition-theme">
      <td className="px-6 py-4 whitespace-nowrap font-medium text-slate-900 dark:text-slate-100">{cycle}</td>
      <td className="px-6 py-4 whitespace-nowrap text-slate-900 dark:text-slate-100 font-semibold">₹{amount}</td>
      <td className="px-6 py-4 whitespace-nowrap text-slate-500 dark:text-slate-400">{dueDate}</td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${statusColors[status] || 'bg-slate-100 text-slate-800'}`}>
          {status}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-slate-500 dark:text-slate-400">{paidDate || '-'}</td>
    </tr>
  );
}

export default PaymentRow;
