import React, { useState } from 'react';
import { Outlet, useNavigate, NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Megaphone, FolderOpen, Calendar, 
  AlertTriangle, Users, CreditCard, Image, Bot, BarChart3, User
} from 'lucide-react';
import Sidebar from '../components/sidebar/Sidebar';
import Navbar from '../components/navbar/Navbar';
import Breadcrumbs from '../components/common/Breadcrumbs';
import { useAuthContext } from '../context/AuthContext';

function AdminLayout() {
  const { logout, user } = useAuthContext();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const links = [
    { label: 'Admin Dashboard', path: '/admin/dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    { label: 'Profile Info', path: '/admin/profile', icon: <User className="w-5 h-5" /> },
    { label: 'Manage Notices', path: '/admin/notices', icon: <Megaphone className="w-5 h-5" /> },
    { label: 'Manage Documents', path: '/admin/documents', icon: <FolderOpen className="w-5 h-5" /> },
    { label: 'Manage Events', path: '/admin/events', icon: <Calendar className="w-5 h-5" /> },
    { label: 'Manage Complaints', path: '/admin/complaints', icon: <AlertTriangle className="w-5 h-5" /> },
    { label: 'Manage Residents', path: '/admin/residents', icon: <Users className="w-5 h-5" /> },
    { label: 'Manage Payments', path: '/admin/payments', icon: <CreditCard className="w-5 h-5" /> },
    { label: 'Manage Gallery', path: '/admin/gallery', icon: <Image className="w-5 h-5" /> },
    { label: 'AI Chatbot Training', path: '/admin/chatbot-training', icon: <Bot className="w-5 h-5" /> },
    { label: 'Reports & Analytics', path: '/admin/analytics', icon: <BarChart3 className="w-5 h-5" /> },
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
        title="ADMIN PANEL"
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
              <div className="self-start sm:self-auto text-xs bg-rose-600/10 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 px-3 py-1.5 rounded-lg font-bold border border-rose-650/25">
                Committee Officer
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
          { label: 'Dashboard', path: '/admin/dashboard', icon: <LayoutDashboard className="w-5.5 h-5.5" /> },
          { label: 'Notices', path: '/admin/notices', icon: <Megaphone className="w-5.5 h-5.5" /> },
          { label: 'Payments', path: '/admin/payments', icon: <CreditCard className="w-5.5 h-5.5" /> },
          { label: 'Complaints', path: '/admin/complaints', icon: <AlertTriangle className="w-5.5 h-5.5" /> },
          { label: 'Analytics', path: '/admin/analytics', icon: <BarChart3 className="w-5.5 h-5.5" /> }
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

export default AdminLayout;
