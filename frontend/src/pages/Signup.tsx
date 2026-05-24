import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { MonitorPlay, Mail, Lock, User } from 'lucide-react';

const Signup = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await register(name, email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create account');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f172a] relative overflow-hidden px-4">
      <div className="absolute top-[-20%] right-[-10%] w-96 h-96 bg-[#ff0055]/20 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-[-20%] left-[-10%] w-96 h-96 bg-[#00f0ff]/20 rounded-full blur-[100px] pointer-events-none"></div>
      
      <div className="w-full max-w-md p-8 glass-panel z-10">
        <div className="text-center mb-8">
          <MonitorPlay size={48} className="mx-auto text-[#ff0055] mb-4" />
          <h1 className="text-3xl font-bold text-white mb-2">Create Account</h1>
          <p className="text-slate-400">Join OSM to track your subscriptions</p>
        </div>

        {error && <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-lg mb-6 text-sm text-center">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Full Name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
              <input 
                type="text" 
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-800/50 border border-slate-700 rounded-lg py-3 pl-10 pr-4 text-white focus:outline-none focus:border-[#ff0055] focus:ring-1 focus:ring-[#ff0055] transition-all"
                placeholder="John Doe"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-800/50 border border-slate-700 rounded-lg py-3 pl-10 pr-4 text-white focus:outline-none focus:border-[#ff0055] focus:ring-1 focus:ring-[#ff0055] transition-all"
                placeholder="john@example.com"
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
                className="w-full bg-slate-800/50 border border-slate-700 rounded-lg py-3 pl-10 pr-4 text-white focus:outline-none focus:border-[#ff0055] focus:ring-1 focus:ring-[#ff0055] transition-all"
                placeholder="Create a password"
              />
            </div>
          </div>
          <button 
            type="submit"
            className="w-full py-3 bg-gradient-to-r from-[#ff0055] to-[#ff0055]/80 hover:from-[#ff0055]/90 hover:to-[#ff0055]/70 text-white rounded-lg font-medium transition-all shadow-lg shadow-[#ff0055]/25"
          >
            Sign Up
          </button>
        </form>
        
        <p className="text-center text-slate-400 mt-6">
          Already have an account? <Link to="/login" className="text-[#00f0ff] hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
