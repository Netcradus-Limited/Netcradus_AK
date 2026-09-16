import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../App';

// Domain metadata mapper for course visual styling, images, speech tag, and feature highlights
const getCourseVisualMeta = (course) => {
  const slug = (course.slug || '').toLowerCase();
  const category = (course.category || '').toLowerCase();
  const title = (course.title || '').toLowerCase();

  if (slug.includes('vapt') || title.includes('vapt')) {
    return {
      themeClass: 'theme-cyber',
      speechTag: 'Secure the Digital World',
      iconClass: 'fa-solid fa-shield-halved',
      pedestalGlow: 'rgba(255, 107, 0, 0.15)',
      highlights: ['Hands-on Labs', 'Real-World Tools', 'Industry Scenarios'],
      badgeColor: '#FF6B00',
      imageAsset: '/images/vapt.png',
    };
  }
  if (slug.includes('pentest') || title.includes('penetration')) {
    return {
      themeClass: 'theme-cyber',
      speechTag: 'Ethical Testing & Evasion',
      iconClass: 'fa-solid fa-terminal',
      pedestalGlow: 'rgba(255, 140, 0, 0.15)',
      highlights: ['Active Directory Pentesting', 'Privilege Escalation', 'Red Team Labs'],
      badgeColor: '#FF6B00',
      imageAsset: '/images/cyber.png',
    };
  }
  if (slug.includes('soc') || title.includes('soc')) {
    return {
      themeClass: 'theme-soc',
      speechTag: 'Real-Time Threat Defense',
      iconClass: 'fa-solid fa-shield-virus',
      pedestalGlow: 'rgba(239, 68, 68, 0.15)',
      highlights: ['Splunk SIEM Ops', 'Malware Forensics', 'Incident Playbooks'],
      badgeColor: '#EF4444',
      imageAsset: '/images/soc.png',
    };
  }
  if (slug.includes('cloud-security') || title.includes('cloud security')) {
    return {
      themeClass: 'theme-cloud-sec',
      speechTag: 'Multi-Cloud Protection',
      iconClass: 'fa-solid fa-cloud-shield',
      pedestalGlow: 'rgba(14, 165, 233, 0.15)',
      highlights: ['AWS & Azure Security', 'Kubernetes Hardening', 'IAM Compliance'],
      badgeColor: '#0EA5E9',
      imageAsset: '/images/cloud.png',
    };
  }
  if (slug.includes('cloud') || category.includes('cloud')) {
    return {
      themeClass: 'theme-cloud',
      speechTag: 'Build Scalable Systems',
      iconClass: 'fa-solid fa-cloud-arrow-up',
      pedestalGlow: 'rgba(56, 189, 248, 0.15)',
      highlights: ['Cloud Labs', 'Infrastructure as Code', 'Deployment Projects'],
      badgeColor: '#0EA5E9',
      imageAsset: '/images/cloud.png',
    };
  }
  if (slug.includes('linux') || category.includes('linux')) {
    return {
      themeClass: 'theme-linux',
      speechTag: 'Master Enterprise OS',
      iconClass: 'fa-solid fa-server',
      pedestalGlow: 'rgba(16, 185, 129, 0.15)',
      highlights: ['RHEL & Ubuntu Server', 'Bash Automation', 'System Hardening'],
      badgeColor: '#10B981',
      imageAsset: '/images/devops.png',
    };
  }
  if (slug.includes('ai') || category.includes('ai')) {
    return {
      themeClass: 'theme-ai',
      speechTag: 'Turn Ideas Into Intelligent Solutions',
      iconClass: 'fa-solid fa-brain',
      pedestalGlow: 'rgba(168, 85, 247, 0.15)',
      highlights: ['Practical Projects', 'Modern AI Tools', 'Build Intelligent Solutions'],
      badgeColor: '#9333EA',
      imageAsset: '/images/ai.png',
    };
  }
  if (slug.includes('net-sec') || title.includes('network security')) {
    return {
      themeClass: 'theme-net-sec',
      speechTag: 'Protect Perimeter Networks',
      iconClass: 'fa-solid fa-network-wired',
      pedestalGlow: 'rgba(249, 115, 22, 0.15)',
      highlights: ['Next-Gen Firewalls', 'VPN Architecture', 'IDS/IPS Auditing'],
      badgeColor: '#F97316',
      imageAsset: '/images/cyber-course-card.png',
    };
  }
  if (slug.includes('network') || category.includes('networking')) {
    return {
      themeClass: 'theme-networking',
      speechTag: 'Connect Enterprise Networks',
      iconClass: 'fa-solid fa-sitemap',
      pedestalGlow: 'rgba(99, 102, 241, 0.15)',
      highlights: ['Cisco Router & Switch', 'VLANs & Subnetting', 'BGP & OSPF Routing'],
      badgeColor: '#6366F1',
      imageAsset: '/images/devops.png',
    };
  }
  if (slug.includes('fullstack') || category.includes('full stack')) {
    return {
      themeClass: 'theme-cyber',
      speechTag: 'Build Full-Stack Applications',
      iconClass: 'fa-solid fa-code',
      pedestalGlow: 'rgba(16, 185, 129, 0.15)',
      highlights: ['React & Next.js', 'Node & Express APIs', 'MongoDB Databases'],
      badgeColor: '#10B981',
      imageAsset: '/images/fullstack.png',
    };
  }
  if (slug.includes('data') || category.includes('data')) {
    return {
      themeClass: 'theme-soc',
      speechTag: 'Data Analytics & Visualization',
      iconClass: 'fa-solid fa-chart-line',
      pedestalGlow: 'rgba(14, 165, 233, 0.15)',
      highlights: ['Python & Pandas', 'Advanced SQL Queries', 'PowerBI Dashboards'],
      badgeColor: '#0EA5E9',
      imageAsset: '/images/data.png',
    };
  }

  // Fallback default
  return {
    themeClass: 'theme-cyber',
    speechTag: 'Industry Certified Program',
    iconClass: 'fa-solid fa-laptop-code',
    pedestalGlow: 'rgba(255, 107, 0, 0.15)',
    highlights: course.highlights || ['Hands-on Labs', 'Real-World Tools', 'Industry Projects'],
    badgeColor: '#FF6B00',
    imageAsset: course.thumbnail || '/images/cyber.png',
  };
};

