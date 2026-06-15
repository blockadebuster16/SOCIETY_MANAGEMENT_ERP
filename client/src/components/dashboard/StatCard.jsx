import React from 'react';

function StatCard({ label, value, description, icon }) {
  return (
    <div className="bg-white rounded-lg border border-slate-205 shadow-sm p-6 flex items-center justify-between hover:shadow-md transition">
      <div>
        <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider block mb-1">{label}</span>
        <span className="text-2xl font-bold text-society-primary block mb-1">{value}</span>
        {description && <span className="text-xs text-slate-400">{description}</span>}
      </div>
      {icon && (
        <div className="p-3 bg-slate-50 rounded-full text-society-primary border border-slate-100">
          {icon}
        </div>
      )}
    </div>
  );
}

export default StatCard;
