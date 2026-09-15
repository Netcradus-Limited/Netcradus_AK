import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function PublicOnlyRoute() {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
      <div className="auth-loading-screen">
        <div className="auth-loading-card">
          <img src="/images/logo.png" alt="Netcradus Academia" className="auth-loading-logo" />
          <div className="auth-spinner"></div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '15px' }}>
            Checking account status...
          </p>
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    const targetPath = (user?.role === 'admin' || user?.role === 'super_admin')
      ? '/admin/dashboard'
      : '/dashboard';
    return <Navigate to={targetPath} replace />;
  }

  return <Outlet />;
}

