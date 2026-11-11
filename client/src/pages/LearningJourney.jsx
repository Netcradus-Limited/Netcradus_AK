import React from 'react';
import { Link } from 'react-router-dom';
import { LEARNING_JOURNEY_STAGES, TRACKS, CONTACT_INFO } from '../data/programmesData';
import SEOHead from '../components/SEOHead';

export default function LearningJourney() {
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
        name: 'Learning Journey',
        item: 'https://academy.netcradus.com/learning-journey',
      },
    ],
  };

  return (
    <>
      <SEOHead
        title="4-Stage Learning Journey | Practical Cyber & AI Labs – Netcradus Academy"
        description="Explore Netcradus Academy's 4-stage experiential learning framework: Foundational Concepts, Hands-on Lab Practice, Capstone Projects, and Job-Ready Skills."
        keywords="Learning Journey, Cyber Security Labs, Practical AI Training, Capstone Projects, Netcradus Academy"
        canonical="https://academy.netcradus.com/learning-journey"
        schema={breadcrumbSchema}
      />

      <div className="learning-journey-page">
      {/* PAGE BANNER */}
      <section className="page-banner-section">
        <div className="container text-center">
          <span className="section-badge badge-emerald">PEDAGOGICAL FRAMEWORK</span>
          <h1 className="page-title">The Netcradus Learning Journey</h1>
          <p className="page-subtitle">
            A four-stage experiential learning methodology engineered to take you from foundational concepts
            to proven, job-ready capabilities.
          </p>
        </div>
      </section>

      {/* 4-STAGE TIMELINE SECTION */}
      <section className="section journey-detail-section">
        <div className="container">
          <div className="journey-vertical-timeline">
            {LEARNING_JOURNEY_STAGES.map((stage, idx) => (
              <div
                key={stage.stage}
                className="timeline-stage-row"
                style={{ '--stage-color': stage.accent }}
              >
                {/* Stage Indicator Node */}
                <div className="stage-node-col">
                  <div className="stage-node-circle" style={{ background: stage.accent }}>
                    <span>0{stage.stage}</span>
                  </div>
                  {idx < LEARNING_JOURNEY_STAGES.length - 1 && (
                    <div className="stage-connector-line"></div>
                  )}
                </div>

                {/* Stage Content Card */}
                <div className="stage-card-col">
                  <div className="stage-detailed-card">
                    <div className="sdc-header">
                      <div className="sdc-icon-badge" style={{ color: stage.accent }}>
                        <i className={stage.icon}></i>
                      </div>
                      <div>
                        <span className="sdc-stage-label">Stage 0{stage.stage}</span>
                        <h2 className="sdc-stage-title">{stage.title}</h2>
                        <h4 className="sdc-stage-subtitle">“{stage.subtitle}”</h4>
                      </div>
                    </div>

                    <p className="sdc-desc">{stage.description}</p>

                    <div className="sdc-highlights-grid">
                      {stage.stage === 1 && (
                        <>
                          <div className="sdc-hl-item">
                            <i className="fa-solid fa-check"></i>
                            <span>Fundamental computer networking & protocol hygiene</span>
                          </div>
                          <div className="sdc-hl-item">
                            <i className="fa-solid fa-check"></i>
                            <span>Core Python & machine learning mathematical intuition</span>
                          </div>
                          <div className="sdc-hl-item">
                            <i className="fa-solid fa-check"></i>
                            <span>Zero-assumptions entry points for beginners and switchers</span>
                          </div>
                        </>
                      )}
                      {stage.stage === 2 && (
                        <>
                          <div className="sdc-hl-item">
                            <i className="fa-solid fa-check"></i>
                            <span>Hands-on exercises inside safe, authorized virtual ranges</span>
                          </div>
                          <div className="sdc-hl-item">
                            <i className="fa-solid fa-check"></i>
                            <span>Mastery of Kali Linux, Splunk, Prowler, LangGraph, etc.</span>
                          </div>
                          <div className="sdc-hl-item">
                            <i className="fa-solid fa-check"></i>
                            <span>Real-time triage of simulated attack and alert queues</span>
                          </div>
                        </>
                      )}
                      {stage.stage === 3 && (
                        <>
                          <div className="sdc-hl-item">
                            <i className="fa-solid fa-check"></i>
                            <span>End-to-end vulnerability assessment report generation</span>
                          </div>
                          <div className="sdc-hl-item">
                            <i className="fa-solid fa-check"></i>
                            <span>Deployed autonomous multi-agent or workflow automations</span>
                          </div>
                          <div className="sdc-hl-item">
                            <i className="fa-solid fa-check"></i>
                            <span>Production deliverables you can present during interviews</span>
                          </div>
                        </>
                      )}
                      {stage.stage === 4 && (
                        <>
                          <div className="sdc-hl-item">
                            <i className="fa-solid fa-check"></i>
                            <span>Technical portfolio and resume alignment with target roles</span>
                          </div>
                          <div className="sdc-hl-item">
                            <i className="fa-solid fa-check"></i>
                            <span>Mock technical interviews and playbook walkthroughs</span>
                          </div>
                          <div className="sdc-hl-item">
                            <i className="fa-solid fa-check"></i>
                            <span>Guidance on presenting findings and risk to employers</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TRACKS EXPLORATION CALLOUT */}
      <section className="section journey-tracks-callout">
        <div className="container">
          <div className="section-header text-center">
            <span className="section-badge badge-cyan">APPLY THE JOURNEY</span>
            <h2 className="section-title">Apply This Journey in Any of Our Four Tracks</h2>
            <p className="section-subtitle">
              Every track implements this exact four-stage pedagogical architecture.
            </p>
          </div>

          <div className="tracks-grid-4">
            {TRACKS.map((track) => (
              <div
                key={track.id}
                className="journey-track-item-card"
                style={{ '--track-accent': track.accentColor }}
              >
                <div className="jti-icon" style={{ color: track.accentColor }}>
                  <i className={track.icon}></i>
                </div>
                <h3>{track.title}</h3>
                <span className="jti-count">{track.badge}</span>
                <p>{track.description}</p>
                <Link to={`/programmes?track=${track.id}`} className="btn-link">
                  Explore Programmes <i className="fa-solid fa-arrow-right"></i>
                </Link>
              </div>
            ))}
          </div>

          <div className="journey-bottom-cta text-center" style={{ marginTop: '50px' }}>
            <Link to="/programmes" className="btn btn-hero-primary">
              Browse All 11 Programmes
            </Link>
            <a
              href={CONTACT_INFO.whatsappBaseUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-whatsapp-direct"
              style={{ marginLeft: '15px' }}
            >
              <i className="fa-brands fa-whatsapp"></i> Chat with Admissions Advisor
            </a>
          </div>
        </div>
      </section>
    </div>
    </>
  );
}

