import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  PROGRAMMES,
  CONTACT_INFO,
  getProgrammeBySlug,
} from '../data/programmesData';
import FAQAccordion from '../components/FAQAccordion';
import EnquiryForm from '../components/EnquiryForm';
import SEOHead from '../components/SEOHead';

export default function ProgrammeDetail() {
  const { slug } = useParams();

  const [activeModule, setActiveModule] = useState(1);
  const programme = getProgrammeBySlug(slug);

  // Scroll to top on slug change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    setActiveModule(1);
  }, [slug]);

  if (!programme) {
    return (
      <div className="not-found-page section">
        <div className="container text-center" style={{ padding: '100px 20px' }}>
          <i className="fa-solid fa-triangle-exclamation" style={{ fontSize: '3rem', color: '#f59e0b', marginBottom: '20px' }}></i>
          <h2>Programme Not Found</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '30px' }}>
            We could not locate the requested programme in our official brochure catalogue.
          </p>
          <Link to="/programmes" className="btn btn-cyan">
            Explore All 11 Programmes
          </Link>
        </div>
      </div>
    );
  }

  // Related programmes in the same track or adjacent tracks
  const relatedProgrammes = PROGRAMMES.filter(
    (p) => p.slug !== programme.slug && (p.trackId === programme.trackId || p.track === programme.track)
  ).slice(0, 3);

  // If less than 3 in same track, add from other tracks
  if (relatedProgrammes.length < 3) {
    const additional = PROGRAMMES.filter(
      (p) => p.slug !== programme.slug && !relatedProgrammes.some((r) => r.slug === p.slug)
    ).slice(0, 3 - relatedProgrammes.length);
    relatedProgrammes.push(...additional);
  }

  const getTrackBadgeClass = (trackName) => {
    switch (trackName) {
      case 'Offensive Security':
        return 'track-badge-offensive';
      case 'Defence & Governance':
        return 'track-badge-defence';
      case 'Secure Engineering':
        return 'track-badge-engineering';
      case 'AI & Automation':
        return 'track-badge-ai';
      default:
        return 'track-badge-default';
    }
  };

  const whatsappUrl = CONTACT_INFO.getWhatsAppUrl(programme.title);
  const siteUrl = 'https://academy.netcradus.com';
  const progUrl = `${siteUrl}/programmes/${programme.slug}`;

  // Structured Data (Course + BreadcrumbList + FAQPage)
  const courseSchema = {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: programme.title,
    description: programme.metaDescription || programme.overview,
    courseCode: programme.code,
    provider: {
      '@type': 'EducationalOrganization',
      name: 'Netcradus Academy',
      sameAs: siteUrl,
      url: siteUrl,
    },
    educationalCredentialAwarded: 'Netcradus Programme Completion Certificate',
    occupationalCredentialAwarded: programme.careerRoles.join(', '),
    teaches: programme.learningOutcomes,
    hasCourseInstance: {
      '@type': 'CourseInstance',
      courseMode: ['Onsite', 'Blended', 'Online'],
      courseWorkload: '6 Practical Modules with Hands-on Capstone Assessment',
      location: {
        '@type': 'Place',
        name: 'Netcradus Academy Learning Hub',
        address: {
          '@type': 'PostalAddress',
          streetAddress: 'G-260, Sector 63',
          addressLocality: 'Noida',
          addressRegion: 'Uttar Pradesh',
          postalCode: '201301',
          addressCountry: 'IN',
        },
      },
    },
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: siteUrl,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Programmes',
        item: `${siteUrl}/programmes`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: programme.title,
        item: progUrl,
      },
    ],
  };

  const faqSchema = programme.faqs && programme.faqs.length > 0 ? {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: programme.faqs.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: f.a,
      },
    })),
  } : null;

  const pageSchemas = [courseSchema, breadcrumbSchema, ...(faqSchema ? [faqSchema] : [])];

  return (
    <>
      <SEOHead
        title={programme.seoTitle || `${programme.title} | Netcradus Academy`}
        description={programme.metaDescription || programme.overview}
        keywords={`${programme.title}, ${programme.track}, ${programme.tools.join(', ')}, Netcradus Academy, Cyber Security Training India, Noida, Delhi NCR`}
        canonical={progUrl}
        schema={pageSchemas}
      />

      <div className="programme-detail-page">
        {/* ====================================================================
            1. PROGRAMME HERO SECTION
            ==================================================================== */}
        <section className={`programme-hero-section ${programme.bannerClass || 'cyber-bg'}`}>
          <div className="hero-backdrop-glow" aria-hidden="true" />
          <div className="container">
            {/* Breadcrumbs */}
            <nav className="detail-breadcrumb" aria-label="Breadcrumb">
              <Link to="/">Home</Link>
              <span className="bc-sep">/</span>
              <Link to="/programmes">Programmes</Link>
              <span className="bc-sep">/</span>
              <span className="bc-current">{programme.title}</span>
            </nav>

            <div className="programme-hero-grid">
              <div className="prog-hero-main">
                <div className="prog-hero-badges">
                  <span className={`prog-track-pill ${getTrackBadgeClass(programme.track)}`}>
                    {programme.track}
                  </span>
                  <span className="prog-code-pill">Programme {programme.number}</span>
                </div>

                <h1 className="prog-hero-title">{programme.title}</h1>
                <p className="prog-hero-tagline">“{programme.tagline}”</p>
                <p className="prog-hero-overview">{programme.overview}</p>

                {/* Direct AEO Fast-Answer Snippet */}
                {programme.aeoAnswer && (
                  <div
                    className="aeo-answer-box"
                    style={{
                      background: 'rgba(16, 185, 129, 0.08)',
                      borderLeft: '4px solid #10b981',
                      borderRadius: '0 8px 8px 0',
                      padding: '14px 18px',
                      margin: '18px 0',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        color: '#10b981',
                        fontWeight: '700',
                        fontSize: '0.8rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        marginBottom: '6px',
                      }}
                    >
                      <i className="fa-solid fa-bolt"></i>
                      <span>Role Definition & Summary</span>
                    </div>
                    <p style={{ margin: 0, color: '#e2e8f0', fontSize: '0.92rem', lineHeight: '1.6' }}>
                      {programme.aeoAnswer}
                    </p>
                  </div>
                )}

              {/* Quick Hero Highlights */}
              <div className="prog-hero-highlights">
                <div className="ph-item">
                  <i className="fa-solid fa-graduation-cap"></i>
                  <div>
                    <span className="ph-label">Ideal For</span>
                    <span className="ph-val">{programme.idealFor}</span>
                  </div>
                </div>
                <div className="ph-item">
                  <i className="fa-solid fa-screwdriver-wrench"></i>
                  <div>
                    <span className="ph-label">Key Tools</span>
                    <span className="ph-val">{programme.tools.slice(0, 4).join(', ')}</span>
                  </div>
                </div>
              </div>

              {/* Hero Action Buttons */}
              <div className="prog-hero-actions">
                <a href="#admissions-enquiry" className="btn btn-hero-primary">
                  Enquire for Admissions <i className="fa-solid fa-arrow-down-long"></i>
                </a>
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-whatsapp-direct"
                >
                  <i className="fa-brands fa-whatsapp"></i> Chat with Advisor (+91 7290909574)
                </a>
              </div>
            </div>

            {/* Hero Visual Card */}
            <div className="prog-hero-aside">
              <div className="prog-visual-card">
                <div className="pvc-media">
                  <img
                    src={programme.thumbnail || '/images/cyber.png'}
                    alt={programme.title}
                    className="pvc-img"
                  />
                  <div className="pvc-overlay"></div>
                  <div className="pvc-icon-wrap">
                    <i className={programme.icon}></i>
                  </div>
                </div>

                <div className="pvc-body">
                  <h4 className="pvc-title">Target Career Roles</h4>
                  <ul className="pvc-roles-list">
                    {programme.careerRoles.map((role, idx) => (
                      <li key={idx}>
                        <i className="fa-solid fa-circle-check"></i>
                        <span>{role}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="pvc-disclaimer-note">
                    <i className="fa-solid fa-shield-halved"></i>
                    <span>All attack & defense exercises are conducted in authorized, controlled lab environments.</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* QUICK IN-PAGE NAVIGATION JUMP BAR */}
      <div className="inpage-jump-bar">
        <div className="container jump-bar-container">
          <a href="#overview-section" className="jump-link">Overview</a>
          <a href="#outcomes-section" className="jump-link">What You'll Do</a>
          <a href="#curriculum-section" className="jump-link">6 Core Modules</a>
          <a href="#tools-section" className="jump-link">Tools & Platforms</a>
          <a href="#hands-on-section" className="jump-link">Labs & Capstone</a>
          <a href="#careers-section" className="jump-link">Career Opportunities</a>
          <a href="#faqs-section" className="jump-link">FAQs</a>
          <a href="#admissions-enquiry" className="jump-link highlight">Enquire Now</a>
        </div>
      </div>

      {/* ====================================================================
          2. PROGRAMME OVERVIEW & WHO SHOULD JOIN
          ==================================================================== */}
      <section className="section prog-detail-section" id="overview-section">
        <div className="container">
          <div className="two-col-layout">
            <div className="col-card">
              <div className="col-card-header">
                <i className="fa-solid fa-circle-info col-header-icon"></i>
                <div>
                  <span className="col-sub">PROGRAMME OVERVIEW</span>
                  <h2 className="col-title">About {programme.title}</h2>
                </div>
              </div>
              <p className="col-text-lead">{programme.overview}</p>
              <p className="col-text">
                Designed to deliver job-ready technical competence, this programme guides you through
                systematic real-world workflows used by elite enterprise teams. From initial scoping
                and vulnerability triage to incident containment, automated pipelines, or autonomous agent
                orchestration, you develop practical skills grounded in industry best practices.
              </p>
            </div>

            <div className="col-card">
              <div className="col-card-header">
                <i className="fa-solid fa-users col-header-icon"></i>
                <div>
                  <span className="col-sub">TARGET AUDIENCE</span>
                  <h2 className="col-title">Who Should Join / Ideal For</h2>
                </div>
              </div>
              <p className="col-text-lead">{programme.idealFor}</p>
              <ul className="ideal-points-list">
                {programme.targetAudience.map((audience, idx) => (
                  <li key={idx}>
                    <i className="fa-solid fa-check-double"></i>
                    <span>{audience}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          3. WHAT YOU WILL BE ABLE TO DO (LEARNING OUTCOMES)
          ==================================================================== */}
      <section className="section outcomes-section" id="outcomes-section">
        <div className="container">
          <div className="section-header text-center">
            <span className="section-badge badge-emerald">KEY LEARNING OUTCOMES</span>
            <h2 className="section-title">What You Will Be Able to Do</h2>
            <p className="section-subtitle">
              Measurable practical capabilities acquired upon successful completion of the programme.
            </p>
          </div>

          <div className="outcomes-grid-3">
            {programme.learningOutcomes.map((outcome, idx) => (
              <div key={idx} className="outcome-display-card">
                <div className="od-top">
                  <span className="od-number">0{idx + 1}</span>
                  <i className="fa-solid fa-circle-check od-icon"></i>
                </div>
                <h3 className="od-title">Capability {idx + 1}</h3>
                <p className="od-text">{outcome}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ====================================================================
          4. SIX CORE CURRICULUM MODULES
          ==================================================================== */}
      <section className="section curriculum-section" id="curriculum-section">
        <div className="container">
          <div className="section-header text-center">
            <span className="section-badge badge-cyan">STRUCTURED SYLLABUS</span>
            <h2 className="section-title">Six Core Curriculum Modules</h2>
            <p className="section-subtitle">
              A comprehensive breakdown of every technical topic covered across the programme modules.
            </p>
          </div>

          <div className="modules-accordion-wrap">
            {programme.modules.map((mod) => {
              const isOpen = activeModule === mod.number;
              return (
                <div
                  key={mod.number}
                  className={`curriculum-module-card ${isOpen ? 'active' : ''}`}
                >
                  <button
                    type="button"
                    className="module-toggle-btn"
                    onClick={() => setActiveModule(isOpen ? null : mod.number)}
                    aria-expanded={isOpen}
                  >
                    <div className="mod-btn-left">
                      <span className="mod-index-pill">Module 0{mod.number}</span>
                      <h4 className="mod-title-text">{mod.title}</h4>
                    </div>
                    <div className="mod-btn-right">
                      <span className="mod-topic-count">{mod.topics.length} Key Topics</span>
                      <i className={`fa-solid ${isOpen ? 'fa-chevron-up' : 'fa-chevron-down'}`}></i>
                    </div>
                  </button>

                  <div className={`module-topics-collapse ${isOpen ? 'open' : ''}`}>
                    <div className="module-topics-inner">
                      <h5 className="topics-heading">Topics & Practical Objectives:</h5>
                      <div className="topics-grid">
                        {mod.topics.map((topic, tidx) => (
                          <div key={tidx} className="topic-pill-item">
                            <i className="fa-solid fa-arrow-right"></i>
                            <span>{topic}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ====================================================================
          5. TOOLS, PLATFORMS AND FRAMEWORKS
          ==================================================================== */}
      <section className="section tools-frameworks-section" id="tools-section">
        <div className="container">
          <div className="section-header text-center">
            <span className="section-badge badge-orange">TECHNOLOGY STACK</span>
            <h2 className="section-title">Tools, Platforms & Frameworks</h2>
            <p className="section-subtitle">
              Train with the exact enterprise software, command-line utilities, and frameworks used in production.
            </p>
          </div>

          <div className="tools-cards-grid">
            {programme.tools.map((tool, idx) => (
              <div key={idx} className="tool-feature-card">
                <div className="tfc-icon">
                  <i className="fa-solid fa-terminal"></i>
                </div>
                <h4 className="tfc-name">{tool}</h4>
                <span className="tfc-badge">Practical Lab Stack</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ====================================================================
          6. PRACTICAL LABS & CAPSTONE PROJECTS
          ==================================================================== */}
      <section className="section hands-on-section" id="hands-on-section">
        <div className="container">
          <div className="capstone-highlight-card">
            <div className="chc-content">
              <span className="chc-badge">
                <i className="fa-solid fa-trophy"></i> PRACTICAL LABS & CAPSTONE
              </span>
              <h2 className="chc-title">Real-World Project Experience</h2>
              <div className="chc-statement-box">
                <i className="fa-solid fa-quote-left quote-icon"></i>
                <p className="chc-statement">{programme.handsOn}</p>
              </div>
              <p className="chc-desc">
                Unlike purely theoretical courses, every learner demonstrates their proficiency by
                completing realistic assessment reports, audit-readiness packages, hardening exercises,
                or deployed software pipelines that serve as tangible proof of capability during hiring interviews.
              </p>
              <div className="chc-features-list">
                <div className="chc-feat-item">
                  <i className="fa-solid fa-shield-halved"></i>
                  <span>Authorised & Controlled Environments</span>
                </div>
                <div className="chc-feat-item">
                  <i className="fa-solid fa-file-contract"></i>
                  <span>Professional Enterprise Deliverables</span>
                </div>
                <div className="chc-feat-item">
                  <i className="fa-solid fa-user-check"></i>
                  <span>Mentor Review & Feedback</span>
                </div>
              </div>
            </div>
            <div className="chc-illustration">
              <i className="fa-solid fa-flask-vial"></i>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          7. CAREER OPPORTUNITIES & TARGET ROLES
          ==================================================================== */}
      <section className="section career-roles-section" id="careers-section">
        <div className="container">
          <div className="section-header text-center">
            <span className="section-badge badge-cyan">JOB ROLES</span>
            <h2 className="section-title">Target Career Opportunities</h2>
            <p className="section-subtitle">
              Roles you will be qualified to pursue following successful completion of the {programme.title} curriculum.
            </p>
          </div>

          <div className="career-roles-cards-grid">
            {programme.careerRoles.map((role, idx) => (
              <div key={idx} className="career-target-card">
                <div className="ctc-icon-circle">
                  <i className="fa-solid fa-briefcase"></i>
                </div>
                <h3 className="ctc-role-title">{role}</h3>
                <span className="ctc-track-pill">{programme.track}</span>
                <p className="ctc-desc">
                  Qualified to handle core responsibilities, tool operations, and stakeholder deliverables in this capacity.
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ====================================================================
          8. ADMISSIONS ENQUIRY CTA SECTION
          ==================================================================== */}
      <section className="section admissions-anchor-section" id="admissions-enquiry">
        <div className="container">
          <div className="admissions-split-card">
            <div className="asc-left-info">
              <span className="section-badge badge-orange">ADMISSIONS ADVISORY</span>
              <h2>Enquire for Admissions in {programme.title}</h2>
              <p className="asc-desc">
                Speak directly with our academic advisory team to understand upcoming batch schedules,
                learning prerequisites, and personalized career roadmaps.
              </p>

              <div className="asc-contact-list">
                <div className="asc-item">
                  <i className="fa-solid fa-phone"></i>
                  <div>
                    <h5>Admissions Desk</h5>
                    <a href={`tel:${CONTACT_INFO.phoneClean}`}>{CONTACT_INFO.phone}</a>
                  </div>
                </div>
                <div className="asc-item">
                  <i className="fa-regular fa-envelope"></i>
                  <div>
                    <h5>Email Desk</h5>
                    <a href={`mailto:${CONTACT_INFO.email}`}>{CONTACT_INFO.email}</a>
                  </div>
                </div>
                <div className="asc-item">
                  <i className="fa-brands fa-whatsapp"></i>
                  <div>
                    <h5>WhatsApp Direct</h5>
                    <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                      Chat on WhatsApp (+91 7290909574)
                    </a>
                  </div>
                </div>
              </div>

              <div className="asc-note-box">
                <i className="fa-solid fa-circle-info"></i>
                <p>
                  <strong>Programme Schedule & Fees Notice:</strong> Official cohort start dates,
                  curriculum delivery schedules, and fee structures are coordinated through admissions
                  advisors. Please submit your enquiry to receive verified details.
                </p>
              </div>
            </div>

            <div className="asc-right-form">
              <EnquiryForm
                defaultProgramme={programme.title}
                title={`Enquire for ${programme.title}`}
                subtitle="Submit your details to discuss prerequisites and cohort schedules."
                source="programme_page"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          9. FREQUENTLY ASKED QUESTIONS
          ==================================================================== */}
      <section className="section programme-faqs-section" id="faqs-section">
        <div className="container">
          <div className="section-header text-center">
            <span className="section-badge badge-cyan">FREQUENTLY ASKED QUESTIONS</span>
            <h2 className="section-title">Questions About {programme.title}</h2>
            <p className="section-subtitle">
              Answers regarding prerequisites, practical exercises, and admissions procedures.
            </p>
          </div>

          <div className="faq-container-narrow">
            <FAQAccordion items={programme.faqs} />
          </div>
        </div>
      </section>

      {/* ====================================================================
          10. RELATED PROGRAMMES
          ==================================================================== */}
      {relatedProgrammes.length > 0 && (
        <section className="section related-programmes-section">
          <div className="container">
            <div className="section-header text-center">
              <span className="section-badge badge-orange">EXPLORE MORE</span>
              <h2 className="section-title">Related Programmes in {programme.track}</h2>
              <p className="section-subtitle">
                Expand your skills with complementary learning paths across our emerging technology catalog.
              </p>
            </div>

            <div className="related-cards-grid">
              {relatedProgrammes.map((rel) => (
                <div key={rel.slug} className="related-prog-card">
                  <div className="rpc-media">
                    <img src={rel.thumbnail || '/images/cyber.png'} alt={rel.title} />
                    <span className="rpc-badge">{rel.track}</span>
                  </div>
                  <div className="rpc-body">
                    <h4>{rel.title}</h4>
                    <p className="rpc-tagline">“{rel.tagline}”</p>
                    <p className="rpc-overview">{rel.overview}</p>
                    <div className="rpc-actions">
                      <Link to={`/programmes/${rel.slug}`} className="btn btn-sm btn-cyan">
                        View Programme
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
    </>
  );
}
