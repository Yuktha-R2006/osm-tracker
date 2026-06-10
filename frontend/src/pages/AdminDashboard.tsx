import React, { useState, useEffect } from 'react';
import { 
  Users, 
  MonitorPlay, 
  CheckCircle, 
  AlertCircle, 
  TrendingUp, 
  TrendingDown, 
  Award, 
  Clock, 
  Activity, 
  ArrowUpRight, 
  ShieldCheck,
  RefreshCw
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  LineChart,
  Line,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import StatCard from '../components/StatCard';
import api from '../services/api';

const CustomLineTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900/95 border border-slate-700/80 p-4 rounded-xl shadow-2xl backdrop-blur-md text-xs space-y-3 min-w-[180px]">
        <p className="text-slate-400 font-bold border-b border-slate-800 pb-1.5 mb-1.5 uppercase tracking-wider text-[10px]">
          Month: {label}
        </p>
        {payload.map((pld: any) => {
          const name = pld.name;
          const totalVal = pld.value;
          const color = pld.stroke;
          const gained = pld.payload[`${name}_gained`] || 0;
          const lost = pld.payload[`${name}_lost`] || 0;
          
          return (
            <div key={name} className="flex flex-col gap-0.5 border-l-2 pl-2" style={{ borderColor: color }}>
              <p className="font-bold text-white text-xs">{name}</p>
              <div className="flex items-center gap-2 text-[10px] text-slate-400">
                <span className="text-green-400">+{gained} gained</span>
                <span className="text-red-400">-{lost} lost</span>
              </div>
              <p className="text-[10px] font-semibold text-slate-300">
                Total: <span className="text-white font-black">{totalVal}</span> active
              </p>
            </div>
          );
        })}
      </div>
    );
  }
  return null;
};

