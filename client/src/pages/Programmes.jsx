import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useApp } from '../App';
import {
  TRACKS,
  PROGRAMMES,
  CAREER_INTEREST_MATRIX,
  CONTACT_INFO,
  getProgrammeBySlug,
} from '../data/programmesData';
import SEOHead from '../components/SEOHead';

export default function Programmes() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTrack = searchParams.get('track') || 'all';

  const [activeTrack, setActiveTrack] = useState(initialTrack);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'cards'
  const { openEnrollModalFor } = useApp() || {};

  useEffect(() => {
    const trackParam = searchParams.get('track');
    if (trackParam && trackParam !== activeTrack) {
      setActiveTrack(trackParam);
    }
  }, [searchParams, activeTrack]);

  const handleTrackChange = (trackId) => {
    setActiveTrack(trackId);
    if (trackId === 'all') {
      searchParams.delete('track');
      setSearchParams(searchParams);
    } else {
      setSearchParams({ track: trackId });
    }
  };

  const filtered = PROGRAMMES.filter((p) => {
    const matchesTrack = activeTrack === 'all' || p.trackId === activeTrack;
    const q = searchTerm.toLowerCase().trim();
    const matchesSearch =
      !q ||
      p.title.toLowerCase().includes(q) ||
      p.tagline.toLowerCase().includes(q) ||
      p.overview.toLowerCase().includes(q) ||
      p.track.toLowerCase().includes(q) ||
      p.careerRoles.some((r) => r.toLowerCase().includes(q)) ||
      p.tools.some((t) => t.toLowerCase().includes(q));
    return matchesTrack && matchesSearch;
  });

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
        name: 'Programmes',
        item: 'https://academy.netcradus.com/programmes',
      },
    ],
  };

  return (
    <>
      <SEOHead
        title="All 11 Emerging Technologies Programmes | Netcradus Academy"
        description="Browse all 11 career programmes across Offensive Security, Defence & Governance, Secure Engineering, and AI & Automation. Compare syllabus, tools, outcomes, and careers."
        keywords="Cyber Security Programmes, Ethical Hacking Course, VAPT, SOC Analyst, DevSecOps, AI Developer, Agentic AI, Cloud Security, Netcradus Academy"
        canonical="https://academy.netcradus.com/programmes"
        schema={breadcrumbSchema}
      />

      <div className="programmes-comparison-page">
      {/* PAGE HEADER BANNER */}
      <section className="page-banner-section">
        <div className="container text-center">
          <span className="section-badge badge-orange">PROGRAMMES AT A GLANCE</span>
          <h1 className="page-title">Compare All 11 Technology Programmes</h1>
          <p className="page-subtitle">
            Explore the curriculum, learning outcomes, tools and career opportunities across our four specialized tracks.
          </p>
        </div>
      </section>

      {/* FILTER & SEARCH TOOLBAR */}
      <section className="comparison-toolbar-section">
        <div className="container">
          <div className="comparison-toolbar-card">
            {/* Track Filter Tabs */}
            <div className="toolbar-tracks">
              <button
                type="button"
                className={`filter-pill ${activeTrack === 'all' ? 'active' : ''}`}
                onClick={() => handleTrackChange('all')}
              >
                All Tracks ({PROGRAMMES.length})
              </button>
              {TRACKS.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  className={`filter-pill ${activeTrack === t.id ? 'active' : ''}`}
                  onClick={() => handleTrackChange(t.id)}
                >
                  <i className={t.icon} style={{ marginRight: '6px' }}></i>
                  {t.title} ({t.count})
                </button>
              ))}
            </div>

            {/* Search Box & View Mode Toggle */}
            <div className="toolbar-controls-right">
              <div className="toolbar-search">
                <i className="fa-solid fa-magnifying-glass"></i>
                <input
                  type="text"
                  placeholder="Filter by role, tool or keyword..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                  <button
                    type="button"
                    className="clear-search-btn"
                    onClick={() => setSearchTerm('')}
                  >
                    &times;
                  </button>
                )}
              </div>

              <div className="view-mode-toggle" role="group" aria-label="View layout">
                <button
                  type="button"
                  className={`view-btn ${viewMode === 'table' ? 'active' : ''}`}
                  onClick={() => setViewMode('table')}
                  title="Table comparison view"
                >
                  <i className="fa-solid fa-table-list"></i>
                </button>
                <button
                  type="button"
                  className={`view-btn ${viewMode === 'cards' ? 'active' : ''}`}
                  onClick={() => setViewMode('cards')}
                  title="Grid cards view"
                >
                  <i className="fa-solid fa-grip"></i>
                </button>
              </div>
            </div>
          </div>

          <div className="results-counter-row">
            <span>
              Displaying <strong>{filtered.length}</strong> of {PROGRAMMES.length} programmes
            </span>
            {(activeTrack !== 'all' || searchTerm) && (
              <button
                type="button"
                className="reset-filters-link"
                onClick={() => {
                  handleTrackChange('all');
                  setSearchTerm('');
                }}
              >
                Reset All Filters
              </button>
            )}
          </div>
        </div>
      </section>

      {/* COMPARISON DATA DISPLAY */}
      <section className="section comparison-data-section">
        <div className="container">
          {filtered.length === 0 ? (
            <div className="empty-results-box">
              <i className="fa-solid fa-folder-open"></i>
              <h3>No matching programmes</h3>
              <p>We couldn't find any programmes matching your selected criteria.</p>
              <button
                type="button"
                className="btn btn-outline-cyan"
                onClick={() => {
                  handleTrackChange('all');
                  setSearchTerm('');
                }}
              >
                Clear Filters
              </button>
            </div>
          ) : viewMode === 'table' ? (
            /* ================================================================
               RESPONSIVE COMPARISON TABLE
               ================================================================ */
            <div className="table-responsive-wrapper">
              <table className="comparison-table">
                <thead>
                  <tr>
                    <th scope="col" style={{ width: '22%' }}>Programme</th>
                    <th scope="col" style={{ width: '16%' }}>Learning Track</th>
                    <th scope="col" style={{ width: '32%' }}>What You Will Learn</th>
                    <th scope="col" style={{ width: '20%' }}>Career Roles</th>
                    <th scope="col" style={{ width: '10%' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((prog) => (
                    <tr key={prog.slug} className="comparison-row">
                      {/* 1. Programme Column */}
                      <td className="prog-title-cell">
                        <div className="prog-cell-inner">
                          <span className="prog-code-pill">Prog {prog.number}</span>
                          <Link to={`/programmes/${prog.slug}`} className="prog-title-link">
                            {prog.title}
                          </Link>
                          <span className="prog-tagline-text">“{prog.tagline}”</span>
                        </div>
                      </td>

                      {/* 2. Track Column */}
                      <td>
                        <span className={`track-pill-sm ${getTrackBadgeClass(prog.track)}`}>
                          {prog.track}
                        </span>
                      </td>

                      {/* 3. What You Will Learn Column */}
                      <td className="learning-outcomes-cell">
                        <p className="cell-overview-text">{prog.overview}</p>
                        <ul className="cell-outcomes-list">
                          {prog.learningOutcomes.map((outcome, idx) => (
                            <li key={idx}>
                              <i className="fa-solid fa-check"></i>
                              <span>{outcome}</span>
                            </li>
                          ))}
                        </ul>
                        <div className="cell-tools-chips">
                          {prog.tools.slice(0, 4).map((tool, idx) => (
                            <span key={idx} className="tool-tiny-badge">{tool}</span>
                          ))}
                          {prog.tools.length > 4 && (
                            <span className="tool-tiny-badge more">+{prog.tools.length - 4}</span>
                          )}
                        </div>
                      </td>

                      {/* 4. Career Roles Column */}
                      <td className="career-roles-cell">
                        <ul className="roles-tags-list">
                          {prog.careerRoles.map((role, idx) => (
                            <li key={idx} className="role-tag-item">
                              <i className="fa-solid fa-briefcase"></i> {role}
                            </li>
                          ))}
                        </ul>
                      </td>

                      {/* 5. View Details Action */}
                      <td className="actions-cell">
                        <Link
                          to={`/programmes/${prog.slug}`}
                          className="btn btn-sm btn-cyan"
                        >
                          View Details
                        </Link>
                        <button
                          type="button"
                          className="btn btn-sm btn-enquire-ghost"
                          onClick={() => {
                            if (openEnrollModalFor) {
                              openEnrollModalFor(prog.title);
                            }
                          }}
                        >
                          Enquire
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            /* ================================================================
               GRID CARDS VIEW
               ================================================================ */
            <div className="modern-programmes-grid">
              {filtered.map((programme) => (
                <div key={programme.slug} className="modern-programme-card">
                  <div className="mp-card-media">
                    <img
                      src={programme.thumbnail || '/images/cyber.png'}
                      alt={programme.title}
                      className="mp-card-img"
                    />
                    <div className="mp-media-overlay" />
                    <div className="mp-badge-row">
                      <span className={`mp-track-pill ${getTrackBadgeClass(programme.track)}`}>
                        {programme.track}
                      </span>
                      <span className="mp-number-pill">Prog {programme.number}</span>
                    </div>
                  </div>

                  <div className="mp-card-body">
                    <h3 className="mp-card-title">{programme.title}</h3>
                    <p className="mp-card-tagline">“{programme.tagline}”</p>
                    <p className="mp-card-desc">{programme.overview}</p>

                    <div className="mp-outcome-box">
                      <div className="mp-outcome-header">
                        <i className="fa-solid fa-circle-check"></i>
                        <span>Primary Outcome</span>
                      </div>
                      <p className="mp-outcome-text">{programme.learningOutcomes[0]}</p>
                    </div>

                    <div className="mp-tools-wrapper">
                      <span className="mp-tools-label">Tools & Frameworks:</span>
                      <div className="mp-tools-chips">
                        {programme.tools.slice(0, 5).map((tool, idx) => (
                          <span key={idx} className="mp-tool-chip">{tool}</span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="mp-card-footer">
                    <Link
                      to={`/programmes/${programme.slug}`}
                      className="btn btn-explore-details"
                    >
                      Explore Details <i className="fa-solid fa-arrow-right"></i>
                    </Link>
                    <button
                      type="button"
                      onClick={() => openEnrollModalFor && openEnrollModalFor(programme.title)}
                      className="btn btn-enquire-card"
                    >
                      Enquire
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ====================================================================
          CAREER-INTEREST MATCHING MATRIX
          ==================================================================== */}
      <section className="section career-interest-section">
        <div className="container">
          <div className="section-header text-center">
            <span className="section-badge badge-cyan">CAREER PATHFINDER</span>
            <h2 className="section-title">What Excites You Most?</h2>
            <p className="section-subtitle">
              Match your professional interests directly with the recommended Netcradus Academy programmes.
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

      {/* BOTTOM ADVISORY BANNER */}
      <section className="section programmes-cta-banner">
        <div className="container">
          <div className="advisory-banner-box">
            <div className="abb-text">
              <h3>Still Deciding Which Programme Fits Your Background?</h3>
              <p>
                Our admissions advisors will assess your academic and technical background to
                recommend the most strategic learning path.
              </p>
            </div>
            <div className="abb-actions">
              <a
                href={CONTACT_INFO.whatsappBaseUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-whatsapp-direct"
              >
                <i className="fa-brands fa-whatsapp"></i> Chat with Admissions (+91 7290909574)
              </a>
              <Link to="/contact" className="btn btn-outline-cyan">
                Contact Form <i className="fa-solid fa-arrow-right"></i>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
    </>
  );
}
