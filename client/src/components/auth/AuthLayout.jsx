import React from 'react';

export default function AuthLayout({
  title,
  subtitle,
  children,
  badgeText = 'NETCRADUS ACADEMIA AUTH',
  leftTagline = 'Master Cyber Security & Artificial Intelligence',
  leftPoints = [
    {
      icon: 'fa-shield-halved',
      title: '24/7 Virtual Cloud Labs',
      desc: 'Isolated target sandboxes and enterprise GPU clusters.',
    },
    {
      icon: 'fa-certificate',
      title: 'Global Industry Certifications',
      desc: 'ISO 9001:2015 & NASSCOM aligned skill tracks.',
    },
    {
      icon: 'fa-diagram-project',
      title: 'Real-World Client Builds',
      desc: 'Work on live security R&D and AI agent engineering.',
    },
  ],
  singleCard = false,
  showLogoInCard = true,
}) {
  if (singleCard) {
    return (
      <div className="auth-page-section single-card-section">
        <div className="auth-single-container">
          <div className="auth-form-card login-glass-card">
            {showLogoInCard && (
              <div className="auth-card-logo-wrapper">
                <img src="/images/logo.png" alt="Netcradus Academy" className="auth-card-logo-img" />
              </div>
            )}
            <div className="auth-form-header">
              <h2 className="auth-card-title">{title}</h2>
              {subtitle && <p className="auth-card-subtitle">{subtitle}</p>}
            </div>

            {children}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page-section">
      <div className="container">
        <div className="auth-grid">
          {/* LEFT SIDE: BRANDING & HIGHLIGHTS */}
          <div className="auth-left-card">
            <div
              className="badge-pill pill-cyan"
              style={{
                marginBottom: '20px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <i className="fa-solid fa-graduation-cap"></i>
              <span>{badgeText}</span>
            </div>

            <h1
              className="auth-left-title"
              style={{
                fontSize: '2.2rem',
                fontWeight: 800,
                color: 'var(--white)',
                marginBottom: '16px',
                lineHeight: 1.25,
              }}
            >
              {leftTagline}
            </h1>

            <p
              style={{
                color: 'var(--text-muted)',
                fontSize: '0.95rem',
                marginBottom: '32px',
                lineHeight: 1.6,
              }}
            >
              Join over 50,000+ active tech learners, access hands-on lab environments, and accelerate your career with mentor-guided practical projects.
            </p>

            <div className="auth-left-points" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {(leftPoints || []).map((point, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '16px',
                    background: 'rgba(0, 210, 255, 0.04)',
                    padding: '16px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid rgba(0, 210, 255, 0.12)',
                  }}
                >
                  <div
                    style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '10px',
                      background: 'rgba(0, 210, 255, 0.15)',
                      color: 'var(--cyan-primary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.2rem',
                      flexShrink: 0,
                    }}
                  >
                    <i className={`fa-solid ${point.icon}`}></i>
                  </div>
                  <div>
                    <h4 style={{ color: 'var(--white)', fontSize: '1rem', fontWeight: 600, marginBottom: '3px' }}>
                      {point.title}
                    </h4>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.83rem', margin: 0 }}>{point.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div
              style={{
                marginTop: '35px',
                paddingTop: '20px',
                borderTop: '1px solid var(--border-subtle)',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
              }}
            >
              <img src="/images/logo.png" alt="Netcradus Academy Logo" style={{ height: '46px', opacity: 0.95, objectFit: 'contain' }} />
              <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>Official Student Skill Portal</span>
            </div>
          </div>

          {/* RIGHT SIDE: AUTH FORM CARD */}
          <div className="auth-form-card">
            <div className="auth-form-header" style={{ marginBottom: '25px' }}>
              <h2 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--white)', marginBottom: '6px' }}>
                {title}
              </h2>
              {subtitle && <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{subtitle}</p>}
            </div>

            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
