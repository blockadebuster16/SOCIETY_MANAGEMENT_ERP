import React from 'react';
import { Link } from 'react-router-dom';

function ComplaintRow({ id, title, category, status, date }) {
  const statusColors = {
    PENDING: 'bg-amber-100 text-amber-800',
    IN_PROGRESS: 'bg-blue-100 text-blue-800',
    RESOLVED: 'bg-emerald-100 text-emerald-800',
    REJECTED: 'bg-rose-100 text-rose-800'
  };

  return (
    <tr className="hover:bg-slate-50">
      <td className="px-6 py-4 whitespace-nowrap font-medium text-slate-900">#{id.substring(0, 6)}</td>
      <td className="px-6 py-4 whitespace-nowrap text-slate-800">{title}</td>
      <td className="px-6 py-4 whitespace-nowrap text-slate-500 capitalize">{category}</td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${statusColors[status] || 'bg-slate-100 text-slate-800'}`}>
          {status.replace('_', ' ')}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-slate-500">{date}</td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-xs font-semibold">
        <Link to={`/resident/complaints/${id}`} className="text-society-primary hover:text-yellow-600">
          Track
        </Link>
      </td>
    </tr>
  );
}

export default ComplaintRow;
