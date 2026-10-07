import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../App';

export default function Courses() {
  const [activeCategory, setActiveCategory] = useState('all');
  const {
    courses,
    loadingCourses,
    coursesError,
    reloadCourses,
    openEnrollModalFor,
  } = useApp();

  const categoryMap = {
    cyber: 'Cyber Security',
    cloud: 'Cloud',
    aiml: 'AI/ML',
    linux: 'Linux',
    networking: 'Networking',
  };

  const filteredCourses = activeCategory === 'all'
    ? courses
    : courses.filter((c) => {
        const targetCategory = categoryMap[activeCategory];
        if (!targetCategory) return true;
        const matchesCategory = (c.category || '').toLowerCase() === targetCategory.toLowerCase();
        const matchesTag = Array.isArray(c.tags) && c.tags.some((t) => t.toLowerCase() === targetCategory.toLowerCase());
        return matchesCategory || matchesTag || c.slug === activeCategory;
      });

  return (
    <div className="courses-page">
      {/* PAGE HEADER */}
      <section className="page-banner-section">
        <div className="container text-center">
          <span className="section-badge">POPULAR COURSES</span>
          <h1 className="page-title">Industry-Relevant Course Catalog</h1>
          <p className="page-subtitle">
            Master in-demand technology stacks with hands-on lab environments and dedicated mentor support.
          </p>
        </div>
      </section>

      {/* COURSES GRID SECTION */}
      <section className="section courses-section" id="courses">
        <div className="container">
          {/* Category Filter Tabs */}
          <div className="course-tabs">
            <button
              className={`tab-btn ${activeCategory === 'all' ? 'active' : ''}`}
              onClick={() => setActiveCategory('all')}
            >
              All Courses
            </button>
            <button
              className={`tab-btn ${activeCategory === 'cyber' ? 'active' : ''}`}
              onClick={() => setActiveCategory('cyber')}
            >
              Cyber Security
            </button>
            <button
              className={`tab-btn ${activeCategory === 'cloud' ? 'active' : ''}`}
              onClick={() => setActiveCategory('cloud')}
            >
              Cloud
            </button>
            <button
              className={`tab-btn ${activeCategory === 'aiml' ? 'active' : ''}`}
              onClick={() => setActiveCategory('aiml')}
            >
              AI/ML
            </button>
            <button
              className={`tab-btn ${activeCategory === 'linux' ? 'active' : ''}`}
              onClick={() => setActiveCategory('linux')}
            >
              Linux
            </button>
            <button
              className={`tab-btn ${activeCategory === 'networking' ? 'active' : ''}`}
              onClick={() => setActiveCategory('networking')}
            >
              Networking
            </button>
          </div>

          {/* LOADING STATE */}
          {loadingCourses && (
            <div className="courses-grid" id="coursesGridLoading">
              {[1, 2, 3, 4, 5, 6].map((idx) => (
                <div key={idx} className="course-card" style={{ opacity: 0.75, minHeight: '380px' }}>
                  <div className="course-banner cyber-bg" style={{ height: '170px', background: 'rgba(245, 158, 11, 0.05)' }}>
                    <div style={{ width: '40%', height: '20px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px' }}></div>
                  </div>
                  <div className="course-content">
                    <div style={{ width: '80%', height: '24px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', marginBottom: '15px' }}></div>
                    <div style={{ width: '60%', height: '16px', background: 'rgba(245, 158, 11,0.15)', borderRadius: '4px', marginBottom: '20px' }}></div>
                    <div style={{ width: '100%', height: '14px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', marginBottom: '10px' }}></div>
                    <div style={{ width: '90%', height: '14px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', marginBottom: '20px' }}></div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ERROR STATE */}
          {!loadingCourses && coursesError && (
            <div className="text-center" style={{ padding: '60px 20px', background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', border: '1px solid rgba(255, 50, 50, 0.3)' }}>
              <i className="fa-solid fa-triangle-exclamation" style={{ fontSize: '2.5rem', color: '#ff4757', marginBottom: '15px' }}></i>
              <h3 style={{ color: 'var(--white)', marginBottom: '10px' }}>Unable to Load Course Catalog</h3>
              <p style={{ color: 'var(--text-muted)', marginBottom: '25px', maxWidth: '500px', margin: '0 auto 25px auto' }}>
                {coursesError}
              </p>
              <button className="btn btn-cyan" onClick={reloadCourses}>
                <i className="fa-solid fa-rotate-right"></i> Try Again
              </button>
            </div>
          )}

          {/* EMPTY STATE */}
          {!loadingCourses && !coursesError && filteredCourses.length === 0 && (
            <div className="text-center" style={{ padding: '60px 20px', background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', border: '1px dashed var(--border-subtle)' }}>
              <i className="fa-solid fa-folder-open" style={{ fontSize: '2.5rem', color: 'var(--cyan-primary)', marginBottom: '15px' }}></i>
              <h3 style={{ color: 'var(--white)', marginBottom: '8px' }}>No Courses Found</h3>
              <p style={{ color: 'var(--text-muted)' }}>There are no courses currently available in this category.</p>
            </div>
          )}

          {/* COURSE CARDS GRID */}
          {!loadingCourses && !coursesError && filteredCourses.length > 0 && (
            <div className="courses-grid" id="coursesGrid">
              {filteredCourses.map((c) => (
                <div key={c._id || c.slug} className="course-card">
                  <div className={`course-banner ${c.bannerClass || 'cyber-bg'}`}>
                    <img src={c.thumbnail || '/images/cyber.png'} alt={c.title} className="course-banner-img" />
                    <div className="banner-overlay"></div>
                    <div className="course-badge">{c.category}</div>
                    <div className="banner-icon"><i className={c.bannerIcon || 'fa-solid fa-user-secret'}></i></div>
                    <h3 className="banner-title">{c.title}</h3>
                  </div>
                  <div className="course-content">
                    <h4 className="course-subtitle">{c.shortDescription || c.title}</h4>
                    <p className="course-meta">
                      <i className="fa-regular fa-clock"></i> {c.duration ? c.duration.split('|')[0] : '6 Months'} | <i className="fa-solid fa-laptop-code"></i> {c.duration && c.duration.includes('|') ? c.duration.split('|')[1] : 'Live Labs'}
                    </p>
                    <ul className="course-highlights">
                      {(c.highlights && c.highlights.length > 0 ? c.highlights : c.learningOutcomes || []).slice(0, 3).map((hl, idx) => (
                        <li key={idx}><i className="fa-solid fa-check"></i> {hl}</li>
                      ))}
                    </ul>
                    <div className="course-footer">
                      <Link to={`/courses/${c.slug}`} className="btn-link">
                        VIEW COURSE <i className="fa-solid fa-arrow-right-long"></i>
                      </Link>
                      <button className="btn btn-sm btn-outline-cyan" onClick={() => openEnrollModalFor(c.title)}>
                        Enroll
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
