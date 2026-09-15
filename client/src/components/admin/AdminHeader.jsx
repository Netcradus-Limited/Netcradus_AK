import React from 'react';
import { useAuth } from '../../context/AuthContext';

export default function AdminHeader({ title, onToggleMobile }) {
  const { user } = useAuth();

  return (
    <header className="admin-header">
      <div className="admin-header-left">
        <button
          type="button"
          className="admin-hamburger-btn"
          onClick={onToggleMobile}
          aria-label="Toggle navigation sidebar"
        >
          <i className="fa-solid fa-bars"></i>
        </button>
        <h1 className="admin-page-title">{title}</h1>
      </div>

      <div className="admin-header-right">
        <div className="admin-header-user">
          <div className="admin-avatar-badge">
            <i className="fa-solid fa-user-shield"></i>
          </div>
          <div className="admin-user-info">
            <span className="admin-name-text">{user?.fullName || 'Admin User'}</span>
            <span className="admin-role-badge">
              {user?.role === 'super_admin' ? 'Super Admin' : 'Administrator'}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
