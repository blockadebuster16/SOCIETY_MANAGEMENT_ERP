import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { Sun, Moon, Menu, X, Bell, User, LogOut, ChevronDown } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAuthContext } from '../../context/AuthContext';

const publicNavLinks = [
  { label: 'Home', to: '/' },
  { label: 'About', to: '/about' },
  { label: 'Notices', to: '/notices' },
  { label: 'Events', to: '/events' },
  { label: 'Gallery', to: '/gallery' },
  { label: 'Downloads', to: '/downloads' },
  { label: 'Contact', to: '/contact' },
];

export function Navbar({ onToggleSidebar }) {
  const { theme, toggleTheme } = useTheme();
  const { user, logout, isAuthenticated } = useAuthContext();
  const navigate = useNavigate();
  const location = useLocation();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const isHomePage = location.pathname === '/';

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => { setMobileMenuOpen(false); }, [location.pathname]);

  const handleLogout = () => {
    logout();
    setProfileDropdownOpen(false);
    navigate('/login');
  };

  const isTransparent = isHomePage && !scrolled;

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-in-out ${
          isTransparent
            ? 'bg-transparent border-b border-white/10'
            : 'bg-white/95 dark:bg-[#0A1628]/97 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-700/50 shadow-lg shadow-black/5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-18 py-3">

            {/* Logo */}
            {onToggleSidebar ? (
              <div className="flex items-center gap-3">
                <button
                  onClick={onToggleSidebar}
                  className="md:hidden text-society-primary dark:text-slate-300 hover:text-society-secondary focus:outline-none p-1.5 rounded-md"
                  aria-label="Toggle Navigation Menu"
                >
                  <Menu className="w-6 h-6" />
                </button>
                <Link to="/" className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#D4AF37] to-[#AA820A] flex items-center justify-center shadow-md">
                    <span className="text-white font-black text-xs">SP</span>
                  </div>
                  <span className="text-society-primary dark:text-white font-black text-base tracking-wider hidden sm:block">
                    SUYASH PRIDE
                  </span>
                </Link>
              </div>
            ) : (
              <Link to="/" className="flex items-center gap-3 group">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#D4AF37] to-[#8B6914] flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-300">
                  <span className={`font-black text-sm ${isTransparent ? 'text-[#0A1628]' : 'text-white'}`}>SP</span>
                </div>
                <div className="flex flex-col leading-none">
                  <span className={`font-black text-base tracking-widest transition-colors duration-300 ${
                    isTransparent ? 'text-white' : 'text-[#0A1628] dark:text-white'
                  }`}>
                    SUYASH PRIDE
                  </span>
                  <span className={`text-[9px] font-semibold tracking-[0.25em] uppercase transition-colors duration-300 ${
                    isTransparent ? 'text-[#D4AF37]' : 'text-[#D4AF37]'
                  }`}>
                    Housing Society Ltd.
                  </span>
                </div>
              </Link>
            )}

            {/* Desktop Nav Links – only on public layout (no sidebar toggle) */}
            {!onToggleSidebar && (
              <nav className="hidden lg:flex items-center gap-1">
                {publicNavLinks.map((link) => (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    end={link.to === '/'}
                    className={({ isActive }) =>
                      `relative px-4 py-2 text-[11px] font-bold tracking-[0.15em] uppercase transition-all duration-200 group
                      ${isTransparent
                        ? `text-white/90 hover:text-white`
                        : `text-[#0A1628] dark:text-slate-200 hover:text-[#D4AF37] dark:hover:text-[#D4AF37]`
                      }
                      ${isActive ? (isTransparent ? '!text-[#D4AF37]' : '!text-[#D4AF37]') : ''}`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        {link.label}
                        <span className={`absolute bottom-0 left-1/2 -translate-x-1/2 h-[2px] bg-[#D4AF37] rounded-full transition-all duration-300 ${
                          isActive ? 'w-4/5' : 'w-0 group-hover:w-4/5'
                        }`} />
                      </>
                    )}
                  </NavLink>
                ))}
              </nav>
            )}

            {/* Right Controls */}
            <div className="flex items-center gap-2">
              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className={`p-2 rounded-lg transition-all duration-200 ${
                  isTransparent
                    ? 'text-white/80 hover:text-white hover:bg-white/10'
                    : 'text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
                aria-label="Toggle Theme"
              >
                {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>

              {isAuthenticated && (
                <>
                  <button
                    className={`p-2 rounded-lg relative transition-all duration-200 ${
                      isTransparent
                        ? 'text-white/80 hover:text-white hover:bg-white/10'
                        : 'text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                    aria-label="Notifications"
                  >
                    <Bell className="w-4 h-4" />
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 border border-white dark:border-slate-900 rounded-full" />
                  </button>

                  <div className="relative">
                    <button
                      onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                      className={`flex items-center gap-2 p-1.5 rounded-full border transition-all duration-200 ${
                        isTransparent
                          ? 'border-white/30 hover:border-[#D4AF37]'
                          : 'border-slate-200 dark:border-slate-700 hover:border-[#D4AF37]'
                      }`}
                    >
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#D4AF37] to-[#8B6914] text-white flex items-center justify-center font-bold text-xs shadow-sm">
                        {user?.first_name?.charAt(0) || <User className="w-3 h-3" />}
                      </div>
                      <ChevronDown className={`w-3 h-3 transition-transform ${profileDropdownOpen ? 'rotate-180' : ''} ${isTransparent ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`} />
                    </button>

                    {profileDropdownOpen && (
                      <>
                        <div onClick={() => setProfileDropdownOpen(false)} className="fixed inset-0 z-40" />
                        <div className="absolute right-0 mt-2 w-56 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                          <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700">
                            <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                              {user?.first_name} {user?.last_name}
                            </p>
                            <p className="text-xs text-slate-400 truncate mt-0.5">{user?.email}</p>
                            <span className="inline-block mt-1.5 text-[9px] font-bold bg-[#D4AF37]/15 text-[#8B6914] dark:text-[#D4AF37] px-2 py-0.5 rounded-full uppercase tracking-widest">
                              {user?.role?.replace('_', ' ')}
                            </span>
                          </div>
                          <Link
                            to={`/${user?.role === 'resident' ? 'resident' : user?.role === 'security' ? 'security' : 'admin'}/profile`}
                            onClick={() => setProfileDropdownOpen(false)}
                            className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition"
                          >
                            <User className="w-4 h-4" />
                            <span>My Profile</span>
                          </Link>
                          <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition text-left"
                          >
                            <LogOut className="w-4 h-4" />
                            <span>Sign Out</span>
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </>
              )}

              {!isAuthenticated && !onToggleSidebar && (
                <Link
                  to="/login"
                  className="hidden sm:inline-flex items-center gap-2 bg-gradient-to-r from-[#D4AF37] to-[#AA820A] hover:from-[#E5C142] hover:to-[#C49A0D] text-[#0A1628] font-bold px-5 py-2.5 rounded-lg text-[11px] tracking-widest uppercase transition-all duration-200 shadow-lg shadow-[#D4AF37]/20 hover:shadow-[#D4AF37]/40"
                >
                  Member Portal
                </Link>
              )}

              {/* Mobile Hamburger (public layout only) */}
              {!onToggleSidebar && (
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className={`lg:hidden p-2 rounded-lg transition-all duration-200 ${
                    isTransparent
                      ? 'text-white/90 hover:bg-white/10'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                  aria-label="Toggle mobile menu"
                >
                  {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {!onToggleSidebar && mobileMenuOpen && (
          <div className="lg:hidden bg-white/98 dark:bg-[#0A1628]/98 backdrop-blur-xl border-t border-slate-200/50 dark:border-slate-700/50 shadow-2xl">
            <nav className="flex flex-col py-4 px-6 gap-1">
              {publicNavLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.to === '/'}
                  className={({ isActive }) =>
                    `py-3 px-4 text-sm font-bold tracking-widest uppercase rounded-lg transition-all duration-200 ${
                      isActive
                        ? 'text-[#D4AF37] bg-[#D4AF37]/10'
                        : 'text-slate-700 dark:text-slate-200 hover:text-[#D4AF37] hover:bg-[#D4AF37]/5'
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              ))}
              {!isAuthenticated && (
                <Link
                  to="/login"
                  className="mt-2 bg-gradient-to-r from-[#D4AF37] to-[#AA820A] text-[#0A1628] font-bold py-3 px-4 rounded-lg text-sm tracking-widest uppercase text-center"
                >
                  Member Portal
                </Link>
              )}
            </nav>
          </div>
        )}
      </header>
    </>
  );
}

export default Navbar;
