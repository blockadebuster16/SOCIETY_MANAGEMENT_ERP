import React, { useState } from 'react';
import { Outlet, useNavigate, NavLink, useLocation } from 'react-router-dom';
import { 
  Shield, UserCheck, History, ClipboardList, Settings, User 
} from 'lucide-react';
import Sidebar from '../components/sidebar/Sidebar';
import Navbar from '../components/navbar/Navbar';
import Breadcrumbs from '../components/common/Breadcrumbs';
import { useAuthContext } from '../context/AuthContext';

function SecurityLayout() {
  const { logout, user } = useAuthContext();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const links = [
    { label: 'Gate Dashboard', path: '/security/dashboard', icon: <Shield className="w-5 h-5" /> },
    { label: 'Profile Info', path: '/security/profile', icon: <User className="w-5 h-5" /> },
    { label: 'Active Visitors', path: '/security/active-visitors', icon: <UserCheck className="w-5 h-5" /> },
    { label: 'Visitor History', path: '/security/visitor-history', icon: <History className="w-5 h-5" /> },
    { label: 'Incident Logs', path: '/security/incident-logs', icon: <ClipboardList className="w-5 h-5" /> },
    { label: 'Settings', path: '/security/settings', icon: <Settings className="w-5 h-5" /> },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-slate-100 dark:bg-slate-950 overflow-hidden relative transition-theme">
      {/* Reusable Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        links={links}
        title="SECURITY GATE"
        titleColor="text-society-secondary"
        onLogout={handleLogout}
      />

      {/* Main Content Pane */}
      <div className="flex-grow flex flex-col overflow-hidden">
        {/* Header Navbar */}
        <Navbar onToggleSidebar={() => setSidebarOpen(true)} />

        {/* Content Body Container */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 pb-20 md:pb-8 space-y-6">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
            <Breadcrumbs />
            {user && (
              <div className="self-start sm:self-auto text-xs bg-amber-500/10 dark:bg-amber-950/20 text-amber-605 dark:text-amber-400 px-3 py-1.5 rounded-lg font-bold border border-amber-500/20">
                Main Gate 1
              </div>
            )}
          </div>
          <main className="animate-in fade-in duration-300">
            <Outlet />
          </main>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-2 px-6 flex justify-between items-center z-45 shadow-lg transition-theme">
        {[
          { label: 'Gate', path: '/security/dashboard', icon: <Shield className="w-5.5 h-5.5" /> },
          { label: 'Active', path: '/security/active-visitors', icon: <UserCheck className="w-5.5 h-5.5" /> },
          { label: 'Incidents', path: '/security/incident-logs', icon: <ClipboardList className="w-5.5 h-5.5" /> },
          { label: 'History', path: '/security/visitor-history', icon: <History className="w-5.5 h-5.5" /> },
          { label: 'Settings', path: '/security/settings', icon: <Settings className="w-5.5 h-5.5" /> }
        ].map((item) => {
          const loc = useLocation();
          const isActive = loc.pathname === item.path;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center gap-0.5 transition ${
                isActive ? 'text-[#D4AF37] font-bold' : 'text-slate-400 dark:text-slate-500 hover:text-slate-655'
              }`}
            >
              {item.icon}
              <span className="text-[9px] tracking-wider">{item.label}</span>
            </NavLink>
          );
        })}
      </div>
    </div>
  );
}

export default SecurityLayout;
