import React from 'react';
import { NavLink } from 'react-router-dom';
import { LogOut } from 'lucide-react';

export function Sidebar({
  isOpen,
  onClose,
  links = [],
  title = 'PORTAL',
  titleColor = 'text-society-secondary',
  onLogout,
  logoutLabel = 'Sign Out'
}) {
  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/50 z-30 md:hidden backdrop-blur-sm transition-all duration-300"
        ></div>
      )}

      {/* Sidebar Panel */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-40 w-64 shrink-0 bg-society-primary text-white flex flex-col transform transition-transform duration-300 ease-in-out md:translate-x-0 border-r border-slate-800/50 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header Block */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={`font-extrabold text-lg tracking-wider ${titleColor}`}>
              {title}
            </span>
          </div>
          <button
            onClick={onClose}
            className="md:hidden text-slate-400 hover:text-white text-2xl font-bold focus:outline-none"
            aria-label="Close Sidebar"
          >
            ×
          </button>
        </div>

        {/* Dynamic Navigation list */}
        <nav className="flex-1 p-4 space-y-1 text-sm overflow-y-auto">
          {links.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-society-secondary text-society-primary font-bold shadow-md shadow-yellow-500/10'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`
              }
            >
              {link.icon && <span className="w-5 h-5">{link.icon}</span>}
              <span>{link.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Footer Block / Sign out button */}
        {onLogout && (
          <div className="p-4 border-t border-slate-800">
            <button
              onClick={onLogout}
              className="flex items-center justify-center gap-2 w-full bg-slate-800/80 hover:bg-rose-700/90 text-white font-medium py-2.5 px-4 rounded-lg text-xs tracking-wide transition-all duration-200"
            >
              <LogOut className="w-4 h-4" />
              <span>{logoutLabel}</span>
            </button>
          </div>
        )}
      </aside>
    </>
  );
}

export default Sidebar;
