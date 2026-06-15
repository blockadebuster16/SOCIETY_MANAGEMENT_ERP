import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Users, ShieldAlert, HardDrive, 
  Activity, Settings, User
} from 'lucide-react';
import Sidebar from '../components/sidebar/Sidebar';
import Navbar from '../components/navbar/Navbar';
import Breadcrumbs from '../components/common/Breadcrumbs';
import { useAuthContext } from '../context/AuthContext';

function SuperAdminLayout() {
  const { logout, user } = useAuthContext();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const links = [
    { label: 'System Dashboard', path: '/superadmin/dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    { label: 'Profile Info', path: '/superadmin/profile', icon: <User className="w-5 h-5" /> },
    { label: 'User Accounts', path: '/superadmin/users', icon: <Users className="w-5 h-5" /> },
    { label: 'Role Authority', path: '/superadmin/roles', icon: <ShieldAlert className="w-5 h-5" /> },
    { label: 'File Buckets', path: '/superadmin/storage', icon: <HardDrive className="w-5 h-5" /> },
    { label: 'Audit Logs', path: '/superadmin/audit-logs', icon: <Activity className="w-5 h-5" /> },
    { label: 'Portal Properties', path: '/superadmin/settings', icon: <Settings className="w-5 h-5" /> },
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
        title="ROOT ACCESS"
        titleColor="text-rose-500"
        onLogout={handleLogout}
        logoutLabel="Root Exit"
      />

      {/* Main Content Pane */}
      <div className="flex-grow flex flex-col overflow-hidden">
        {/* Header Navbar */}
        <Navbar onToggleSidebar={() => setSidebarOpen(true)} />

        {/* Content Body Container */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
            <Breadcrumbs />
            {user && (
              <div className="self-start sm:self-auto text-xs bg-rose-550/10 dark:bg-rose-950/20 text-rose-500 px-3 py-1.5 rounded-lg font-bold border border-rose-500/20">
                System SuperAdmin
              </div>
            )}
          </div>
          <main className="animate-in fade-in duration-300">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}

export default SuperAdminLayout;
