import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ allowedRoles }) {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
      <div className="auth-loading-screen">
        <div className="auth-loading-card">
          <img src="/images/logo.png" alt="Netcradus Academia" className="auth-loading-logo" />
          <div className="auth-spinner"></div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '15px' }}>
            Verifying authentication session...
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Role-based access control check
  if (allowedRoles && allowedRoles.length > 0) {
    if (!user || !allowedRoles.includes(user.role)) {
      const fallbackPath = (user?.role === 'admin' || user?.role === 'super_admin')
        ? '/admin/dashboard'
        : '/dashboard';
      return <Navigate to={fallbackPath} replace />;
    }
  }

  return <Outlet />;
}

