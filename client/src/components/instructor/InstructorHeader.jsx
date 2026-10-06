import React from 'react';
import { useAuth } from '../../context/AuthContext';

export default function InstructorHeader({ title, onToggleMobile }) {
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
          <div className="admin-avatar-badge" style={{ background: 'rgba(0, 210, 255, 0.15)', color: 'var(--cyan-primary)' }}>
            <i className="fa-solid fa-chalkboard-user"></i>
          </div>
          <div className="admin-user-info">
            <span className="admin-name-text">{user?.fullName || 'Instructor'}</span>
            <span className="admin-role-badge" style={{ borderColor: 'var(--cyan-primary)', color: 'var(--cyan-primary)' }}>
              Faculty Instructor
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