const AdminDashboard = () => {
  const [stats, setStats] = useState<any>({
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
    longestContinuousSubscriber: { platformName: 'None', activeDays: 0, userName: 'None' },
    fastestGrowingPlatform: '',
    fastestGrowingRate: 0,
    cancellationRate: 0,
    cancellationTrend: 0,
    mostCancelledPlatform: '',
    subscriptionRenewals: 0,
    mostActiveUsers: [],
    leadingPlatform: null,
    barData: [],
    pieData: [],
    areaData: []
  });
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [visiblePlatforms, setVisiblePlatforms] = useState<Record<string, boolean>>({});

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/stats');
      setStats(res.data);
      setIsOffline(false);
    } catch (error) {
      console.error('Failed to fetch admin dashboard stats from MongoDB', error);
      setIsOffline(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();

    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const COLORS = ['#00f0ff', '#ff0055', '#a855f7', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#ec4899'];

  const platformKeys = stats.barData.length > 0 
    ? Object.keys(stats.barData[0]).filter(key => key !== 'name' && !key.endsWith('_gained') && !key.endsWith('_lost'))
    : [];

  // Initialize visibility state once platform keys are loaded
  useEffect(() => {
    if (platformKeys.length > 0 && Object.keys(visiblePlatforms).length === 0) {
      const initialVisibility: Record<string, boolean> = {};
      platformKeys.forEach(key => {
        initialVisibility[key] = true;
      });
      setVisiblePlatforms(initialVisibility);
    }
  }, [platformKeys, visiblePlatforms]);

  const togglePlatform = (platformName: string) => {
    setVisiblePlatforms(prev => ({
      ...prev,
      [platformName]: !prev[platformName]
    }));
  };

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-40">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-secondary"></div>
        <p className="text-slate-400 mt-4 animate-pulse">Loading dashboard telemetry...</p>
      </div>
    );
  }

  return (
    <div className="pb-20 md:pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
            Admin Dashboard <span className="text-xs font-semibold px-2 py-0.5 bg-secondary/10 text-secondary rounded border border-secondary/20">Control Center</span>
          </h1>
          <p className="text-slate-400 mt-1">Real-time stats, service trends, and OTT subscription analytics.</p>
        </div>
        <button 
          onClick={fetchStats}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-white rounded-xl text-sm font-medium transition-all duration-300 shadow-md cursor-pointer hover:border-secondary/50 hover:shadow-[0_0_10px_rgba(0,240,255,0.2)]"
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {isOffline && (
        <div className="mb-6 p-4 bg-amber-500/15 border border-amber-500/30 text-amber-400 rounded-xl text-xs flex items-center gap-3 animate-pulse shadow-[0_0_15px_rgba(245,158,11,0.1)]">
          <AlertCircle size={18} className="shrink-0 text-amber-500" />
          <div className="flex-1">
            <span className="font-bold block">Offline Mode Active</span>
            <span>Failed to connect to the backend database. Displaying local simulated sandbox data.</span>
          </div>
          <button 
            onClick={fetchStats}
            className="px-3 py-1 bg-amber-500/25 hover:bg-amber-500/35 border border-amber-500/40 text-amber-300 font-bold rounded-lg transition-colors cursor-pointer"
          >
            Retry Connection
          </button>
        </div>
      )}

      {/* Advanced Statistics Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-8">
        {/* Card 1: Cancellation Rate */}
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

        {/* Card 2: Premium User Percentage */}
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

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        
        {/* Left Column: Analytics Charts */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          
          {/* Subscription Growth Trend (Area Chart) */}
          <div className="glass-panel p-4 md:p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-secondary/5 rounded-full blur-3xl pointer-events-none"></div>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-lg font-bold text-white">Active Subscription Volume</h3>
                <p className="text-xs text-slate-400">Total active subscriptions over the last 6 months</p>
              </div>
              <div className="text-right">
                <span className="text-2xl font-black text-secondary">{stats.activeSubscriptions}</span>
                <p className="text-[10px] text-slate-400">Active Licenses</p>
              </div>
            </div>
            
            <div className="h-[250px] sm:h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.areaData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="activeGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00f0ff" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#00f0ff" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                  <XAxis dataKey="name" stroke="#94a3b8" axisLine={false} tickLine={false} fontSize={isMobile ? 10 : 11} />
                  <YAxis stroke="#94a3b8" axisLine={false} tickLine={false} fontSize={isMobile ? 10 : 11} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '12px', color: '#fff' }}
                  />
                  <Area type="monotone" dataKey="active" name="Subscribers" stroke="#00f0ff" strokeWidth={3} fillOpacity={1} fill="url(#activeGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Platform Subscriber Trends (Interactive Multi-Line Analytics Graph) */}
          <div className="glass-panel p-4 md:p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-secondary/5 rounded-full blur-3xl pointer-events-none"></div>
            
            <div className="mb-6">
              <h3 className="text-lg font-bold text-white">Platform Subscriber Trends</h3>
              <p className="text-xs text-slate-400">Interactive telemetry mapping monthly active subscribers and movements</p>
            </div>

            {/* Clickable Legend */}
            <div className="flex flex-wrap gap-2 mb-6">
              {platformKeys.map((key, index) => {
                const isVisible = visiblePlatforms[key] !== false;
                const color = COLORS[index % COLORS.length];
                return (
                  <button
                    key={key}
                    onClick={() => togglePlatform(key)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all duration-300 flex items-center gap-2 cursor-pointer ${
                      isVisible 
                        ? 'bg-slate-800/80 border-slate-700 text-white shadow-sm' 
                        : 'bg-slate-900/10 border-slate-800 text-slate-500 line-through'
                    }`}
                    style={{
                      borderLeft: isVisible ? `4px solid ${color}` : undefined,
                      boxShadow: isVisible ? `0 0 10px ${color}10` : undefined
                    }}
                  >
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: isVisible ? color : '#475569' }}></span>
                    {key}
                  </button>
                );
              })}
            </div>

            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stats.barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid stroke="#334155" strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" stroke="#94a3b8" axisLine={false} tickLine={false} fontSize={isMobile ? 10 : 11} />
                  <YAxis stroke="#94a3b8" axisLine={false} tickLine={false} fontSize={isMobile ? 10 : 11} />
                  <Tooltip 
                    content={<CustomLineTooltip />}
                    cursor={{ stroke: '#475569', strokeWidth: 1.5, strokeDasharray: '4 4' }}
                  />
                  {platformKeys.map((key, index) => {
                    const color = COLORS[index % COLORS.length];
                    const isVisible = visiblePlatforms[key] !== false;
                    return (
                      <Line 
                        key={key} 
                        type="monotone" 
                        dataKey={key} 
                        name={key}
                        stroke={color} 
                        strokeWidth={isVisible ? 3 : 0}
                        dot={isVisible ? { r: 3, strokeWidth: 1, fill: '#1e293b' } : false}
                        activeDot={isVisible ? { r: 6, strokeWidth: 0, fill: '#fff' } : false}
                        isAnimationActive={true}
                        hide={!isVisible}
                        style={{
                          filter: isVisible ? `drop-shadow(0px 2px 6px ${color}50)` : undefined
                        }}
                      />
                    );
                  })}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>

        {/* Right Column: Platform Stats & Active Users */}
        <div className="flex flex-col gap-6">

          {/* Platform Leader Detection Panel */}
          <div className="glass-panel p-5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/5 rounded-full blur-3xl pointer-events-none"></div>
            
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
              <Award size={16} className="text-secondary" />
              Platform Leaders
            </h3>
            
            <div className="space-y-4">
              {/* Leader 1: Highest Subscribers */}
              <div className="p-3.5 bg-slate-900/40 rounded-xl border border-white/5 flex items-center justify-between">
                <div>
                  <span className="text-[9px] text-slate-500 uppercase tracking-wider block">Highest Subscribers</span>
                  <span className="text-xs font-bold text-white block mt-0.5">
                    {stats.topPlatformBySubs || stats.leadingPlatform?.name || 'None'}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-black text-secondary">
                    {stats.leadingPlatform?.subscribers || 0} active
                  </span>
                  <span className="text-[9px] text-slate-400 block mt-0.5">
                    {stats.leadingPlatform?.subsContribution || 0}% share
                  </span>
                </div>
              </div>

              {/* Leader 2: Longest Continuous Subscriber */}
              <div className="p-3.5 bg-slate-900/40 rounded-xl border border-white/5 flex items-center justify-between">
                <div>
                  <span className="text-[9px] text-slate-500 uppercase tracking-wider block">Longest Subscriber</span>
                  <span className="text-xs font-bold text-white block mt-0.5">
                    {stats.longestContinuousSubscriber?.platformName || 'None'}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-black text-primary">
                    {stats.longestContinuousSubscriber?.activeDays || 0} days
                  </span>
                  <span className="text-[9px] text-slate-400 block mt-0.5">
                    User: {stats.longestContinuousSubscriber?.userName || 'None'}
                  </span>
                </div>
              </div>

              {/* Leader 3: Fastest Growing */}
              <div className="p-3.5 bg-slate-900/40 rounded-xl border border-white/5 flex items-center justify-between">
                <div>
                  <span className="text-[9px] text-slate-500 uppercase tracking-wider block">Fastest Growing</span>
                  <span className="text-xs font-bold text-white block mt-0.5">
                    {stats.fastestGrowingPlatform || 'None'}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-black text-green-400">
                    +{stats.fastestGrowingRate || 0}%
                  </span>
                  <span className="text-[9px] text-slate-400 block mt-0.5">MoM Growth</span>
                </div>
              </div>
            </div>
          </div>

          {/* Donut Chart: Current Subscriptions Distribution */}
          <div className="glass-panel p-5">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Platform Distribution</h3>
            <div className="h-[220px] w-full flex items-center justify-center relative">
              {!stats.pieData || stats.pieData.length === 0 ? (
                <p className="text-slate-500 text-sm">No platform distribution data available</p>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stats.pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={isMobile ? 40 : 60}
                      outerRadius={isMobile ? 65 : 85}
                      paddingAngle={4}
                      dataKey="value"
                      stroke="#0f172a"
                      strokeWidth={2}
                      label={false}
                    >
                      {stats.pieData.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '12px', color: '#fff' }}
                      itemStyle={{ color: '#fff' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
              {stats.pieData && stats.pieData.length > 0 && (
                <div className="absolute flex flex-col items-center justify-center">
                  <span className="text-2xl font-black text-white">{stats.activeSubscriptions}</span>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider">Subscribers</span>
                </div>
              )}
            </div>
            
            {/* Custom Legend for Donut */}
            <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
              {stats.pieData && stats.pieData.map((item: any, index: number) => (
                <div key={item.name} className="flex items-center gap-2 text-slate-300 truncate">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                  <span className="truncate">{item.name}</span>
                  <span className="text-slate-500 ml-auto font-bold shrink-0">{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Top Watch-time / Active Users */}
          <div className="glass-panel p-5 flex-1 flex flex-col">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
              <Clock size={16} className="text-secondary" />
              Most Active Users
            </h3>
            <div className="space-y-3 overflow-y-auto max-h-[300px] flex-1 custom-scrollbar">
              {stats.mostActiveUsers && stats.mostActiveUsers.length > 0 ? (
                stats.mostActiveUsers.map((u: any) => (
                  <div key={u._id} className="flex items-center gap-3 p-2 bg-slate-900/40 rounded-xl border border-white/5 hover:bg-slate-800/40 transition-colors duration-200">
                    <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-secondary text-xs">
                      {getInitials(u.name)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-white truncate">{u.name}</p>
                      <p className="text-[10px] text-slate-400 truncate">{u.email}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-slate-200">{u.activeSubscriptionDays || 0} active days</span>
                      <p className="text-[10px] text-slate-400 font-medium">
                        Renewals: <span className="text-white font-bold">{u.totalRenewals || 0}</span>
                      </p>
                      <p className="text-[9px] text-secondary font-semibold truncate">
                        {u.subscriptionCount || 0} subscriptions
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-slate-500 text-xs py-4">No active user history populated</p>
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default AdminDashboard;
