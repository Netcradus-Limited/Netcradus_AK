import React, { useState, useEffect, useRef } from 'react';
import { NavLink, Link, useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../App';
import { useAuth } from '../context/AuthContext';
import { TRACKS, PROGRAMMES, CONTACT_INFO } from '../data/programmesData';

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const dropdownRef = useRef(null);

  const { openModal, openDrawer, showToast } = useApp() || {};
  const { user, isAuthenticated, logout } = useAuth() || {};
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu and dropdown on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsDropdownOpen(false);
  }, [location.pathname]);

  // Handle outside click for dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
    setIsDropdownOpen(false);
  };

  const handleLogout = async () => {
    closeMobileMenu();
    if (logout) {
      await logout();
    }
    if (showToast) {
      showToast('You have been logged out successfully.');
    }
    navigate('/login', { replace: true });
  };

  const handleEnquireClick = (e) => {
    e.preventDefault();
    closeMobileMenu();
    if (openDrawer) {
      openDrawer('enquire');
    } else if (openModal) {
      openModal('enroll');
    }
  };

  return (
    <header className={`site-header ${isScrolled ? 'header-scrolled' : ''}`}>
      {/* Top Notification Announcement Bar */}
      <div className="top-announcement-bar">
        <div className="header-container announcement-inner">
          <div className="announcement-text">
            <span className="announcement-pill">NEW</span>
            <span className="announcement-text-content">
              Netcradus Emerging Technologies Programme – 11 Specialised Career Tracks in Cyber Security & AI
            </span>
          </div>
          <div className="announcement-contact">
            <a href={`mailto:${CONTACT_INFO.email}`} className="top-link">
              <i className="fa-regular fa-envelope"></i>
              <span>{CONTACT_INFO.email}</span>
            </a>
            <span className="top-sep"></span>
            <a href={`tel:${CONTACT_INFO.phoneClean}`} className="top-link">
              <i className="fa-solid fa-phone"></i>
              <span>{CONTACT_INFO.phone}</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <nav className="navbar" id="navbar">
        <div className="header-container navbar-container">
          {/* Logo */}
          <NavLink
            to="/"
            className="logo brand-logo-link"
            onClick={closeMobileMenu}
            title="Netcradus Academy"
          >
            <img src="/images/logo.png" alt="NETCRADUS ACADEMY™" className="site-logo-img" />
          </NavLink>

          {/* Desktop & Mobile Navigation Links */}
          <ul className={`nav-menu ${isMobileMenuOpen ? 'active' : ''}`} id="nav-menu">
            {/* 1. Home */}
            <li className="nav-item">
              <NavLink
                to="/"
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                onClick={closeMobileMenu}
                end
              >
                Home
              </NavLink>
            </li>

            {/* 2. About Academy */}
            <li className="nav-item">
              <NavLink
                to="/about"
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                onClick={closeMobileMenu}
              >
                About Academy
              </NavLink>
            </li>

            {/* 3. Programmes with 4-Track Dropdown */}
            <li
              className={`nav-item nav-item-dropdown ${isDropdownOpen ? 'dropdown-open' : ''}`}
              ref={dropdownRef}
              onMouseEnter={() => setIsDropdownOpen(true)}
              onMouseLeave={() => setIsDropdownOpen(false)}
            >
              <NavLink
                to="/programmes"
                className={({ isActive }) =>
                  `nav-link nav-dropdown-trigger ${
                    isActive || location.pathname.startsWith('/programmes') || location.pathname.startsWith('/courses')
                      ? 'active'
                      : ''
                  }`
                }
                onClick={(e) => {
                  if (window.innerWidth < 992) {
                    e.preventDefault();
                    setIsDropdownOpen(!isDropdownOpen);
                  } else {
                    closeMobileMenu();
                  }
                }}
              >
                <span>Programmes</span>
                <i className={`fa-solid fa-chevron-down dropdown-arrow ${isDropdownOpen ? 'rotated' : ''}`}></i>
              </NavLink>

              {/* Mega Dropdown Menu */}
              <div className={`programmes-mega-dropdown ${isDropdownOpen ? 'show' : ''}`}>
                <div className="dropdown-tracks-grid">
                  {TRACKS.map((track) => (
                    <div key={track.id} className="dropdown-track-col">
                      <div className="dropdown-track-header">
                        <i className={track.icon} style={{ color: track.accentColor }}></i>
                        <div>
                          <h4 className="dropdown-track-title">{track.title}</h4>
                          <span className="dropdown-track-count">{track.badge}</span>
                        </div>
                      </div>
                      <ul className="dropdown-programmes-list">
                        {track.programmes.map((slug) => {
                          const prog = PROGRAMMES.find((p) => p.slug === slug);
                          return (
                            <li key={slug}>
                              <Link
                                to={`/programmes/${slug}`}
                                className="dropdown-prog-link"
                                onClick={closeMobileMenu}
                              >
                                <span className="prog-bullet">•</span>
                                <span className="prog-link-text">{prog ? prog.title : slug}</span>
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  ))}
                </div>

                <div className="dropdown-mega-footer">
                  <div className="mega-footer-text">
                    <i className="fa-solid fa-compass"></i>
                    <span>Not sure which track to choose? Compare all 11 programmes side by side.</span>
                  </div>
                  <Link
                    to="/programmes"
                    className="btn btn-sm btn-outline-cyan mega-footer-btn"
                    onClick={closeMobileMenu}
                  >
                    View All 11 Programmes <i className="fa-solid fa-arrow-right-long"></i>
                  </Link>
                </div>
              </div>
            </li>

            {/* 4. Learning Journey */}
            <li className="nav-item">
              <NavLink
                to="/learning-journey"
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                onClick={closeMobileMenu}
              >
                Learning Journey
              </NavLink>
            </li>

            {/* 5. Career Opportunities */}
            <li className="nav-item">
              <NavLink
                to="/careers"
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                onClick={closeMobileMenu}
              >
                Career Opportunities
              </NavLink>
            </li>

            {/* 6. For Institutions */}
            <li className="nav-item">
              <NavLink
                to="/institutions"
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                onClick={closeMobileMenu}
              >
                For Institutions
              </NavLink>
            </li>

            {/* 7. Knowledge Hub */}
            <li className="nav-item">
              <NavLink
                to="/blog"
                className={({ isActive }) =>
                  `nav-link ${isActive || location.pathname.startsWith('/blog') ? 'active' : ''}`
                }
                onClick={closeMobileMenu}
              >
                Knowledge Hub
              </NavLink>
            </li>

            {/* 8. Contact Us */}
            <li className="nav-item">
              <NavLink
                to="/contact"
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                onClick={closeMobileMenu}
              >
                Contact Us
              </NavLink>
            </li>

            {/* Authenticated Role Portal Shortcuts for Mobile Menu */}
            {isAuthenticated && (
              <li className="nav-item mobile-auth-item">
                {user?.role === 'admin' || user?.role === 'super_admin' ? (
                  <NavLink to="/admin/dashboard" className="nav-link" onClick={closeMobileMenu}>
                    <i className="fa-solid fa-shield-halved"></i> Admin Panel
                  </NavLink>
                ) : user?.role === 'instructor' ? (
                  <NavLink to="/instructor/dashboard" className="nav-link" onClick={closeMobileMenu}>
                    <i className="fa-solid fa-chalkboard-user"></i> Instructor Portal
                  </NavLink>
                ) : (
                  <NavLink to="/dashboard" className="nav-link" onClick={closeMobileMenu}>
                    <i className="fa-solid fa-laptop-code"></i> Student Dashboard
                  </NavLink>
                )}
              </li>
            )}
            {/* Mobile Drawer CTA: Explore Programmes & Enquire Now */}
            <li className="nav-item mobile-drawer-only-item">
              <Link
                to="/programmes"
                className="btn-nav-explore mobile-drawer-btn"
                onClick={closeMobileMenu}
              >
                Explore Programmes
              </Link>
            </li>
            <li className="nav-item mobile-drawer-only-item">
              <button
                type="button"
                className="btn-nav-enquire mobile-drawer-btn"
                onClick={handleEnquireClick}
              >
                Enquire Now
              </button>
            </li>

            {/* Mobile Drawer Auth: Login */}
            {!isAuthenticated && (
              <li className="nav-item mobile-drawer-only-item">
                <Link
                  to="/login"
                  className="mobile-drawer-login-btn"
                  onClick={closeMobileMenu}
                >
                  <i className="fa-regular fa-user"></i>
                  <span>Login to Student Portal</span>
                </Link>
              </li>
            )}
          </ul>

          {/* Right Action Buttons */}
          <div className="nav-actions">
            {/* Primary Action: Explore Programmes (Available on large desktop, tucked in drawer on laptops) */}
            <Link
              to="/programmes"
              className="btn-nav-explore d-none-laptop"
              onClick={closeMobileMenu}
            >
              Explore Programmes
            </Link>

            {/* Secondary Action: Enquire Now */}
            <button
              type="button"
              className="btn-nav-enquire d-none-mobile-xs"
              onClick={handleEnquireClick}
            >
              Enquire Now
            </button>

            {/* User Profile / Auth State */}
            {isAuthenticated ? (
              <div className="user-nav-profile">
                <Link
                  to={
                    user?.role === 'admin' || user?.role === 'super_admin'
                      ? '/admin/dashboard'
                      : user?.role === 'instructor'
                      ? '/instructor/dashboard'
                      : '/dashboard'
                  }
                  className="user-profile-badge"
                  title="Go to Dashboard"
                  onClick={closeMobileMenu}
                >
                  <i className="fa-regular fa-user-circle"></i>
                  <span>
                    {user?.fullName
                      ? user.fullName.split(' ')[0]
                      : user?.role === 'instructor'
                      ? 'Instructor'
                      : user?.role === 'admin'
                      ? 'Admin'
                      : 'Student'}
                  </span>
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="btn-nav-logout"
                  title="Log out"
                >
                  <i className="fa-solid fa-arrow-right-from-bracket"></i>
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="btn btn-login-pill"
                onClick={closeMobileMenu}
                title="Student / Member Login"
              >
                <i className="fa-regular fa-user"></i>
                <span>Login</span>
              </Link>
            )}

            {/* Hamburger Toggle */}
            <button
              className="hamburger"
              id="hamburger"
              aria-label="Toggle navigation"
              onClick={toggleMobileMenu}
            >
              <i className={`fa-solid ${isMobileMenuOpen ? 'fa-xmark' : 'fa-bars'}`}></i>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Backdrop */}
      {isMobileMenuOpen && (
        <div
          className="nav-backdrop"
          onClick={closeMobileMenu}
          aria-hidden="true"
        />
      )}
    </header>
  );
}
