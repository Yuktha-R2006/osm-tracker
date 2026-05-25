import React, { useState, useEffect } from 'react';
import { X, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';
import API_URL from '../config/api';

const AddSubscriptionModal = ({ isOpen, onClose, onAdd }) => {
  const getLogoUrl = (logo?: string) => {
    if (!logo) return '';
    if (logo.startsWith('http') || logo.startsWith('data:')) return logo;
    const backendUrl = API_URL.replace(/\/api$/, '');
    if (logo.startsWith('/uploads')) {
      return `${backendUrl}${logo}`;
    }
    return logo;
  };

  const [platforms, setPlatforms] = useState([]);
  const [formData, setFormData] = useState({
    ottPlatformId: '',
    planName: '',
    startDate: new Date().toISOString().split('T')[0],
    expiryDate: '',
    subscriptionCost: '',
    autoRenewal: false
  });
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSuccessAnim, setShowSuccessAnim] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchPlatforms();
      setShowSuccessAnim(false);
    }
  }, [isOpen]);

  const fetchPlatforms = async () => {
    try {
      const res = await api.get('/platforms');
      setPlatforms(res.data);
      if (res.data.length > 0) {
        const defaultPlatform = res.data[0];
        const defaultPlan = defaultPlatform.plans?.[0];
        const start = new Date();
        const expiry = new Date();
        expiry.setDate(start.getDate() + 30);
        
        setFormData({
          ottPlatformId: defaultPlatform._id,
          planName: defaultPlan ? defaultPlan.name : '',
          startDate: start.toISOString().split('T')[0],
          expiryDate: expiry.toISOString().split('T')[0],
          subscriptionCost: defaultPlan ? defaultPlan.pricingMonthly.toString() : '9.99',
          autoRenewal: false
        });
        setBillingCycle('monthly');
      }
    } catch (err) {
      console.error(err);
      setError('Failed to load platforms');
    }
  };

  const handlePlatformSelect = (platformId) => {
    const selected = platforms.find(p => p._id === platformId);
    if (selected) {
      const defaultPlan = selected.plans?.[0];
      const start = new Date(formData.startDate);
      const expiry = new Date(start);
      expiry.setDate(start.getDate() + 30);
      
      setFormData(prev => ({
        ...prev,
        ottPlatformId: platformId,
        planName: defaultPlan ? defaultPlan.name : '',
        subscriptionCost: defaultPlan ? defaultPlan.pricingMonthly.toString() : '9.99',
        expiryDate: expiry.toISOString().split('T')[0]
      }));
      setBillingCycle('monthly');
    }
  };

  const handlePlanChange = (planName) => {
    const selectedPlatform = platforms.find(p => p._id === formData.ottPlatformId);
    const plan = selectedPlatform?.plans?.find(p => p.name === planName);
    if (plan) {
      const price = billingCycle === 'yearly' ? plan.pricingYearly : plan.pricingMonthly;
      setFormData(prev => ({
        ...prev,
        planName: plan.name,
        subscriptionCost: price.toString()
      }));
    }
  };

  const handleCycleChange = (cycle) => {
    setBillingCycle(cycle);
    const selectedPlatform = platforms.find(p => p._id === formData.ottPlatformId);
    const plan = selectedPlatform?.plans?.find(p => p.name === formData.planName);
    if (plan) {
      const price = cycle === 'yearly' ? plan.pricingYearly : plan.pricingMonthly;
      
      const start = new Date(formData.startDate);
      const expiry = new Date(start);
      if (cycle === 'yearly') {
        expiry.setFullYear(start.getFullYear() + 1);
      } else {
        expiry.setDate(start.getDate() + 30);
      }

      setFormData(prev => ({
        ...prev,
        subscriptionCost: price.toString(),
        expiryDate: expiry.toISOString().split('T')[0]
      }));
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => {
      const updated = {
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      };
      
      // Auto recalculate expiry date if start date changes
      if (name === 'startDate') {
        const start = new Date(value);
        const expiry = new Date(start);
        if (billingCycle === 'yearly') {
          expiry.setFullYear(start.getFullYear() + 1);
        } else {
          expiry.setDate(start.getDate() + 30);
        }
        updated.expiryDate = expiry.toISOString().split('T')[0];
      }

      return updated;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const payload = {
        ...formData,
        subscriptionCost: Number(formData.subscriptionCost)
      };
      
      const res = await api.post('/subscriptions', payload);
      
      // Show success animation
      setShowSuccessAnim(true);
      
      setTimeout(() => {
        onAdd(res.data);
        toast.success('Subscription added successfully!');
        onClose();
      }, 1500);
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Failed to add subscription';
      setError(errorMsg);
      toast.error(errorMsg);
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const selectedPlatform = platforms.find(p => p._id === formData.ottPlatformId);
  const availablePlans = selectedPlatform?.plans || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-[#1e293b]/80 backdrop-blur-xl border border-white/10 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl shadow-black/50 animate-in zoom-in-95 duration-300 relative">
        
        {showSuccessAnim ? (
          <div className="p-10 text-center flex flex-col items-center justify-center space-y-4 h-[500px]">
            <div className="w-20 h-20 bg-green-500/20 text-green-400 rounded-full border border-green-500/40 flex items-center justify-center animate-bounce shadow-[0_0_30px_rgba(34,197,94,0.4)]">
              <Sparkles size={40} />
            </div>
            <h3 className="text-2xl font-bold text-white">Success!</h3>
            <p className="text-slate-300">Adding subscription to your portfolio...</p>
            <div className="w-12 h-1.5 bg-green-500 rounded-full overflow-hidden relative">
              <div className="absolute inset-y-0 left-0 bg-white w-1/3 animate-ping"></div>
            </div>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center p-5 border-b border-white/10">
              <h2 className="text-xl font-bold text-white bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">Add Subscription</h2>
              <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors hover:scale-110 transform duration-200 cursor-pointer">
                <X size={20} />
              </button>
            </div>

            <div className="p-6">
              {error && <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded-lg mb-4 text-sm backdrop-blur-sm">{error}</div>}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Platform</label>
                  <div className="grid grid-cols-4 gap-2 mb-3 max-h-40 overflow-y-auto custom-scrollbar pr-2">
                    {platforms.map(platform => (
                      <div
                        key={platform._id}
                        onClick={() => handlePlatformSelect(platform._id)}
                        className={`cursor-pointer rounded-xl border p-2 flex flex-col items-center justify-center gap-1 transition-all duration-300 ${
                          formData.ottPlatformId === platform._id
                            ? 'bg-[#ff0055]/20 border-[#ff0055] shadow-[0_0_15px_rgba(255,0,85,0.4)] scale-105'
                            : 'bg-slate-900/60 backdrop-blur-sm border-white/10 hover:border-white/20 hover:bg-slate-800/60'
                        }`}
                      >
                        <div className="w-8 h-8 rounded-full overflow-hidden bg-white/5 flex items-center justify-center">
                           {platform.logo ? <img src={getLogoUrl(platform.logo)} alt={platform.name} className="w-full h-full object-contain" /> : <span className="text-xs">{platform.name.charAt(0)}</span>}
                        </div>
                        <span className="text-[10px] text-center text-slate-300 truncate w-full">{platform.name}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">Select Plan</label>
                    <select
                      name="planName"
                      value={formData.planName}
                      onChange={(e) => handlePlanChange(e.target.value)}
                      className="w-full bg-slate-900/60 backdrop-blur-sm border border-white/10 rounded-lg py-2.5 px-3 text-white focus:outline-none focus:border-[#00f0ff] transition-all duration-300 cursor-pointer"
                    >
                      {availablePlans.map(plan => (
                        <option key={plan.name} value={plan.name} className="bg-slate-900 text-white">
                          {plan.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">Billing Cycle</label>
                    <select
                      value={billingCycle}
                      onChange={(e) => handleCycleChange(e.target.value)}
                      className="w-full bg-slate-900/60 backdrop-blur-sm border border-white/10 rounded-lg py-2.5 px-3 text-white focus:outline-none focus:border-[#00f0ff] transition-all duration-300 cursor-pointer"
                    >
                      <option value="monthly" className="bg-slate-900 text-white">Monthly</option>
                      <option value="yearly" className="bg-slate-900 text-white">Yearly</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">Start Date</label>
                    <input
                      type="date"
                      name="startDate"
                      required
                      value={formData.startDate}
                      onChange={handleChange}
                      className="w-full bg-slate-900/60 backdrop-blur-sm border border-white/10 rounded-lg py-2.5 px-3 text-white focus:outline-none focus:border-[#00f0ff] transition-all duration-300"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">Expiry Date</label>
                    <input
                      type="date"
                      name="expiryDate"
                      required
                      value={formData.expiryDate}
                      onChange={handleChange}
                      className="w-full bg-slate-900/60 backdrop-blur-sm border border-white/10 rounded-lg py-2.5 px-3 text-white focus:outline-none focus:border-[#00f0ff] transition-all duration-300"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Amount ($)</label>
                  <input
                    type="number"
                    name="subscriptionCost"
                    required
                    min="0"
                    step="0.01"
                    value={formData.subscriptionCost}
                    onChange={handleChange}
                    className="w-full bg-slate-900/60 backdrop-blur-sm border border-white/10 rounded-lg py-2.5 px-3 text-white focus:outline-none focus:border-[#00f0ff] focus:shadow-[0_0_15px_rgba(0,240,255,0.3)] transition-all duration-300"
                  />
                </div>

                <div className="flex items-center mt-4">
                  <input
                    id="autoRenewal"
                    name="autoRenewal"
                    type="checkbox"
                    checked={formData.autoRenewal}
                    onChange={handleChange}
                    className="w-4 h-4 rounded border-white/20 text-[#00f0ff] focus:ring-[#00f0ff] focus:ring-offset-0 bg-slate-900/60 cursor-pointer"
                  />
                  <label htmlFor="autoRenewal" className="ml-2 text-sm text-slate-300 cursor-pointer">
                    Auto-renewal enabled
                  </label>
                </div>

                <div className="pt-4 border-t border-white/10 mt-6 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-slate-300 hover:text-white font-medium transition-colors hover:bg-white/5 rounded-lg cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2 bg-gradient-to-r from-[#ff0055] to-[#ff0055]/80 hover:from-[#ff0055]/90 text-white rounded-lg font-bold transition-all duration-300 shadow-[0_0_15px_rgba(255,0,85,0.3)] hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 cursor-pointer"
                  >
                    {loading ? 'Saving...' : 'Add Subscription'}
                  </button>
                </div>
              </form>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AddSubscriptionModal;
