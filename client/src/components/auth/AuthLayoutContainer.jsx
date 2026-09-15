import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useApp } from '../../App';

export default function AuthLayoutContainer() {
  const { toast } = useApp();
  const location = useLocation();
  const isLoginPage = location.pathname === '/login';

  return (
    <div className="auth-site-wrapper">
      {/* Minimal Clean Header for Auth Pages */}
      <header className="auth-minimal-header">
        <div className="auth-minimal-header-container">
          {!isLoginPage ? (
            <Link to="/" className="auth-header-brand" title="Return to Netcradus Home">
              <img src="/images/logo.png" alt="Netcradus Academy" className="auth-header-logo" />
            </Link>
          ) : (
            <div></div>
          )}

          <Link to="/" className="auth-back-home-link" title="Return to Home">
            <i className="fa-solid fa-arrow-left"></i>
            <span>Back to Home</span>
          </Link>
        </div>
      </header>

      {/* Main Auth View (Login / Signup) */}
      <main className="auth-site-main">
        <Outlet />
      </main>

      {/* Global Toast Notification */}
      <div className={`toast ${toast.show ? 'show' : ''}`} id="toast">
        <div className="toast-icon">
          <i className="fa-solid fa-circle-check"></i>
        </div>
        <div className="toast-message" id="toastMessage">
          {toast.message}
        </div>
      </div>
    </div>
  );
}
