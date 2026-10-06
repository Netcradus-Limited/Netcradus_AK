import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function InstructorSidebar({ mobileOpen, onCloseMobile }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  const navItems = [
    { label: 'Dashboard', path: '/instructor/dashboard', icon: 'fa-solid fa-chart-line' },
    { label: 'My Courses', path: '/instructor/courses', icon: 'fa-solid fa-book-open' },
    { label: 'Submissions', path: '/instructor/submissions', icon: 'fa-solid fa-clipboard-check' },
    { label: 'Students', path: '/instructor/students', icon: 'fa-solid fa-user-graduate' },
    { label: 'Profile', path: '/instructor/profile', icon: 'fa-solid fa-id-badge' },
  ];

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {mobileOpen && (
        <div
          className="admin-sidebar-backdrop"
          onClick={onCloseMobile}
        />
      )}

      <aside className={`admin-sidebar ${mobileOpen ? 'mobile-open' : ''}`}>
        {/* Brand Header */}
        <div className="admin-sidebar-brand">
          <img src="/images/logo.png" alt="Netcradus Academy" className="admin-brand-logo" />
          <div className="admin-brand-text">
            <span className="admin-brand-name">Netcradus</span>
            <span className="admin-brand-badge" style={{ color: 'var(--cyan-primary)' }}>
              INSTRUCTOR PORTAL
            </span>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="admin-sidebar-nav">
          <div className="admin-nav-section-label">TEACHING & MANAGEMENT</div>
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onCloseMobile}
              className={({ isActive }) =>
                `admin-nav-item ${isActive ? 'active' : ''}`
              }
            >
              <i className={item.icon}></i>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* User Info & Logout Footer */}
        <div className="admin-sidebar-footer">
          <div className="admin-user-pill">
            <div className="admin-user-avatar" style={{ background: 'rgba(0, 210, 255, 0.15)', color: 'var(--cyan-primary)' }}>
              <i className="fa-solid fa-chalkboard-user"></i>
            </div>
            <div className="admin-user-details">
              <span className="admin-user-name">{user?.fullName || 'Instructor'}</span>
              <span className="admin-user-role" style={{ color: 'var(--cyan-primary)', textTransform: 'capitalize' }}>
                {user?.role || 'Instructor'}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="admin-btn-logout"
            title="Log out of Instructor Session"
          >
            <i className="fa-solid fa-right-from-bracket"></i>
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}
