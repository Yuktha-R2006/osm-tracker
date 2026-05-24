import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { MonitorPlay, Mail, Lock, User, Shield } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [selectedRole, setSelectedRole] = useState<'user' | 'admin'>('user');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (selectedRole === 'admin') {
        // Hard-coded admin credentials check
        if (email === 'admin@osm.com' && password === 'admin123') {
          const userData = await login(email, password, selectedRole);
          navigate('/admin');
        } else {
          setError('Invalid admin credentials');
        }
      } else {
        // Normal user login
        const userData = await login(email, password, selectedRole);
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to login');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f172a] relative overflow-hidden px-4">
      {/* Animated gradient background */}
      <div className="absolute top-[-20%] right-[-10%] w-96 h-96 bg-[#ff0055]/30 rounded-full blur-[120px] pointer-events-none animate-pulse"></div>
      <div className="absolute bottom-[-20%] left-[-10%] w-96 h-96 bg-[#00f0ff]/30 rounded-full blur-[120px] pointer-events-none animate-pulse" style={{ animationDelay: '1s' }}></div>
      <div className="absolute top-[30%] left-[20%] w-64 h-64 bg-[#a855f7]/20 rounded-full blur-[100px] pointer-events-none animate-pulse" style={{ animationDelay: '2s' }}></div>
      
      <div className="w-full max-w-md p-8 glass-panel z-10 backdrop-blur-xl bg-white/5 border border-white/10 shadow-2xl shadow-black/50">
        <div className="text-center mb-6">
          <MonitorPlay size={48} className="mx-auto text-[#ff0055] mb-4 drop-shadow-[0_0_20px_rgba(255,0,85,0.5)]" />
        </div>

        {/* Role Selector Toggle */}
        <div className="mb-8">
          <div className="flex bg-slate-900/60 backdrop-blur-sm rounded-2xl p-1.5 border border-white/10 shadow-lg">
            <button
              type="button"
              onClick={() => setSelectedRole('user')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-medium transition-all duration-300 ${
                selectedRole === 'user'
                  ? 'bg-gradient-to-r from-[#ff0055] to-[#ff0055]/80 text-white shadow-lg shadow-[#ff0055]/30 scale-105'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <User size={18} />
              User
            </button>
            <button
              type="button"
              onClick={() => setSelectedRole('admin')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-medium transition-all duration-300 ${
                selectedRole === 'admin'
                  ? 'bg-gradient-to-r from-[#00f0ff] to-[#00f0ff]/80 text-slate-900 shadow-lg shadow-[#00f0ff]/30 scale-105'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Shield size={18} />
              Admin
            </button>
          </div>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2 bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">Welcome Back</h1>
          <p className="text-slate-400">Sign in to manage your subscriptions</p>
        </div>

        {error && <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-lg mb-6 text-sm text-center">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-900/60 backdrop-blur-sm border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder-slate-500 focus:outline-none focus:border-[#00f0ff] focus:shadow-[0_0_20px_rgba(0,240,255,0.3)] transition-all duration-300"
                placeholder="Enter your email"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-900/60 backdrop-blur-sm border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder-slate-500 focus:outline-none focus:border-[#00f0ff] focus:shadow-[0_0_20px_rgba(0,240,255,0.3)] transition-all duration-300"
                placeholder="Enter your password"
              />
            </div>
          </div>
          <button
            type="submit"
            className="w-full py-3 bg-gradient-to-r from-[#ff0055] to-[#ff0055]/80 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-[#ff0055]/40 hover:scale-[1.02] transition-all duration-300"
          >
            Sign In
          </button>
        </form>
        
        <p className="text-center text-slate-400 mt-6">
          Don't have an account? <Link to="/signup" className="text-[#00f0ff] hover:underline">Sign up</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
