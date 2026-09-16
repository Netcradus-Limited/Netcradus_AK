import React from 'react';
import { Link } from 'react-router-dom';

const portalModules = [
  {
    num: '01',
    title: 'About Us',
    desc: 'Learn about our virtual cloud labs, certified mentors, and learning ecosystem.',
    route: '/about',
    ctaText: 'Open About Page',
    iconClass: 'fa-solid fa-building-columns',
    themeClass: 'theme-about',
    pedestalGlow: 'rgba(255, 120, 30, 0.15)',
  },
  {
    num: '02',
    title: 'Popular Courses',
    desc: 'Explore 100+ industry tracks: Ethical Hacking, AI & ML, Cloud, Data Science, MERN & SOC.',
    route: '/courses',
    ctaText: 'Open Courses Page',
    iconClass: 'fa-solid fa-book-bookmark',
    themeClass: 'theme-courses',
    pedestalGlow: 'rgba(255, 145, 0, 0.15)',
  },
  {
    num: '03',
    title: 'Real-World Projects',
    desc: '3 to 6 months hands-on projects, live code submissions, stipend tracks, and mentor guidance.',
    route: '/projects',
    ctaText: 'Open Projects Page',
    iconClass: 'fa-solid fa-folder-open',
    themeClass: 'theme-projects',
    pedestalGlow: 'rgba(249, 115, 22, 0.15)',
  },
  {
    num: '04',
    title: 'Student Dashboard',
    desc: 'Access your live classes, recorded lectures, assignments, progress graph, and virtual sandboxes.',
    route: '/dashboard',
    ctaText: 'Launch Student Dashboard',
    iconClass: 'fa-solid fa-laptop-code',
    themeClass: 'theme-dashboard',
    pedestalGlow: 'rgba(255, 107, 0, 0.18)',
    highlight: true,
  },
  {
    num: '05',
    title: 'Certificate Verification',
    desc: 'Verify 12-digit student credentials, download ISO-certified certificates, and share to LinkedIn.',
    route: '/certificate',
    ctaText: 'Open Certificate Portal',
    iconClass: 'fa-solid fa-award',
    themeClass: 'theme-certificate',
    pedestalGlow: 'rgba(234, 179, 8, 0.15)',
  },
  {
    num: '06',
    title: 'Contact Us',
    desc: 'Connect with expert academic counselors, request a demo callback, or visit our tech campus.',
    route: '/contact',
    ctaText: 'Open Contact Page',
    iconClass: 'fa-solid fa-headset',
    themeClass: 'theme-contact',
    pedestalGlow: 'rgba(239, 68, 68, 0.15)',
  },
];

export default function ExplorePortalSection() {
  const handleMouseMove = (e) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    const tiltX = (y - 50) / -14;
    const tiltY = (x - 50) / 14;

    card.style.setProperty('--mouse-x', `${x}%`);
    card.style.setProperty('--mouse-y', `${y}%`);
    card.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) translateY(-8px) scale(1.015)`;
  };

  const handleMouseLeave = (e) => {
    const card = e.currentTarget;
    card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px) scale(1)';
  };

  return (
    <section className="explore-portal-redesign" id="explore-portal">
      {/* Background Ambient Glow & Dot Pattern Layers */}
      <div className="ep-glow-blob blob-top-left"></div>
      <div className="ep-glow-blob blob-bottom-right"></div>
      <div className="ep-dot-pattern"></div>

      {/* Side Decorative Typography */}
      <div className="ep-side-tag left">
        <span>Explore</span>
        <span>Learn</span>
        <span>Build</span>
        <span>Grow</span>
      </div>

      <div className="ep-side-tag right">
        <span>Your Learning Journey</span>
        <span>Your Way</span>
      </div>

      <div className="container relative-container">
        {/* SECTION HEADER */}
        <div className="ep-section-header text-center">
          <div className="ep-badge-line">
            <span className="line"></span>
            <span className="badge-text">EXPLORE NETCRADUS PORTAL</span>
            <span className="line"></span>
          </div>

          <h2 className="ep-section-title">
            Open Any Section <span className="highlight-orange">Individually</span>
          </h2>

          <p className="ep-section-subtitle">
            Select any dedicated page module below to jump directly into the full experience.
          </p>
        </div>

        {/* PORTAL CARDS 3x2 GRID */}
        <div className="ep-grid">
          {portalModules.map((m) => (
            <Link
              key={m.num}
              to={m.route}
              className={`ep-card ${m.themeClass} ${m.highlight ? 'highlight-card' : ''}`}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
            >
              {/* Cursor Spotlight Glow */}
              <div className="ep-card-spotlight"></div>

              {/* CARD TOP ROW: 3D Visual Pedestal + Number */}
              <div className="ep-card-header">
                <div className="ep-3d-pedestal">
                  <div className="ep-pedestal-glow" style={{ background: m.pedestalGlow }}></div>
                  <div className="ep-pedestal-base"></div>
                  <div className="ep-3d-icon-box">
                    <i className={m.iconClass}></i>
                  </div>
                </div>

                <div className="ep-card-num">{m.num}</div>
              </div>

              {/* CARD BODY: Title & Description */}
              <div className="ep-card-body">
                <h3 className="ep-card-title">{m.title}</h3>
                <p className="ep-card-desc">{m.desc}</p>
              </div>

              {/* CARD FOOTER: CTA Pill Bar */}
              <div className="ep-card-footer">
                <div className="ep-cta-pill">
                  <span className="ep-cta-text">{m.ctaText}</span>
                  <div className="ep-cta-btn">
                    <i className="fa-solid fa-arrow-right"></i>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* BOTTOM CLOSING STRIP */}
        <div className="ep-closing-strip">
          <div className="ep-closing-icon">
            <i className="fa-solid fa-graduation-cap"></i>
          </div>
          <p className="ep-closing-text">
            "A <span className="highlight-orange">smarter</span> way to navigate your learning journey."
          </p>
        </div>
      </div>
    </section>
  );
}
