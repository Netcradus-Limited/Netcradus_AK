import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function AdminSidebar({ mobileOpen, onCloseMobile }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  const navItems = [
    { label: 'Dashboard', path: '/admin/dashboard', icon: 'fa-solid fa-chart-line' },
    { label: 'Students', path: '/admin/students', icon: 'fa-solid fa-user-graduate' },
    { label: 'Courses', path: '/admin/courses', icon: 'fa-solid fa-book-open' },
    { label: 'Enrollments', path: '/admin/enrollments', icon: 'fa-solid fa-graduation-cap' },
    { label: 'Inquiries', path: '/admin/inquiries', icon: 'fa-solid fa-envelope-open-text' },
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
            <span className="admin-brand-badge">ADMIN PANEL</span>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="admin-sidebar-nav">
          <div className="admin-nav-section-label">MANAGEMENT</div>
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
            <div className="admin-user-avatar">
              <i className="fa-solid fa-user-shield"></i>
            </div>
            <div className="admin-user-details">
              <span className="admin-user-name">{user?.fullName || 'Administrator'}</span>
              <span className="admin-user-role">{user?.role || 'admin'}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="admin-btn-logout"
            title="Log out of Admin Session"
          >
            <i className="fa-solid fa-right-from-bracket"></i>
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}
