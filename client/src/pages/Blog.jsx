import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import SEOHead from '../components/SEOHead';
import { BLOG_POSTS } from '../data/blogData';
import { useApp } from '../App';

export default function Blog() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const { openModal } = useApp() || {};

  // Supported Categories derived directly from content
  const categories = useMemo(() => {
    const counts = { All: BLOG_POSTS.length };
    BLOG_POSTS.forEach((post) => {
      counts[post.category] = (counts[post.category] || 0) + 1;
    });
    return [
      { id: 'All', label: `All Articles (${counts.All})` },
      { id: 'Cyber Security', label: `Cyber Security (${counts['Cyber Security'] || 0})` },
      { id: 'Offensive Security', label: `Offensive Security (${counts['Offensive Security'] || 0})` },
      { id: 'Defence & Governance', label: `Defensive & SOC (${counts['Defence & Governance'] || 0})` },
      { id: 'Secure Engineering', label: `Secure Engineering (${counts['Secure Engineering'] || 0})` },
      { id: 'AI & Automation', label: `AI & Automation (${counts['AI & Automation'] || 0})` },
      { id: 'Career Guides', label: `Career Guides (${counts['Career Guides'] || 0})` },
    ];
  }, []);

  // Filtered articles
  const filteredPosts = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return BLOG_POSTS.filter((post) => {
      const matchesCategory = selectedCategory === 'All' || post.category === selectedCategory;
      if (!matchesCategory) return false;
      if (!q) return true;

      const titleMatch = post.title.toLowerCase().includes(q);
      const descMatch = (post.metaDescription || '').toLowerCase().includes(q);
      const answerMatch = (post.quickAnswer || '').toLowerCase().includes(q);
      const tagMatch = post.tags && post.tags.some((t) => t.toLowerCase().includes(q));
      const categoryMatch = post.category.toLowerCase().includes(q);

      return titleMatch || descMatch || answerMatch || tagMatch || categoryMatch;
    });
  }, [selectedCategory, searchQuery]);

  // Lead / Featured Story (when viewing default "All" with no search, show first article as featured)
  const isDefaultView = selectedCategory === 'All' && !searchQuery;
  const featuredPost = isDefaultView ? BLOG_POSTS[0] : null;
  const standardPosts = isDefaultView ? filteredPosts.slice(1) : filteredPosts;

  const getCategoryBadgeClass = (category) => {
    switch (category) {
      case 'Offensive Security':
        return 'badge-domain badge-offensive';
      case 'Defence & Governance':
        return 'badge-domain badge-defence';
      case 'Secure Engineering':
        return 'badge-domain badge-engineering';
      case 'AI & Automation':
        return 'badge-domain badge-ai';
      case 'Career Guides':
        return 'badge-domain badge-career';
      default:
        return 'badge-domain badge-cyber';
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
        name: 'Knowledge Hub',
        item: 'https://academy.netcradus.com/blog',
      },
    ],
  };

  return (
    <>
      <SEOHead
        title="Knowledge Hub | Cyber Security & AI Technical Guides – Netcradus Academy"
        description="Explore authoritative technical guides, career roadmaps, and industry analysis on Cyber Security, Ethical Hacking, SOC Operations, DevSecOps, and Agentic AI."
        keywords="Cyber Security guides India, SOC Analyst roadmap, VAPT tutorial, Agentic AI tutorial, DevSecOps guide, Ethical Hacking training Delhi NCR"
        schema={breadcrumbSchema}
      />

      <main className="kh-page">
        {/* ====================================================================
            1. HERO SECTION
            ==================================================================== */}
        <section className="kh-hero-section">
          <div className="kh-container">
            {/* Breadcrumb Navigation */}
            <nav aria-label="Breadcrumb" className="kh-breadcrumbs">
              <Link to="/" className="kh-crumb-link">
                <i className="fa-solid fa-house"></i>
                <span>Home</span>
              </Link>
              <span className="kh-crumb-sep">/</span>
              <span className="kh-crumb-current">Knowledge Hub</span>
            </nav>

            <div className="kh-hero-content">
              {/* Eyebrow */}
              <div className="kh-eyebrow">
                <span className="kh-eyebrow-dot"></span>
                <i className="fa-solid fa-shield-halved"></i>
                <span>NETCRADUS KNOWLEDGE HUB</span>
              </div>

              {/* Main Headline */}
              <h1 className="kh-hero-headline">
                Explore the Future of Cybersecurity &amp; AI.
              </h1>

              {/* Subheading */}
              <p className="kh-hero-subhead">
                In-Depth Technical Playbooks, Attack-Defense Case Studies &amp; Career Roadmaps
              </p>

              {/* Supporting Description */}
              <p className="kh-hero-lead">
                Authored by practicing security engineers, SOC leaders, and AI architects at Netcradus Academy. Grounded in enterprise physical labs and live telemetry from our Sector 63, Noida facility.
              </p>

              {/* Stat Chips */}
              <div className="kh-stat-strips">
                <div className="kh-stat-chip">
                  <i className="fa-solid fa-book-bookmark"></i>
                  <span><strong>8</strong> In-Depth Technical Pillars</span>
                </div>
                <div className="kh-stat-chip">
                  <i className="fa-solid fa-cubes"></i>
                  <span><strong>4</strong> Specialization Domains</span>
                </div>
                <div className="kh-stat-chip">
                  <i className="fa-solid fa-flask-vial"></i>
                  <span><strong>100%</strong> Practical Lab Grounded</span>
                </div>
              </div>

              {/* Prominent Search Bar */}
              <div className="kh-search-wrapper">
                <i className="fa-solid fa-magnifying-glass kh-search-icon"></i>
                <input
                  type="text"
                  placeholder="Search articles, tools (Burp Suite, Wireshark, Splunk), roles, or topics..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="kh-search-input"
                  aria-label="Search Knowledge Hub articles"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="kh-search-clear"
                    title="Clear search"
                    aria-label="Clear search query"
                  >
                    <i className="fa-solid fa-xmark"></i>
                  </button>
                )}
                <span className="kh-search-badge">
                  {filteredPosts.length} {filteredPosts.length === 1 ? 'guide' : 'guides'}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ====================================================================
            2. HORIZONTAL CATEGORY NAVIGATION BAR (STICKY)
            ==================================================================== */}
        <section className="kh-cat-bar" aria-label="Category Filters">
          <div className="kh-container">
            <div className="kh-cat-track">
              <span className="kh-cat-label">
                <i className="fa-solid fa-filter"></i>
                <span>Topics:</span>
              </span>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`kh-cat-btn ${selectedCategory === cat.id ? 'active' : ''}`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* ====================================================================
            3. MAIN ARTICLES AREA
            ==================================================================== */}
        <div className="kh-main-area">
          <div className="kh-container">
            {/* FEATURED ARTICLE (EDITORIAL LAYOUT) */}
            {featuredPost && (
              <section className="kh-featured-section" aria-labelledby="featured-story-title">
                <div className="kh-section-eyebrow">
                  <span className="kh-pulse-dot"></span>
                  <span>FEATURED EDITORIAL STORY</span>
                </div>

                <div className="kh-featured-card">
                  {/* Left: 16/10 Aspect Image */}
                  <div className="kh-featured-media">
                    <img
                      src={featuredPost.coverImage || '/images/cyber.png'}
                      alt={featuredPost.title}
                      className="kh-featured-img"
                    />
                    <div className="kh-media-overlay"></div>

                    {/* Top Badges */}
                    <div className="kh-badge-float-top">
                      <span className="kh-pill-primary">FEATURED</span>
                      <span className="kh-pill-blur">{featuredPost.difficulty || 'Essential Pillar'}</span>
                    </div>

                    {/* Bottom Metadata Strip */}
                    <div className="kh-media-bottom-strip">
                      <span>
                        <i className="fa-regular fa-clock" style={{ color: '#f59e0b', marginRight: '6px' }}></i>
                        {featuredPost.readTime}
                      </span>
                      <span>Updated {featuredPost.lastUpdated}</span>
                    </div>
                  </div>

                  {/* Right: Editorial Typography */}
                  <div className="kh-featured-content">
                    <div className="kh-meta-row">
                      <span className={getCategoryBadgeClass(featuredPost.category)}>
                        {featuredPost.category}
                      </span>
                      <span style={{ color: '#94a3b8' }}>
                        <i className="fa-regular fa-calendar" style={{ marginRight: '6px' }}></i>
                        {featuredPost.publishedDate}
                      </span>
                    </div>

                    <h2 id="featured-story-title" className="kh-featured-title">
                      <Link to={`/blog/${featuredPost.slug}`}>
                        {featuredPost.title}
                      </Link>
                    </h2>

                    <p className="kh-featured-excerpt">
                      {featuredPost.metaDescription}
                    </p>

                    {/* Executive Takeaway Callout */}
                    {featuredPost.quickAnswer && (
                      <div className="kh-takeaway-box">
                        <span className="kh-takeaway-label">
                          Executive Takeaway / Direct Answer:
                        </span>
                        <span>{featuredPost.quickAnswer}</span>
                      </div>
                    )}

                    {/* Tags */}
                    {featuredPost.tags && (
                      <div className="kh-tags-list">
                        {featuredPost.tags.slice(0, 4).map((tag, tIdx) => (
                          <span key={tIdx} className="kh-tag-pill">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Footer Row */}
                    <div className="kh-featured-footer">
                      <div className="kh-author-snippet">
                        <img
                          src={featuredPost.author.avatar || '/images/logo.png'}
                          alt={featuredPost.author.name}
                          className="kh-author-avatar"
                        />
                        <div>
                          <div className="kh-author-name">{featuredPost.author.name}</div>
                          <div className="kh-author-sub">{featuredPost.author.role}</div>
                        </div>
                      </div>

                      <Link to={`/blog/${featuredPost.slug}`} className="kh-btn-read-featured">
                        <span>Read Full Guide</span>
                        <i className="fa-solid fa-arrow-right"></i>
                      </Link>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* ARTICLES GRID SECTION */}
            <section aria-labelledby="all-articles-title">
              <div className="kh-grid-header">
                <div>
                  <h2 id="all-articles-title" className="kh-grid-heading">
                    <i className="fa-solid fa-layer-group"></i>
                    <span>
                      {selectedCategory === 'All' && !searchQuery
                        ? 'All Technical Roadmaps & Research Guides'
                        : `Articles matching "${selectedCategory === 'All' ? searchQuery : selectedCategory}"`}
                    </span>
                  </h2>
                  <p className="kh-grid-sub">
                    Practical, tool-grounded engineering resources engineered for career progression.
                  </p>
                </div>
                <div className="kh-grid-count">
                  Showing <strong>{filteredPosts.length}</strong> of {BLOG_POSTS.length} articles
                </div>
              </div>

              {/* Empty State */}
              {filteredPosts.length === 0 ? (
                <div className="kh-empty-box">
                  <div className="kh-empty-icon">
                    <i className="fa-solid fa-magnifying-glass"></i>
                  </div>
                  <h3 className="kh-empty-title">No technical guides found</h3>
                  <p className="kh-empty-desc">
                    We could not find any articles matching "{searchQuery}". Try searching for broader terms such as "SOC", "VAPT", "SIEM", "DevSecOps", or reset your category filter.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCategory('All');
                      setSearchQuery('');
                    }}
                    className="kh-btn-reset"
                  >
                    <i className="fa-solid fa-rotate-left"></i>
                    <span>Reset All Filters</span>
                  </button>
                </div>
              ) : (
                /* 3-Column Responsive Card Grid */
                <div className="kh-articles-grid">
                  {standardPosts.map((post) => (
                    <article key={post.slug} className="kh-card">
                      <div>
                        {/* 1. Thumbnail Media with Consistent 16/9 Ratio */}
                        <div className="kh-card-thumb-wrap">
                          <img
                            src={post.coverImage || '/images/cyber.png'}
                            alt={post.title}
                            className="kh-card-img"
                            loading="lazy"
                          />
                          <div className="kh-media-overlay"></div>

                          {/* Floating Category and Read Time Pills */}
                          <div className="kh-card-top-pills">
                            <span className={getCategoryBadgeClass(post.category)}>
                              {post.category}
                            </span>
                            <span className="kh-pill-blur">
                              <i className="fa-regular fa-clock" style={{ color: '#f59e0b', marginRight: '4px' }}></i>
                              {post.readTime}
                            </span>
                          </div>
                        </div>

                        {/* 2. Card Content Body */}
                        <div className="kh-card-body">
                          {/* Metadata row */}
                          <div className="kh-card-meta">
                            <span>
                              <i className="fa-regular fa-calendar" style={{ marginRight: '5px' }}></i>
                              {post.publishedDate}
                            </span>
                            <span style={{ fontFamily: 'monospace' }}>
                              {post.difficulty || 'Technical Guide'}
                            </span>
                          </div>

                          {/* Article Title */}
                          <h3 className="kh-card-title">
                            <Link to={`/blog/${post.slug}`}>
                              {post.title}
                            </Link>
                          </h3>

                          {/* Description Excerpt */}
                          <p className="kh-card-desc">
                            {post.metaDescription}
                          </p>

                          {/* Tag Chips */}
                          {post.tags && post.tags.length > 0 && (
                            <div className="kh-tags-list" style={{ marginTop: '4px' }}>
                              {post.tags.slice(0, 3).map((tag, tIdx) => (
                                <span key={tIdx} className="kh-tag-pill">
                                  #{tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* 3. Card Footer */}
                      <div className="kh-card-footer">
                        <div className="kh-author-snippet">
                          <img
                            src={post.author.avatar || '/images/logo.png'}
                            alt={post.author.name}
                            className="kh-author-avatar"
                            style={{ width: '26px', height: '26px' }}
                          />
                          <span style={{ fontSize: '0.74rem', color: '#cbd5e1', fontWeight: 600 }}>
                            {post.author.name.replace('Netcradus ', '')}
                          </span>
                        </div>

                        <Link to={`/blog/${post.slug}`} className="kh-read-btn">
                          <span>Read Guide</span>
                          <i className="fa-solid fa-arrow-right"></i>
                        </Link>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>

            {/* ====================================================================
                4. CAREER ACCELERATION BANNER
                ==================================================================== */}
            <section className="kh-cta-banner">
              <div>
                <span className="kh-eyebrow" style={{ marginBottom: '8px' }}>
                  <i className="fa-solid fa-graduation-cap"></i>
                  <span>TURN KNOWLEDGE INTO EMPLOYMENT</span>
                </span>
                <h3 className="kh-cta-title">
                  Ready to Turn Technical Knowledge into Job-Ready Competence?
                </h3>
                <p className="kh-cta-desc">
                  Netcradus Academy offers 11 structured career tracks spanning Offensive Security, Defensive SOC Operations, DevSecOps, and Agentic AI. Experience physical hardware labs in Sector 63, Noida and hybrid training formats.
                </p>
              </div>

              <div className="kh-cta-actions">
                <Link to="/programmes" className="kh-btn-primary-glow">
                  <span>Explore 11 Programmes</span>
                  <i className="fa-solid fa-arrow-right"></i>
                </Link>
                <button
                  type="button"
                  onClick={() => openModal && openModal('admissions')}
                  className="kh-btn-secondary-outline"
                >
                  Book Admissions Counselling
                </button>
              </div>
            </section>
          </div>
        </div>
      </main>
    </>
  );
}
