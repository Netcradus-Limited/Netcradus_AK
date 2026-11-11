import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { TRACKS, CONTACT_INFO } from '../data/programmesData';
import SEOHead from '../components/SEOHead';
import './About.css';

export default function About() {
  const [showFullAbout, setShowFullAbout] = useState(false);

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://academy.netcradus.com/',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'About Netcradus Academy',
        item: 'https://academy.netcradus.com/about',
      },
    ],
  };

  return (
    <>
      <SEOHead
        title="About Netcradus Academy | Cyber Security & AI Education in India"
        description="Learn about Netcradus Academy, our mission, emerging technologies curriculum across 4 tracks, and our physical learning center in Sector 63, Noida (Delhi NCR)."
        keywords="About Netcradus Academy, Cyber Security Training Institute Noida, AI Institute Delhi NCR, Ethical Hacking Training"
        canonical="https://academy.netcradus.com/about"
        schema={breadcrumbSchema}
      />

      <div className="pioneer-about-wrapper about-academy-page">
      {/* ====================================================================
          1. HERO SECTION ("Learn the Technologies Shaping Tomorrow")
          ==================================================================== */}
      <section className="pioneer-hero-section">
        <div className="pioneer-stars-overlay" aria-hidden="true" />
        <div className="shooting-star" aria-hidden="true" />

        <div className="pioneer-hero-container">
          <div className="pioneer-hero-visual">
            <div className="pioneer-telescope-img-wrapper">
              <img
                src="/images/about/hero-innovation.jpg"
                alt="Student exploring emerging technologies at Netcradus Academy"
                className="pioneer-telescope-img"
              />
            </div>
          </div>

          <div className="pioneer-hero-content">
            <span className="badge-pill pill-cyan" style={{ marginBottom: '15px', display: 'inline-block' }}>
              NETCRADUS ACADEMY
            </span>
            <h1 className="pioneer-hero-title">LEARN</h1>
            <p className="pioneer-hero-subtitle">the Technologies Shaping Tomorrow</p>
            <p style={{ color: '#cbd5e1', fontSize: '1.05rem', margin: '20px 0 25px 0', lineHeight: 1.6, maxWidth: '520px' }}>
              Netcradus Academy's Emerging Technologies Programme trains students and professionals
              for growing career opportunities in cybersecurity and artificial intelligence.
            </p>
            <div className="pioneer-hero-action">
              <Link to="/programmes" className="btn-pioneer-explore">
                EXPLORE 11 PROGRAMMES
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          2. ABOUT US SECTION
          ==================================================================== */}
      <section className="pioneer-about-section" id="about-overview">
        <div className="pioneer-about-container full-width">
          <div className="pioneer-about-text-col">
            <span className="section-badge badge-orange" style={{ marginBottom: '10px', display: 'inline-block' }}>
              ABOUT THE PROGRAMME
            </span>
            <h2 className="pioneer-about-heading">Learn the Technologies Shaping Tomorrow</h2>
            <p className="pioneer-about-desc">
              Netcradus Academy's Emerging Technologies Programme trains students and professionals
              for growing career opportunities in cybersecurity and artificial intelligence.
              Eleven programmes across four tracks allow learners to select a learning path based
              on their career goals.
            </p>
            <p className="pioneer-about-desc" style={{ marginTop: '16px' }}>
              From discovering security weaknesses before attackers do (VAPT Analyst, Penetration Tester)
              and managing real-time security monitoring (SOC Analyst, Cloud Security Analyst, GRC Analyst),
              to securing AI and pipelines (AI Security Engineer, DevSecOps) and building intelligent applications
              and automations (AI Developer, AI Automation, Agentic AI, Prompt Engineer)—every curriculum
              emphasizes hands-on practical lab mastery and tangible capstone projects.
            </p>

            {/* Four Tracks Highlights Grid */}
            <div className="about-cyber-pillars-grid">
              {TRACKS.map((track) => (
                <div key={track.id} className="cyber-pillar-card">
                  <div className="pillar-icon" style={{ color: track.accentColor }}>
                    <i className={track.icon}></i>
                  </div>
                  <div className="pillar-title">{track.title}</div>
                  <span style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '4px', display: 'block' }}>
                    {track.badge}
                  </span>
                </div>
              ))}
            </div>

            {showFullAbout && (
              <div className="pioneer-about-extra" style={{ marginTop: '28px' }}>
                <h4 style={{ color: '#ffffff', marginBottom: '10px' }}>Our Training Philosophy</h4>
                <p style={{ color: '#cbd5e1', lineHeight: 1.6 }}>
                  We believe that technology education must mirror enterprise realities. Rather than
                  memorizing abstract slides, our learners spend their time in authorized sandbox
                  environments: configuring SIEM correlation rules, fuzzing LLM prompts for injection
                  vulnerabilities, mapping MITRE ATT&CK techniques, orchestrating LangGraph multi-agent teams,
                  and writing professional audit reports.
                </p>
              </div>
            )}

            <div style={{ marginTop: '32px' }}>
              <button
                type="button"
                className="btn-pioneer-outline"
                onClick={() => setShowFullAbout(!showFullAbout)}
              >
                {showFullAbout ? 'Show less' : 'Read more about our approach...'}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          3. FOUR PILLARS OF NETCRADUS ACADEMY
          ==================================================================== */}
      <section className="section about-pillars-deep" style={{ background: 'var(--bg-dark-secondary)', padding: '80px 0' }}>
        <div className="container">
          <div className="section-header text-center">
            <span className="section-badge badge-cyan">ACADEMY FOUNDATIONS</span>
            <h2 className="section-title">The Four Pillars of Netcradus Training</h2>
            <p className="section-subtitle">
              Engineered to support students, fresh graduates, working professionals, and career switchers.
            </p>
          </div>

          <div className="about-pillars-grid" style={{ marginTop: '40px' }}>
            <div className="about-pillar-card">
              <div className="pillar-icon"><i className="fa-solid fa-layer-group"></i></div>
              <h5>1. Build Foundations</h5>
              <p>Core networking, computing and AI concepts so beginners and experienced learners start on solid ground.</p>
            </div>
            <div className="about-pillar-card">
              <div className="pillar-icon"><i className="fa-solid fa-flask-vial"></i></div>
              <h5>2. Practise in Labs</h5>
              <p>Guided practical exercises using professional tools: Kali, Splunk, Prowler, LangGraph, Docker, and more.</p>
            </div>
            <div className="about-pillar-card">
              <div className="pillar-icon"><i className="fa-solid fa-trophy"></i></div>
              <h5>3. Create a Capstone</h5>
              <p>A real-world-style project learners can present to prospective employers and colleges.</p>
            </div>
            <div className="about-pillar-card">
              <div className="pillar-icon"><i className="fa-solid fa-user-tie"></i></div>
              <h5>4. Get Career-Ready</h5>
              <p>Profile building, interview preparation, and technical communication tailored to the target role.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          4. ADMISSIONS CONTACT CALLOUT
          ==================================================================== */}
      <section className="section about-cta-band" style={{ padding: '60px 0', borderTop: '1px solid var(--border-subtle)' }}>
        <div className="container text-center">
          <h2 style={{ color: 'var(--white)', fontSize: '2rem', marginBottom: '15px' }}>
            Ready to Begin Your Learning Path?
          </h2>
          <p style={{ color: 'var(--text-muted)', maxWidth: '600px', margin: '0 auto 25px auto' }}>
            Submit an enquiry or consult directly with our admissions advisors to find the programme aligned with your goals.
          </p>
          <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/programmes" className="btn btn-hero-primary">
              View All 11 Programmes
            </Link>
            <a
              href={CONTACT_INFO.whatsappBaseUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-whatsapp-direct"
            >
              <i className="fa-brands fa-whatsapp"></i> WhatsApp Admissions (+91 7290909574)
            </a>
          </div>
        </div>
      </section>
    </div>
    </>
  );
}
