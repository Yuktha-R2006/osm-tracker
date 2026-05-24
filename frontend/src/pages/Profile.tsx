import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useSearchParams } from 'react-router-dom';
import { User, Mail, Bell, Shield, LogOut, CheckCircle, AlertCircle, Settings, Edit2, Trash2, X, Calendar, Tv } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';

const Profile = () => {
  const { user, logout, updateProfile, updateSettings, deleteAccount } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'profile';
  const [notifications, setNotifications] = useState([]);
  const [stats, setStats] = useState({ total: 0, active: 0, cost: 0 });
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: '',
    email: '',
    favoriteOTT: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name || '',
        email: user.email || '',
        favoriteOTT: user.favoriteOTT || ''
      });
    }
  }, [user]);

  const fetchData = async () => {
    try {
      const [notifRes, subRes] = await Promise.all([
        api.get('/notifications'),
        api.get('/subscriptions')
      ]);
      setNotifications(notifRes.data);
      
      const subs = subRes.data;
      const activeSubs = subs.filter(s => s.status === 'active');
      setStats({
        total: subs.length,
        active: activeSubs.length,
        cost: activeSubs.reduce((acc, curr) => acc + curr.subscriptionCost, 0)
      });
    } catch (error) {
      console.error('Failed to fetch profile data', error);
    }
  };

  const handleMarkAsRead = async () => {
    try {
      await api.put('/notifications/read');
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (error) {
      console.error('Failed to mark notifications as read', error);
    }
  };

  const handleToggleEmail = async () => {
    try {
      await updateSettings({ emailNotifications: !user?.emailNotifications });
      toast.success('Email preferences updated');
    } catch (error) {
      toast.error('Failed to update email preferences');
    }
  };

  const handleToggleAutoRenewal = async () => {
    try {
      await updateSettings({ autoRenewalAlerts: !user?.autoRenewalAlerts });
      toast.success('Auto-renewal alerts updated');
    } catch (error) {
      toast.error('Failed to update auto-renewal alerts');
    }
  };

  const handleToggleDarkMode = async () => {
    try {
      await toggleTheme();
      toast.success('Theme preference updated');
    } catch (error) {
      toast.error('Failed to save theme choice');
    }
  };

  const handleDeleteAccount = async () => {
    if (window.confirm('WARNING: Are you sure you want to permanently delete your account? All subscriptions, notifications, and watch logs will be deleted. This cannot be undone.')) {
      try {
        await deleteAccount();
        toast.success('Account deleted successfully');
      } catch (error) {
        console.error(error);
        toast.error('Failed to delete account');
      }
    }
  };

  const handleEditProfileSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateProfile(profileForm);
      setIsEditProfileOpen(false);
      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error(error);
      toast.error('Failed to update profile');
    }
  };

  const getNotificationIcon = (type) => {
    switch(type) {
      case 'expiry': return <AlertCircle className="text-orange-400" size={20} />;
      case 'expired': return <AlertCircle className="text-red-400" size={20} />;
      case 'renewal': return <CheckCircle className="text-green-400" size={20} />;
      default: return <Bell className="text-blue-400" size={20} />;
    }
  };

  const getInitials = (name?: string) => {
    if (!name) return 'JD';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className="max-w-6xl mx-auto pb-20 md:pb-0 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">Profile & Settings</h1>
          <p className="text-slate-400">Manage your account and preferences</p>
        </div>
        
        {/* URL Tab Switcher Buttons */}
        <div className="flex bg-slate-900/60 backdrop-blur-sm rounded-xl p-1 border border-white/10 shadow-lg">
          <button 
            onClick={() => setSearchParams({ tab: 'profile' })}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 cursor-pointer ${
              activeTab === 'profile' 
                ? 'bg-gradient-to-r from-[#ff0055] to-[#ff0055]/85 text-white' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            My Profile
          </button>
          <button 
            onClick={() => setSearchParams({ tab: 'settings' })}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 cursor-pointer ${
              activeTab === 'settings' 
                ? 'bg-gradient-to-r from-[#00f0ff] to-[#00f0ff]/85 text-slate-900' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Settings
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: User Profile Card / Preferences */}
        <div className="lg:col-span-1 space-y-8">
          
          {activeTab === 'profile' ? (
            <div className="glass-panel backdrop-blur-xl bg-white/5 border border-white/10 p-8 text-center relative overflow-hidden transition-all duration-300">
              <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-br from-[#ff0055]/30 to-[#00f0ff]/30 animate-pulse-glow"></div>
              
              <div className="w-28 h-28 rounded-full bg-slate-900/60 backdrop-blur-sm border-4 border-[#0f172a] mx-auto mb-4 relative z-10 flex items-center justify-center overflow-hidden shadow-2xl shadow-black/30 hover:scale-105 transition-transform duration-300">
                <span className="text-3xl font-extrabold text-white">
                  {getInitials(user?.name)}
                </span>
              </div>
              
              <h2 className="text-2xl font-bold text-white mb-1">{user?.name}</h2>
              <p className="text-slate-400 flex items-center justify-center gap-2 text-sm mb-2">
                <Mail size={14} /> {user?.email}
              </p>
              
              <div className="flex flex-col gap-2 items-center mb-6">
                <div className="inline-flex items-center gap-1 px-3 py-1 bg-[#00f0ff]/10 border border-[#00f0ff]/30 rounded-full text-xs text-[#00f0ff]">
                  <Shield size={12} /> {user?.isPremium ? 'Premium Member' : 'Normal User'}
                </div>
                {user?.favoriteOTT && (
                  <div className="inline-flex items-center gap-1 text-xs text-slate-400">
                    <Tv size={12} /> Fav OTT: <span className="text-white font-medium">{user.favoriteOTT}</span>
                  </div>
                )}
                {user?.joinedDate && (
                  <div className="inline-flex items-center gap-1 text-[11px] text-slate-500">
                    <Calendar size={11} /> Joined: <span className="font-medium">{new Date(user.joinedDate).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-4 border-t border-white/10 pt-6">
                <div className="p-3 bg-slate-900/30 backdrop-blur-sm rounded-xl border border-white/5 hover:border-white/10 transition-all duration-300">
                  <p className="text-3xl font-bold text-white mb-1">{stats.active}</p>
                  <p className="text-xs text-slate-400 uppercase tracking-wider">Active Subs</p>
                </div>
                <div className="p-3 bg-slate-900/30 backdrop-blur-sm rounded-xl border border-white/5 hover:border-white/10 transition-all duration-300">
                  <p className="text-3xl font-bold text-[#00f0ff] mb-1">${stats.cost.toFixed(2)}</p>
                  <p className="text-xs text-slate-400 uppercase tracking-wider">Monthly Cost</p>
                </div>
              </div>

              <button 
                onClick={() => setIsEditProfileOpen(true)}
                className="w-full mt-6 py-2.5 flex items-center justify-center gap-2 text-slate-300 hover:text-white bg-slate-800/60 hover:bg-slate-700/60 border border-white/10 rounded-xl transition-all duration-300 text-sm font-medium cursor-pointer"
              >
                <Edit2 size={16} />
                Edit Profile
              </button>
            </div>
          ) : (
            <div className="glass-panel backdrop-blur-xl bg-white/5 border border-[#00f0ff]/30 shadow-[0_0_20px_rgba(0,240,255,0.15)] p-6 transition-all duration-300">
              <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <Settings className="text-[#00f0ff] animate-spin-slow" size={20} /> App Settings
              </h3>
              
              <div className="space-y-4">
                {/* Email Toggle */}
                <div className="flex items-center justify-between p-4 bg-slate-900/30 backdrop-blur-sm rounded-xl border border-white/10 hover:border-white/20 transition-all duration-300">
                  <div>
                    <p className="text-sm font-medium text-white">Email Notifications</p>
                    <p className="text-xs text-slate-400">Receive alerts via email</p>
                  </div>
                  <div 
                    onClick={handleToggleEmail}
                    className={`w-12 h-6 rounded-full relative cursor-pointer transition-all duration-300 ${
                      user?.emailNotifications 
                        ? 'bg-[#ff0055] shadow-[0_0_10px_rgba(255,0,85,0.4)]' 
                        : 'bg-slate-700 border border-white/5'
                    }`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 left-0.5 shadow-md transition-transform duration-300 transform ${
                      user?.emailNotifications ? 'translate-x-6' : 'translate-x-0'
                    }`}></div>
                  </div>
                </div>
                
                {/* Auto-Renewal Toggle */}
                <div className="flex items-center justify-between p-4 bg-slate-900/30 backdrop-blur-sm rounded-xl border border-white/10 hover:border-white/20 transition-all duration-300">
                  <div>
                    <p className="text-sm font-medium text-white">Auto-Renewal Alerts</p>
                    <p className="text-xs text-slate-400">Before card charge</p>
                  </div>
                  <div 
                    onClick={handleToggleAutoRenewal}
                    className={`w-12 h-6 rounded-full relative cursor-pointer transition-all duration-300 ${
                      user?.autoRenewalAlerts 
                        ? 'bg-[#ff0055] shadow-[0_0_10px_rgba(255,0,85,0.4)]' 
                        : 'bg-slate-700 border border-white/5'
                    }`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 left-0.5 shadow-md transition-transform duration-300 transform ${
                      user?.autoRenewalAlerts ? 'translate-x-6' : 'translate-x-0'
                    }`}></div>
                  </div>
                </div>

                {/* Dark Mode Toggle */}
                <div className="flex items-center justify-between p-4 bg-slate-900/30 backdrop-blur-sm rounded-xl border border-white/10 hover:border-white/20 transition-all duration-300">
                  <div>
                    <p className="text-sm font-medium text-white">Dark Mode</p>
                    <p className="text-xs text-slate-400">Switch between light and dark theme</p>
                  </div>
                  <div 
                    onClick={handleToggleDarkMode}
                    className={`w-12 h-6 rounded-full relative cursor-pointer transition-all duration-300 ${
                      theme === 'dark' 
                        ? 'bg-[#00f0ff] shadow-[0_0_10px_rgba(0,240,255,0.4)]' 
                        : 'bg-slate-700 border border-white/5'
                    }`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 left-0.5 shadow-md transition-transform duration-300 transform ${
                      theme === 'dark' ? 'translate-x-6' : 'translate-x-0'
                    }`}></div>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-white/10 space-y-3">
                <button 
                  onClick={logout}
                  className="w-full py-3 flex items-center justify-center gap-2 text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-all duration-300 font-medium border border-white/10 cursor-pointer"
                >
                  <LogOut size={18} />
                  Sign Out
                </button>

                <button 
                  onClick={handleDeleteAccount}
                  className="w-full py-3 flex items-center justify-center gap-2 text-red-500 bg-red-500/10 hover:bg-red-500/20 rounded-xl transition-all duration-300 font-medium border border-red-500/30 hover:border-red-500/50 hover:shadow-lg hover:shadow-red-500/20 cursor-pointer"
                >
                  <Trash2 size={18} />
                  Delete Account
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Notifications */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-panel backdrop-blur-xl bg-white/5 border border-white/10 p-6 h-full flex flex-col min-h-[500px]">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Bell className="text-[#00f0ff]" /> Notifications Feed
              </h3>
              
              {notifications.some(n => !n.isRead) && (
                <button 
                  onClick={handleMarkAsRead}
                  className="text-xs text-[#00f0ff] hover:text-white transition-colors hover:scale-105 transform duration-200 cursor-pointer"
                >
                  Mark all as read
                </button>
              )}
            </div>

            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-4 max-h-[600px]">
              {notifications.length === 0 ? (
                <div className="text-center py-20 text-slate-400">
                  <Bell size={40} className="mx-auto mb-3 opacity-50" />
                  <p>You're all caught up!</p>
                </div>
              ) : (
                notifications.map(notif => (
                  <div 
                    key={notif._id} 
                    className={`p-4 rounded-xl border flex gap-4 transition-all duration-300 ${
                      notif.isRead 
                        ? 'bg-slate-900/30 backdrop-blur-sm border-white/5 opacity-70' 
                        : 'bg-slate-800/60 backdrop-blur-sm border-white/10 shadow-lg relative hover:border-white/20'
                    }`}
                  >
                    {!notif.isRead && (
                      <div className="absolute -left-1.5 -top-1.5 w-3 h-3 bg-[#ff0055] rounded-full border-2 border-[#1e293b] shadow-[0_0_10px_rgba(255,0,85,0.5)]"></div>
                    )}
                    <div className="mt-1">
                      {getNotificationIcon(notif.type)}
                    </div>
                    <div className="flex-1">
                      <p className={`text-sm ${notif.isRead ? 'text-slate-300' : 'text-white font-medium'} mb-1`}>
                        {notif.message}
                      </p>
                      <p className="text-xs text-slate-500">
                        {new Date(notif.createdAt).toLocaleDateString()} at {new Date(notif.createdAt).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {isEditProfileOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-[#1e293b]/80 backdrop-blur-xl border border-white/10 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl shadow-black/50 animate-in zoom-in-95 duration-300">
            <div className="flex justify-between items-center p-5 border-b border-white/10">
              <h2 className="text-xl font-bold text-white bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">Edit Profile</h2>
              <button onClick={() => setIsEditProfileOpen(false)} className="text-slate-400 hover:text-white transition-colors hover:scale-110 transform duration-200 cursor-pointer">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleEditProfileSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Name</label>
                <input
                  type="text"
                  required
                  value={profileForm.name}
                  onChange={(e) => setProfileForm({...profileForm, name: e.target.value})}
                  className="w-full bg-slate-900/60 backdrop-blur-sm border border-white/10 rounded-lg py-2.5 px-3 text-white placeholder-slate-500 focus:outline-none focus:border-[#00f0ff] focus:shadow-[0_0_15px_rgba(0,240,255,0.3)] transition-all duration-300"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Email</label>
                <input
                  type="email"
                  required
                  value={profileForm.email}
                  onChange={(e) => setProfileForm({...profileForm, email: e.target.value})}
                  className="w-full bg-slate-900/60 backdrop-blur-sm border border-white/10 rounded-lg py-2.5 px-3 text-white placeholder-slate-500 focus:outline-none focus:border-[#00f0ff] focus:shadow-[0_0_15px_rgba(0,240,255,0.3)] transition-all duration-300"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Favorite OTT Platform</label>
                <input
                  type="text"
                  placeholder="e.g. Netflix"
                  value={profileForm.favoriteOTT}
                  onChange={(e) => setProfileForm({...profileForm, favoriteOTT: e.target.value})}
                  className="w-full bg-slate-900/60 backdrop-blur-sm border border-white/10 rounded-lg py-2.5 px-3 text-white placeholder-slate-500 focus:outline-none focus:border-[#00f0ff] focus:shadow-[0_0_15px_rgba(0,240,255,0.3)] transition-all duration-300"
                />
              </div>

              <div className="pt-4 border-t border-white/10 mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditProfileOpen(false)}
                  className="px-4 py-2 text-slate-300 hover:text-white font-medium transition-colors hover:bg-white/5 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-gradient-to-r from-[#ff0055] to-[#ff0055]/80 hover:from-[#ff0055]/90 text-white rounded-lg font-bold transition-all duration-300 shadow-[0_0_15px_rgba(255,0,85,0.3)] hover:scale-105 cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
