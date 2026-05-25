import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  profileImage?: string;
  joinedDate?: string;
  isPremium?: boolean;
  favoriteOTT?: string;
  totalWatchTime?: number;
  watchHistory?: Array<{
    showName: string;
    watchDate: string;
    duration: number;
    genre: string;
    ottPlatform: string;
  }>;
  darkMode?: boolean;
  emailNotifications?: boolean;
  autoRenewalAlerts?: boolean;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  isAuthenticated: boolean;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  login: (email: string, password: string, role?: 'user' | 'admin') => Promise<any>;
  register: (name: string, email: string, password: string) => Promise<any>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => Promise<any>;
  updateSettings: (data: Partial<User>) => Promise<any>;
  deleteAccount: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token') || localStorage.getItem('accessToken'));
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    const fetchUser = async () => {
      const storedToken = localStorage.getItem('token') || localStorage.getItem('accessToken');
      if (storedToken) {
        try {
          const res = await api.get('/auth/profile');
          setUser(res.data);
          setToken(storedToken);
        } catch (error) {
          console.error('Failed to fetch user', error);
          localStorage.removeItem('token');
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          setToken(null);
        }
      }
      setLoading(false);
    };

    fetchUser();
  }, []);

  const login = async (email: string, password: string, role?: 'user' | 'admin'): Promise<any> => {
    const res = await api.post('/auth/login', { email, password, role });
    localStorage.setItem('token', res.data.accessToken);
    localStorage.setItem('accessToken', res.data.accessToken);
    localStorage.setItem('refreshToken', res.data.refreshToken);
    setUser(res.data);
    setToken(res.data.accessToken);
    return res.data;
  };

  const register = async (name: string, email: string, password: string): Promise<any> => {
    const res = await api.post('/auth/register', { name, email, password });
    localStorage.setItem('token', res.data.accessToken);
    localStorage.setItem('accessToken', res.data.accessToken);
    localStorage.setItem('refreshToken', res.data.refreshToken);
    setUser(res.data);
    setToken(res.data.accessToken);
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setUser(null);
    setToken(null);
  };

  const updateProfile = async (data: Partial<User>): Promise<any> => {
    const res = await api.put('/auth/profile', data);
    setUser(res.data);
    return res.data;
  };

  const updateSettings = async (data: Partial<User>): Promise<any> => {
    const res = await api.put('/auth/settings', data);
    setUser(res.data);
    return res.data;
  };

  const deleteAccount = async (): Promise<void> => {
    await api.delete('/auth/profile');
    logout();
  };

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{ 
      user, 
      token, 
      login, 
      register, 
      logout, 
      loading, 
      isAuthenticated, 
      searchQuery, 
      setSearchQuery,
      updateProfile,
      updateSettings,
      deleteAccount
    }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
