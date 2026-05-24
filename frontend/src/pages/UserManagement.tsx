import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Trash2, 
  Search, 
  Mail, 
  Calendar, 
  Eye, 
  Power, 
  PowerOff, 
  Edit2, 
  X, 
  Check, 
  Award, 
  Clock,
  UserCheck
} from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

const UserManagement = () => {
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

  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  
  // Edit Modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState<any>({
    id: '',
    numericId: '',
    name: '',
    email: '',
    isPremium: false,
    isActive: true,
    totalRenewals: 0
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/users');
      setUsers(res.data);
    } catch (error) {
      console.error('Failed to fetch users', error);
      toast.error('Failed to retrieve user list');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to permanently delete this user and all their subscriptions?')) {
      try {
        await api.delete(`/admin/users/${id}`);
        setUsers(users.filter(user => user._id !== id));
        toast.success('User deleted successfully');
      } catch (error) {
        console.error('Failed to delete user', error);
        toast.error('Failed to delete user');
      }
    }
  };

  const handleViewDetails = async (id: string) => {
    try {
      const res = await api.get(`/admin/users/${id}`);
      setSelectedUser(res.data);
      setShowDetailsModal(true);
    } catch (error) {
      console.error('Failed to fetch user details', error);
      toast.error('Failed to retrieve user telemetry details');
    }
  };

  const handleToggleStatus = async (id: string) => {
    try {
      const res = await api.patch(`/admin/users/${id}/status`);
      setUsers(users.map(user => user._id === id ? { ...user, isActive: res.data.isActive } : user));
      toast.success(`User ${res.data.isActive ? 'activated' : 'suspended'}`);
    } catch (error) {
      console.error('Failed to toggle user status', error);
      toast.error('Failed to toggle user suspension status');
    }
  };

  const handleOpenEditModal = (user: any) => {
    setEditForm({
      id: user._id,
      numericId: user.numericId,
      name: user.name,
      email: user.email,
      isPremium: user.isPremium || false,
      isActive: user.isActive !== undefined ? user.isActive : true,
      totalRenewals: user.totalRenewals || 0
    });
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.put(`/admin/users/${editForm.id}`, {
        name: editForm.name,
        email: editForm.email,
        isPremium: editForm.isPremium,
        isActive: editForm.isActive,
        totalRenewals: editForm.totalRenewals
      });
      
      setUsers(users.map(user => user._id === editForm.id ? { 
        ...user, 
        name: res.data.user.name,
        email: res.data.user.email,
        isPremium: res.data.user.isPremium,
        isActive: res.data.user.isActive,
        totalRenewals: res.data.user.totalRenewals
      } : user));

      setShowEditModal(false);
      toast.success('User updated successfully');
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Failed to update user profile');
    }
  };

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatLastActive = (dateString?: string) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    
    // Quick calendar style or time ago format
    const diffMs = Date.now() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    
    if (diffHours < 24) {
      if (diffHours === 0) return 'Just now';
      return `${diffHours}h ago`;
    }
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="pb-20 md:pb-8">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
            User Operations Management
          </h1>
          <p className="text-slate-400 mt-1">Review active sessions, suspend abusers, and edit subscriber plans.</p>
        </div>
        
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
          <input 
            type="text" 
            placeholder="Search by name, email or tier..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-800/50 border border-slate-700 rounded-xl py-2.5 pl-10 pr-4 text-white focus:outline-none focus:border-[#00f0ff] focus:shadow-[0_0_10px_rgba(0,240,255,0.15)] transition-all duration-300"
          />
        </div>
      </div>



      {/* Main Table Grid */}
      <div className="glass-panel overflow-hidden rounded-2xl">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#00f0ff]"></div>
            <p className="text-xs text-slate-500">Retrieving subscriber data...</p>
          </div>
        ) : (
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-800/50 border-b border-slate-700">
                  <th className="px-4 md:px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400 w-16">ID</th>
                  <th className="px-4 md:px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">Subscriber Name</th>
                  <th className="px-4 md:px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">Email Address</th>
                  <th className="px-4 md:px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">Membership Type</th>
                  <th className="px-4 md:px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400 text-center">Subscriptions</th>
                  <th className="px-4 md:px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">Active Since</th>
                  <th className="px-4 md:px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400 text-center">Total Renewals</th>
                  <th className="px-4 md:px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">Last Session</th>
                  <th className="px-4 md:px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">Status</th>
                  <th className="px-4 md:px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {filteredUsers.length > 0 ? (
                  filteredUsers.map(user => (
                    <tr key={user._id} className="hover:bg-slate-800/20 transition-colors">
                      {/* Numeric ID */}
                      <td className="px-4 md:px-6 py-4 whitespace-nowrap text-slate-400 text-xs font-mono">
                        #{user.numericId || 'N/A'}
                      </td>
                      
                      {/* Name with initials Avatar */}
                      <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-extrabold text-xs shadow-md border ${
                            user.isPremium 
                              ? 'bg-gradient-to-tr from-[#a855f7] to-[#ec4899] text-white border-purple-500/30' 
                              : 'bg-gradient-to-tr from-[#3b82f6] to-[#00f0ff] text-slate-900 border-blue-500/20'
                          }`}>
                            {getInitials(user.name)}
                          </div>
                          <span className="text-white font-semibold block text-sm">{user.name}</span>
                        </div>
                      </td>

                      {/* Email Address */}
                      <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2 text-xs text-slate-400">
                          <Mail size={14} className="shrink-0 text-slate-600" />
                          <span>{user.email}</span>
                        </div>
                      </td>

                      {/* Membership Type Badge */}
                      <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                        {user.isPremium ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#a855f7]/20 text-[#a855f7] border border-[#a855f7]/30">
                            <Award size={10} />
                            Premium
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-400 border border-slate-700">
                            Standard
                          </span>
                        )}
                      </td>

                      {/* Subscription Count */}
                      <td className="px-4 md:px-6 py-4 text-center whitespace-nowrap">
                        <span className="inline-block px-2.5 py-0.5 bg-slate-900 text-slate-300 font-bold rounded-lg text-xs border border-white/5">
                          {user.subscriptionCount || 0}
                        </span>
                      </td>

                      {/* Active Since */}
                      <td className="px-4 md:px-6 py-4 whitespace-nowrap text-xs text-slate-300">
                        {new Date(user.joinedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>

                      {/* Total Renewals */}
                      <td className="px-4 md:px-6 py-4 text-center whitespace-nowrap">
                        <span className="inline-block px-2.5 py-0.5 bg-slate-900 text-slate-300 font-bold rounded-lg text-xs border border-white/5">
                          {user.totalRenewals || 0}
                        </span>
                      </td>

                      {/* Last Active */}
                      <td className="px-4 md:px-6 py-4 text-xs text-slate-400 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Clock size={12} className="text-slate-600" />
                          <span>{formatLastActive(user.lastActive)}</span>
                        </div>
                      </td>

                      {/* Account Status */}
                      <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-wider uppercase ${
                          user.isActive 
                            ? 'bg-[#10b981]/15 text-[#10b981] border border-[#10b981]/25' 
                            : 'bg-[#ef4444]/15 text-[#ef4444] border border-[#ef4444]/25'
                        }`}>
                          {user.isActive ? 'Active' : 'Suspended'}
                        </span>
                      </td>

                      {/* Action buttons */}
                      <td className="px-4 md:px-6 py-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button 
                            onClick={() => handleViewDetails(user._id)}
                            className="p-1.5 text-slate-500 hover:text-[#00f0ff] hover:bg-[#00f0ff]/10 rounded-lg transition-colors cursor-pointer"
                            title="Telemetry Details"
                          >
                            <Eye size={16} />
                          </button>
                          <button 
                            onClick={() => handleOpenEditModal(user)}
                            className="p-1.5 text-slate-500 hover:text-[#a855f7] hover:bg-[#a855f7]/10 rounded-lg transition-colors cursor-pointer"
                            title="Edit Profile"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button 
                            onClick={() => handleToggleStatus(user._id)}
                            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                              user.isActive 
                                ? 'text-slate-500 hover:text-[#ef4444] hover:bg-[#ef4444]/10' 
                                : 'text-[#10b981] bg-[#10b981]/10 hover:bg-[#10b981]/20'
                            }`}
                            title={user.isActive ? 'Suspend Account' : 'Activate Account'}
                          >
                            {user.isActive ? <PowerOff size={16} /> : <Power size={16} />}
                          </button>
                          <button 
                            onClick={() => handleDelete(user._id)}
                            className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
                            title="Delete Permanently"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>

                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={9} className="px-6 py-12 text-center text-slate-500 text-sm">
                      No users match the search parameter.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Details View Modal */}
      {showDetailsModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-[#1e293b]/95 border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <UserCheck className="text-[#00f0ff]" />
                Subscriber Detail File
              </h2>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-slate-400 hover:text-white p-1 hover:bg-slate-800 rounded-lg cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)] custom-scrollbar space-y-6">
              
              {/* User Identity Header */}
              <div className="flex items-center gap-4 p-4 bg-slate-900/40 rounded-xl border border-white/5">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center font-black text-xl shadow-lg border ${
                  selectedUser.isPremium 
                    ? 'bg-gradient-to-tr from-[#a855f7] to-[#ec4899] text-white border-purple-500/30' 
                    : 'bg-gradient-to-tr from-[#3b82f6] to-[#00f0ff] text-slate-900 border-blue-500/20'
                }`}>
                  {getInitials(selectedUser.name)}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">
                    {selectedUser.name} <span className="text-slate-400 font-mono text-sm ml-2">#{selectedUser.numericId || 'N/A'}</span>
                  </h3>
                  <p className="text-xs text-slate-400">{selectedUser.email}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                      selectedUser.isActive 
                        ? 'bg-[#10b981]/15 text-[#10b981] border border-[#10b981]/25' 
                        : 'bg-[#ef4444]/15 text-[#ef4444] border border-[#ef4444]/25'
                    }`}>
                      {selectedUser.isActive ? 'Active' : 'Suspended'}
                    </span>
                    {selectedUser.isPremium && (
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-[#a855f7]/15 text-[#a855f7] border border-[#a855f7]/25">
                        Premium Subscriber
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Data Summary Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-900/20 p-4 rounded-xl border border-white/5">
                  <p className="text-slate-400 text-xs">Joined Date</p>
                  <p className="text-sm font-bold text-white mt-1">
                    {new Date(selectedUser.createdAt || selectedUser.joinedDate).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
                <div className="bg-slate-900/20 p-4 rounded-xl border border-white/5">
                  <p className="text-slate-400 text-xs">Total Renewal Count</p>
                  <p className="text-sm font-bold text-white mt-1">{selectedUser.totalRenewals || 0} renewals</p>
                </div>
                <div className="bg-slate-900/20 p-4 rounded-xl border border-white/5">
                  <p className="text-slate-400 text-xs">Email Broadcasts</p>
                  <p className="text-sm font-bold text-white mt-1">{selectedUser.emailNotifications ? 'Enabled' : 'Disabled'}</p>
                </div>
                <div className="bg-slate-900/20 p-4 rounded-xl border border-white/5">
                  <p className="text-slate-400 text-xs">Active Subscriptions</p>
                  <p className="text-sm font-bold text-white mt-1">{selectedUser.subscriptions?.length || 0} licensed</p>
                </div>
              </div>

              {/* Subscription List */}
              {selectedUser.subscriptions && selectedUser.subscriptions.length > 0 ? (
                <div>
                  <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-3">Linked Plan Bundles</h4>
                  <div className="space-y-3">
                    {selectedUser.subscriptions.map((sub: any) => (
                      <div key={sub._id} className="bg-slate-900/40 p-4 rounded-xl border border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          {sub.ottPlatformId?.logo ? (
                            <img 
                              src={getLogoUrl(sub.ottPlatformId.logo)} 
                              alt={sub.ottPlatformId.name} 
                              className="w-10 h-10 object-contain rounded-xl bg-slate-800 p-1 border border-slate-700" 
                              onError={(e) => { e.currentTarget.style.display = 'none'; }}
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center font-bold text-white text-xs border border-slate-700">
                              {sub.ottPlatformId?.name?.charAt(0) || 'P'}
                            </div>
                          )}
                          <div>
                            <p className="text-sm font-bold text-white">{sub.ottPlatformId?.name || sub.platformName || 'OTT Streaming'}</p>
                            <p className="text-xs text-slate-400">{sub.planName} tier · ${sub.subscriptionCost}/mo</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 justify-between md:justify-end">
                          <span className={`px-2.5 py-0.5 rounded text-[10px] font-black uppercase ${
                            sub.status === 'active' 
                              ? 'bg-[#10b981]/15 text-[#10b981] border border-[#10b981]/25' 
                              : 'bg-[#ef4444]/15 text-[#ef4444] border border-[#ef4444]/25'
                          }`}>
                            {sub.status}
                          </span>
                          <span className="text-xs text-slate-400">
                            Expires: {new Date(sub.expiryDate).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-slate-900/20 rounded-xl border border-white/5 text-center text-xs text-slate-500">
                  This user currently holds no streaming platform subscriptions.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Edit Profile Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#1e293b]/95 border border-white/10 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col">
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Edit2 className="text-[#a855f7]" size={18} />
                Modify Subscriber Profile <span className="text-slate-500 font-mono text-xs ml-2">#{editForm.numericId || ''}</span>
              </h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-slate-400 hover:text-white p-1 hover:bg-slate-800 rounded-lg cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
              
              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">Full Name</label>
                <input 
                  type="text" 
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full bg-slate-900/60 border border-slate-700 rounded-xl py-2 px-4 text-white focus:outline-none focus:border-[#a855f7] text-sm"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">Email Address</label>
                <input 
                  type="email" 
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  className="w-full bg-slate-900/60 border border-slate-700 rounded-xl py-2 px-4 text-white focus:outline-none focus:border-[#a855f7] text-sm"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">Total Renewal Count</label>
                <input 
                  type="number" 
                  value={editForm.totalRenewals}
                  onChange={(e) => setEditForm({ ...editForm, totalRenewals: parseInt(e.target.value) || 0 })}
                  className="w-full bg-slate-900/60 border border-slate-700 rounded-xl py-2 px-4 text-white focus:outline-none focus:border-[#a855f7] text-sm"
                  min="0"
                />
              </div>

              {/* Toggles */}
              <div className="space-y-3 pt-2">
                <label className="flex items-center justify-between p-3 bg-slate-900/40 rounded-xl border border-white/5 cursor-pointer hover:border-slate-800 transition-all">
                  <div>
                    <span className="text-xs font-semibold text-white block">Premium Status</span>
                    <span className="text-[9px] text-slate-500">Provide elite badge and limits</span>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={editForm.isPremium}
                    onChange={(e) => setEditForm({ ...editForm, isPremium: e.target.checked })}
                    className="w-9 h-5 bg-slate-800 checked:bg-[#a855f7] rounded-full appearance-none relative after:absolute after:top-[2px] after:left-[2px] after:w-4 after:h-4 after:bg-slate-400 after:rounded-full after:transition-all checked:after:translate-x-4 checked:after:bg-[#0f172a] cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between p-3 bg-slate-900/40 rounded-xl border border-white/5 cursor-pointer hover:border-slate-800 transition-all">
                  <div>
                    <span className="text-xs font-semibold text-white block">Account Status</span>
                    <span className="text-[9px] text-slate-500">Active vs Suspended</span>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={editForm.isActive}
                    onChange={(e) => setEditForm({ ...editForm, isActive: e.target.checked })}
                    className="w-9 h-5 bg-slate-800 checked:bg-[#10b981] rounded-full appearance-none relative after:absolute after:top-[2px] after:left-[2px] after:w-4 after:h-4 after:bg-slate-400 after:rounded-full after:transition-all checked:after:translate-x-4 checked:after:bg-[#0f172a] cursor-pointer"
                  />
                </label>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-[#a855f7] hover:bg-[#9333ea] text-white rounded-xl text-xs font-bold shadow-md cursor-pointer transition-all flex items-center justify-center gap-1.5"
                >
                  <Check size={14} />
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

export default UserManagement;