export default function PopularProgramsSection() {
  const { courses, loadingCourses, coursesError, openEnrollModalFor } = useApp();

  const [activeCategory, setActiveCategory] = useState('all');
  const [activeIndex, setActiveIndex] = useState(0);

  const categoryMap = {
    cyber: 'Cyber Security',
    cloud: 'Cloud',
    aiml: 'AI/ML',
    linux: 'Linux',
    networking: 'Networking',
  };

  // Filter out any temporary test courses if present
  const validCourses = courses.filter((c) => {
    const title = (c.title || '').toLowerCase();
    const slug = (c.slug || '').toLowerCase();
    return !title.includes('sync verification') && !slug.includes('sync-course');
  });

  // Filter courses by category
  const filteredCourses = activeCategory === 'all'
    ? validCourses
    : validCourses.filter((c) => {
        const targetCategory = categoryMap[activeCategory];
        if (!targetCategory) return true;
        const matchesCategory = (c.category || '').toLowerCase() === targetCategory.toLowerCase();
        const matchesTag = Array.isArray(c.tags) && c.tags.some((t) => t.toLowerCase() === targetCategory.toLowerCase());
        return matchesCategory || matchesTag || c.slug === activeCategory;
      });

  const handleCategoryChange = (catKey) => {
    setActiveCategory(catKey);
    setActiveIndex(0);
  };

  const N = filteredCourses.length;

  const prevSlide = () => {
    if (N === 0) return;
    setActiveIndex((prev) => (prev - 1 + N) % N);
  };

  const nextSlide = () => {
    if (N === 0) return;
    setActiveIndex((prev) => (prev + 1) % N);
  };

  // Compute displayed cards for cover-flow composition (Left, Center, Right)
  const getDisplayedCards = () => {
    if (N === 0) return [];
    if (N === 1) {
      return [{ course: filteredCourses[0], slot: 'center', originalIndex: 0 }];
    }
    if (N === 2) {
      const centerIdx = activeIndex % 2;
      const otherIdx = (activeIndex + 1) % 2;
      return [
        { course: filteredCourses[centerIdx], slot: 'center', originalIndex: centerIdx },
        { course: filteredCourses[otherIdx], slot: 'right', originalIndex: otherIdx },
      ];
    }

    const centerIdx = ((activeIndex % N) + N) % N;
    const leftIdx = ((centerIdx - 1 + N) % N);
    const rightIdx = ((centerIdx + 1) % N);

    return [
      { course: filteredCourses[leftIdx], slot: 'left', originalIndex: leftIdx },
      { course: filteredCourses[centerIdx], slot: 'center', originalIndex: centerIdx },
      { course: filteredCourses[rightIdx], slot: 'right', originalIndex: rightIdx },
    ];
  };

  const displayedCards = getDisplayedCards();

  // Mouse spotlight glow & 3D tilt handler
  const handleMouseMove = (e) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    const tiltX = (y - 50) / -12;
    const tiltY = (x - 50) / 12;

    card.style.setProperty('--mouse-x', `${x}%`);
    card.style.setProperty('--mouse-y', `${y}%`);
    card.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) translateY(-8px)`;
  };

  const handleMouseLeave = (e) => {
    const card = e.currentTarget;
    card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)';
  };

  return (
    <section className="popular-programs-redesign" id="featured-courses">
      {/* Background Ambient Glow & Dot Pattern Layers */}
      <div className="pp-glow-blob blob-left"></div>
      <div className="pp-glow-blob blob-right"></div>
      <div className="pp-dot-pattern"></div>

      <div className="container relative-container">
        {/* Decorative Floating Badges */}
        <div className="pp-header-floating-pill left">
          <div className="pp-pill-icon"><i className="fa-solid fa-graduation-cap"></i></div>
          <span>Job-Ready Skills</span>
        </div>
        <div className="pp-header-script-tag">
          Skills Today A Better Tomorrow
        </div>

        {/* SECTION HEADER */}
        <div className="pp-section-header text-center">
          <div className="pp-badge-line">
            <span className="line"></span>
            <span className="badge-text">POPULAR PROGRAMS</span>
            <span className="line"></span>
          </div>

          <h2 className="pp-section-title">
            Explore <span className="highlight-orange">Industry-Ready</span> Courses
          </h2>

          <p className="pp-section-subtitle">
            Gain practical skills, work on real-world projects, and build a career in today's most in-demand tech fields.
          </p>
        </div>

        {/* CATEGORY FILTERS BAR & VIEW ALL LINK */}
        <div className="pp-filter-row">
          <div className="pp-filter-tabs">
            <button
              className={`pp-tab-btn ${activeCategory === 'all' ? 'active' : ''}`}
              onClick={() => handleCategoryChange('all')}
            >
              All Courses
            </button>
            <button
              className={`pp-tab-btn ${activeCategory === 'cyber' ? 'active' : ''}`}
              onClick={() => handleCategoryChange('cyber')}
            >
              Cyber Security
            </button>
            <button
              className={`pp-tab-btn ${activeCategory === 'cloud' ? 'active' : ''}`}
              onClick={() => handleCategoryChange('cloud')}
            >
              Cloud
            </button>
            <button
              className={`pp-tab-btn ${activeCategory === 'aiml' ? 'active' : ''}`}
              onClick={() => handleCategoryChange('aiml')}
            >
              AI/ML
            </button>
            <button
              className={`pp-tab-btn ${activeCategory === 'linux' ? 'active' : ''}`}
              onClick={() => handleCategoryChange('linux')}
            >
              Linux
            </button>
            <button
              className={`pp-tab-btn ${activeCategory === 'networking' ? 'active' : ''}`}
              onClick={() => handleCategoryChange('networking')}
            >
              Networking
            </button>
          </div>

          <Link to="/courses" className="pp-view-all-link">
            View All Courses <i className="fa-solid fa-arrow-right-long"></i>
          </Link>
        </div>

        {/* CAROUSEL COVERFLOW WRAPPER */}
        <div className="pp-carousel-wrapper">
          {/* Navigation Arrow Buttons */}
          {N > 1 && (
            <>
              <button
                type="button"
                className="pp-carousel-nav prev"
                onClick={prevSlide}
                aria-label="Previous Course"
              >
                <i className="fa-solid fa-arrow-left"></i>
              </button>

              <button
                type="button"
                className="pp-carousel-nav next"
                onClick={nextSlide}
                aria-label="Next Course"
              >
                <i className="fa-solid fa-arrow-right"></i>
              </button>
            </>
          )}

          {/* LOADING STATE */}
          {loadingCourses && (
            <div className="pp-grid-loading">
              {[1, 2, 3].map((idx) => (
                <div key={idx} className="pp-card-skeleton">
                  <div className="skeleton-visual"></div>
                  <div className="skeleton-line title"></div>
                  <div className="skeleton-line desc"></div>
                  <div className="skeleton-line btn"></div>
                </div>
              ))}
            </div>
          )}

          {/* ERROR STATE */}
          {!loadingCourses && coursesError && (
            <div className="pp-error-box">
              <i className="fa-solid fa-triangle-exclamation"></i>
              <p>{coursesError}</p>
            </div>
          )}

          {/* EMPTY STATE */}
          {!loadingCourses && !coursesError && N === 0 && (
            <div className="pp-empty-box">
              <i className="fa-solid fa-folder-open"></i>
              <p>No courses found in this category.</p>
            </div>
          )}

          {/* COVERFLOW CAROUSEL COMPOSITION */}
          {!loadingCourses && !coursesError && N > 0 && (
            <div className="pp-coverflow-container">
              {displayedCards.map(({ course: c, slot, originalIndex }) => {
                const meta = getCourseVisualMeta(c);
                const highlights = (c.highlights && c.highlights.length > 0 ? c.highlights : meta.highlights).slice(0, 3);
                const cardImage = c.thumbnail || meta.imageAsset;

                return (
                  <div
                    key={`${c._id || c.slug}-${slot}`}
                    className={`pp-coverflow-card-wrap slot-${slot}`}
                    onClick={() => {
                      if (slot === 'left' || slot === 'right') {
                        setActiveIndex(originalIndex);
                      }
                    }}
                  >
                    <div
                      className={`pp-card ${meta.themeClass}`}
                      onMouseMove={handleMouseMove}
                      onMouseLeave={handleMouseLeave}
                    >
                      {/* Cursor Spotlight Layer */}
                      <div className="pp-card-spotlight"></div>

                      {/* TOP VISUAL AREA WITH CLEAN COURSE IMAGE ONLY */}
                      <div className="pp-card-header-visual">
                        <img 
                          src={cardImage} 
                          alt={c.title} 
                          className="pp-card-img" 
                        />
                      </div>

                      {/* CARD BODY CONTENT */}
                      <div className="pp-card-body">
                        {/* Category Badge */}
                        <div className="pp-category-pill" style={{ color: meta.badgeColor }}>
                          {c.category || 'Academy Program'}
                        </div>

                        {/* Title */}
                        <h3 className="pp-card-title">{c.title}</h3>

                        {/* Short Description */}
                        <p className="pp-card-desc">
                          {c.shortDescription || c.description}
                        </p>

                        {/* Highlights List */}
                        <ul className="pp-card-highlights">
                          {highlights.map((hl, idx) => (
                            <li key={idx}>
                              <div className="pp-hl-icon">
                                <i className="fa-solid fa-check"></i>
                              </div>
                              <span>{hl}</span>
                            </li>
                          ))}
                        </ul>

                        {/* BOTTOM ACTIONS */}
                        <div className="pp-card-actions">
                          <Link
                            to={`/courses/${c.slug}`}
                            className="pp-btn-view-course"
                          >
                            View Course <i className="fa-solid fa-arrow-right-long"></i>
                          </Link>

                          <button
                            type="button"
                            className="pp-btn-enroll-now"
                            onClick={(e) => {
                              e.stopPropagation();
                              openEnrollModalFor(c.title);
                            }}
                          >
                            Enroll Now
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* BOTTOM TRUST / BENEFITS STRIP */}
        <div className="pp-trust-strip">
          <div className="pp-trust-item">
            <div className="pp-trust-icon"><i className="fa-solid fa-display"></i></div>
            <div className="pp-trust-text">
              <h4>Practical Learning</h4>
              <p>Hands-on labs and projects</p>
            </div>
          </div>

          <div className="pp-trust-item">
            <div className="pp-trust-icon"><i className="fa-solid fa-user-tie"></i></div>
            <div className="pp-trust-text">
              <h4>Expert Mentorship</h4>
              <p>Learn from industry professionals</p>
            </div>
          </div>

          <div className="pp-trust-item">
            <div className="pp-trust-icon"><i className="fa-solid fa-briefcase"></i></div>
            <div className="pp-trust-text">
              <h4>Career Support</h4>
              <p>Get job-ready with guidance</p>
            </div>
          </div>

          <div className="pp-trust-item">
            <div className="pp-trust-icon"><i className="fa-solid fa-globe"></i></div>
            <div className="pp-trust-text">
              <h4>Globally Relevant</h4>
              <p>Skills for a better tomorrow</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
