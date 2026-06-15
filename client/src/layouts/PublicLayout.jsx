import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from '../components/navbar/Navbar';
import Footer from '../components/footer/Footer';

function PublicLayout() {
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-[#060F1C] text-slate-900 dark:text-slate-100 transition-theme">
      {/* Shared Header Navbar */}
      <Navbar />

      {/* Main Body content wrapper – full-bleed on home, constrained on sub-pages */}
      <main className={`flex-grow ${isHomePage ? 'w-full' : 'max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20'} animate-in fade-in duration-300`}>
        <Outlet />
      </main>

      {/* Shared Footer */}
      <Footer />
    </div>
  );
}

export default PublicLayout;
