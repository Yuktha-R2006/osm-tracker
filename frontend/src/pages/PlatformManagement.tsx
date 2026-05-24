import React, { useState, useEffect } from 'react';
import { 
  MonitorPlay, 
  Plus, 
  Edit2, 
  CheckCircle, 
  XCircle, 
  Trash2, 
  Sparkles, 
  X, 
  Check,
  Palette,
  UploadCloud,
  FileImage,
  TrendingUp,
  DollarSign,
  AlertCircle,
  Eye,
  Info,
  Layers,
  Calendar,
  Activity
} from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

const PlatformManagement = () => {
  const getLogoUrl = (logo?: string) => {
    if (!logo) return '';
    if (logo.startsWith('http') || logo.startsWith('data:')) return logo;
    const host = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') ? 'http://localhost:5000' : '';
    return `${host}${logo}`;
  };

  const [platforms, setPlatforms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false);
  const [selectedAnalyticsPlatform, setSelectedAnalyticsPlatform] = useState<any>(null);
  
  // Drag and drop state
  const [dragActive, setDragActive] = useState(false);

  const [formData, setFormData] = useState({ 
    name: '', 
    description: '',
    logo: '', 
    status: 'active',
    themeColor: '#ff0055',
    subscriptionType: 'Premium',
    pricingMonthly: 9.99,
    pricingYearly: 99.99
  });
  
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    fetchPlatforms();
  }, []);

  const fetchPlatforms = async () => {
    try {
      setLoading(true);
      const res = await api.get('/platforms/all');
      setPlatforms(res.data);
    } catch (error) {
      console.error('Failed to fetch platforms', error);
      toast.error('Failed to retrieve platforms list');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (platform: any = null) => {
    if (platform) {
      const primaryPlan = platform.plans?.[0] || { name: 'Premium', pricingMonthly: 9.99, pricingYearly: 99.99 };
      setFormData({ 
        name: platform.name, 
        description: platform.description || '',
        logo: platform.logo || '', 
        status: platform.status,
        themeColor: platform.themeColor || '#ff0055',
        subscriptionType: primaryPlan.name || 'Premium',
        pricingMonthly: primaryPlan.pricingMonthly || 9.99,
        pricingYearly: primaryPlan.pricingYearly || 99.99
      });
      setEditingId(platform._id);
    } else {
      setFormData({ 
        name: '', 
        description: '',
        logo: '', 
        status: 'active',
        themeColor: '#ff0055',
        subscriptionType: 'Premium',
        pricingMonthly: 9.99,
        pricingYearly: 99.99
      });
      setEditingId(null);
    }
    setIsModalOpen(true);
  };

  const handleOpenAnalytics = (platform: any) => {
    setSelectedAnalyticsPlatform(platform);
    setIsAnalyticsOpen(true);
  };

  // Drag & drop handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file: File) => {
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast.error('Unsupported file format. Please upload PNG, JPG, SVG, or WEBP.');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64Logo = reader.result as string;
      setFormData(prev => ({ ...prev, logo: base64Logo }));
      
      if (editingId) {
        try {
          const res = await api.put(`/platforms/${editingId}/logo`, { logo: base64Logo, platformId: editingId });
          if (res.data && res.data.logo) {
            setFormData(prev => ({ ...prev, logo: res.data.logo }));
          }
          toast.success('Logo uploaded and updated in database!');
          fetchPlatforms();
        } catch (error) {
          console.error('Failed to upload logo to backend', error);
          toast.error('Failed to update logo in database');
        }
      } else {
        toast.success('Logo uploaded and preview generated!');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const payload = {
      name: formData.name,
      logo: formData.logo,
      status: formData.status,
      themeColor: formData.themeColor,
      description: formData.description,
      plans: [
        {
          name: formData.subscriptionType,
          pricingMonthly: Number(formData.pricingMonthly),
          pricingYearly: Number(formData.pricingYearly)
        }
      ]
    };

    try {
      if (editingId) {
        await api.put(`/platforms/${editingId}`, payload);
        toast.success('Platform configurations saved successfully');
        fetchPlatforms();
      } else {
        await api.post('/platforms', payload);
        toast.success('Platform created successfully');
        fetchPlatforms();
      }
      setIsModalOpen(false);
    } catch (error: any) {
      console.error('Failed to save platform', error);
      toast.error(error.response?.data?.message || 'Failed to save platform configurations');
    }
  };

  const toggleStatus = async (platform: any) => {
    try {
      const newStatus = platform.status === 'active' ? 'inactive' : 'active';
      await api.put(`/platforms/${platform._id}`, { status: newStatus });
      toast.success(`Platform ${newStatus === 'active' ? 'activated' : 'disabled'}`);
      fetchPlatforms();
    } catch (error) {
      console.error('Failed to update status', error);
      toast.error('Failed to toggle platform status');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this platform? This will affect users with this subscription.')) {
      try {
        await api.delete(`/platforms/${id}`);
        setPlatforms(platforms.filter(p => p._id !== id));
        toast.success('Platform removed from service database');
      } catch (error) {
        console.error('Failed to delete platform', error);
        toast.error('Failed to delete platform');
      }
    }
  };

  // Helper to calculate total revenue generated by a platform
  const calculateRevenue = (platform: any) => {
    const subs = platform.subscribers || 0;
    const monthlyRate = platform.plans?.[0]?.pricingMonthly || 9.99;
    return Math.round(subs * monthlyRate);
  };

  return (
    <div className="pb-20 md:pb-8 animate-in fade-in duration-300">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
            OTT Platforms Catalog <span className="text-xs font-semibold px-2 py-0.5 bg-[#00f0ff]/10 text-[#00f0ff] rounded border border-[#00f0ff]/20">Management</span>
          </h1>
          <p className="text-slate-400 mt-1">Configure active streaming channels, subscription pricing structures, and view customer distribution.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#00f0ff] to-[#00f0ff]/80 hover:shadow-[0_0_15px_rgba(0,240,255,0.4)] hover:border-[#00f0ff] border border-transparent text-slate-900 rounded-xl font-bold transition-all hover:scale-[1.02] cursor-pointer hover:shadow-cyan-500/20 active:scale-95"
        >
          <Plus size={20} />
          Add Platform
        </button>
      </div>



      {/* Grid of Platform Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {loading ? (
          <div className="col-span-full flex flex-col items-center justify-center py-20 gap-4">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#00f0ff]"></div>
            <p className="text-xs text-slate-500">Syncing platform catalog database...</p>
          </div>
        ) : platforms.length === 0 ? (
          <div className="col-span-full glass-panel p-12 text-center text-slate-500 text-sm border border-dashed border-slate-700/60 rounded-2xl">
            <MonitorPlay size={40} className="mx-auto text-slate-600 mb-3" />
            No streaming platforms cataloged in this repository.
          </div>
        ) : (
          platforms.map(platform => {
            const growth = platform.subscribers > 0 ? (platform.isTrending ? 18.4 : 7.2) : 0;
            const revenue = calculateRevenue(platform);

            return (
              <div 
                key={platform._id} 
                className="glass-panel p-5 relative overflow-hidden group hover:border-slate-500 transition-all duration-300 flex flex-col justify-between"
                style={{
                  borderLeft: `4px solid ${platform.themeColor || '#ff0055'}`,
                  boxShadow: `0 4px 20px -2px rgba(15, 23, 42, 0.5)`
                }}
              >
                {/* Top status badges */}
                <div className="absolute top-2 right-2 flex items-center gap-1.5 z-10">
                  {platform.isTrending && (
                    <span className="px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider bg-[#00f0ff]/20 text-[#00f0ff] border border-[#00f0ff]/30 animate-pulse">
                      <Sparkles size={8} className="inline mr-0.5" />
                      Trending
                    </span>
                  )}
                  <span className={`px-2 py-0.5 rounded text-[8px] font-black tracking-wider uppercase ${
                    platform.status === 'active' 
                      ? 'bg-green-500/10 text-green-400 border border-green-500/20' 
                      : 'bg-red-500/10 text-red-400 border border-red-500/20'
                  }`}>
                    {platform.status}
                  </span>
                </div>
                
                {/* Branding Section */}
                <div>
                  <div className="flex items-center gap-4 mb-5 mt-4">
                    <div className="w-16 h-16 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center p-2 group-hover:scale-105 transition-all duration-300 shadow-inner shrink-0 relative overflow-hidden">
                      {platform.logo ? (
                        <img 
                          src={getLogoUrl(platform.logo)} 
                          alt={platform.name} 
                          className="max-w-full max-h-full object-contain rounded-lg"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      ) : (
                        <span className="text-xl font-black text-slate-500">{platform.name.charAt(0)}</span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-lg font-bold text-white truncate leading-snug">{platform.name}</h3>
                      <p className="text-[10px] text-slate-500 uppercase tracking-widest font-mono mt-0.5">
                        {platform.plans?.[0]?.name || 'Premium'} Plan
                      </p>
                    </div>
                  </div>

                  {/* Enhanced Analytical summary inside card */}
                  <div className="grid grid-cols-2 gap-3 mb-6 bg-slate-950/40 p-3 rounded-xl border border-white/5">
                    <div>
                      <p className="text-[9px] text-slate-500 uppercase tracking-wide">Subscribers</p>
                      <p className="text-sm font-bold text-slate-200">{platform.subscribers || 0}</p>
                    </div>
                    <div className="border-l border-white/5 pl-3">
                      <p className="text-[9px] text-slate-500 uppercase tracking-wide">Revenue</p>
                      <p className="text-sm font-bold text-green-400 flex items-center gap-0.5">
                        <DollarSign size={12} className="shrink-0" />
                        {revenue}/mo
                      </p>
                    </div>
                    <div className="border-t border-white/5 pt-2">
                      <p className="text-[9px] text-slate-500 uppercase tracking-wide">Cancel Rate</p>
                      <p className="text-sm font-bold text-red-400">{platform.cancellationPercentage || 0}%</p>
                    </div>
                    <div className="border-t border-l border-white/5 pl-3 pt-2">
                      <p className="text-[9px] text-slate-500 uppercase tracking-wide">Growth %</p>
                      <p className="text-sm font-bold text-[#00f0ff] flex items-center gap-0.5">
                        <TrendingUp size={12} />
                        +{growth}%
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="flex flex-col gap-2 pt-3 border-t border-slate-800/40">
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleOpenModal(platform)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-slate-800 hover:bg-slate-700/80 text-slate-200 border border-slate-700 hover:border-slate-500 rounded-xl text-xs font-bold transition-all cursor-pointer hover:shadow-lg active:scale-95"
                      title="Configure Metadata"
                    >
                      <Edit2 size={12} /> Configure
                    </button>
                    <button 
                      onClick={() => handleOpenAnalytics(platform)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-slate-900/60 hover:bg-slate-800/60 text-[#00f0ff] border border-[#00f0ff]/20 hover:border-[#00f0ff]/60 rounded-xl text-xs font-bold transition-all cursor-pointer active:scale-95"
                      title="View Insights"
                    >
                      <Eye size={12} /> Insights
                    </button>
                  </div>
                  
                  <div className="flex gap-2">
                    <button 
                      onClick={() => toggleStatus(platform)}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-xl text-xs font-bold transition-all border cursor-pointer active:scale-95 ${
                        platform.status === 'active' 
                          ? 'bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 border-orange-500/20 hover:border-orange-500/40' 
                          : 'bg-green-500/10 hover:bg-green-500/20 text-green-400 border-green-500/20 hover:border-green-500/40'
                      }`}
                    >
                      {platform.status === 'active' ? <XCircle size={12} /> : <CheckCircle size={12} />}
                      {platform.status === 'active' ? 'Suspend' : 'Activate'}
                    </button>
                    <button 
                      onClick={() => handleDelete(platform._id)}
                      className="flex items-center justify-center gap-1.5 py-1.5 px-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl text-xs font-bold transition-all border border-red-500/20 hover:border-red-500/40 cursor-pointer active:scale-95"
                      title="Delete Platform permanently"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>

              </div>
            );
          })
        )}
      </div>

      {/* Analytics/Insights Modal */}
      {isAnalyticsOpen && selectedAnalyticsPlatform && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
          <div 
            className="bg-[#1e293b]/95 border border-white/10 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col relative"
            style={{ borderTop: `6px solid ${selectedAnalyticsPlatform.themeColor || '#ff0055'}` }}
          >
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Activity className="text-[#00f0ff]" size={20} />
                {selectedAnalyticsPlatform.name} Analytics Overview
              </h2>
              <button
                onClick={() => setIsAnalyticsOpen(false)}
                className="text-slate-400 hover:text-white p-1 hover:bg-slate-800 rounded-lg cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-6 overflow-y-auto max-h-[75vh] custom-scrollbar">
              {/* branding header */}
              <div className="flex items-center gap-4 p-4 bg-slate-900/40 rounded-2xl border border-white/5">
                <div className="w-16 h-16 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center p-1.5 shrink-0 overflow-hidden shadow-inner">
                  {selectedAnalyticsPlatform.logo ? (
                    <img 
                      src={getLogoUrl(selectedAnalyticsPlatform.logo)} 
                      alt={selectedAnalyticsPlatform.name} 
                      className="max-w-full max-h-full object-contain" 
                    />
                  ) : (
                    <span className="text-2xl font-black text-slate-500">{selectedAnalyticsPlatform.name.charAt(0)}</span>
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white leading-snug">{selectedAnalyticsPlatform.name}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Primary Plan: <span className="font-semibold text-slate-300">{selectedAnalyticsPlatform.plans?.[0]?.name || 'Premium'}</span></p>
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest font-mono mt-1">Accent: <span className="font-bold font-mono" style={{ color: selectedAnalyticsPlatform.themeColor }}>{selectedAnalyticsPlatform.themeColor || '#ff0055'}</span></p>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Service Profile & Offering</h4>
                <p className="text-xs text-slate-300 bg-slate-900/20 border border-white/5 rounded-xl p-3.5 leading-relaxed">
                  {selectedAnalyticsPlatform.description || "No customized service description has been cataloged for this streaming platform. Configure platform metadata to describe its core features, content formats, and streaming qualities."}
                </p>
              </div>

              {/* Pricing Cards */}
              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Catalog Rate Cards</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-900/40 border border-white/5 rounded-xl p-3 flex flex-col justify-between">
                    <span className="text-[9px] text-slate-500 uppercase font-bold tracking-wide">Monthly Price</span>
                    <span className="text-lg font-black text-white mt-1">
                      ${selectedAnalyticsPlatform.plans?.[0]?.pricingMonthly || '9.99'}/mo
                    </span>
                  </div>
                  <div className="bg-slate-900/40 border border-white/5 rounded-xl p-3 flex flex-col justify-between">
                    <span className="text-[9px] text-slate-500 uppercase font-bold tracking-wide">Yearly Price</span>
                    <span className="text-lg font-black text-[#00f0ff] mt-1">
                      ${selectedAnalyticsPlatform.plans?.[0]?.pricingYearly || '99.99'}/yr
                    </span>
                  </div>
                </div>
              </div>

              {/* Deep Analysis telemetry metrics */}
              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Membership Insights</h4>
                <div className="grid grid-cols-2 gap-4 bg-slate-950/40 border border-white/5 rounded-xl p-4">
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-slate-500">Gross Monthly Volume</span>
                    <p className="text-lg font-black text-green-400 flex items-center gap-0.5">
                      <DollarSign size={16} />
                      {calculateRevenue(selectedAnalyticsPlatform)}
                    </p>
                  </div>
                  <div className="space-y-0.5 pl-3 border-l border-white/5">
                    <span className="text-[10px] text-slate-500">Gross Annual Projection</span>
                    <p className="text-lg font-black text-white flex items-center gap-0.5">
                      <DollarSign size={16} />
                      {calculateRevenue(selectedAnalyticsPlatform) * 12}
                    </p>
                  </div>
                  <div className="space-y-0.5 border-t border-white/5 pt-3 mt-3">
                    <span className="text-[10px] text-slate-500">Premium Density</span>
                    <p className="text-sm font-bold text-purple-400">
                      {selectedAnalyticsPlatform.premiumSubscribers || 0} premium members
                    </p>
                  </div>
                  <div className="space-y-0.5 border-t border-l border-white/5 pl-3 pt-3 mt-3">
                    <span className="text-[10px] text-slate-500">Retention Standing</span>
                    <p className="text-sm font-bold text-slate-200">
                      {Math.max(0, 100 - (selectedAnalyticsPlatform.cancellationPercentage || 0))}% stable
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => setIsAnalyticsOpen(false)}
                  className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  Close Insights File
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit/Create Premium Glassmorphism Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-[#1e293b]/95 border border-white/10 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col max-h-[95vh] relative">
            <div 
              className="absolute top-0 left-0 w-full h-[5px]" 
              style={{ backgroundColor: formData.themeColor || '#00f0ff' }}
            ></div>
            
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Layers className="text-[#00f0ff]" size={18} />
                {editingId ? 'Configure OTT Platform' : 'Create OTT Platform'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 hover:bg-slate-800 rounded-lg cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto max-h-[calc(95vh-85px)] custom-scrollbar">
              
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Platform Name</label>
                <input 
                  type="text" 
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-slate-900/60 border border-slate-700 rounded-xl py-2 px-3 text-white focus:outline-none focus:border-[#00f0ff] focus:shadow-[0_0_10px_rgba(0,240,255,0.15)] text-sm transition-all"
                  placeholder="e.g. HBO Max"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Platform Description</label>
                <textarea 
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full bg-slate-900/60 border border-slate-700 rounded-xl py-2 px-3 text-white focus:outline-none focus:border-[#00f0ff] focus:shadow-[0_0_10px_rgba(0,240,255,0.15)] text-sm h-18 resize-none transition-all"
                  placeholder="Catalog highlights, content selection, video quality specs..."
                />
              </div>

              {/* Logo Upload System */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">Platform Logo</label>
                
                {formData.logo ? (
                  /* Circular Preview and change/remove actions */
                  <div className="p-4 bg-slate-900/60 border border-slate-700 rounded-xl flex items-center justify-between gap-4 animate-in zoom-in duration-200">
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-14 rounded-full bg-slate-950 border border-slate-700 flex items-center justify-center p-1.5 overflow-hidden shadow-inner shrink-0">
                        <img 
                          src={getLogoUrl(formData.logo)} 
                          alt="Platform Logo Preview" 
                          className="w-full h-full object-contain rounded-full"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-white truncate">Logo Uploaded</p>
                        <p className="text-[10px] text-slate-400">Ready for catalog integration</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <label className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-[10px] font-bold rounded-lg transition-colors cursor-pointer select-none">
                        Change
                        <input 
                          type="file" 
                          accept=".png,.jpg,.jpeg,.svg,.webp" 
                          className="hidden" 
                          onChange={handleFileInputChange} 
                        />
                      </label>
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, logo: '' }))}
                        className="p-1.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 rounded-lg transition-colors cursor-pointer"
                        title="Remove Logo"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Drag and drop neon dashed area */
                  <div 
                    onDragEnter={handleDrag}
                    onDragOver={handleDrag}
                    onDragLeave={handleDrag}
                    onDrop={handleDrop}
                    className={`w-full p-6 bg-slate-950/40 rounded-xl border-2 border-dashed flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 relative ${
                      dragActive 
                        ? 'border-[#00f0ff] bg-[#00f0ff]/5 shadow-[0_0_15px_rgba(0,240,255,0.15)]' 
                        : 'border-slate-700 hover:border-slate-500 hover:bg-slate-900/20'
                    }`}
                  >
                    <input 
                      type="file" 
                      accept=".png,.jpg,.jpeg,.svg,.webp" 
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      onChange={handleFileInputChange}
                    />
                    <UploadCloud size={28} className={`mb-2 transition-transform duration-300 ${dragActive ? 'scale-110 text-[#00f0ff]' : 'text-slate-400'}`} />
                    <p className="text-xs font-bold text-white leading-snug">Drag & drop logo here</p>
                    <p className="text-[10px] text-slate-500 mt-1">or <span className="text-[#00f0ff] hover:underline font-semibold">browse your computer</span></p>
                    <p className="text-[9px] text-slate-500 mt-1 uppercase font-mono tracking-wider">PNG, JPG, SVG, WEBP (Max 2MB)</p>
                  </div>
                )}
              </div>

              {/* Pricing breakdown */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Monthly Price ($)</label>
                  <input 
                    type="number" 
                    step="0.01"
                    min="0"
                    required
                    value={formData.pricingMonthly}
                    onChange={(e) => setFormData({...formData, pricingMonthly: parseFloat(e.target.value) || 0})}
                    className="w-full bg-slate-900/60 border border-slate-700 rounded-xl py-2 px-3 text-white focus:outline-none focus:border-[#00f0ff] text-sm transition-all"
                    placeholder="9.99"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Yearly Price ($)</label>
                  <input 
                    type="number" 
                    step="0.01"
                    min="0"
                    required
                    value={formData.pricingYearly}
                    onChange={(e) => setFormData({...formData, pricingYearly: parseFloat(e.target.value) || 0})}
                    className="w-full bg-slate-900/60 border border-slate-700 rounded-xl py-2 px-3 text-white focus:outline-none focus:border-[#00f0ff] text-sm transition-all"
                    placeholder="99.99"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Subscription Type (Primary Plan Name)</label>
                <input 
                  type="text" 
                  required
                  value={formData.subscriptionType}
                  onChange={(e) => setFormData({...formData, subscriptionType: e.target.value})}
                  className="w-full bg-slate-900/60 border border-slate-700 rounded-xl py-2 px-3 text-white focus:outline-none focus:border-[#00f0ff] text-sm transition-all"
                  placeholder="e.g. Premium HD, Mega Pass, VIP Plan"
                />
              </div>
              
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Theme Accent Color</label>
                <div className="relative">
                  <Palette size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input 
                    type="text" 
                    required
                    value={formData.themeColor}
                    onChange={(e) => setFormData({...formData, themeColor: e.target.value})}
                    className="w-full bg-slate-900/60 border border-slate-700 rounded-xl py-2 pl-10 pr-4 text-white focus:outline-none focus:border-[#00f0ff] text-sm font-mono transition-all"
                    placeholder="#ff0055"
                  />
                  <input 
                    type="color" 
                    value={formData.themeColor}
                    onChange={(e) => setFormData({...formData, themeColor: e.target.value})}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 border-0 bg-transparent rounded cursor-pointer"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Platform Status</label>
                <select 
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                  className="w-full bg-slate-900/60 border border-slate-700 rounded-xl py-2.5 px-3 text-white focus:outline-none focus:border-[#00f0ff] text-sm cursor-pointer transition-all"
                >
                  <option value="active">Active Integration</option>
                  <option value="inactive">Suspended Integration</option>
                </select>
              </div>

              <div className="pt-4 flex gap-3">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition-all cursor-pointer active:scale-95"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="flex-1 py-2.5 bg-[#00f0ff] hover:bg-[#00d0e6] text-slate-900 rounded-xl text-xs font-bold shadow-md cursor-pointer transition-all flex items-center justify-center gap-1.5 active:scale-95"
                >
                  <Check size={14} />
                  Save Configurations
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlatformManagement;
