import React, { useState } from 'react';
import { Plus, PlaySquare, CheckCircle, AlertCircle, Clock, Search, Tv, XCircle } from 'lucide-react';
import StatCard from '../components/StatCard';
import SubscriptionCard from '../components/SubscriptionCard';
import AddSubscriptionModal from '../components/AddSubscriptionModal';
import SkeletonCard from '../components/SkeletonCard';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';

const Dashboard = () => {
  const { user, searchQuery, setSearchQuery } = useAuth();
  const { subscriptions, loading, refreshAllData } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleAddSubscription = async (newSub) => {
    await refreshAllData(); // Sync everything automatically
  };

  // Filter subscriptions based on search query
  const filteredSubscriptions = subscriptions.filter(sub => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    const platformName = sub.ottPlatformId?.name?.toLowerCase() || '';
    const planName = sub.planName?.toLowerCase() || '';
    const status = sub.status?.toLowerCase() || '';
    return platformName.includes(query) || planName.includes(query) || status.includes(query);
  });

  // Calculate stats dynamically
  const activeSubs = subscriptions.filter(s => s.status === 'active');
  const activeCount = activeSubs.length;
  
  const expiredCount = subscriptions.filter(s => s.status === 'expired' || s.status === 'cancelled').length;

  const today = new Date();
  const expiringSoonCount = activeSubs.filter(s => {
    const expiry = new Date(s.expiryDate);
    const diffTime = expiry.getTime() - today.getTime();
    const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return daysRemaining > 0 && daysRemaining <= 3;
  }).length;

  const cancelledCount = subscriptions.filter(s => s.status === 'cancelled').length;

  const getPlatformTheme = (platformName: string) => {
    const name = platformName.toLowerCase();
    if (name.includes('netflix')) return 'from-red-600/20 to-red-600/5 border-red-500/30 text-red-400';
    if (name.includes('prime') || name.includes('amazon')) return 'from-blue-600/20 to-blue-600/5 border-blue-500/30 text-blue-400';
    if (name.includes('disney')) return 'from-indigo-600/20 to-indigo-600/5 border-indigo-500/30 text-indigo-400';
    if (name.includes('sony')) return 'from-yellow-600/20 to-yellow-600/5 border-yellow-500/30 text-yellow-400';
    if (name.includes('zee5')) return 'from-purple-600/20 to-purple-600/5 border-purple-500/30 text-purple-400';
    if (name.includes('viki')) return 'from-sky-600/20 to-sky-600/5 border-sky-500/30 text-sky-400';
    if (name.includes('iqiyi')) return 'from-green-600/20 to-green-600/5 border-green-500/30 text-green-400';
    if (name.includes('crunchyroll')) return 'from-orange-600/20 to-orange-600/5 border-orange-500/30 text-orange-400';
    return 'from-slate-600/20 to-slate-600/5 border-slate-500/30 text-slate-400';
  };

  return (
    <div className="pb-20 md:pb-0 space-y-8 animate-in fade-in duration-500">
      {/* Mobile Search Bar */}
      <div className="md:hidden">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
          <input
            type="text"
            placeholder="Search platforms or plans..."
            className="w-full bg-slate-900/60 backdrop-blur-sm border border-slate-700/60 rounded-xl py-2.5 pl-10 pr-4 text-white placeholder-slate-500 focus:outline-none focus:border-secondary focus:shadow-[0_0_15px_rgba(0,240,255,0.3)] transition-all duration-300"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2 bg-linear-to-r from-white to-slate-300 bg-clip-text text-transparent">My Subscriptions</h1>
          <p className="text-slate-400">Track and manage your streaming platforms</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="hidden md:flex items-center gap-2 px-5 py-2.5 bg-linear-to-r from-primary to-primary/80 hover:from-primary/90 text-white rounded-xl font-medium transition-all duration-300 shadow-[0_0_15px_rgba(255,0,85,0.3)] hover:shadow-[0_0_25px_rgba(255,0,85,0.5)] hover:scale-105"
        >
          <Plus size={20} />
          Add New
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <StatCard
          title="Total Subscriptions"
          value={subscriptions.length}
          icon={<PlaySquare size={24} />}
          color="#00f0ff"
        />
        <StatCard
          title="Active Plans"
          value={activeCount}
          icon={<CheckCircle size={24} />}
          color="#10b981"
        />
        <StatCard
          title="Expiring Soon"
          value={expiringSoonCount}
          icon={<AlertCircle size={24} />}
          color="#f59e0b"
        />
        <StatCard
          title="Cancelled Plans"
          value={cancelledCount}
          icon={<XCircle size={24} />}
          color="#ef4444"
        />
      </div>

      {/* Watch History Carousel */}
      {user?.watchHistory && user.watchHistory.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span className="w-8 h-1 bg-linear-to-r from-primary to-transparent rounded-full"></span>
            Watch History
          </h2>
          <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar snap-x snap-mandatory">
            {user.watchHistory.map((item, idx) => (
              <div 
                key={idx}
                className={`snap-start backdrop-blur-lg border border-white/10 rounded-2xl p-5 w-64 shrink-0 transition-all duration-300 hover:scale-[1.03] hover:border-white/20 bg-linear-to-br ${getPlatformTheme(item.ottPlatform)}`}
              >
                <div className="flex justify-between items-start mb-3">
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-900/60 border border-white/5 text-slate-300">
                    {item.ottPlatform}
                  </span>
                  <span className="text-[10px] text-slate-500">
                    {new Date(item.watchDate).toLocaleDateString()}
                  </span>
                </div>
                <h3 className="font-bold text-white truncate text-base mb-1">{item.showName}</h3>
                <p className="text-xs text-slate-400 mb-4">{item.genre}</p>
                <div className="flex items-center gap-1.5 text-xs text-slate-300">
                  <Clock size={12} className="text-slate-400" />
                  <span>Watched {item.duration} mins</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Subscriptions Grid */}
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <span className="w-8 h-1 bg-linear-to-r from-secondary to-transparent rounded-full"></span>
          Your Portfolio
        </h2>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {[1, 2, 3, 4].map(i => <SkeletonCard key={i} />)}
          </div>
        ) : filteredSubscriptions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {filteredSubscriptions.map(sub => (
              <SubscriptionCard key={sub._id} subscription={sub} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 glass-panel backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl">
            <Tv size={48} className="mx-auto text-slate-500 mb-4 animate-pulse" />
            <h3 className="text-xl font-bold text-white mb-2">
              {searchQuery ? 'No Match Found' : 'No Subscriptions Yet'}
            </h3>
            <p className="text-slate-400 mb-6">
              {searchQuery ? 'Try adjusting your search criteria.' : 'Add your first OTT platform to start tracking.'}
            </p>
            {!searchQuery && (
              <button
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-800/60 backdrop-blur-sm hover:bg-slate-700/60 text-white border border-white/10 rounded-xl font-medium transition-all duration-300 hover:shadow-lg hover:shadow-primary/20"
              >
                <Plus size={20} />
                Add Subscription
              </button>
            )}
          </div>
        )}
      </div>

      {/* Floating Action Button - Mobile Only */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="md:hidden fixed bottom-6 right-6 w-14 h-14 bg-linear-to-r from-primary to-primary/80 text-white rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(255,0,85,0.4)] z-40 hover:scale-110 transition-transform duration-300"
      >
        <Plus size={28} />
      </button>

      <AddSubscriptionModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onAdd={handleAddSubscription}
      />
    </div>
  );
};

export default Dashboard;
