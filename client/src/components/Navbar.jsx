import React, { useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useApp } from '../App';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { openModal, showToast } = useApp();
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const handleLogout = async () => {
    closeMobileMenu();
    await logout();
    showToast('You have been logged out successfully.');
    navigate('/login', { replace: true });
  };

  return (
    <nav className="navbar" id="navbar">
      <div className="container navbar-container">
        {/* Logo */}
        <NavLink to="/" className="logo brand-logo-link" onClick={closeMobileMenu} title="Netcradus Academy">
          <img src="/images/logo.png" alt="NETCRADUS ACADEMY™" className="site-logo-img" />
        </NavLink>

        {/* Desktop Nav Links */}
        <ul className={`nav-menu ${isMobileMenuOpen ? 'active' : ''}`} id="nav-menu">
          {isAuthenticated && (user?.role === 'admin' || user?.role === 'super_admin') ? (
            /* ADMIN NAVBAR LINKS */
            <>
              <li className="nav-item">
                <NavLink to="/admin/dashboard" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={closeMobileMenu}>
                  <i className="fa-solid fa-shield-halved" style={{ marginRight: '5px' }}></i> Admin Panel
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={closeMobileMenu} end>
                  Home
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink to="/courses" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={closeMobileMenu}>
                  Courses
                </NavLink>
              </li>
            </>
          ) : isAuthenticated && user?.role === 'student' ? (
            /* STUDENT NAVBAR LINKS */
            <>
              <li className="nav-item">
                <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={closeMobileMenu} end>
                  Home
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink to="/courses" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={closeMobileMenu}>
                  Courses
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink to="/my-courses" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={closeMobileMenu}>
                  My Courses
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink to="/dashboard" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={closeMobileMenu}>
                  Dashboard
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink to="/projects" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={closeMobileMenu}>
                  Projects
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink to="/contact" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={closeMobileMenu}>
                  Contact Us
                </NavLink>
              </li>
            </>
          ) : (
            /* GUEST NAVBAR LINKS */
            <>
              <li className="nav-item">
                <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={closeMobileMenu} end>
                  Home
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink to="/about" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={closeMobileMenu}>
                  About
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink to="/courses" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={closeMobileMenu}>
                  Courses
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink to="/projects" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={closeMobileMenu}>
                  Projects
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink to="/contact" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={closeMobileMenu}>
                  Contact Us
                </NavLink>
              </li>
            </>
          )}
        </ul>

        {/* Navbar Right Action */}
        <div className="nav-actions">
          {isAuthenticated ? (
            <div className="user-nav-profile">
              <span className="user-profile-badge">
                <i className="fa-regular fa-user-circle"></i>
                {user?.fullName ? user.fullName.split(' ')[0] : 'Student'}
              </span>
              <button
                onClick={handleLogout}
                className="btn-nav-logout"
                title="Log out of session"
              >
                <i className="fa-solid fa-arrow-right-from-bracket"></i> Logout
              </button>
            </div>
          ) : (
            <Link to="/login" className="btn btn-login-pill" onClick={closeMobileMenu}>
              <i className="fa-regular fa-user"></i> Login / Sign Up
            </Link>
          )}

          <button className="hamburger" id="hamburger" aria-label="Toggle navigation" onClick={toggleMobileMenu}>
            <i className={`fa-solid ${isMobileMenuOpen ? 'fa-xmark' : 'fa-bars'}`}></i>
          </button>
        </div>
      </div>
    </nav>
  );
}
