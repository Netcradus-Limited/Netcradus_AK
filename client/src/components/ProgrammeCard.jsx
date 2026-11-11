import React from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../App';

export default function ProgrammeCard({ programme }) {
  const { openEnrollModalFor } = useApp() || {};

  if (!programme) return null;

  const trackBadgeClasses = {
    'Offensive Security': 'track-badge-offensive',
    'Defence & Governance': 'track-badge-defence',
    'Secure Engineering': 'track-badge-engineering',
    'AI & Automation': 'track-badge-ai',
  };

  const badgeClass = trackBadgeClasses[programme.track || programme.category] || 'track-badge-default';

  const handleEnquire = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (typeof openEnrollModalFor === 'function') {
      openEnrollModalFor(programme.title);
    }
  };

  return (
    <div className="modern-programme-card" id={`prog-card-${programme.slug}`}>
      {/* Top Banner / Image Header */}
      <div className="mp-card-media">
        <img
          src={programme.thumbnail || '/images/cyber.png'}
          alt={programme.title}
          className="mp-card-img"
          loading="lazy"
        />
        <div className="mp-media-overlay" />
        <div className="mp-badge-row">
          <span className={`mp-track-pill ${badgeClass}`}>
            {programme.track || programme.category}
          </span>
          <span className="mp-number-pill">Prog {programme.number || '01'}</span>
        </div>
      </div>

      {/* Card Content Body */}
      <div className="mp-card-body">
        <div className="mp-title-block">
          <h3 className="mp-card-title">{programme.title}</h3>
          {programme.tagline && (
            <p className="mp-card-tagline">“{programme.tagline}”</p>
          )}
        </div>

        <p className="mp-card-desc">
          {programme.shortDescription || programme.overview}
        </p>

        {/* Key Learning Outcome */}
        {programme.learningOutcomes && programme.learningOutcomes.length > 0 && (
          <div className="mp-outcome-box">
            <div className="mp-outcome-header">
              <i className="fa-solid fa-circle-check"></i>
              <span>Key Outcome</span>
            </div>
            <p className="mp-outcome-text">{programme.learningOutcomes[0]}</p>
          </div>
        )}

        {/* Tools and Platforms */}
        {programme.tools && programme.tools.length > 0 && (
          <div className="mp-tools-wrapper">
            <span className="mp-tools-label">Tools & Frameworks:</span>
            <div className="mp-tools-chips">
              {programme.tools.slice(0, 5).map((tool, idx) => (
                <span key={idx} className="mp-tool-chip">{tool}</span>
              ))}
              {programme.tools.length > 5 && (
                <span className="mp-tool-chip more">+{programme.tools.length - 5}</span>
              )}
            </div>
          </div>
        )}

        {/* Target Career Roles Preview */}
        {programme.careerRoles && programme.careerRoles.length > 0 && (
          <div className="mp-roles-preview">
            <i className="fa-solid fa-briefcase"></i>
            <span>{programme.careerRoles.slice(0, 2).join(' • ')}</span>
          </div>
        )}
      </div>

      {/* Card Footer Actions */}
      <div className="mp-card-footer">
        <Link
          to={`/programmes/${programme.slug}`}
          className="btn btn-explore-details"
        >
          Explore Details <i className="fa-solid fa-arrow-right"></i>
        </Link>
        <button
          type="button"
          onClick={handleEnquire}
          className="btn btn-enquire-card"
        >
          Enquire Now
        </button>
      </div>
    </div>
  );
}
