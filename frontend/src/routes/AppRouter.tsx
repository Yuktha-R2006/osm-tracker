import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../layouts/DashboardLayout';
import Login from '../pages/Login';
import Signup from '../pages/Signup';

// Lazy load pages for performance
const Dashboard = React.lazy(() => import('../pages/Dashboard'));
const SubscriptionDetails = React.lazy(() => import('../pages/SubscriptionDetails'));
const Profile = React.lazy(() => import('../pages/Profile'));
const AdminDashboard = React.lazy(() => import('../pages/AdminDashboard'));
const UserManagement = React.lazy(() => import('../pages/UserManagement'));
const PlatformManagement = React.lazy(() => import('../pages/PlatformManagement'));
const Analytics = React.lazy(() => import('../pages/Analytics'));
const AdminSettings = React.lazy(() => import('../pages/AdminSettings'));

const ProtectedRoute = ({ children, requireAdmin }: { children: React.ReactNode; requireAdmin?: boolean }) => {
  const { user, loading } = useAuth();
  
  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#0f172a] text-white">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (requireAdmin && user.role !== 'admin') return <Navigate to="/dashboard" replace />;
  
  return children;
};

const IndexRedirect = () => {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#0f172a] text-white">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return user.role === 'admin' ? <Navigate to="/admin" replace /> : <Navigate to="/dashboard" replace />;
};

const AppRouter = () => {
  return (
    <React.Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-[#0f172a] text-white">Loading...</div>}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        
        <Route path="/" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
          <Route index element={<IndexRedirect />} />
          <Route path="dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="subscription/:id" element={<ProtectedRoute><SubscriptionDetails /></ProtectedRoute>} />
          <Route path="profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          
          <Route path="admin" element={<ProtectedRoute requireAdmin><AdminDashboard /></ProtectedRoute>} />
          <Route path="admin/users" element={<ProtectedRoute requireAdmin><UserManagement /></ProtectedRoute>} />
          <Route path="admin/platforms" element={<ProtectedRoute requireAdmin><PlatformManagement /></ProtectedRoute>} />
          <Route path="admin/analytics" element={<ProtectedRoute requireAdmin><Analytics /></ProtectedRoute>} />
          <Route path="admin/settings" element={<ProtectedRoute requireAdmin><AdminSettings /></ProtectedRoute>} />
        </Route>
        
        <Route path="*" element={<IndexRedirect />} />
      </Routes>
    </React.Suspense>
  );
};

export default AppRouter;
