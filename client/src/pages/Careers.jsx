import React from 'react';
import { Link } from 'react-router-dom';
import {
  PROGRAMMES,
  WHO_CAN_JOIN,
  CAREER_INTEREST_MATRIX,
  CONTACT_INFO,
  getProgrammeBySlug,
} from '../data/programmesData';
import SEOHead from '../components/SEOHead';

export default function Careers() {
  // Aggregate all unique career roles across the 11 programmes
  const allRoles = [];
  PROGRAMMES.forEach((p) => {
    p.careerRoles.forEach((role) => {
      allRoles.push({
        role,
        programmeTitle: p.title,
        programmeSlug: p.slug,
        track: p.track,
      });
    });
  });

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
        name: 'Career Opportunities',
        item: 'https://academy.netcradus.com/careers',
      },
    ],
  };

  return (
    <>
      <SEOHead
        title="Cyber Security & AI Career Opportunities in India | Netcradus Academy"
        description="Explore high-growth career opportunities in Cybersecurity, Ethical Hacking, SOC, DevSecOps, and Artificial Intelligence across India. Compare roles and career tracks."
        keywords="Cyber Security Careers India, Ethical Hacking jobs, SOC Analyst salary India, AI developer careers, Netcradus Academy"
        canonical="https://academy.netcradus.com/careers"
        schema={breadcrumbSchema}
      />

      <div className="careers-page">
      {/* PAGE BANNER */}
      <section className="page-banner-section">
        <div className="container text-center">
          <span className="section-badge badge-orange">CAREER PATHWAYS</span>
          <h1 className="page-title">Career Opportunities in Cybersecurity & AI</h1>
          <p className="page-subtitle">
            Discover the high-demand industry roles you can pursue through Netcradus Academy's 11 career-focused programmes.
          </p>
        </div>
      </section>

      {/* WHO CAN JOIN SECTION */}
      <section className="section who-can-join-detailed">
        <div className="container">
          <div className="section-header text-center">
            <span className="section-badge badge-cyan">LEARNER PROFILES</span>
            <h2 className="section-title">Who Can Join Netcradus Academy?</h2>
            <p className="section-subtitle">
              Whether you are an undergraduate, recent graduate, or seasoned professional, our modular programmes provide clear transition paths.
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
        </div>
      </section>

      {/* CAREER INTEREST MATRIX */}
      <section className="section career-matrix-section">
        <div className="container">
          <div className="section-header text-center">
            <span className="section-badge badge-emerald">MATCH YOUR INTEREST</span>
            <h2 className="section-title">Explore Roles by What You Enjoy Doing</h2>
            <p className="section-subtitle">
              Select what motivates you most to discover corresponding programmes and career trajectories.
            </p>
          </div>

          <div className="career-matrix-grid">
            {CAREER_INTEREST_MATRIX.map((item, idx) => (
              <div
                key={idx}
                className="career-match-card"
                style={{ '--match-accent': item.color }}
              >
                <div className="cm-header">
                  <div className="cm-icon-circle" style={{ color: item.color }}>
                    <i className={item.icon}></i>
                  </div>
                  <span className="cm-track-badge">{item.track}</span>
                </div>

                <h4 className="cm-interest-title">“{item.interest}”</h4>

                <div className="cm-recommended-block">
                  <span className="cm-rec-label">Recommended Programmes:</span>
                  <div className="cm-prog-links">
                    {item.recommendedSlugs.map((slug) => {
                      const prog = getProgrammeBySlug(slug);
                      return (
                        <Link
                          key={slug}
                          to={`/programmes/${slug}`}
                          className="cm-prog-pill"
                        >
                          <i className="fa-solid fa-arrow-right"></i>
                          <span>{prog ? prog.title : slug}</span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ALL ROLES ROSTER MAPPED TO PROGRAMMES */}
      <section className="section all-roles-section">
        <div className="container">
          <div className="section-header text-center">
            <span className="section-badge badge-cyan">ROLE DIRECTORY</span>
            <h2 className="section-title">Target Roles Mapped Across All 11 Programmes</h2>
            <p className="section-subtitle">
              Explore the exact job titles targeted across our curriculum tracks.
            </p>
          </div>

          <div className="roles-roster-grid">
            {PROGRAMMES.map((prog) => (
              <div key={prog.slug} className="programme-roles-card">
                <div className="prc-header">
                  <span className="prc-track">{prog.track}</span>
                  <h3 className="prc-title">{prog.title}</h3>
                </div>
                <div className="prc-roles-wrap">
                  <span className="prc-roles-label">Qualified Roles:</span>
                  <ul className="prc-roles-list">
                    {prog.careerRoles.map((role, idx) => (
                      <li key={idx}>
                        <i className="fa-solid fa-check"></i>
                        <span>{role}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="prc-footer">
                  <Link to={`/programmes/${prog.slug}`} className="btn btn-sm btn-outline-cyan">
                    View Programme Details <i className="fa-solid fa-arrow-right"></i>
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <div className="careers-cta-box text-center" style={{ marginTop: '50px' }}>
            <h3>Ready to Map Your Tech Career?</h3>
            <p>Speak with our admissions counselors to review your resume and align with an optimal programme.</p>
            <div className="careers-cta-btns">
              <a
                href={CONTACT_INFO.whatsappBaseUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-whatsapp-direct"
              >
                <i className="fa-brands fa-whatsapp"></i> Chat on WhatsApp (+91 7290909574)
              </a>
              <Link to="/contact" className="btn btn-cyan" style={{ marginLeft: '12px' }}>
                Contact Admissions Desk
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
    </>
  );
}

