import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, CreditCard, Clock, Trash2, CheckCircle, RefreshCw, Edit2, X } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';

const SubscriptionDetails = () => {
  const getLogoUrl = (logo?: string) => {
    if (!logo) return '';
    if (logo.startsWith('http') || logo.startsWith('data:')) return logo;
    const apiUrl = (import.meta as any).env.VITE_API_URL || 'http://localhost:5000/api';
    const backendUrl = apiUrl.replace(/\/api$/, '');
    if (logo.startsWith('/uploads')) {
      return `${backendUrl}${logo}`;
    }
    return logo;
  };

  const { id } = useParams();
  const navigate = useNavigate();
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    planName: '',
    subscriptionCost: 0,
    startDate: '',
    expiryDate: '',
    autoRenewal: false
  });

  useEffect(() => {
    fetchSubscription();
  }, [id]);

  useEffect(() => {
    if (subscription) {
      setEditFormData({
        planName: subscription.planName || '',
        subscriptionCost: subscription.subscriptionCost || 0,
        startDate: subscription.startDate ? new Date(subscription.startDate).toISOString().split('T')[0] : '',
        expiryDate: subscription.expiryDate ? new Date(subscription.expiryDate).toISOString().split('T')[0] : '',
        autoRenewal: !!subscription.autoRenewal
      });
    }
  }, [subscription]);

  const fetchSubscription = async () => {
    try {
      const res = await api.get('/subscriptions');
      const sub = res.data.find(s => s._id === id);
      if (sub) {
        setSubscription(sub);
      } else {
        navigate('/dashboard');
      }
    } catch (error) {
      console.error(error);
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (window.confirm('Are you sure you want to cancel this subscription?')) {
      try {
        const res = await api.delete(`/subscriptions/${id}`);
        setSubscription(res.data.subscription);
        toast.success('Subscription cancelled successfully');
      } catch (error) {
        console.error('Failed to cancel', error);
        toast.error('Failed to cancel subscription');
      }
    }
  };

  const handleRenew = async () => {
    try {
      const baseDate = new Date(subscription.expiryDate) > new Date() ? new Date(subscription.expiryDate) : new Date();
      baseDate.setDate(baseDate.getDate() + 30);
      
      const res = await api.put(`/subscriptions/${id}`, {
        status: 'active',
        expiryDate: baseDate.toISOString()
      });
      setSubscription(res.data);
      toast.success('Subscription renewed successfully!');
    } catch (error) {
      console.error('Failed to renew', error);
      toast.error('Failed to renew subscription');
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.put(`/subscriptions/${id}`, {
        ...editFormData,
        subscriptionCost: Number(editFormData.subscriptionCost)
      });
      setSubscription(res.data);
      setIsEditModalOpen(false);
      toast.success('Subscription details updated!');
    } catch (error) {
      console.error('Failed to update', error);
      toast.error('Failed to update subscription details');
    }
  };

  if (loading) return <div className="text-white text-center py-20">Loading...</div>;
  if (!subscription) return null;

  const today = new Date();
  const expiry = new Date(subscription.expiryDate);
  const diffTime = expiry.getTime() - today.getTime();
  const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  const getPlatformColor = () => {
    const name = subscription.ottPlatformId?.name?.toLowerCase() || '';
    if (name.includes('netflix')) return 'from-red-600 to-red-400';
    if (name.includes('prime') || name.includes('amazon')) return 'from-blue-600 to-blue-400';
    if (name.includes('disney')) return 'from-indigo-600 to-indigo-400';
    if (name.includes('viki')) return 'from-purple-600 to-purple-400';
    if (name.includes('iqiyi')) return 'from-green-600 to-green-400';
    return 'from-[#ff0055] to-[#00f0ff]';
  };

  const getStatusColor = () => {
    if (subscription.status === 'active') {
      if (daysRemaining <= 3) return 'text-orange-400 bg-orange-400/10 border-orange-400/30 shadow-[0_0_10px_rgba(251,146,60,0.3)]';
      return 'text-green-400 bg-green-400/10 border-green-400/30 shadow-[0_0_10px_rgba(74,222,128,0.3)]';
    }
    if (subscription.status === 'cancelled') {
      return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30 shadow-[0_0_10px_rgba(234,179,8,0.3)]';
    }
    return 'text-red-400 bg-red-400/10 border-red-400/30 shadow-[0_0_10px_rgba(248,113,113,0.3)]';
  };

  return (
    <div className="max-w-4xl mx-auto pb-20 md:pb-0 animate-in fade-in duration-500">
      <button 
        onClick={() => navigate('/dashboard')}
        className="flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors hover:scale-105 transform duration-200 cursor-pointer"
      >
        <ArrowLeft size={20} />
        Back to Dashboard
      </button>

      {/* Hero Banner */}
      <div className="glass-panel backdrop-blur-xl bg-white/5 border border-white/10 overflow-hidden relative mb-8">
        <div className={`absolute inset-0 bg-gradient-to-br ${getPlatformColor()} opacity-20`}></div>
        <div className={`absolute inset-0 bg-gradient-to-b from-transparent to-[#0f172a]`}></div>
        
        <div className="p-8 md:p-12 relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="flex items-center gap-8">
              <div className="w-32 h-32 rounded-2xl bg-slate-900/60 backdrop-blur-sm flex items-center justify-center border border-white/10 overflow-hidden shadow-2xl shadow-black/30 group hover:scale-105 transition-transform duration-300">
                 {subscription.ottPlatformId?.logo ? (
                  <img src={getLogoUrl(subscription.ottPlatformId.logo)} alt={subscription.ottPlatformId.name} className="w-full h-full object-contain bg-white" />
                ) : (
                  <span className="text-3xl font-bold text-slate-500">{subscription.ottPlatformId?.name?.charAt(0)}</span>
                )}
              </div>
              <div>
                <h1 className="text-4xl font-bold text-white mb-3 bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">{subscription.ottPlatformId?.name}</h1>
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="px-4 py-2 bg-slate-900/60 backdrop-blur-sm text-slate-300 rounded-full text-sm font-medium border border-white/10">
                    {subscription.planName}
                  </span>
                  <span className={`px-4 py-2 rounded-full text-sm font-medium border transition-all duration-300 ${getStatusColor()}`}>
                    {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-3">
              <button 
                onClick={() => setIsEditModalOpen(true)}
                className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-3 bg-slate-800 hover:bg-slate-700 text-white border border-white/10 rounded-xl font-semibold transition-all duration-300 hover:scale-105 cursor-pointer"
              >
                <Edit2 size={18} />
                Edit
              </button>
              <button 
                onClick={handleRenew}
                className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-[#00f0ff] to-[#00f0ff]/80 hover:from-[#00f0ff]/90 text-slate-900 border border-[#00f0ff]/30 rounded-xl font-semibold transition-all duration-300 shadow-[0_0_15px_rgba(0,240,255,0.3)] hover:shadow-[0_0_25px_rgba(0,240,255,0.5)] hover:scale-105 cursor-pointer"
              >
                <RefreshCw size={18} />
                Renew
              </button>
              {subscription.status === 'active' && (
                <button 
                  onClick={handleCancel}
                  className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-[#ff0055] to-[#ff0055]/80 hover:from-[#ff0055]/90 text-white border border-[#ff0055]/30 rounded-xl font-semibold transition-all duration-300 shadow-[0_0_15px_rgba(255,0,85,0.3)] hover:shadow-[0_0_25px_rgba(255,0,85,0.5)] hover:scale-105 cursor-pointer"
                >
                  <Trash2 size={18} />
                  Cancel
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Calendar className="text-[#00f0ff]" /> Subscription Details
          </h3>
          
          <div className="glass-panel backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4 hover:border-white/20 transition-all duration-300">
            <div className="flex justify-between items-center">
              <span className="text-slate-400 text-sm">Start Date</span>
              <span className="text-white font-medium">{new Date(subscription.startDate).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400 text-sm">Expiry Date</span>
              <span className="text-white font-medium">{new Date(subscription.expiryDate).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between items-center pt-4 border-t border-white/10">
              <span className="text-slate-400 text-sm">Days Remaining</span>
              <span className={`font-bold ${daysRemaining <= 3 && subscription.status === 'active' ? 'text-orange-400' : 'text-[#00f0ff]'} text-lg`}>
                {subscription.status === 'active' ? (daysRemaining > 0 ? `${daysRemaining} days` : '0 days') : '0 days'}
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <CreditCard className="text-[#ff0055]" /> Billing Information
          </h3>
          
          <div className="glass-panel backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4 hover:border-white/20 transition-all duration-300">
            <div className="flex justify-between items-center">
              <span className="text-slate-400 text-sm">Subscription Cost</span>
              <span className="text-white font-medium text-lg">${subscription.subscriptionCost}/month</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400 text-sm">Auto Renewal</span>
              <span className="text-white font-medium flex items-center gap-2">
                {subscription.autoRenewal ? (
                  <><CheckCircle size={16} className="text-green-400" /> Enabled</>
                ) : (
                  <><Clock size={16} className="text-slate-500" /> Disabled</>
                )}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-[#1e293b]/80 backdrop-blur-xl border border-white/10 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl shadow-black/50 animate-in zoom-in-95 duration-300">
            <div className="flex justify-between items-center p-5 border-b border-white/10">
              <h2 className="text-xl font-bold text-white bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">Edit Subscription</h2>
              <button onClick={() => setIsEditModalOpen(false)} className="text-slate-400 hover:text-white transition-colors hover:scale-110 transform duration-200 cursor-pointer">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Plan Name</label>
                <input
                  type="text"
                  required
                  value={editFormData.planName}
                  onChange={(e) => setEditFormData({...editFormData, planName: e.target.value})}
                  className="w-full bg-slate-900/60 backdrop-blur-sm border border-white/10 rounded-lg py-2.5 px-3 text-white placeholder-slate-500 focus:outline-none focus:border-[#00f0ff] focus:shadow-[0_0_15px_rgba(0,240,255,0.3)] transition-all duration-300"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Cost ($)</label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={editFormData.subscriptionCost}
                  onChange={(e) => setEditFormData({...editFormData, subscriptionCost: Number(e.target.value)})}
                  className="w-full bg-slate-900/60 backdrop-blur-sm border border-white/10 rounded-lg py-2.5 px-3 text-white placeholder-slate-500 focus:outline-none focus:border-[#00f0ff] focus:shadow-[0_0_15px_rgba(0,240,255,0.3)] transition-all duration-300"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Start Date</label>
                  <input
                    type="date"
                    required
                    value={editFormData.startDate}
                    onChange={(e) => setEditFormData({...editFormData, startDate: e.target.value})}
                    className="w-full bg-slate-900/60 backdrop-blur-sm border border-white/10 rounded-lg py-2.5 px-3 text-white focus:outline-none focus:border-[#00f0ff] transition-all duration-300"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Expiry Date</label>
                  <input
                    type="date"
                    required
                    value={editFormData.expiryDate}
                    onChange={(e) => setEditFormData({...editFormData, expiryDate: e.target.value})}
                    className="w-full bg-slate-900/60 backdrop-blur-sm border border-white/10 rounded-lg py-2.5 px-3 text-white focus:outline-none focus:border-[#00f0ff] transition-all duration-300"
                  />
                </div>
              </div>

              <div className="flex items-center mt-4">
                <input
                  id="editAutoRenewal"
                  type="checkbox"
                  checked={editFormData.autoRenewal}
                  onChange={(e) => setEditFormData({...editFormData, autoRenewal: e.target.checked})}
                  className="w-4 h-4 rounded border-white/20 text-[#00f0ff] focus:ring-[#00f0ff] bg-slate-900/60 cursor-pointer"
                />
                <label htmlFor="editAutoRenewal" className="ml-2 text-sm text-slate-300 cursor-pointer">
                  Auto-renewal enabled
                </label>
              </div>

              <div className="pt-4 border-t border-white/10 mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
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

export default SubscriptionDetails;
