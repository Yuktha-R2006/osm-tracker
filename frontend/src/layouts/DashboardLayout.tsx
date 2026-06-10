import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { LayoutDashboard, CreditCard, User, LogOut, Shield, Users, MonitorPlay, Bell, Menu, X, Search, ChevronDown, Settings, BarChart2 } from 'lucide-react';
import NotificationDropdown from '../components/NotificationDropdown';

const DashboardLayout = () => {
  const { user, logout, searchQuery, setSearchQuery } = useAuth();
  const { unreadCount } = useNotifications();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={20} /> },
    { name: 'Profile', path: '/profile', icon: <User size={20} /> }
  ];

  const adminLinks = [
    { name: 'Admin Dashboard', path: '/admin', icon: <Shield size={20} /> },
    { name: 'Users', path: '/admin/users', icon: <Users size={20} /> },
    { name: 'Platforms', path: '/admin/platforms', icon: <MonitorPlay size={20} /> },
    { name: 'Analytics', path: '/admin/analytics', icon: <BarChart2 size={20} /> },
    { name: 'Settings', path: '/admin/settings', icon: <Settings size={20} /> },
  ];

  const getInitials = (name?: string) => {
    if (!name) return 'JD';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="flex h-screen bg-[#0f172a] text-slate-200 font-sans overflow-hidden">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-[#1e293b] border-r border-slate-700">
        <div className="p-6">
          <h1 className="text-2xl font-bold gradient-text tracking-tight flex items-center gap-2">
            <MonitorPlay className="text-primary" />
            OSM Tracker
          </h1>
        </div>
        
        <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
          {user?.role === 'admin' ? (
            <>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 mt-4 px-2">Admin Portal</p>
              {adminLinks.map((link) => (
                <NavLink
                  key={link.path}
                  to={link.path}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                      isActive ? 'bg-secondary/20 text-secondary' : 'hover:bg-slate-800 hover:text-white'
                    }`
                  }
                >
                  {link.icon}
                  {link.name}
                </NavLink>
              ))}
            </>
          ) : (
            <>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 mt-4 px-2">Menu</p>
              {navLinks.map((link) => (
                <NavLink
                  key={link.path}
                  to={link.path}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                      isActive ? 'bg-primary/20 text-primary' : 'hover:bg-slate-800 hover:text-white'
                    }`
                  }
                >
                  {link.icon}
                  {link.name}
                </NavLink>
              ))}
            </>
          )}
        </nav>

        <div className="p-4 border-t border-slate-700">
          <div className="flex items-center gap-3 px-3 py-2 mb-4 bg-slate-800/40 rounded-xl border border-white/5">
            <div className="w-10 h-10 rounded-full bg-linear-to-tr from-primary to-secondary flex items-center justify-center font-bold text-slate-900 shadow-md">
              {getInitials(user?.name)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user?.name}</p>
              <p className="text-xs text-slate-400 truncate">
                {user?.role === 'admin' ? 'Administrator' : (user?.isPremium ? 'Premium User' : 'Normal User')}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between p-4 bg-[#1e293b] border-b border-slate-700 relative z-40">
          <h1 className="text-xl font-bold gradient-text flex items-center gap-2">
            <MonitorPlay size={24} className="text-primary" />
            OSM
          </h1>
          <div className="flex items-center gap-4">
            <div className="relative">
              <button onClick={() => setNotifOpen(!notifOpen)} className="text-slate-400 hover:text-white">
                <Bell size={24} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-primary rounded-full border-2 border-[#1e293b] flex items-center justify-center text-[8px] font-bold text-white">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>
            </div>
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-slate-400 hover:text-white">
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </header>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute top-[73px] left-0 right-0 bottom-0 bg-[#0f172a]/95 backdrop-blur-xl z-50 flex flex-col animate-in slide-in-from-top duration-300">
             <nav className="flex-1 p-4 space-y-2 overflow-y-auto custom-scrollbar">
                {user?.role === 'admin' ? (
                  <>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 mt-4 px-2">Admin Portal</p>
                    {adminLinks.map((link) => (
                      <NavLink
                        key={link.path}
                        to={link.path}
                        onClick={() => setMobileMenuOpen(false)}
                        className={({ isActive }) =>
                          `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                            isActive ? 'bg-secondary/20 text-secondary shadow-[0_0_10px_rgba(0,240,255,0.3)]' : 'hover:bg-slate-800/60 hover:text-white'
                          }`
                        }
                      >
                        {link.icon}
                        {link.name}
                      </NavLink>
                    ))}
                  </>
                ) : (
                  <>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 mt-4 px-2">Menu</p>
                    {navLinks.map((link) => (
                      <NavLink
                        key={link.path}
                        to={link.path}
                        onClick={() => setMobileMenuOpen(false)}
                        className={({ isActive }) =>
                          `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                            isActive ? 'bg-primary/20 text-primary shadow-[0_0_10px_rgba(255,0,85,0.3)]' : 'hover:bg-slate-800/60 hover:text-white'
                          }`
                        }
                      >
                        {link.icon}
                        {link.name}
                      </NavLink>
                    ))}
                  </>
                )}
              </nav>
              <div className="p-4 border-t border-white/10 pb-8">
                <div className="flex items-center gap-3 px-4 py-3 mb-4 bg-slate-800/30 backdrop-blur-sm rounded-xl">
                  <div className="w-10 h-10 rounded-full bg-linear-to-tr from-primary to-secondary flex items-center justify-center font-bold text-slate-900 shadow-md">
                    {getInitials(user?.name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{user?.name}</p>
                    <p className="text-xs text-slate-400 truncate">
                      {user?.role === 'admin' ? 'Administrator' : (user?.isPremium ? 'Premium Member' : 'Normal User')}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center justify-center gap-3 w-full px-4 py-3 bg-slate-800/60 backdrop-blur-sm hover:bg-slate-700/60 text-red-400 rounded-xl transition-all duration-300 border border-white/10"
                >
                  <LogOut size={20} />
                  Logout
                </button>
              </div>
          </div>
        )}

        {/* Desktop Header */}
        <header className="hidden md:flex items-center justify-between p-6 bg-transparent relative z-40">
          {/* Dynamic Search Bar */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input
                type="text"
                placeholder="Search platforms, plans or subscriptions..."
                className="w-full bg-slate-900/60 backdrop-blur-sm border border-slate-700 rounded-xl py-2.5 pl-10 pr-4 text-white placeholder-slate-500 focus:outline-none focus:border-secondary focus:shadow-[0_0_15px_rgba(0,240,255,0.3)] transition-all duration-300"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Notification Bell */}
            <div className="relative">
              <button 
                onClick={() => setNotifOpen(!notifOpen)}
                className="p-2 text-slate-400 hover:text-white bg-slate-800/50 rounded-full border border-slate-700 backdrop-blur-sm relative transition-colors"
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full border-2 border-[#0f172a] flex items-center justify-center text-[9px] font-bold text-white">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>
              <NotificationDropdown isOpen={notifOpen} onClose={() => setNotifOpen(false)} />
            </div>

            {/* Profile Dropdown Area */}
            <div className="relative">
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-3 px-3 py-1.5 rounded-xl bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700 transition-all duration-300 cursor-pointer"
              >
                <div className="w-8 h-8 rounded-full bg-linear-to-tr from-primary to-secondary flex items-center justify-center text-sm font-bold text-slate-900 shadow-md">
                  {getInitials(user?.name)}
                </div>
                <div className="hidden lg:flex flex-col text-left">
                  <span className="text-xs font-semibold text-white leading-tight">{user?.name}</span>
                  <span className="text-[10px] text-secondary font-medium leading-none">
                    {user?.role === 'admin' ? 'Admin' : (user?.isPremium ? 'Premium User' : 'Normal User')}
                  </span>
                </div>
                <ChevronDown size={14} className="text-slate-400" />
              </button>

              {profileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-[#1e293b]/90 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl z-50 py-2 animate-in fade-in slide-in-from-top-2 duration-200">
                  {user?.role === 'admin' ? (
                    <>
                      <button 
                        onClick={() => { navigate('/admin/settings'); setProfileDropdownOpen(false); }}
                        className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:text-white hover:bg-white/5 flex items-center gap-2 transition-colors cursor-pointer"
                      >
                        <Settings size={16} /> Settings
                      </button>
                    </>
                  ) : (
                    <>
                      <button 
                        onClick={() => { navigate('/profile'); setProfileDropdownOpen(false); }}
                        className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:text-white hover:bg-white/5 flex items-center gap-2 transition-colors cursor-pointer"
                      >
                        <User size={16} /> My Profile
                      </button>
                      <button 
                        onClick={() => { navigate('/profile?tab=settings'); setProfileDropdownOpen(false); }}
                        className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:text-white hover:bg-white/5 flex items-center gap-2 transition-colors cursor-pointer"
                      >
                        <Settings size={16} /> Settings
                      </button>
                    </>
                  )}
                  <hr className="border-white/10 my-1" />
                  <button 
                    onClick={() => { handleLogout(); setProfileDropdownOpen(false); }}
                    className="w-full text-left px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-white/5 flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <LogOut size={16} /> Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar relative z-10">
          <Outlet />
        </div>
        
        {/* Background Decorative Elements */}
        <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-[-10%] left-[-5%] w-96 h-96 bg-secondary/10 rounded-full blur-3xl pointer-events-none"></div>
      </main>
    </div>
  );
};

export default DashboardLayout;
