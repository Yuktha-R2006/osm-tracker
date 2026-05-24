import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';

interface Notification {
  _id: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  fetchNotifications: () => Promise<void>;
  markAsRead: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType>({} as NotificationContextType);

export const useNotifications = () => useContext(NotificationContext);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { user } = useAuth();

  const fetchNotifications = async () => {
    if (!user) return;
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data);
    } catch (error) {
      console.error('Failed to fetch notifications', error);
    }
  };

  const markAsRead = async () => {
    try {
      await api.put('/notifications/read');
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (error) {
      console.error('Failed to mark notifications as read', error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
    } else {
      setNotifications([]);
    }
  }, [user]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, fetchNotifications, markAsRead }}>
      {children}
    </NotificationContext.Provider>
  );
};
