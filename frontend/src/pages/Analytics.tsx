import React, { useState } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  MonitorPlay, 
  Calendar, 
  Percent, 
  RefreshCw, 
  BarChart2, 
  PieChart as PieIcon, 
  Info,
  Layers,
  Flame,
  Award
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip 
} from 'recharts';
import { useData } from '../context/DataContext';

const Analytics = () => {
  const { adminStats, loading, refreshAllData } = useData();
  const [timeRange, setTimeRange] = useState('6m');

  const stats = adminStats || {
    totalUsers: 0,
    totalPlatforms: 0,
    activeSubscriptions: 0,
    expiredSubscriptions: 0,
    cancelledSubscriptions: 0,
    premiumUsersPercent: 0,
    premiumUserPercent: 0,
    premiumSubscriptionsCount: 0,
    highestPremiumPlatform: '',
    topPlatformBySubs: '',
    topPlatformByWatchTime: '',
    fastestGrowingPlatform: '',
    fastestGrowingRate: 0,
    cancellationRate: 0,
    cancellationTrend: 0,
    mostCancelledPlatform: '',
    subscriptionRenewals: 0,
    mostActiveUsers: [],
    barData: [],
    pieData: [],
    areaData: []
  };

  const COLORS = ['#00f0ff', '#ff0055', '#a855f7', '#3b82f6', '#10b981', '#f59e0b'];

  // User distribution data: Premium vs Standard
  const premiumUsersPercent = stats.premiumUsersPercent || stats.premiumUserPercent || 0;
  const premiumCount = Math.round((premiumUsersPercent / 100) * stats.totalUsers);
  const standardCount = stats.totalUsers - premiumCount;
  const userTierData = [
    { name: 'Premium Tier', value: premiumCount || 1, color: '#a855f7' },
    { name: 'Standard Tier', value: standardCount || 1, color: '#3b82f6' }
  ];

  // Auto-renewal vs Manual
  const renewalCount = stats.subscriptionRenewals || 0;
  const manualCount = Math.max(0, stats.activeSubscriptions - renewalCount);
  const renewalData = [
    { name: 'Auto Renewing', value: renewalCount, color: '#10b981' },
    { name: 'Manual Renewing', value: manualCount, color: '#f59e0b' }
  ];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-40">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-secondary"></div>
        <p className="text-slate-400 mt-4 animate-pulse">Running advanced calculations...</p>
      </div>
    );
  }

  return (
    <div className="pb-20 md:pb-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
            Analytical Deep Dive
          </h1>
          <p className="text-slate-400 mt-1">Granular breakdown of user behaviors, retention curves, and service usage.</p>
        </div>
        <div className="flex items-center gap-3 self-stretch sm:self-auto">
          <select 
            value={timeRange} 
            onChange={(e) => setTimeRange(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-secondary"
          >
            <option value="30d">Last 30 Days</option>
            <option value="6m">Last 6 Months</option>
            <option value="1y">Last 1 Year</option>
          </select>
          <button 
            onClick={refreshAllData}
            className="p-2.5 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-white rounded-xl transition-all cursor-pointer hover:border-secondary/50"
            title="Refresh Analysis"
          >
            <RefreshCw size={16} />
          </button>
        </div>
      </div>



      {/* Overview Analytics Cards Row: Cancellation Rate and Premium User % ONLY */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-8">
        {/* Cancellation Rate */}
        <div className="glass-panel p-6 flex items-center justify-between group hover:border-slate-600 transition-all relative overflow-hidden">
          <div>
            <p className="text-slate-400 text-sm font-medium mb-1">Cancellation Rate</p>
            <h3 className="text-4xl font-black text-white group-hover:scale-105 transition-transform origin-left">
              {stats.cancellationRate}%
            </h3>
            <div className="flex flex-col gap-1 mt-3">
              <p className="text-[10px] text-slate-500">
                Total Cancelled: <span className="text-red-400 font-bold">{stats.cancelledSubscriptions || 0}</span>
              </p>
              <p className="text-[10px] text-slate-500">
                Most Cancelled: <span className="text-slate-300 font-bold">{stats.mostCancelledPlatform || 'None'}</span>
              </p>
            </div>
          </div>
          <div className="flex flex-col items-end justify-between h-full">
            <div className="p-3.5 rounded-xl bg-red-500/10 text-red-400 flex items-center justify-center">
              <TrendingDown size={22} />
            </div>
            <span className="text-[10px] bg-red-500/15 text-red-400 px-2 py-0.5 rounded-full font-bold mt-4">
              {stats.cancellationTrend}% MoM
            </span>
          </div>
        </div>

        {/* Premium User Percentage */}
        <div className="glass-panel p-6 flex items-center justify-between group hover:border-slate-600 transition-all relative overflow-hidden">
          <div>
            <p className="text-slate-400 text-sm font-medium mb-1">Premium User Percentage</p>
            <h3 className="text-4xl font-black text-white group-hover:scale-105 transition-transform origin-left">
              {stats.premiumUsersPercent || stats.premiumUserPercent || 0}%
            </h3>
            <div className="flex flex-col gap-1 mt-3">
              <p className="text-[10px] text-slate-500">
                Premium Subscriptions: <span className="text-purple-400 font-bold">{stats.premiumSubscriptionsCount || 0}</span>
              </p>
              <p className="text-[10px] text-slate-500">
                Top Premium Hub: <span className="text-slate-300 font-bold">{stats.highestPremiumPlatform || 'None'}</span>
              </p>
            </div>
          </div>
          <div className="flex flex-col items-end justify-between h-full">
            <div className="p-3.5 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
              <Award size={22} />
            </div>
            <span className="text-[10px] bg-purple-500/15 text-purple-400 px-2 py-0.5 rounded-full font-bold mt-4">
              {stats.totalUsers} Active Users
            </span>
          </div>
        </div>
      </div>

      {/* Multi-chart Segment */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        
        {/* User Tier & Membership Mix */}
        <div className="glass-panel p-6">
          <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
            <Users size={20} className="text-[#a855f7]" />
            User Tier Segmentation
          </h3>
          <p className="text-xs text-slate-400 mb-6">Distribution between Premium Subscriptions and Standard Subscriptions</p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 items-center gap-6">
            <div className="h-[200px] flex items-center justify-center relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={userTierData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {userTierData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', color: '#fff' }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute flex flex-col items-center">
                <span className="text-xl font-extrabold text-white">{stats.totalUsers}</span>
                <span className="text-[9px] text-slate-400 uppercase tracking-widest">Active Users</span>
              </div>
            </div>
            
            <div className="space-y-4">
              {userTierData.map((tier) => (
                <div key={tier.name} className="p-3 bg-slate-900/40 rounded-xl border border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: tier.color }}></span>
                    <span className="text-xs font-semibold text-slate-300">{tier.name}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold text-white">{tier.value}</span>
                    <p className="text-[10px] text-slate-400">
                      {Math.round((tier.value / stats.totalUsers) * 100 || 0)}% share
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Subscription Renewal Analysis */}
        <div className="glass-panel p-6">
          <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
            <Percent size={20} className="text-[#10b981]" />
            Auto-Renewal vs Manual Toggles
          </h3>
          <p className="text-xs text-slate-400 mb-6">Proportion of subscribers with automated subscription billing enabled</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 items-center gap-6">
            <div className="h-[200px] flex items-center justify-center relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={renewalData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {renewalData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', color: '#fff' }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute flex flex-col items-center">
                <span className="text-xl font-extrabold text-white">
                  {renewalCount}
                </span>
                <span className="text-[9px] text-slate-400 uppercase tracking-widest">Auto Enabled</span>
              </div>
            </div>

            <div className="space-y-4">
              {renewalData.map((item) => (
                <div key={item.name} className="p-3 bg-slate-900/40 rounded-xl border border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></span>
                    <span className="text-xs font-semibold text-slate-300">{item.name}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold text-white">{item.value}</span>
                    <p className="text-[10px] text-slate-400">
                      {stats.activeSubscriptions > 0 
                        ? `${Math.round((item.value / stats.activeSubscriptions) * 100)}%`
                        : '0%'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* Platform Popularity Leaderboard and User Binge Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Platform Share Leaderboard */}
        <div className="lg:col-span-2 glass-panel p-6">
          <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
            <MonitorPlay size={20} className="text-secondary" />
            Streaming Popularity Matrix
          </h3>
          <p className="text-xs text-slate-400 mb-6">Subscribers density per streaming service (active subscription units)</p>

          <div className="space-y-4">
            {stats.pieData && stats.pieData.length > 0 ? (
              stats.pieData.map((platform: any, index: number) => {
                const percentage = stats.activeSubscriptions > 0 
                  ? Math.round((platform.value / stats.activeSubscriptions) * 100)
                  : 0;

                return (
                  <div key={platform.name} className="p-4 bg-slate-900/40 rounded-xl border border-white/5 hover:border-slate-700 transition-all duration-300">
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-white text-[10px]">
                          #{index + 1}
                        </span>
                        <span className="text-sm font-bold text-white">{platform.name}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-xs font-semibold text-slate-400">{platform.value} Subs</span>
                        <span className="text-xs font-black text-secondary">{percentage}%</span>
                      </div>
                    </div>
                    {/* Progress Bar */}
                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all duration-1000"
                        style={{ 
                          width: `${percentage}%`,
                          backgroundColor: COLORS[index % COLORS.length],
                          boxShadow: `0 0 8px ${COLORS[index % COLORS.length]}`
                        }}
                      ></div>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-slate-500 text-xs py-8 text-center">No platform metrics found</p>
            )}
          </div>
        </div>

        {/* Subscription Engagement Leaderboard */}
        <div className="glass-panel p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
              <Flame size={20} className="text-primary" />
              Subscription Engagement
            </h3>
            <p className="text-xs text-slate-400 mb-6">Global subscription active metrics across the subscriber pool</p>
          </div>

          <div className="space-y-4">
            {stats.mostActiveUsers && stats.mostActiveUsers.slice(0, 5).map((user: any, index: number) => (
              <div key={user._id} className="flex items-center justify-between p-3 bg-slate-900/60 rounded-xl border border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-linear-to-tr from-primary to-purple-500 flex items-center justify-center text-slate-900 font-extrabold text-xs">
                    {index + 1}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-white truncate">{user.name}</p>
                    <p className="text-[9px] text-primary uppercase font-semibold">
                      {user.subscriptionCount || 0} subscriptions
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-white">{user.activeSubscriptionDays || 0} active days</span>
                  <p className="text-[9px] text-slate-500 truncate">Pref: {user.favoriteOTT || 'None'}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-4 flex items-center gap-2 text-xs text-slate-400 bg-slate-800/20 p-3 rounded-lg border border-slate-700/50">
            <Info size={16} className="text-secondary shrink-0" />
            <p className="leading-tight">Rankings derived directly from user subscription counts, renewals, and continuous active days.</p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Analytics;
