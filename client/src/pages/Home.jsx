import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../App';
import {
  TRACKS,
  PROGRAMMES,
  LEARNING_JOURNEY_STAGES,
  WHO_CAN_JOIN,
  GENERAL_FAQS,
  CONTACT_INFO,
} from '../data/programmesData';
import ProgrammeCard from '../components/ProgrammeCard';
import TrackCard from '../components/TrackCard';
import FAQAccordion from '../components/FAQAccordion';
import EnquiryForm from '../components/EnquiryForm';
import SEOHead from '../components/SEOHead';
import { BLOG_POSTS } from '../data/blogData';

export default function Home() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const { openDrawer, openModal } = useApp() || {};

  const handleAdvisorClick = () => {
    if (openDrawer) {
      openDrawer('enquire');
    } else if (openModal) {
      openModal('call');
    }
  };

  const handleTrackFilter = (trackId) => {
    setActiveCategory(trackId);
    const element = document.getElementById('all-programmes-section');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Filter programmes
  const filteredProgrammes = PROGRAMMES.filter((p) => {
    const matchesCategory =
      activeCategory === 'all' || p.trackId === activeCategory;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      p.title.toLowerCase().includes(q) ||
      p.tagline.toLowerCase().includes(q) ||
      p.overview.toLowerCase().includes(q) ||
      p.careerRoles.some((r) => r.toLowerCase().includes(q)) ||
      p.tools.some((t) => t.toLowerCase().includes(q));
    return matchesCategory && matchesSearch;
  });

  const siteUrl = 'https://academy.netcradus.com';
  const itemListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Netcradus Emerging Technologies Programmes',
    description: '11 career-focused programmes in Cyber Security, Artificial Intelligence, and Automation',
    numberOfItems: PROGRAMMES.length,
    itemListElement: PROGRAMMES.map((prog, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      name: prog.title,
      url: `${siteUrl}/programmes/${prog.slug}`,
    })),
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: GENERAL_FAQS.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: f.a,
      },
    })),
  };

  const homeSchemas = [itemListSchema, faqSchema];

  return (
    <>
      <SEOHead
        title="Netcradus Academy | Cyber Security & AI Courses in India"
        description="Explore career-focused Cyber Security, Ethical Hacking, VAPT, SOC Analyst, AI, DevSecOps and Agentic AI programmes at Netcradus Academy. Physical labs in Noida & live hybrid training."
        keywords="Best Cyber Security Courses in India, Best Cyber Security Training Institute in India, Best Ethical Hacking Institute in India, Best VAPT Course in India, Best SOC Analyst Training, Best AI Courses in India, Best Agentic AI Course, Best DevSecOps Training, Cyber Security Academy in Delhi NCR, Cyber Security Courses in Ghaziabad, Cyber Security Training in Noida"
        canonical="https://academy.netcradus.com/"
        schema={homeSchemas}
      />

      <div className="home-page brochure-redesign-home">
      {/* ====================================================================
          SECTION 1: HERO SECTION
          ==================================================================== */}
      <section className="hero-section modern-brochure-hero" id="home">
        <div className="hero-ambient-glow" aria-hidden="true" />

        <div className="container hero-container-grid">
          {/* Left Column: Headlines & CTAs */}
          <div className="hero-main-content">
            <div className="badge-pill pill-cyan">
              <i className="fa-solid fa-graduation-cap"></i>
              <span>NETCRADUS EMERGING TECHNOLOGIES PROGRAMME</span>
            </div>

            <h1 className="hero-main-title">
              Build Your Future in <span className="highlight-orange">Cyber Security</span>,{' '}
              <span className="highlight-cyan">Artificial Intelligence</span> &{' '}
              <span className="highlight-emerald">Automation</span>
            </h1>

            <p className="hero-supporting-desc">
              Explore 11 career-focused programmes designed to take you from foundational concepts
              to practical, job-ready skills.
            </p>

            {/* CTAs */}
            <div className="hero-cta-group">
              <a href="#all-programmes-section" className="btn btn-hero-primary">
                Explore Programmes <i className="fa-solid fa-arrow-down-long"></i>
              </a>
              <button
                type="button"
                className="btn btn-hero-secondary"
                onClick={handleAdvisorClick}
              >
                <i className="fa-solid fa-comments"></i> Talk to an Admissions Advisor
              </button>
            </div>

            {/* WhatsApp Quick Assistance */}
            <div className="hero-whatsapp-indicator">
              <span className="live-indicator-dot"></span>
              <span>Admissions Advisory Available: </span>
              <a
                href={CONTACT_INFO.whatsappBaseUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hero-wa-link"
              >
                <i className="fa-brands fa-whatsapp"></i> +91 7290909574
              </a>
            </div>
          </div>

          {/* Right Column: 4 Track Interactive Showcase */}
          <div className="hero-tracks-panel">
            <div className="tracks-panel-header">
              <span className="panel-label">FOUR LEARNING PATHWAYS</span>
              <h3 className="panel-title">Select Your Career Track</h3>
            </div>

            <div className="hero-tracks-list">
              {TRACKS.map((track) => (
                <div
                  key={track.id}
                  className="hero-track-row"
                  onClick={() => handleTrackFilter(track.id)}
                  style={{ '--row-accent': track.accentColor }}
                >
                  <div className="ht-icon" style={{ color: track.accentColor }}>
                    <i className={track.icon}></i>
                  </div>
                  <div className="ht-info">
                    <div className="ht-title-row">
                      <h4 className="ht-title">{track.title}</h4>
                      <span className="ht-count">{track.badge}</span>
                    </div>
                    <p className="ht-desc">{track.description}</p>
                  </div>
                  <div className="ht-arrow">
                    <i className="fa-solid fa-chevron-right"></i>
                  </div>
                </div>
              ))}
            </div>

            <div className="hero-panel-footer">
              <div className="hpf-stat">
                <strong>11</strong>
                <span>Job-Ready Programmes</span>
              </div>
              <div className="hpf-sep"></div>
              <div className="hpf-stat">
                <strong>100%</strong>
                <span>Practical Lab Focus</span>
              </div>
              <div className="hpf-sep"></div>
              <div className="hpf-stat">
                <strong>Enterprise</strong>
                <span>Industry Tools</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          SECTION 2: ABOUT NETCRADUS ACADEMY
          ==================================================================== */}
      <section className="section about-academy-section" id="about-academy">
        <div className="container">
          <div className="about-academy-grid">
            <div className="about-academy-content">
              <span className="section-badge badge-orange">ABOUT NETCRADUS ACADEMY</span>
              <h2 className="section-heading-large">
                Learn the Technologies <span className="highlight-orange">Shaping Tomorrow</span>
              </h2>
              <p className="section-intro-text">
                Netcradus Academy's Emerging Technologies Programme trains students and professionals
                for growing career opportunities in cybersecurity and artificial intelligence.
              </p>
              <p className="section-body-text">
                Eleven programmes across four tracks allow learners to select a learning path based on
                their career goals. Built around hands-on lab environments, industry frameworks, and
                real-world capstone projects, our curriculum bridges the gap between academic theory
                and enterprise operational requirements.
              </p>

              <div className="about-pillars-grid">
                <div className="about-pillar-card">
                  <div className="pillar-icon"><i className="fa-solid fa-compass-drafting"></i></div>
                  <h5>Structured Pathways</h5>
                  <p>From beginner foundations through to advanced multi-stage attack and defense exercises.</p>
                </div>
                <div className="about-pillar-card">
                  <div className="pillar-icon"><i className="fa-solid fa-shield-halved"></i></div>
                  <h5>Authorised Lab Practice</h5>
                  <p>Controlled virtual machine ranges and safe environments for ethical hands-on testing.</p>
                </div>
                <div className="about-pillar-card">
                  <div className="pillar-icon"><i className="fa-solid fa-briefcase"></i></div>
                  <h5>Career Alignment</h5>
                  <p>Targeted training mapped directly to open roles in cybersecurity, cloud, and AI engineering.</p>
                </div>
                <div className="about-pillar-card">
                  <div className="pillar-icon"><i className="fa-solid fa-building-columns"></i></div>
                  <h5>Institutional Readiness</h5>
                  <p>Tailored workshops, faculty enablement, and placement-focused batches for colleges.</p>
                </div>
              </div>

              <div className="about-cta-row">
                <Link to="/about" className="btn btn-outline-cyan">
                  Read Full Academy Profile <i className="fa-solid fa-arrow-right"></i>
                </Link>
                <Link to="/learning-journey" className="btn btn-ghost-link">
                  View 4-Stage Learning Journey <i className="fa-solid fa-caret-right"></i>
                </Link>
              </div>
            </div>

            {/* Visual Column */}
            <div className="about-academy-visual">
              <div className="about-visual-card">
                <img
                  src="/images/about/hero-innovation.jpg"
                  alt="Students exploring emerging technologies at Netcradus Academy"
                  className="about-visual-img"
                />
                <div className="visual-stat-card v-stat-top">
                  <i className="fa-solid fa-shield-virus"></i>
                  <div>
                    <h4>Offensive & Defensive</h4>
                    <span>Comprehensive Security</span>
                  </div>
                </div>
                <div className="visual-stat-card v-stat-bottom">
                  <i className="fa-solid fa-brain"></i>
                  <div>
                    <h4>Applied AI & Agents</h4>
                    <span>Modern Autonomous Workflows</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          SECTION 3: EXPLORE OUR FOUR LEARNING TRACKS
          ==================================================================== */}
      <section className="section learning-tracks-section" id="tracks-section">
        <div className="container">
          <div className="section-header text-center">
            <span className="section-badge badge-cyan">SPECIALISED CURRICULUM</span>
            <h2 className="section-title">Explore Our Four Learning Tracks</h2>
            <p className="section-subtitle">
              Choose an industry-aligned learning path tailored to your professional ambitions.
            </p>
          </div>

          <div className="tracks-grid-4">
            {TRACKS.map((track) => (
              <TrackCard
                key={track.id}
                track={track}
                onExploreTrack={handleTrackFilter}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ====================================================================
          SECTION 4: ALL 11 PROGRAMMES (FILTERABLE LISTING)
          ==================================================================== */}
      <section className="section all-programmes-section" id="all-programmes-section">
        <div className="container">
          <div className="section-header text-center">
            <span className="section-badge badge-orange">COMPLETE CATALOGUE</span>
            <h2 className="section-title">All 11 Career-Focused Programmes</h2>
            <p className="section-subtitle">
              Filter by learning track or search by role, technology, or keywords from the official brochure.
            </p>
          </div>

          {/* Interactive Search & Filter Controls */}
          <div className="catalog-controls-bar">
            {/* Track Filter Tabs */}
            <div className="catalog-tabs">
              <button
                type="button"
                className={`catalog-tab-btn ${activeCategory === 'all' ? 'active' : ''}`}
                onClick={() => setActiveCategory('all')}
              >
                All Programmes ({PROGRAMMES.length})
              </button>
              {TRACKS.map((track) => (
                <button
                  key={track.id}
                  type="button"
                  className={`catalog-tab-btn ${activeCategory === track.id ? 'active' : ''}`}
                  onClick={() => setActiveCategory(track.id)}
                >
                  <i className={track.icon} style={{ marginRight: '6px', fontSize: '0.9em' }}></i>
                  {track.title} ({track.count})
                </button>
              ))}
            </div>

            {/* Keyword Search Input */}
            <div className="catalog-search-wrap">
              <i className="fa-solid fa-magnifying-glass search-icon"></i>
              <input
                type="text"
                className="catalog-search-input"
                placeholder="Search by programme, tool (e.g. Splunk, Burp, LangGraph)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  type="button"
                  className="search-clear-btn"
                  onClick={() => setSearchQuery('')}
                  title="Clear search"
                >
                  <i className="fa-solid fa-xmark"></i>
                </button>
              )}
            </div>
          </div>

          {/* Results Summary Bar */}
          <div className="catalog-meta-info">
            <span>
              Showing <strong>{filteredProgrammes.length}</strong> of {PROGRAMMES.length} programmes
              {activeCategory !== 'all' && (
                <> in <em>{TRACKS.find((t) => t.id === activeCategory)?.title}</em></>
              )}
              {searchQuery && <> matching "{searchQuery}"</>}
            </span>
            <Link to="/programmes" className="btn-link-subtle">
              Compare All in Table View <i className="fa-solid fa-arrow-right-long"></i>
            </Link>
          </div>

          {/* Programme Cards Grid */}
          {filteredProgrammes.length > 0 ? (
            <div className="modern-programmes-grid">
              {filteredProgrammes.map((programme) => (
                <ProgrammeCard key={programme.slug} programme={programme} />
              ))}
            </div>
          ) : (
            <div className="empty-results-box">
              <i className="fa-solid fa-filter-circle-xmark"></i>
              <h3>No programmes found</h3>
              <p>Try adjusting your search query or reset the track filter.</p>
              <button
                type="button"
                className="btn btn-outline-cyan"
                onClick={() => {
                  setActiveCategory('all');
                  setSearchQuery('');
                }}
              >
                Reset Filters
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ====================================================================
          SECTION 5: FOUR-STAGE LEARNING JOURNEY
          ==================================================================== */}
      <section className="section learning-journey-section" id="journey-preview">
        <div className="container">
          <div className="section-header text-center">
            <span className="section-badge badge-emerald">PEDAGOGICAL METHODOLOGY</span>
            <h2 className="section-title">The Four-Stage Learning Journey</h2>
            <p className="section-subtitle">
              A structured progression engineered to turn aspiring learners into capable technology practitioners.
            </p>
          </div>

          <div className="journey-timeline-grid">
            {LEARNING_JOURNEY_STAGES.map((step) => (
              <div key={step.stage} className="journey-stage-card" style={{ '--stage-accent': step.accent }}>
                <div className="stage-top-row">
                  <div className="stage-number-badge">Stage {step.stage}</div>
                  <div className="stage-icon-circle" style={{ color: step.accent }}>
                    <i className={step.icon}></i>
                  </div>
                </div>
                <h3 className="stage-title">{step.title}</h3>
                <h5 className="stage-subtitle">{step.subtitle}</h5>
                <p className="stage-desc">{step.description}</p>
              </div>
            ))}
          </div>

          <div className="text-center" style={{ marginTop: '35px' }}>
            <Link to="/learning-journey" className="btn btn-outline-cyan">
              Explore Complete Learning Journey Roadmap <i className="fa-solid fa-arrow-right"></i>
            </Link>
          </div>
        </div>
      </section>

      {/* ====================================================================
          SECTION 6: WHO CAN JOIN
          ==================================================================== */}
      <section className="section who-can-join-section">
        <div className="container">
          <div className="section-header text-center">
            <span className="section-badge badge-cyan">TARGET AUDIENCE</span>
            <h2 className="section-title">Who Can Join Netcradus Academy?</h2>
            <p className="section-subtitle">
              Our 11 programmes are thoughtfully tailored across four distinct learner profiles.
            </p>
          </div>

          <div className="who-can-join-grid">
            {WHO_CAN_JOIN.map((group) => (
              <div key={group.id} className="learner-profile-card">
                <div className="learner-icon-wrap">
                  <i className={group.icon}></i>
                </div>
                <span className="learner-badge">{group.badge}</span>
                <h3 className="learner-title">{group.title}</h3>
                <p className="learner-summary">{group.description}</p>
                <div className="learner-divider"></div>
                <p className="learner-details">{group.details}</p>
              </div>
            ))}
          </div>

          <div className="text-center" style={{ marginTop: '35px' }}>
            <Link to="/careers" className="btn btn-hero-secondary">
              View Career Opportunities & Target Roles <i className="fa-solid fa-arrow-right"></i>
            </Link>
          </div>
        </div>
      </section>

      {/* ====================================================================
          SECTION 7: FOR COLLEGES & INSTITUTIONS BANNER
          ==================================================================== */}
      <section className="section institutions-cta-section">
        <div className="container">
          <div className="institutions-banner-card">
            <div className="ibc-content">
              <span className="ibc-badge">
                <i className="fa-solid fa-building-columns"></i> INSTITUTIONAL PARTNERSHIPS
              </span>
              <h2 className="ibc-title">
                Build Industry-Ready Technology Skills at Your Institution
              </h2>
              <p className="ibc-desc">
                Netcradus Academy can discuss workshops, skill programmes and placement-oriented
                batches for colleges and institutions. Empower your campus with authorized cybersecurity
                ranges, AI labs, and expert mentor support.
              </p>
              <div className="ibc-actions">
                <Link to="/institutions" className="btn btn-hero-primary">
                  Request Institutional Programme Details <i className="fa-solid fa-arrow-right"></i>
                </Link>
                <a
                  href={`mailto:${CONTACT_INFO.email}?subject=Institutional%20Training%20Enquiry`}
                  className="btn btn-outline"
                >
                  <i className="fa-regular fa-envelope"></i> Email Institutional Desk
                </a>
              </div>
            </div>
            <div className="ibc-illustration">
              <i className="fa-solid fa-graduation-cap ibc-back-icon"></i>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          SECTION 8: INLINE ADMISSIONS ENQUIRY FORM
          ==================================================================== */}
      <section className="section admissions-form-section" id="enquiry-section">
        <div className="container">
          <div className="admissions-grid-wrap">
            <div className="admissions-copy-col">
              <span className="section-badge badge-orange">ADMISSIONS & ADVISORY</span>
              <h2 className="section-title">
                Start Your Journey With <span className="highlight-orange">Netcradus Academy</span>
              </h2>
              <p className="admissions-intro">
                Take the next step in your cybersecurity or artificial intelligence career. Submit your
                enquiry below to receive personalized curriculum recommendations and batch details.
              </p>

              <div className="admissions-contact-points">
                <div className="ac-point">
                  <div className="ac-icon"><i className="fa-solid fa-phone"></i></div>
                  <div>
                    <h5>Phone & WhatsApp</h5>
                    <a href={`tel:${CONTACT_INFO.phoneClean}`}>{CONTACT_INFO.phone}</a>
                  </div>
                </div>

                <div className="ac-point">
                  <div className="ac-icon"><i className="fa-regular fa-envelope"></i></div>
                  <div>
                    <h5>Admissions Email</h5>
                    <a href={`mailto:${CONTACT_INFO.email}`}>{CONTACT_INFO.email}</a>
                  </div>
                </div>

                <div className="ac-point">
                  <div className="ac-icon"><i className="fa-solid fa-location-dot"></i></div>
                  <div>
                    <h5>Learning Hub</h5>
                    <span>{CONTACT_INFO.address}</span>
                  </div>
                </div>
              </div>

              <div className="admissions-notice-card">
                <i className="fa-solid fa-circle-info"></i>
                <p>
                  <strong>Note on Admissions:</strong> Programme schedules, batch calendars, and fees
                  are coordinated directly by our academic admissions advisors. Submitting an enquiry
                  connects you with an advisor to discuss your individual learning plan.
                </p>
              </div>
            </div>

            <div className="admissions-form-col">
              <EnquiryForm
                title="Admissions Enquiry Form"
                subtitle="Select your preferred programme and submit your details to consult with an advisor."
                source="admissions_enquiry"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          SECTION: LOCAL LEARNING HUB (NOIDA, GHAZIABAD & DELHI NCR)
          ==================================================================== */}
      <section className="section local-hub-section" style={{ background: 'rgba(15, 23, 42, 0.6)', borderTop: '1px solid rgba(51, 65, 85, 0.4)', borderBottom: '1px solid rgba(51, 65, 85, 0.4)', padding: '60px 0' }}>
        <div className="container">
          <div className="section-header text-center">
            <span className="section-badge badge-emerald">PHYSICAL LEARNING HUB & LABS</span>
            <h2 className="section-title">
              Cyber Security & AI Training Center in <span className="highlight-emerald">Sector 63, Noida</span>
            </h2>
            <p className="section-subtitle">
              Serving students and IT professionals across Noida, Ghaziabad, Greater Noida, and Delhi NCR with physical war-room labs and live hybrid sessions.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', marginTop: '40px' }}>
            <div style={{ background: 'rgba(30, 41, 59, 0.7)', border: '1px solid rgba(51, 65, 85, 0.8)', borderRadius: '14px', padding: '24px' }}>
              <div style={{ color: '#10b981', fontSize: '1.5rem', marginBottom: '14px' }}>
                <i className="fa-solid fa-location-dot"></i>
              </div>
              <h4 style={{ color: '#fff', fontSize: '1.1rem', fontWeight: '700', marginBottom: '8px' }}>Prime Location in Sector 63</h4>
              <p style={{ color: '#94a3b8', fontSize: '0.88rem', lineHeight: '1.6', margin: 0 }}>
                Located at <strong>G-260, Sector 63, Noida, UP</strong>, just 5 minutes from Noida Electronic City Metro Station. Easily accessible from Ghaziabad, Indirapuram, Vaishali, and East Delhi.
              </p>
            </div>

            <div style={{ background: 'rgba(30, 41, 59, 0.7)', border: '1px solid rgba(51, 65, 85, 0.8)', borderRadius: '14px', padding: '24px' }}>
              <div style={{ color: '#06b6d4', fontSize: '1.5rem', marginBottom: '14px' }}>
                <i className="fa-solid fa-network-wired"></i>
              </div>
              <h4 style={{ color: '#fff', fontSize: '1.1rem', fontWeight: '700', marginBottom: '8px' }}>Dedicated Hands-On Labs</h4>
              <p style={{ color: '#94a3b8', fontSize: '0.88rem', lineHeight: '1.6', margin: 0 }}>
                High-performance lab stations equipped with Kali Linux, isolated attack sandboxes, enterprise SIEM instances, and GPU clusters for local AI agent execution.
              </p>
            </div>

            <div style={{ background: 'rgba(30, 41, 59, 0.7)', border: '1px solid rgba(51, 65, 85, 0.8)', borderRadius: '14px', padding: '24px' }}>
              <div style={{ color: '#f59e0b', fontSize: '1.5rem', marginBottom: '14px' }}>
                <i className="fa-solid fa-chalkboard-user"></i>
              </div>
              <h4 style={{ color: '#fff', fontSize: '1.1rem', fontWeight: '700', marginBottom: '8px' }}>Mentor-Led Batches</h4>
              <p style={{ color: '#94a3b8', fontSize: '0.88rem', lineHeight: '1.6', margin: 0 }}>
                Flexible schedules tailored for college students, recent graduates, and working professionals across Delhi NCR seeking practical career advancement.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          SECTION: KNOWLEDGE HUB / TOPICAL AUTHORITY PREVIEW
          ==================================================================== */}
      <section className="section knowledge-preview-section" style={{ padding: '60px 0' }}>
        <div className="container">
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'space-between', gap: '20px', marginBottom: '40px' }}>
            <div>
              <span className="section-badge badge-cyan">KNOWLEDGE HUB</span>
              <h2 className="section-title" style={{ margin: '8px 0 0' }}>
                Latest Industry Guides & <span className="highlight-cyan">Career Roadmaps</span>
              </h2>
            </div>
            <Link to="/blog" className="btn btn-outline-cyan btn-sm">
              Explore All Technical Guides <i className="fa-solid fa-arrow-right"></i>
            </Link>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
            {BLOG_POSTS.slice(0, 3).map((post) => (
              <article
                key={post.slug}
                style={{
                  background: 'rgba(30, 41, 59, 0.5)',
                  border: '1px solid rgba(51, 65, 85, 0.7)',
                  borderRadius: '14px',
                  padding: '24px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#10b981', background: 'rgba(16, 185, 129, 0.1)', padding: '3px 8px', borderRadius: '4px' }}>
                      {post.category}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{post.readTime}</span>
                  </div>
                  <h3 style={{ color: '#fff', fontSize: '1.05rem', fontWeight: '700', lineHeight: '1.4', marginBottom: '10px' }}>
                    <Link to={`/blog/${post.slug}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                      {post.title}
                    </Link>
                  </h3>
                  <p style={{ color: '#94a3b8', fontSize: '0.82rem', lineHeight: '1.5', margin: 0 }}>
                    {post.metaDescription}
                  </p>
                </div>
                <div style={{ marginTop: '20px', paddingTop: '14px', borderTop: '1px solid rgba(51, 65, 85, 0.5)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{post.publishedDate}</span>
                  <Link to={`/blog/${post.slug}`} style={{ color: '#10b981', fontSize: '0.8rem', fontWeight: '600', textDecoration: 'none' }}>
                    Read Guide &rarr;
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ====================================================================
          SECTION 9: FREQUENTLY ASKED QUESTIONS
          ==================================================================== */}
      <section className="section faq-section" id="faqs">
        <div className="container">
          <div className="section-header text-center">
            <span className="section-badge badge-cyan">COMMON QUESTIONS</span>
            <h2 className="section-title">Frequently Asked Questions</h2>
            <p className="section-subtitle">
              Clear answers regarding our programmes, prerequisites, practical labs, and admissions.
            </p>
          </div>

          <div className="faq-container-narrow">
            <FAQAccordion items={GENERAL_FAQS} />
          </div>

          <div className="faq-admissions-banner">
            <p>
              Have a question not listed here? Our admissions team is ready to help.
            </p>
            <div className="faq-banner-actions">
              <a
                href={CONTACT_INFO.whatsappBaseUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-whatsapp-direct"
              >
                <i className="fa-brands fa-whatsapp"></i> Chat on WhatsApp
              </a>
              <Link to="/contact" className="btn btn-outline-cyan">
                Contact Page <i className="fa-solid fa-arrow-right"></i>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
    </>
  );
}
