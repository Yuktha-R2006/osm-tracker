import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { 
  User, 
  Mail, 
  Lock, 
  Shield, 
  Settings, 
  Sliders, 
  RefreshCw, 
  AlertTriangle, 
  Check, 
  Play, 
  BellRing,
  HelpCircle,
  Database
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../services/api';

const AdminSettings: React.FC = () => {
  const { user } = useAuth();
  const { refreshAllData } = useData();
  const [profileForm, setProfileForm] = useState({
    name: '',
    email: '',
    currentPassword: '',
    newPassword: ''
  });
  const [updatingProfile, setUpdatingProfile] = useState(false);

  // App configurations state
  const [alertThreshold, setAlertThreshold] = useState(7); // days before subscription expires to alert
  const [sessionTimeout, setSessionTimeout] = useState(30); // minutes
  const [enableAlerts, setEnableAlerts] = useState(true);
  const [debugLogs, setDebugLogs] = useState(false);
  
  // Cron simulation states
  const [isSimulating, setIsSimulating] = useState(false);
  const [simStep, setSimStep] = useState(0);
  const [simLog, setSimLog] = useState<string[]>([]);

  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name || '',
        email: user.email || '',
        currentPassword: '',
        newPassword: ''
      });
    }
  }, [user]);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileForm.name || !profileForm.email) {
      toast.error('Name and Email are required');
      return;
    }

    try {
      setUpdatingProfile(true);
      const payload: any = {
        name: profileForm.name,
        email: profileForm.email
      };
      
      if (profileForm.currentPassword && profileForm.newPassword) {
        payload.currentPassword = profileForm.currentPassword;
        payload.newPassword = profileForm.newPassword;
      }

      await api.put('/auth/profile', payload);
      toast.success('Admin profile updated successfully');
      setProfileForm(prev => ({ ...prev, currentPassword: '', newPassword: '' }));
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setUpdatingProfile(false);
    }
  };

  const runCronSimulation = async () => {
    if (isSimulating) return;
    
    setIsSimulating(true);
    setSimStep(1);
    setSimLog([]);
    
    try {
      const res = await api.post('/admin/run-cron');
      const backendLogs = res.data.logs;
      
      backendLogs.forEach((logMessage: string, idx: number) => {
        setTimeout(() => {
          setSimLog(prev => [...prev, logMessage]);
          setSimStep(idx + 1);
          if (idx === backendLogs.length - 1) {
            setIsSimulating(false);
            toast.success('System billing cron executed and database synchronized!');
            refreshAllData();
          }
        }, (idx + 1) * 800);
      });
    } catch (error: any) {
      console.error(error);
      setIsSimulating(false);
      toast.error(error.response?.data?.message || 'Failed to trigger background billing cron');
    }
  };

  return (
    <div className="pb-20 md:pb-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
          Admin Settings <span className="text-xs font-semibold px-2 py-0.5 bg-primary/10 text-primary rounded border border-primary/20">Console</span>
        </h1>
        <p className="text-slate-400 mt-1">Configure telemetry settings, trigger mock system crons, and manage credentials.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left columns: Config sliders & crons */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          
          {/* Cron Simulation Board */}
          <div className="glass-panel p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/5 rounded-full blur-3xl pointer-events-none"></div>
            
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Database className="text-secondary" size={20} />
                  Simulate System Cron Jobs
                </h3>
                <p className="text-xs text-slate-400">Trigger background checks on subscription expiration & auto-billing rules</p>
              </div>
              <button
                disabled={isSimulating}
                onClick={runCronSimulation}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold shadow-md cursor-pointer transition-all duration-300 ${
                  isSimulating 
                    ? 'bg-slate-700 text-slate-500 cursor-not-allowed border border-transparent' 
                    : 'bg-linear-to-r from-secondary to-cyan-500 hover:shadow-[0_0_15px_rgba(0,240,255,0.3)] text-slate-900 border border-transparent'
                }`}
              >
                {isSimulating ? <RefreshCw className="animate-spin" size={16} /> : <Play size={16} />}
                {isSimulating ? 'Processing...' : 'Run Billing Cron'}
              </button>
            </div>

            {/* Sim Logs terminal */}
            <div className="bg-[#0b0f19] border border-slate-800 rounded-xl p-4 font-mono text-xs text-slate-300 h-64 overflow-y-auto flex flex-col gap-2 relative">
              {simLog.length === 0 && !isSimulating && (
                <div className="flex flex-col items-center justify-center h-full text-slate-600 gap-2">
                  <HelpCircle size={32} />
                  <p>Click "Run Billing Cron" to simulate script logs...</p>
                </div>
              )}

              <AnimatePresence>
                {simLog.map((log, index) => (
                  <motion.div 
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex gap-2 items-start"
                  >
                    <span className="text-secondary shrink-0">&gt;</span>
                    <span>{log}</span>
                  </motion.div>
                ))}
              </AnimatePresence>

              {isSimulating && (
                <div className="flex items-center gap-1.5 mt-2 animate-pulse text-secondary">
                  <span className="w-2 h-2 rounded-full bg-secondary"></span>
                  <span>Executing step {simStep}...</span>
                </div>
              )}
            </div>
          </div>

          {/* System Sliders & Toggles */}
          <div className="glass-panel p-6">
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <Sliders className="text-primary" size={20} />
              Telemetry Configurations
            </h3>

            <div className="space-y-6">
              
              {/* Alert Slider */}
              <div className="bg-slate-900/40 p-4 rounded-xl border border-white/5">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-semibold text-white">Expiration Warning Window</span>
                  <span className="text-sm font-bold text-secondary">{alertThreshold} days</span>
                </div>
                <input 
                  type="range" 
                  min="2" 
                  max="30" 
                  value={alertThreshold}
                  onChange={(e) => setAlertThreshold(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-secondary" 
                />
                <p className="text-[10px] text-slate-500 mt-2">Days before sub expires when automated notifications are dispatched to normal users.</p>
              </div>

              {/* Timeout Slider */}
              <div className="bg-slate-900/40 p-4 rounded-xl border border-white/5">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-semibold text-white">Admin Session Timeout</span>
                  <span className="text-sm font-bold text-primary">{sessionTimeout} minutes</span>
                </div>
                <input 
                  type="range" 
                  min="5" 
                  max="120" 
                  step="5"
                  value={sessionTimeout}
                  onChange={(e) => setSessionTimeout(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-primary" 
                />
                <p className="text-[10px] text-slate-500 mt-2">Inactivity threshold before the control console logs out standard admin accounts.</p>
              </div>

              {/* Toggles */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="flex items-center justify-between p-4 bg-slate-900/40 rounded-xl border border-white/5 cursor-pointer hover:border-slate-800 transition-all">
                  <div>
                    <span className="text-sm font-semibold text-white block">System Broadcasts</span>
                    <span className="text-[10px] text-slate-500">Allow admin to publish alerts</span>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={enableAlerts}
                    onChange={(e) => setEnableAlerts(e.target.checked)}
                    className="w-9 h-5 bg-slate-800 checked:bg-secondary rounded-full appearance-none relative after:absolute after:top-[2px] after:left-[2px] after:w-4 after:h-4 after:bg-slate-400 after:rounded-full after:transition-all checked:after:translate-x-4 checked:after:bg-[#0f172a] cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between p-4 bg-slate-900/40 rounded-xl border border-white/5 cursor-pointer hover:border-slate-800 transition-all">
                  <div>
                    <span className="text-sm font-semibold text-white block">Verbose Logging</span>
                    <span className="text-[10px] text-slate-500">Log all simulated API queries</span>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={debugLogs}
                    onChange={(e) => setDebugLogs(e.target.checked)}
                    className="w-9 h-5 bg-slate-800 checked:bg-primary rounded-full appearance-none relative after:absolute after:top-[2px] after:left-[2px] after:w-4 after:h-4 after:bg-slate-400 after:rounded-full after:transition-all checked:after:translate-x-4 checked:after:bg-[#0f172a] cursor-pointer"
                  />
                </label>
              </div>

            </div>
          </div>

        </div>

        {/* Right column: Admin Credentials update */}
        <div className="glass-panel p-6 self-start">
          <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <Shield className="text-[#a855f7]" size={20} />
            Administrator Credentials
          </h3>

          <form onSubmit={handleProfileSubmit} className="space-y-4">
            
            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1">Administrative Name</label>
              <div className="relative">
                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input 
                  type="text" 
                  value={profileForm.name}
                  onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                  placeholder="Admin Name"
                  className="w-full bg-slate-900/60 border border-slate-700 rounded-xl py-2 pl-10 pr-4 text-white focus:outline-none focus:border-[#a855f7]"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1">Administrative Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input 
                  type="email" 
                  value={profileForm.email}
                  onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                  placeholder="admin@osm.com"
                  className="w-full bg-slate-900/60 border border-slate-700 rounded-xl py-2 pl-10 pr-4 text-white focus:outline-none focus:border-[#a855f7]"
                />
              </div>
            </div>

            <hr className="border-white/5 my-4" />
            <p className="text-[10px] text-slate-500">Only fill the password fields if you wish to change your current administrative authentication credentials.</p>

            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1">Current Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input 
                  type="password" 
                  value={profileForm.currentPassword}
                  onChange={(e) => setProfileForm({ ...profileForm, currentPassword: e.target.value })}
                  placeholder="••••••••"
                  className="w-full bg-slate-900/60 border border-slate-700 rounded-xl py-2 pl-10 pr-4 text-white focus:outline-none focus:border-[#a855f7]"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1">New Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input 
                  type="password" 
                  value={profileForm.newPassword}
                  onChange={(e) => setProfileForm({ ...profileForm, newPassword: e.target.value })}
                  placeholder="••••••••"
                  className="w-full bg-slate-900/60 border border-slate-700 rounded-xl py-2 pl-10 pr-4 text-white focus:outline-none focus:border-[#a855f7]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={updatingProfile}
              className="w-full py-2.5 bg-[#a855f7] hover:bg-[#9333ea] text-white rounded-xl text-sm font-bold shadow-md cursor-pointer transition-all duration-300 flex items-center justify-center gap-2 mt-4"
            >
              {updatingProfile ? <RefreshCw className="animate-spin" size={16} /> : <Check size={16} />}
              Save Credentials
            </button>

          </form>
        </div>

      </div>
    </div>
  );
};

export default AdminSettings;
