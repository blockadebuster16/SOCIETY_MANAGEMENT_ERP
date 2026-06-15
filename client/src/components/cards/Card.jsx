import React from 'react';

function Card({ title, children, className = '' }) {
  return (
    <div className={`bg-white rounded-xl shadow-sm border border-slate-200/80 overflow-hidden hover:shadow-md transition-all duration-300 relative ${className}`}>
      {/* Decorative Top Accent Stripe */}
      <div className="h-1 bg-society-primary w-full"></div>
      
      {title && (
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/60 flex items-center justify-between">
          <h3 className="font-bold text-society-primary text-sm tracking-wide uppercase">{title}</h3>
        </div>
      )}
      <div className="p-6">
        {children}
      </div>
    </div>
  );
}

export default Card;
