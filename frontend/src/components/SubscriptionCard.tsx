import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const SubscriptionCard = ({ subscription }) => {
  const getLogoUrl = (logo?: string) => {
    if (!logo) return '';
    if (logo.startsWith('http') || logo.startsWith('data:')) return logo;
    const apiUrl = (import.meta as any).env.VITE_API_URL || 'https://osm-tracker.onrender.com/api';
    const backendUrl = apiUrl.replace(/\/api$/, '');
    if (logo.startsWith('/uploads')) {
      return `${backendUrl}${logo}`;
    }
    return logo;
  };

  const { searchQuery } = useAuth();
  const { _id, ottPlatformId, planName, expiryDate, status, subscriptionCost } = subscription;

  // Calculate days remaining
  const today = new Date();
  const expiry = new Date(expiryDate);
  const diffTime = expiry.getTime() - today.getTime();
  const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  const getStatusColor = () => {
    if (status === 'active') {
      if (daysRemaining <= 3) return 'text-orange-400 bg-orange-400/10 border-orange-400/30 shadow-[0_0_10px_rgba(251,146,60,0.3)]';
      return 'text-green-400 bg-green-400/10 border-green-400/30 shadow-[0_0_10px_rgba(74,222,128,0.3)]';
    }
    if (status === 'cancelled') {
      return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30 shadow-[0_0_10px_rgba(234,179,8,0.3)]';
    }
    return 'text-red-400 bg-red-400/10 border-red-400/30 shadow-[0_0_10px_rgba(248,113,113,0.3)]';
  };

  const getPlatformColor = () => {
    const name = ottPlatformId?.name?.toLowerCase() || '';
    if (name.includes('netflix')) return 'from-red-600 to-red-400';
    if (name.includes('prime') || name.includes('amazon')) return 'from-blue-600 to-blue-400';
    if (name.includes('disney')) return 'from-indigo-600 to-indigo-400';
    if (name.includes('viki')) return 'from-purple-600 to-purple-400';
    if (name.includes('iqiyi')) return 'from-green-600 to-green-400';
    return 'from-[#ff0055] to-[#00f0ff]';
  };

  const highlightText = (text: string, search: string) => {
    if (!search) return text;
    const parts = text.split(new RegExp(`(${search})`, 'gi'));
    return (
      <span>
        {parts.map((part, i) => 
          part.toLowerCase() === search.toLowerCase() ? (
            <mark key={i} className="bg-[#00f0ff]/20 text-[#00f0ff] rounded-sm px-0.5">{part}</mark>
          ) : (
            part
          )
        )}
      </span>
    );
  };

  return (
    <div className="glass-panel backdrop-blur-xl bg-white/5 border border-white/10 p-5 hover:border-white/20 transition-all duration-300 group flex flex-col h-full relative overflow-hidden hover:scale-[1.02] hover:shadow-2xl hover:shadow-black/30 animate-in zoom-in-95 duration-300">
      {/* Decorative gradient blob based on platform */}
      <div className={`absolute -right-8 -top-8 w-32 h-32 rounded-full blur-3xl opacity-30 pointer-events-none bg-gradient-to-br ${getPlatformColor()}`}></div>

      <div className="flex justify-between items-start mb-4 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-900/60 backdrop-blur-sm p-1 flex items-center justify-center border border-white/10 group-hover:border-white/20 transition-all duration-300 group-hover:scale-110">
            {ottPlatformId?.logo ? (
              <img src={getLogoUrl(ottPlatformId.logo)} alt={ottPlatformId.name} className="w-full h-full object-contain rounded-lg" />
            ) : (
              <div className="text-xs text-center text-slate-400">{ottPlatformId?.name}</div>
            )}
          </div>
          <div>
            <h3 className="font-bold text-lg text-white">
              {highlightText(ottPlatformId?.name || '', searchQuery)}
            </h3>
            <p className="text-sm text-slate-400">
              {highlightText(planName || '', searchQuery)}
            </p>
          </div>
        </div>
        <div className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-all duration-300 ${getStatusColor()}`}>
          {status === 'active' 
            ? (daysRemaining <= 3 ? 'Expiring Soon' : 'Active') 
            : (status === 'cancelled' ? 'Cancelled' : 'Expired')}
        </div>
      </div>

      <div className="mt-auto space-y-3 relative z-10">
        <div className="flex justify-between items-center text-sm">
          <span className="text-slate-400 flex items-center gap-1.5"><Calendar size={14} /> Expiry</span>
          <span className={`font-medium ${daysRemaining <= 3 && status === 'active' ? 'text-orange-400' : 'text-slate-200'}`}>
            {status === 'active' ? (daysRemaining > 0 ? `${daysRemaining} days` : 'Today') : 'Expired'}
          </span>
        </div>

        <div className="flex justify-between items-center text-sm">
          <span className="text-slate-400">Cost</span>
          <span className="font-medium text-white">${subscriptionCost}/mo</span>
        </div>

        <Link
          to={`/subscription/${_id}`}
          className="block w-full py-2.5 mt-2 bg-slate-800/60 backdrop-blur-sm hover:bg-slate-700/60 text-center rounded-lg text-sm font-medium transition-all duration-300 border border-white/10 hover:border-white/20 hover:shadow-lg hover:shadow-[#00f0ff]/20"
        >
          View Details
        </Link>
      </div>
    </div>
  );
};

export default SubscriptionCard;
