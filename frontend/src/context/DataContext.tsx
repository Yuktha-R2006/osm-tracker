import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';
import { useNotifications } from './NotificationContext';

interface DataContextType {
  subscriptions: any[];
  platforms: any[];
  allPlatforms: any[];
  adminStats: any;
  adminUsers: any[];
  loading: boolean;
  refreshSubscriptions: () => Promise<void>;
  refreshPlatforms: () => Promise<void>;
  refreshAllPlatforms: () => Promise<void>;
  refreshAdminStats: () => Promise<void>;
  refreshAdminUsers: () => Promise<void>;
  refreshAllData: () => Promise<void>;
}

const DataContext = createContext<DataContextType>({} as DataContextType);

export const useData = () => useContext(DataContext);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, refreshUser } = useAuth();
  const { fetchNotifications } = useNotifications();

  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [platforms, setPlatforms] = useState<any[]>([]);
  const [allPlatforms, setAllPlatforms] = useState<any[]>([]);
  const [adminStats, setAdminStats] = useState<any>(null);
  const [adminUsers, setAdminUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const refreshSubscriptions = async () => {
    try {
      const res = await api.get('/subscriptions');
      setSubscriptions(res.data);
    } catch (err) {
      console.error('Failed to fetch subscriptions', err);
    }
  };

  const refreshPlatforms = async () => {
    try {
      const res = await api.get('/platforms');
      setPlatforms(res.data);
    } catch (err) {
      console.error('Failed to fetch active platforms', err);
    }
  };

  const refreshAllPlatforms = async () => {
    try {
      const res = await api.get('/platforms/all');
      setAllPlatforms(res.data);
    } catch (err) {
      console.error('Failed to fetch all platforms', err);
    }
  };

  const refreshAdminStats = async () => {
    try {
      const res = await api.get('/admin/stats');
      setAdminStats(res.data);
    } catch (err) {
      console.error('Failed to fetch admin stats', err);
    }
  };

  const refreshAdminUsers = async () => {
    try {
      const res = await api.get('/admin/users');
      setAdminUsers(res.data);
    } catch (err) {
      console.error('Failed to fetch admin users', err);
    }
  };

  const refreshAllData = async () => {
    if (!user) return;
    try {
      const promises: Promise<any>[] = [
        refreshSubscriptions(),
        refreshPlatforms(),
        refreshUser(),
        fetchNotifications(),
      ];

      if (user.role === 'admin') {
        promises.push(refreshAllPlatforms());
        promises.push(refreshAdminStats());
        promises.push(refreshAdminUsers());
      }

      await Promise.all(promises);
    } catch (err) {
      console.error('Failed to refresh data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?._id) {
      setLoading(true);
      refreshAllData();
    } else {
      setSubscriptions([]);
      setPlatforms([]);
      setAllPlatforms([]);
      setAdminStats(null);
      setAdminUsers([]);
      setLoading(false);
    }
  }, [user?._id, user?.role]);

  return (
    <DataContext.Provider value={{
      subscriptions,
      platforms,
      allPlatforms,
      adminStats,
      adminUsers,
      loading,
      refreshSubscriptions,
      refreshPlatforms,
      refreshAllPlatforms,
      refreshAdminStats,
      refreshAdminUsers,
      refreshAllData
    }}>
      {children}
    </DataContext.Provider>
  );
};
