import React from 'react';
import Breadcrumbs from './Breadcrumbs';

export function PageHeader({ title, description, children }) {
  return (
    <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-100 pb-5">
      <div className="space-y-1">
        <Breadcrumbs />
        <h1 className="text-2xl font-bold tracking-tight text-slate-800 font-sans md:text-3xl">{title}</h1>
        {description && <p className="text-slate-500 text-sm">{description}</p>}
      </div>
      {children && (
        <div className="flex items-center gap-2 self-start md:self-center">
          {children}
        </div>
      )}
    </div>
  );
}

export default PageHeader;
