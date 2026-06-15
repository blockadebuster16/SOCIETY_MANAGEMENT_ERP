import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export function Breadcrumbs() {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter(x => x);

  if (pathnames.length === 0) return null;

  return (
    <nav className="flex text-slate-500 text-xs font-semibold tracking-wide" aria-label="Breadcrumb">
      <ol className="inline-flex items-center space-x-1 md:space-x-2">
        <li className="inline-flex items-center">
          <Link to="/" className="hover:text-society-secondary transition-colors duration-150">
            Portal
          </Link>
        </li>
        {pathnames.map((name, index) => {
          const routeTo = `/${pathnames.slice(0, index + 1).join('/')}`;
          const isLast = index === pathnames.length - 1;
          const displayLabel = name.charAt(0).toUpperCase() + name.slice(1).replace('-', ' ');

          return (
            <li key={routeTo} className="flex items-center">
              <span className="mx-2 text-slate-400 font-bold">/</span>
              {isLast ? (
                <span className="text-society-primary font-bold">{displayLabel}</span>
              ) : (
                <Link to={routeTo} className="hover:text-society-secondary transition-colors duration-150">
                  {displayLabel}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export default Breadcrumbs;
