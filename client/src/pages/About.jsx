import React, { useState } from 'react';
import { useApp } from '../App';
import './About.css';

export default function About() {
  const { openEnrollModalFor } = useApp();
  const [showFullAbout, setShowFullAbout] = useState(false);
  const [activeFacilityModal, setActiveFacilityModal] = useState(null);

  const facilities = [
    {
      id: 'smart-classrooms',
      title: 'Smart Classrooms',
      image: '/images/about/facility-classrooms.jpg',
      shortDesc: 'All our classrooms are equipped with E-Boards and Audio-Visual aids for 21st century learning teaching and learning.',
      longDesc: 'Our smart classrooms leverage state-of-the-art interactive digital boards, high-definition audio-visual projection, and real-time screen sharing. Every session is designed for immersive participation, allowing educators and students to seamlessly transition between live coding, architecture diagrams, and collaborative engineering exercises.',
      features: ['Interactive Multi-Touch E-Boards', 'Hybrid Classroom Audio-Visual Systems', 'Live Real-Time Screen Collaboration', 'Dedicated Sandbox Terminals']
    },
    {
      id: 'advanced-library',
      title: 'Advanced Library',
      image: '/images/about/facility-library.jpg',
      shortDesc: 'Libraries in all our campuses contain books, CD-ROMs, DVDs that cover a spectrum of subjects and satisfies the students\' urge to learn.',
      longDesc: 'Our physical and digital research libraries curate extensive technical archives, IEEE publications, cybersecurity whitepapers, software engineering reference guides, and comprehensive multimedia libraries. Students enjoy 24/7 digital repository access alongside peaceful, quiet study pods.',
      features: ['Extensive Tech & Engineering Volumes', 'Digital Audio-Visual & E-Learning Hub', 'IEEE & ACM Research Journal Access', 'Silent Collaborative Study Lounges']
    },
    {
      id: 'science-zones',
      title: 'Science Zones',
      image: '/images/about/facility-science.jpg',
      shortDesc: 'Concepts taught in classroom are reinforced at our science zone, which is well-equipped to work on academic problems.',
      longDesc: 'Our science and cyber experimentation zones bridge theoretical concepts with real-world empirical validation. From hardware security sandboxes and networking racks to automated cloud clusters and AI model training testbeds, students solve real industrial problems in safe, isolated environments.',
      features: ['Isolated Attack & Defense Security Range', 'Enterprise AI/ML Model Sandboxes', 'Hardware IoT & Networking Testing Racks', 'Continuous Mentored Project Labs']
    }
  ];

  const handleApplyClick = () => {
    if (typeof openEnrollModalFor === 'function') {
      openEnrollModalFor('Netcradus Academy Admissions & Programs');
    }
  };

  const scrollToOverview = () => {
    const el = document.getElementById('about-overview');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="pioneer-about-wrapper">
      {/* ====================================================================
          1. HERO SECTION ("INNOVATION is our tradition")
          ==================================================================== */}
      <section className="pioneer-hero-section">
        <div className="pioneer-stars-overlay" aria-hidden="true" />
        <div className="shooting-star" aria-hidden="true" />

        <div className="pioneer-hero-container">
          {/* Left Column: Girl with telescope sitting on floating book */}
          <div className="pioneer-hero-visual">
            <div className="pioneer-telescope-img-wrapper">
              <img
                src="/images/about/hero-innovation.jpg"
                alt="Student exploring the cosmos through a telescope on an open book"
                className="pioneer-telescope-img"
              />
            </div>
          </div>

          {/* Right Column: INNOVATION is our tradition */}
          <div className="pioneer-hero-content">
            <h1 className="pioneer-hero-title">INNOVATION</h1>
            <p className="pioneer-hero-subtitle">is our tradition</p>
            <div className="pioneer-hero-action">
              <button
                type="button"
                className="btn-pioneer-explore"
                onClick={scrollToOverview}
              >
                EXPLORE
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          2. ABOUT US SECTION (Royal Violet Gradient)
          ==================================================================== */}
      <section className="pioneer-about-section" id="about-overview">
        <div className="pioneer-about-container full-width">
          {/* About us Text */}
          <div className="pioneer-about-text-col">
            <h2 className="pioneer-about-heading">About us</h2>
            <p className="pioneer-about-desc">
              At Netcradus Academy, we are dedicated to shaping the next generation of cybersecurity defenders, ethical hackers, and digital security leaders. In an increasingly interconnected and threat-driven digital world, our mission is to bridge the critical skills gap by delivering premier, industry-aligned cybersecurity training. Through our advanced curriculum, expert-led mentorship, and hands-on practical training in ethical hacking, network defense, cloud security, and threat intelligence, we empower individuals to master the digital frontier and secure rewarding careers. Whether you are starting your journey or advancing your technical expertise, Netcradus Academy provides the tools, knowledge, and industry-recognized certifications needed to excel in modern cybersecurity.
            </p>

            {/* Core Domain Pillars Highlight */}
            <div className="about-cyber-pillars-grid">
              <div className="cyber-pillar-card">
                <div className="pillar-icon">
                  <i className="fa-solid fa-user-ninja"></i>
                </div>
                <div className="pillar-title">Ethical Hacking</div>
              </div>

              <div className="cyber-pillar-card">
                <div className="pillar-icon">
                  <i className="fa-solid fa-shield-halved"></i>
                </div>
                <div className="pillar-title">Network Defense</div>
              </div>

              <div className="cyber-pillar-card">
                <div className="pillar-icon">
                  <i className="fa-solid fa-cloud"></i>
                </div>
                <div className="pillar-title">Cloud Security</div>
              </div>

              <div className="cyber-pillar-card">
                <div className="pillar-icon">
                  <i className="fa-solid fa-bolt"></i>
                </div>
                <div className="pillar-title">Threat Intelligence</div>
              </div>
            </div>

            {showFullAbout && (
              <div className="pioneer-about-extra" style={{ marginTop: '28px' }}>
                <p>
                  Our holistic learning ecosystem integrates practical problem solving, critical thinking, and dedicated mentorship from certified industry experts. We believe that curiosity paired with disciplined hands-on practice unlocks boundless potential for every learner.
                </p>
              </div>
            )}

            <div style={{ marginTop: '32px' }}>
              <button
                type="button"
                className="btn-pioneer-outline"
                onClick={() => setShowFullAbout(!showFullAbout)}
              >
                {showFullAbout ? 'Show less' : 'Read more...'}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          3. OUR FACILITIES SECTION (Clean White Background)
          ==================================================================== */}
      <section className="pioneer-facilities-section" id="facilities">
        <div className="pioneer-facilities-container">
          <div className="pioneer-facilities-header-row">
            <h2 className="pioneer-facilities-title">Our Facilities</h2>
            <div className="pioneer-carousel-controls">
              <button
                type="button"
                className="carousel-nav-btn"
                aria-label="Previous facility"
                onClick={() => {
                  const el = document.getElementById('facilities-grid');
                  if (el) el.scrollBy({ left: -300, behavior: 'smooth' });
                }}
              >
                <i className="fa-solid fa-chevron-left"></i>
              </button>
              <button
                type="button"
                className="carousel-nav-btn"
                aria-label="Next facility"
                onClick={() => {
                  const el = document.getElementById('facilities-grid');
                  if (el) el.scrollBy({ left: 300, behavior: 'smooth' });
                }}
              >
                <i className="fa-solid fa-chevron-right"></i>
              </button>
            </div>
          </div>

          <div className="pioneer-facilities-grid" id="facilities-grid">
            {facilities.map((facility) => (
              <div key={facility.id} className="pioneer-facility-card">
                <div className="facility-img-box">
                  <img
                    src={facility.image}
                    alt={facility.title}
                    className="facility-img"
                  />
                </div>
                <h3 className="facility-title">{facility.title}</h3>
                <p className="facility-desc">{facility.shortDesc}</p>
                <button
                  type="button"
                  className="btn-facility-outline"
                  onClick={() => setActiveFacilityModal(facility)}
                >
                  Read more...
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* ====================================================================
          FACILITY DETAIL MODAL (When 'Read more...' is clicked)
          ==================================================================== */}
      {activeFacilityModal && (
        <div
          className="facility-modal-backdrop"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(7, 11, 20, 0.85)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '20px'
          }}
          onClick={() => setActiveFacilityModal(null)}
        >
          <div
            className="facility-modal-card"
            style={{
              background: '#ffffff',
              borderRadius: '20px',
              maxWidth: '560px',
              width: '100%',
              padding: '32px',
              boxShadow: '0 25px 60px rgba(0, 0, 0, 0.35)',
              color: '#1e1b4b',
              position: 'relative'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                background: '#f1f5f9',
                border: 'none',
                borderRadius: '50%',
                width: '36px',
                height: '36px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#64748b'
              }}
              onClick={() => setActiveFacilityModal(null)}
              aria-label="Close modal"
            >
              <i className="fa-solid fa-xmark"></i>
            </button>

            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <img
                src={activeFacilityModal.image}
                alt={activeFacilityModal.title}
                style={{ width: '160px', height: '140px', objectFit: 'contain' }}
              />
              <h3 style={{ fontSize: '1.6rem', color: '#1f1854', marginTop: '12px', fontWeight: 800 }}>
                {activeFacilityModal.title}
              </h3>
            </div>

            <p style={{ color: '#475569', fontSize: '0.98rem', lineHeight: '1.7', marginBottom: '20px' }}>
              {activeFacilityModal.longDesc}
            </p>

            <div style={{ marginBottom: '24px' }}>
              <h4 style={{ fontSize: '1rem', color: '#1f1854', fontWeight: 700, marginBottom: '10px' }}>
                Key Highlights:
              </h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {activeFacilityModal.features.map((feat, idx) => (
                  <li
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      color: '#334155',
                      fontSize: '0.92rem',
                      marginBottom: '8px'
                    }}
                  >
                    <i className="fa-solid fa-circle-check" style={{ color: '#f59e0b' }}></i>
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button
                type="button"
                className="btn-apply-online"
                onClick={() => {
                  setActiveFacilityModal(null);
                  handleApplyClick();
                }}
              >
                Apply Online
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
