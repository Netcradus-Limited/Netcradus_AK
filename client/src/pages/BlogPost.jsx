import React, { useState, useEffect } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import SEOHead from '../components/SEOHead';
import { getBlogPostBySlug, getRelatedPosts } from '../data/blogData';
import { getProgrammeBySlug } from '../data/programmesData';
import { useApp } from '../App';
import EnquiryForm from '../components/EnquiryForm';

export default function BlogPost() {
  const { slug } = useParams();
  const { openModal } = useApp() || {};
  const [scrollProgress, setScrollProgress] = useState(0);
  const [copiedLink, setCopiedLink] = useState(false);
  const [activeFaq, setActiveFaq] = useState(null);

  const post = getBlogPostBySlug(slug);

  // Scroll Reading Progress Bar Calculation
  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollTop;
      const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      if (windowHeight > 0) {
        const scrollPercent = (totalScroll / windowHeight) * 100;
        setScrollProgress(scrollPercent);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!post) {
    return <Navigate to="/blog" replace />;
  }

  const relatedPosts = getRelatedPosts(post.slug, 3);
  const siteUrl = 'https://academy.netcradus.com';
  const postUrl = `${siteUrl}/blog/${post.slug}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleShareLinkedIn = () => {
    window.open(
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`,
      '_blank',
      'noopener,noreferrer'
    );
  };

  const handleShareTwitter = () => {
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(window.location.href)}`,
      '_blank',
      'noopener,noreferrer'
    );
  };

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

  // Structured Data Schemas (Article + FAQ + Breadcrumb)
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': postUrl,
    },
    headline: post.title,
    description: post.metaDescription,
    image: `${siteUrl}${post.coverImage || '/images/cyber.png'}`,
    author: {
      '@type': 'Organization',
      name: post.author.name,
      url: siteUrl,
    },
    publisher: {
      '@type': 'EducationalOrganization',
      name: 'Netcradus Academy',
      logo: {
        '@type': 'ImageObject',
        url: `${siteUrl}/images/logo.png`,
      },
    },
    datePublished: post.publishedDate,
    dateModified: post.lastUpdated,
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
        name: 'Knowledge Hub',
        item: `${siteUrl}/blog`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: post.title,
        item: postUrl,
      },
    ],
  };

  const faqSchema = post.faqs && post.faqs.length > 0 ? {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: post.faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  } : null;

  const combinedSchema = [articleSchema, breadcrumbSchema, ...(faqSchema ? [faqSchema] : [])];

  return (
    <>
      <SEOHead
        title={post.seoTitle || `${post.title} | Netcradus Academy`}
        description={post.metaDescription}
        keywords={`${post.category}, Netcradus Academy, ${post.title}, Cyber Security India, AI Courses, ${(post.tags || []).join(', ')}`}
        canonical={postUrl}
        ogType="article"
        schema={combinedSchema}
      />

      {/* Pinned Scroll Reading Progress Bar */}
      <div
        className="kh-read-progress"
        style={{ width: `${scrollProgress}%` }}
        role="progressbar"
        aria-valuenow={Math.round(scrollProgress)}
        aria-valuemin="0"
        aria-valuemax="100"
      />

      <article className="kh-page">
        <div className="kh-article-container">
          
          {/* 1. Breadcrumbs Navigation */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px', paddingBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
            <nav aria-label="Breadcrumb" className="kh-breadcrumbs" style={{ margin: 0 }}>
              <Link to="/" className="kh-crumb-link">
                <i className="fa-solid fa-house"></i>
                <span>Home</span>
              </Link>
              <span className="kh-crumb-sep">/</span>
              <Link to="/blog" className="kh-crumb-link">
                Knowledge Hub
              </Link>
              <span className="kh-crumb-sep">/</span>
              <span className="kh-crumb-current">{post.category}</span>
            </nav>

            <Link
              to="/blog"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: 600, color: '#f59e0b', textDecoration: 'none' }}
            >
              <i className="fa-solid fa-arrow-left"></i>
              <span>All Guides</span>
            </Link>
          </div>

          {/* 2. Editorial Header */}
          <header className="kh-article-header">
            {/* Metadata Badges */}
            <div className="kh-meta-row" style={{ marginBottom: '16px' }}>
              <span className={getCategoryBadgeClass(post.category)}>
                {post.category}
              </span>
              <span className="kh-pill-blur" style={{ padding: '3px 10px' }}>
                <i className="fa-regular fa-clock" style={{ color: '#f59e0b', marginRight: '5px' }}></i>
                {post.readTime}
              </span>
              <span style={{ color: '#94a3b8', fontSize: '0.78rem' }}>
                <i className="fa-regular fa-calendar" style={{ marginRight: '5px' }}></i>
                Published: {post.publishedDate}
              </span>
              <span style={{ color: '#64748b' }}>•</span>
              <span style={{ color: '#94a3b8', fontSize: '0.78rem' }}>
                Updated: {post.lastUpdated}
              </span>
            </div>

            {/* H1 Title */}
            <h1 className="kh-article-title">
              {post.title}
            </h1>

            {/* Subtitle / Lead Excerpt */}
            <p className="kh-article-lead">
              {post.metaDescription}
            </p>

            {/* Author Profile Card & Social Actions */}
            <div className="kh-author-bar">
              <div className="kh-author-snippet">
                <img
                  src={post.author.avatar || '/images/logo.png'}
                  alt="Netcradus Academy"
                  className="kh-author-avatar"
                  style={{ width: '42px', height: '42px' }}
                />
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span className="kh-author-name">{post.author.name}</span>
                    <span style={{ color: '#f59e0b', fontSize: '0.75rem' }} title="Verified Netcradus Author">✓</span>
                  </div>
                  <div className="kh-author-sub">{post.author.role} • Netcradus Academy (Sector 63, Noida)</div>
                </div>
              </div>

              {/* Share Utility Buttons */}
              <div className="kh-share-actions">
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="kh-share-btn"
                  title="Copy direct link to clipboard"
                >
                  <i className={`fa-solid ${copiedLink ? 'fa-check' : 'fa-link'}`} style={{ color: copiedLink ? '#10b981' : 'inherit' }}></i>
                  <span>{copiedLink ? 'Copied!' : 'Copy Link'}</span>
                </button>
                <button
                  type="button"
                  onClick={handleShareLinkedIn}
                  className="kh-share-icon-btn"
                  title="Share on LinkedIn"
                  aria-label="Share on LinkedIn"
                >
                  <i className="fa-brands fa-linkedin-in"></i>
                </button>
                <button
                  type="button"
                  onClick={handleShareTwitter}
                  className="kh-share-icon-btn"
                  title="Share on X / Twitter"
                  aria-label="Share on X (Twitter)"
                >
                  <i className="fa-brands fa-x-twitter"></i>
                </button>
              </div>
            </div>
          </header>

          {/* 3. Featured Cover Image Banner */}
          <div className="kh-banner-wrapper">
            <img
              src={post.coverImage || '/images/cyber.png'}
              alt={post.title}
              className="kh-banner-img"
            />
            <div className="kh-media-overlay"></div>
            <div className="kh-banner-caption">
              <span><strong>Netcradus Academy Research Publication</strong> • Practical Engineering Series</span>
              <span style={{ color: '#f59e0b', fontFamily: 'monospace' }}>Sector 63, Noida Labs</span>
            </div>
          </div>

          {/* 4. AEO Executive Direct Answer Callout */}
          {post.quickAnswer && (
            <div className="kh-exec-briefing">
              <div className="kh-briefing-label">
                <i className="fa-solid fa-bolt-lightning"></i>
                <span>DIRECT ANSWER / EXECUTIVE BRIEFING</span>
              </div>
              <p className="kh-briefing-text">
                {post.quickAnswer}
              </p>
            </div>
          )}

          {/* 5. Key Takeaways Checklist Box */}
          {post.keyTakeaways && post.keyTakeaways.length > 0 && (
            <div className="kh-key-takeaways">
              <h3 className="kh-takeaways-heading">
                <i className="fa-solid fa-list-check"></i>
                <span>Core Insights &amp; Practical Takeaways</span>
              </h3>
              <ul className="kh-takeaways-list">
                {post.keyTakeaways.map((takeaway, idx) => (
                  <li key={idx} className="kh-takeaway-item">
                    <i className="fa-solid fa-check"></i>
                    <span>{takeaway}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* 6. Interactive Table of Contents */}
          <nav aria-label="Table of Contents" className="kh-toc">
            <div className="kh-toc-heading">
              <i className="fa-solid fa-list-ul"></i>
              <span>Table of Contents ({post.contentSections.length + (post.faqs ? 1 : 0)} Sections)</span>
            </div>
            <ol className="kh-toc-list">
              {post.contentSections.map((sec, idx) => (
                <li key={idx} className="kh-toc-item">
                  <a href={`#section-${idx}`}>
                    {sec.heading}
                  </a>
                </li>
              ))}
              {post.faqs && post.faqs.length > 0 && (
                <li className="kh-toc-item">
                  <a href="#frequently-asked-questions">
                    Frequently Asked Questions (FAQs)
                  </a>
                </li>
              )}
            </ol>
          </nav>

          {/* 7. Main Article Prose Sections */}
          <div className="kh-prose-container">
            {post.contentSections.map((sec, idx) => (
              <section key={idx} id={`section-${idx}`} className="kh-content-section">
                <h2 className="kh-content-heading">
                  <span className="kh-section-num">{idx + 1}</span>
                  <span>{sec.heading}</span>
                </h2>

                {sec.text && (
                  <div className="kh-prose-text">
                    {sec.text}
                  </div>
                )}

                {/* Structured Data Comparison Table */}
                {sec.table && (
                  <div className="kh-data-table-wrap">
                    <table className="kh-data-table">
                      <thead>
                        <tr>
                          {sec.table.headers.map((h, i) => (
                            <th key={i}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {sec.table.rows.map((row, rIdx) => (
                          <tr key={rIdx}>
                            {row.map((cell, cIdx) => (
                              <td
                                key={cIdx}
                                style={cIdx === 0 ? { fontWeight: 700, color: '#ffffff', background: 'rgba(15, 23, 42, 0.4)' } : {}}
                              >
                                {cell}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            ))}
          </div>

          {/* 8. Interactive FAQ Accordion */}
          {post.faqs && post.faqs.length > 0 && (
            <section id="frequently-asked-questions" className="kh-content-section" style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '40px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
                <i className="fa-solid fa-circle-question" style={{ color: '#f59e0b', fontSize: '1.25rem' }}></i>
                <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
                  Frequently Asked Questions
                </h2>
              </div>

              <div>
                {post.faqs.map((faq, i) => {
                  const isOpen = activeFaq === i;
                  return (
                    <div key={i} className="kh-faq-item">
                      <button
                        type="button"
                        onClick={() => setActiveFaq(isOpen ? null : i)}
                        className="kh-faq-trigger"
                      >
                        <span style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                          <span style={{ color: '#f59e0b', fontWeight: 700 }}>Q{i + 1}:</span>
                          <span>{faq.question}</span>
                        </span>
                        <i className={`fa-solid fa-chevron-down ${isOpen ? 'rotated' : ''}`} style={{ fontSize: '0.75rem', color: '#f59e0b', transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s ease' }}></i>
                      </button>
                      
                      {isOpen && (
                        <div className="kh-faq-answer">
                          {faq.answer}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* 9. Related Netcradus Programmes */}
          {post.relatedProgrammeSlugs && post.relatedProgrammeSlugs.length > 0 && (
            <section style={{ margin: '54px 0', padding: '36px', background: 'linear-gradient(135deg, #0d1527 0%, #070c18 100%)', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: '20px', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '20px', marginBottom: '24px', flexWrap: 'wrap' }}>
                <div>
                  <span className="kh-eyebrow" style={{ marginBottom: '8px' }}>
                    <i className="fa-solid fa-graduation-cap"></i>
                    <span>CAREER ACCELERATION</span>
                  </span>
                  <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', fontWeight: 800, color: '#ffffff', margin: '6px 0' }}>
                    Related Netcradus Training Programmes
                  </h3>
                  <p style={{ fontSize: '0.88rem', color: '#94a3b8', margin: 0, maxWidth: '580px', lineHeight: 1.6 }}>
                    Apply the practical frameworks from this guide in physical cyber labs at Sector 63, Noida.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => openModal && openModal('admissions')}
                  className="kh-btn-primary-glow"
                  style={{ padding: '10px 20px', fontSize: '0.75rem' }}
                >
                  <span>Enquire Now</span>
                  <i className="fa-solid fa-arrow-right"></i>
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
                {post.relatedProgrammeSlugs.map((slug) => {
                  const prog = getProgrammeBySlug(slug);
                  if (!prog) return null;
                  return (
                    <div
                      key={slug}
                      style={{ background: '#090e1c', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '14px', padding: '18px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
                    >
                      <div>
                        <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#f59e0b', textTransform: 'uppercase', letterSpacing: '0.6px', display: 'block', marginBottom: '6px' }}>
                          {prog.badge || 'Professional Track'}
                        </span>
                        <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '0.98rem', fontWeight: 700, color: '#ffffff', margin: '0 0 8px', lineHeight: 1.35 }}>
                          {prog.title}
                        </h4>
                        <p style={{ fontSize: '0.78rem', color: '#94a3b8', lineHeight: 1.5, margin: '0 0 14px' }}>
                          {prog.tagline}
                        </p>
                      </div>

                      <Link
                        to={`/programmes/${slug}`}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', fontWeight: 700, color: '#f59e0b', textDecoration: 'none' }}
                      >
                        <span>View Curriculum</span>
                        <i className="fa-solid fa-chevron-right" style={{ fontSize: '0.7rem' }}></i>
                      </Link>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* 10. Direct Admissions Counselling Form */}
          <section style={{ margin: '54px 0', padding: '36px', background: '#0a101f', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '20px' }}>
            <div style={{ textAlign: 'center', marginBottom: '28px' }}>
              <span className="kh-eyebrow" style={{ marginBottom: '8px' }}>
                <i className="fa-solid fa-envelope-open-text"></i>
                <span>DIRECT ADMISSIONS DESK</span>
              </span>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.6rem', fontWeight: 800, color: '#ffffff', margin: '6px 0' }}>
                Speak With A Cyber Security &amp; AI Career Advisor
              </h3>
              <p style={{ fontSize: '0.88rem', color: '#94a3b8', maxWidth: '520px', margin: '0 auto', lineHeight: 1.6 }}>
                Get personalized track recommendations, batch schedules, syllabus breakdowns, and lab tour access in Sector 63, Noida.
              </p>
            </div>

            <EnquiryForm source={`Knowledge Hub Article: ${post.title}`} />
          </section>

          {/* 11. Related Technical Guides (3-Card Footer) */}
          {relatedPosts && relatedPosts.length > 0 && (
            <section style={{ marginTop: '54px', paddingTop: '36px', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '22px' }}>
                <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.35rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
                  Related Research &amp; Guides
                </h3>
                <Link
                  to="/blog"
                  style={{ fontSize: '0.78rem', fontWeight: 700, color: '#f59e0b', textDecoration: 'none' }}
                >
                  View All Guides &rarr;
                </Link>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
                {relatedPosts.map((rPost) => (
                  <article key={rPost.slug} className="kh-card">
                    <div>
                      <div className="kh-card-thumb-wrap">
                        <img
                          src={rPost.coverImage || '/images/cyber.png'}
                          alt={rPost.title}
                          className="kh-card-img"
                        />
                        <div className="kh-media-overlay"></div>
                        <div className="kh-card-top-pills">
                          <span className={getCategoryBadgeClass(rPost.category)}>
                            {rPost.category}
                          </span>
                        </div>
                      </div>

                      <div className="kh-card-body" style={{ padding: '16px' }}>
                        <h4 className="kh-card-title" style={{ fontSize: '0.98rem' }}>
                          <Link to={`/blog/${rPost.slug}`}>
                            {rPost.title}
                          </Link>
                        </h4>
                        <p className="kh-card-desc" style={{ fontSize: '0.78rem', WebkitLineClamp: 2 }}>
                          {rPost.metaDescription}
                        </p>
                      </div>
                    </div>

                    <div className="kh-card-footer" style={{ padding: '12px 16px' }}>
                      <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{rPost.readTime}</span>
                      <Link to={`/blog/${rPost.slug}`} className="kh-read-btn" style={{ fontSize: '0.74rem' }}>
                        <span>Read</span>
                        <i className="fa-solid fa-arrow-right"></i>
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          )}

        </div>
      </article>
    </>
  );
}
