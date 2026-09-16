import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../App';

export default function Footer() {
  const { openModal, showToast } = useApp() || {};
  const [email, setEmail] = useState('');

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    if (!email || !email.trim()) return;
    if (showToast) {
      showToast('Thank you for subscribing to Netcradus Academy newsletter!');
    }
    setEmail('');
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const handleCallbackClick = () => {
    if (openModal) {
      openModal('callback');
    } else if (showToast) {
      showToast('Callback request form opened.');
    }
  };

  return (
    <footer className="footer-redesign">
      {/* 1. TOP FEATURE STRIP (LIGHT CREAM) */}
      <div className="footer-feature-strip">
        <div className="feature-strip-container">
          <div className="feature-strip-grid">
            
            {/* Feature 1 */}
            <div className="feature-item">
              <div className="feature-icon-wrapper">
                <i className="fa-solid fa-tv"></i>
              </div>
              <div className="feature-content">
                <h5 className="feature-title">LIVE CLASSES</h5>
                <p className="feature-desc">Interactive instructor-led sessions</p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="feature-item">
              <div className="feature-icon-wrapper">
                <i className="fa-solid fa-gears"></i>
              </div>
              <div className="feature-content">
                <h5 className="feature-title">HANDS-ON LABS</h5>
                <p className="feature-desc">Real-world labs and tools for practical learning</p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="feature-item">
              <div className="feature-icon-wrapper">
                <i className="fa-solid fa-award"></i>
              </div>
              <div className="feature-content">
                <h5 className="feature-title">CERTIFICATIONS</h5>
                <p className="feature-desc">Industry-recognized certifications</p>
              </div>
            </div>

            {/* Feature 4 */}
            <div className="feature-item">
              <div className="feature-icon-wrapper">
                <i className="fa-solid fa-users"></i>
              </div>
              <div className="feature-content">
                <h5 className="feature-title">REAL-WORLD PROJECTS</h5>
                <p className="feature-desc">Work on live projects with expert guidance</p>
              </div>
            </div>

          </div>

          {/* Subtle Decorative Paper Plane SVG Graphic */}
          <div className="feature-strip-decoration" aria-hidden="true">
            <svg width="120" height="90" viewBox="0 0 120 90" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M10 75 Q 45 85, 75 55 T 105 20" stroke="#F25C05" strokeWidth="1.5" strokeDasharray="3 3" fill="none" opacity="0.4" />
              <path d="M100 12 L116 22 L106 32 L101 24 Z" fill="#F25C05" opacity="0.75" />
            </svg>
          </div>
        </div>
      </div>

      {/* 2. MAIN FOOTER (DARK NAVY) */}
      <div className="footer-main-dark">
        <div className="footer-dark-glow" aria-hidden="true"></div>
        
        <div className="footer-main-container">
          <div className="footer-4col-grid">
            
            {/* COLUMN 1 — BRAND */}
            <div className="footer-col brand-column">
              <Link to="/" className="footer-logo-link" title="Netcradus Academy">
                <img src="/images/logo.png" alt="NETCRADUS ACADEMY™" className="footer-site-logo" />
              </Link>
              
              <p className="footer-brand-desc">
                Netcradus Academia is India's premier cybersecurity and artificial intelligence skill development platform.
              </p>
              
              <div className="footer-social-row">
                <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="social-icon-btn" title="LinkedIn">
                  <i className="fa-brands fa-linkedin-in"></i>
                </a>
                <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="social-icon-btn" title="YouTube">
                  <i className="fa-brands fa-youtube"></i>
                </a>
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="social-icon-btn" title="Instagram">
                  <i className="fa-brands fa-instagram"></i>
                </a>
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="social-icon-btn" title="X (Twitter)">
                  <i className="fa-brands fa-x-twitter"></i>
                </a>
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="social-icon-btn" title="Facebook">
                  <i className="fa-brands fa-facebook-f"></i>
                </a>
              </div>

              <div className="footer-brand-statement">
                <span className="statement-line">“Learn Today.</span>
                <span className="statement-line">Build a <strong className="highlight-orange">Safer Tomorrow</strong>”</span>
              </div>
            </div>

            {/* COLUMN 2 — NAVIGATION LINKS */}
            <div className="footer-col nav-column">
              <h4 className="footer-heading">Navigation Links</h4>
              <ul className="footer-nav-list">
                <li>
                  <Link to="/" className="footer-nav-item">
                    <span>Home</span>
                    <i className="fa-solid fa-chevron-right nav-arrow"></i>
                  </Link>
                </li>
                <li>
                  <Link to="/about" className="footer-nav-item">
                    <span>About</span>
                    <i className="fa-solid fa-chevron-right nav-arrow"></i>
                  </Link>
                </li>
                <li>
                  <Link to="/dashboard" className="footer-nav-item">
                    <span>Dashboard</span>
                    <i className="fa-solid fa-chevron-right nav-arrow"></i>
                  </Link>
                </li>
                <li>
                  <Link to="/courses" className="footer-nav-item">
                    <span>Courses</span>
                    <i className="fa-solid fa-chevron-right nav-arrow"></i>
                  </Link>
                </li>
                <li>
                  <Link to="/certificate" className="footer-nav-item">
                    <span>Certificate</span>
                    <i className="fa-solid fa-chevron-right nav-arrow"></i>
                  </Link>
                </li>
                <li>
                  <Link to="/projects" className="footer-nav-item">
                    <span>Projects</span>
                    <i className="fa-solid fa-chevron-right nav-arrow"></i>
                  </Link>
                </li>
                <li>
                  <Link to="/contact" className="footer-nav-item">
                    <span>Contact Us</span>
                    <i className="fa-solid fa-chevron-right nav-arrow"></i>
                  </Link>
                </li>
              </ul>
            </div>

            {/* COLUMN 3 — CONTACT & SUPPORT */}
            <div className="footer-col contact-column">
              <h4 className="footer-heading">Contact & Support</h4>
              
              <div className="contact-info-list">
                <div className="contact-info-item">
                  <div className="contact-icon-circle">
                    <i className="fa-solid fa-phone"></i>
                  </div>
                  <div className="contact-details">
                    <a href="tel:1800121008800" className="contact-value">1800 121 008800</a>
                    <span className="contact-subtext">Mon - Sat, 9:00 AM - 6:00 PM</span>
                  </div>
                </div>

                <div className="contact-info-item">
                  <div className="contact-icon-circle">
                    <i className="fa-regular fa-envelope"></i>
                  </div>
                  <div className="contact-details">
                    <a href="mailto:academia@netcradus.com" className="contact-value">academia@netcradus.com</a>
                    <span className="contact-subtext">We reply within 24 hours</span>
                  </div>
                </div>

                <div className="contact-info-item">
                  <div className="contact-icon-circle">
                    <i className="fa-solid fa-location-dot"></i>
                  </div>
                  <div className="contact-details">
                    <span className="contact-value">Bangalore, India</span>
                    <span className="contact-subtext">Our Learning Hub</span>
                  </div>
                </div>
              </div>

              <button 
                type="button" 
                className="btn-request-callback"
                onClick={handleCallbackClick}
              >
                <i className="fa-solid fa-headset"></i>
                <span>Request a Callback</span>
                <i className="fa-solid fa-chevron-right callback-arrow"></i>
              </button>
            </div>

            {/* COLUMN 4 — STAY CONNECTED */}
            <div className="footer-col newsletter-column">
              <h4 className="footer-heading">Stay Connected</h4>
              
              <p className="newsletter-subtext">
                Get the latest updates, new courses and learning resources.
              </p>

              <form className="newsletter-form" onSubmit={handleNewsletterSubmit}>
                <div className="newsletter-input-wrap">
                  <i className="fa-regular fa-envelope newsletter-field-icon"></i>
                  <input 
                    type="email" 
                    className="newsletter-email-input"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                  <button type="submit" className="newsletter-submit-btn" title="Subscribe">
                    <i className="fa-solid fa-chevron-right"></i>
                  </button>
                </div>
              </form>

              <p className="newsletter-privacy-note">
                <i className="fa-solid fa-lock"></i> No spam. Unsubscribe anytime.
              </p>

              {/* Decorative Handwritten Watermark */}
              <div className="footer-handwritten-watermark" aria-hidden="true">
                <span>Skills</span>
                <span>Today</span>
                <span>A Safer</span>
                <span>Tomorrow</span>
              </div>
            </div>

          </div>
        </div>

        {/* 3. BOTTOM COPYRIGHT BAR */}
        <div className="footer-bottom-bar">
          <div className="footer-bottom-container">
            <div className="footer-copyright-text">
              © 2026 Netcradus Academia. All Rights Reserved.
            </div>

            <div className="footer-legal-links">
              <Link to="/contact">Privacy Policy</Link>
              <span className="legal-sep">|</span>
              <Link to="/contact">Terms of Service</Link>
              <span className="legal-sep">|</span>
              <Link to="/contact">Cookie Policy</Link>
            </div>

            <button 
              type="button" 
              className="footer-back-to-top"
              onClick={scrollToTop}
              title="Back to Top"
            >
              <span className="back-top-circle">
                <i className="fa-solid fa-arrow-up"></i>
              </span>
              <span className="back-top-label">Back to Top</span>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
