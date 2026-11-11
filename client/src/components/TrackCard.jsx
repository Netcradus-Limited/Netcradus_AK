import React from 'react';
import { Link } from 'react-router-dom';
import { getProgrammeBySlug } from '../data/programmesData';

export default function TrackCard({ track, onExploreTrack }) {
  if (!track) return null;

  return (
    <div
      className="track-card-component"
      style={{
        '--track-accent': track.accentColor,
        '--track-border-glow': track.borderGlow,
      }}
    >
      <div className="track-card-header">
        <div className="track-icon-wrapper" style={{ color: track.accentColor }}>
          <i className={track.icon}></i>
        </div>
        <div className="track-badge-count">{track.badge}</div>
      </div>

      <h3 className="track-card-title">{track.title}</h3>
      <p className="track-card-description">{track.description}</p>

      {/* Programme Links within Track */}
      <div className="track-programmes-list">
        <span className="track-prog-label">Programmes included:</span>
        <ul className="track-prog-items">
          {track.programmes.map((slug) => {
            const prog = getProgrammeBySlug(slug);
            return (
              <li key={slug}>
                <Link to={`/programmes/${slug}`} className="track-prog-link">
                  <i className="fa-solid fa-chevron-right"></i>
                  <span>{prog ? prog.title : slug}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="track-card-actions">
        {onExploreTrack ? (
          <button
            type="button"
            className="btn btn-outline-track"
            onClick={() => onExploreTrack(track.id)}
          >
            Explore Track <i className="fa-solid fa-arrow-right-long"></i>
          </button>
        ) : (
          <Link
            to={`/programmes?track=${track.id}`}
            className="btn btn-outline-track"
          >
            Explore Track <i className="fa-solid fa-arrow-right-long"></i>
          </Link>
        )}
      </div>
    </div>
  );
}

