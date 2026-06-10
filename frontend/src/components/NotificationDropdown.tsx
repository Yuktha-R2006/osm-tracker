import React from 'react';
import { Bell, CheckCircle, AlertCircle, Info, Check } from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';
import { motion, AnimatePresence } from 'framer-motion';

interface NotificationDropdownProps {
  isOpen: boolean;
  onClose: () => void;
}

const NotificationDropdown: React.FC<NotificationDropdownProps> = ({ isOpen, onClose }) => {
  const { notifications, unreadCount, markAsRead } = useNotifications();

  const getIcon = (type: string) => {
    switch (type) {
      case 'added': return <CheckCircle className="text-green-400" size={18} />;
      case 'renewed': return <CheckCircle className="text-blue-400" size={18} />;
      case 'upgraded': return <CheckCircle className="text-purple-400" size={18} />;
      case 'downgraded': return <Info className="text-orange-400" size={18} />;
      case 'payment': return <CheckCircle className="text-green-400" size={18} />;
      case 'expiry': return <AlertCircle className="text-orange-400" size={18} />;
      case 'expired': return <AlertCircle className="text-red-400" size={18} />;
      default: return <Info className="text-slate-400" size={18} />;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={onClose}></div>
          <motion.div 
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-80 md:w-96 bg-[#1e293b] border border-slate-700 rounded-2xl shadow-2xl z-50 overflow-hidden"
          >
            <div className="p-4 border-b border-slate-700 flex justify-between items-center bg-slate-800/50">
              <h3 className="font-bold text-white flex items-center gap-2">
                <Bell size={18} className="text-secondary" /> Notifications
              </h3>
              {unreadCount > 0 && (
                <button 
                  onClick={markAsRead}
                  className="text-xs text-secondary hover:text-white transition-colors flex items-center gap-1"
                >
                  <Check size={14} /> Mark all read
                </button>
              )}
            </div>
            
            <div className="max-h-96 overflow-y-auto custom-scrollbar">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-slate-500">
                  <Bell size={32} className="mx-auto mb-3 opacity-20" />
                  <p className="text-sm">No notifications yet</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-700/50">
                  {notifications.map(notif => (
                    <div 
                      key={notif._id} 
                      className={`p-4 flex gap-3 transition-colors ${notif.isRead ? 'opacity-70 bg-transparent' : 'bg-slate-800/30'}`}
                    >
                      <div className="shrink-0 mt-0.5">
                        {getIcon(notif.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm ${notif.isRead ? 'text-slate-300' : 'text-white font-medium'}`}>
                          {notif.message}
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                          {new Date(notif.createdAt).toLocaleDateString()} at {new Date(notif.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </p>
                      </div>
                      {!notif.isRead && (
                        <div className="w-2 h-2 bg-primary rounded-full mt-1.5 shrink-0"></div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default NotificationDropdown;
