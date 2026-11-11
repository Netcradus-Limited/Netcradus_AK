import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../App';
import { CONTACT_INFO } from '../data/programmesData';

export default function Footer() {
  const { openModal, openDrawer, showToast } = useApp() || {};
  const [email, setEmail] = useState('');

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    if (!email || !email.trim()) return;
    if (showToast) {
      showToast('Thank you for subscribing to Netcradus Academy newsletter updates!');
    }
    setEmail('');
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  const handleEnquireClick = () => {
    if (openDrawer) {
      openDrawer('enquire');
    } else if (openModal) {
      openModal('enroll');
    }
  };

  return (
    <footer className="footer-redesign" id="site-footer">
      {/* 1. TOP HIGHLIGHT STRIP */}
      <div className="footer-feature-strip">
        <div className="feature-strip-container">
          <div className="feature-strip-grid">
            <div className="feature-item">
              <div className="feature-icon-wrapper">
                <i className="fa-solid fa-shield-virus"></i>
              </div>
              <div className="feature-content">
                <h5 className="feature-title">4 CAREER TRACKS</h5>
                <p className="feature-desc">Offensive, Defence, Secure Eng & AI</p>
              </div>
            </div>

            <div className="feature-item">
              <div className="feature-icon-wrapper">
                <i className="fa-solid fa-flask-vial"></i>
              </div>
              <div className="feature-content">
                <h5 className="feature-title">PRACTICAL LABS</h5>
                <p className="feature-desc">Virtual sandboxes & real industry tools</p>
              </div>
            </div>

            <div className="feature-item">
              <div className="feature-icon-wrapper">
                <i className="fa-solid fa-trophy"></i>
              </div>
              <div className="feature-content">
                <h5 className="feature-title">REAL CAPSTONES</h5>
                <p className="feature-desc">Projects you can present to employers</p>
              </div>
            </div>

            <div className="feature-item">
              <div className="feature-icon-wrapper">
                <i className="fa-solid fa-user-tie"></i>
              </div>
              <div className="feature-content">
                <h5 className="feature-title">JOB-READY FOCUS</h5>
                <p className="feature-desc">Aligned with enterprise hiring profiles</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. MAIN FOOTER */}
      <div className="footer-main-dark">
        <div className="footer-main-container">
          <div className="footer-5col-grid">
            {/* COLUMN 1 — BRAND */}
            <div className="footer-col brand-column">
              <Link to="/" className="footer-logo-link" title="Netcradus Academy">
                <img src="/images/logo.png" alt="NETCRADUS ACADEMY™" className="footer-site-logo" />
              </Link>

              <p className="footer-brand-desc">
                Netcradus Academy's Emerging Technologies Programme trains students and professionals
                for growing career opportunities in cybersecurity and artificial intelligence.
              </p>

              <div className="footer-social-row">
                <a
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-icon-btn"
                  title="LinkedIn"
                  aria-label="LinkedIn"
                >
                  <i className="fa-brands fa-linkedin-in"></i>
                </a>
                <a
                  href="https://youtube.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-icon-btn"
                  title="YouTube"
                  aria-label="YouTube"
                >
                  <i className="fa-brands fa-youtube"></i>
                </a>
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-icon-btn"
                  title="Instagram"
                  aria-label="Instagram"
                >
                  <i className="fa-brands fa-instagram"></i>
                </a>
                <a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-icon-btn"
                  title="X (Twitter)"
                  aria-label="X (Twitter)"
                >
                  <i className="fa-brands fa-x-twitter"></i>
                </a>
              </div>

              <div className="footer-brand-statement">
                <span className="statement-line">“Learn the Technologies</span>
                <span className="statement-line">
                  Shaping <strong className="highlight-orange">Tomorrow</strong>”
                </span>
              </div>
            </div>

            {/* COLUMN 2 — QUICK NAVIGATION */}
            <div className="footer-col nav-column">
              <h4 className="footer-heading">Quick Links</h4>
              <ul className="footer-nav-list">
                <li>
                  <Link to="/" className="footer-nav-item">
                    <span>Home</span>
                    <i className="fa-solid fa-chevron-right nav-arrow"></i>
                  </Link>
                </li>
                <li>
                  <Link to="/about" className="footer-nav-item">
                    <span>About Academy</span>
                    <i className="fa-solid fa-chevron-right nav-arrow"></i>
                  </Link>
                </li>
                <li>
                  <Link to="/programmes" className="footer-nav-item">
                    <span>All 11 Programmes</span>
                    <i className="fa-solid fa-chevron-right nav-arrow"></i>
                  </Link>
                </li>
                <li>
                  <Link to="/learning-journey" className="footer-nav-item">
                    <span>Learning Journey</span>
                    <i className="fa-solid fa-chevron-right nav-arrow"></i>
                  </Link>
                </li>
                <li>
                  <Link to="/careers" className="footer-nav-item">
                    <span>Career Opportunities</span>
                    <i className="fa-solid fa-chevron-right nav-arrow"></i>
                  </Link>
                </li>
                <li>
                  <Link to="/institutions" className="footer-nav-item">
                    <span>For Institutions</span>
                    <i className="fa-solid fa-chevron-right nav-arrow"></i>
                  </Link>
                </li>
                <li>
                  <Link to="/blog" className="footer-nav-item">
                    <span>Knowledge Hub & Guides</span>
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

            {/* COLUMN 3 — PROGRAMME TRACKS */}
            <div className="footer-col tracks-column">
              <h4 className="footer-heading">Learning Tracks</h4>
              <ul className="footer-nav-list">
                <li>
                  <Link to="/programmes?track=offensive-security" className="footer-nav-item">
                    <span>Offensive Security (2)</span>
                    <i className="fa-solid fa-chevron-right nav-arrow"></i>
                  </Link>
                </li>
                <li>
                  <Link to="/programmes?track=defence-governance" className="footer-nav-item">
                    <span>Defence & Governance (3)</span>
                    <i className="fa-solid fa-chevron-right nav-arrow"></i>
                  </Link>
                </li>
                <li>
                  <Link to="/programmes?track=secure-engineering" className="footer-nav-item">
                    <span>Secure Engineering (2)</span>
                    <i className="fa-solid fa-chevron-right nav-arrow"></i>
                  </Link>
                </li>
                <li>
                  <Link to="/programmes?track=ai-automation" className="footer-nav-item">
                    <span>AI & Automation (4)</span>
                    <i className="fa-solid fa-chevron-right nav-arrow"></i>
                  </Link>
                </li>
                <li>
                  <Link to="/programmes" className="footer-nav-item text-highlight">
                    <span>Programmes at a Glance</span>
                    <i className="fa-solid fa-chevron-right nav-arrow"></i>
                  </Link>
                </li>
              </ul>
            </div>

            {/* COLUMN 4 — CONTACT & ADMISSIONS */}
            <div className="footer-col contact-column">
              <h4 className="footer-heading">Admissions Desk</h4>

              <div className="contact-info-list">
                <div className="contact-info-item">
                  <div className="contact-icon-circle">
                    <i className="fa-solid fa-phone"></i>
                  </div>
                  <div className="contact-details">
                    <a href={`tel:${CONTACT_INFO.phoneClean}`} className="contact-value">
                      {CONTACT_INFO.phone}
                    </a>
                    <span className="contact-subtext">Phone & WhatsApp Desk</span>
                  </div>
                </div>

                <div className="contact-info-item">
                  <div className="contact-icon-circle">
                    <i className="fa-regular fa-envelope"></i>
                  </div>
                  <div className="contact-details">
                    <a href={`mailto:${CONTACT_INFO.email}`} className="contact-value">
                      {CONTACT_INFO.email}
                    </a>
                    <span className="contact-subtext">Direct Admissions Email</span>
                  </div>
                </div>

                <div className="contact-info-item">
                  <div className="contact-icon-circle">
                    <i className="fa-solid fa-globe"></i>
                  </div>
                  <div className="contact-details">
                    <span className="contact-value">{CONTACT_INFO.website}</span>
                    <span className="contact-subtext">Official Academy Portal</span>
                  </div>
                </div>

                <div className="contact-info-item">
                  <div className="contact-icon-circle">
                    <i className="fa-solid fa-location-dot"></i>
                  </div>
                  <div className="contact-details">
                    <span className="contact-value">{CONTACT_INFO.address}</span>
                    <span className="contact-subtext">Learning Hub</span>
                  </div>
                </div>
              </div>

              <div className="footer-cta-buttons">
                <button
                  type="button"
                  className="btn-request-callback"
                  onClick={handleEnquireClick}
                >
                  <i className="fa-solid fa-headset"></i>
                  <span>Enquire for Admissions</span>
                </button>
                <a
                  href={CONTACT_INFO.whatsappBaseUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-footer-whatsapp"
                >
                  <i className="fa-brands fa-whatsapp"></i>
                  <span>WhatsApp Admissions</span>
                </a>
              </div>
            </div>

            {/* COLUMN 5 — STAY INFORMED */}
            <div className="footer-col newsletter-column">
              <h4 className="footer-heading">Admissions Updates</h4>

              <p className="newsletter-subtext">
                Subscribe for upcoming cohort announcements, workshop invites and curriculum insights.
              </p>

              <form className="newsletter-form" onSubmit={handleNewsletterSubmit}>
                <div className="newsletter-input-wrap">
                  <i className="fa-regular fa-envelope newsletter-field-icon"></i>
                  <input
                    type="email"
                    className="newsletter-email-input"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                  <button type="submit" className="newsletter-submit-btn" title="Subscribe" aria-label="Subscribe">
                    <i className="fa-solid fa-chevron-right"></i>
                  </button>
                </div>
              </form>

              <p className="newsletter-privacy-note">
                <i className="fa-solid fa-shield-halved"></i> Strictly no spam. Unsubscribe anytime.
              </p>
            </div>
          </div>
        </div>

        {/* 3. BOTTOM COPYRIGHT BAR */}
        <div className="footer-bottom-bar">
          <div className="footer-bottom-container">
            <div className="footer-copyright-text">
              © {new Date().getFullYear()} Netcradus Academy. All Rights Reserved.
            </div>

            <div className="footer-legal-links">
              <Link to="/contact">Privacy Policy</Link>
              <span className="legal-sep">|</span>
              <Link to="/contact">Terms of Service</Link>
              <span className="legal-sep">|</span>
              <Link to="/contact">Code of Conduct</Link>
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
