import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { trackPageView } from '../utils/analytics';

/**
 * SEOHead - Dynamic Document Title, Meta, and JSON-LD Schema Manager
 *
 * @param {Object} props
 * @param {string} props.title - Page title
 * @param {string} props.description - Meta description
 * @param {string} props.keywords - Meta keywords
 * @param {string} props.canonical - Canonical URL (optional, defaults to current pathname)
 * @param {string} props.ogType - Open Graph type (website, article, course)
 * @param {string} props.ogImage - Open Graph image URL
 * @param {Object|Array} props.schema - JSON-LD Schema object(s) to inject
 */
export default function SEOHead({
  title = 'Netcradus Academy | Cyber Security & AI Courses in India',
  description = 'Explore career-focused Cyber Security, Ethical Hacking, VAPT, SOC Analyst, AI, DevSecOps and Agentic AI programmes at Netcradus Academy.',
  keywords = 'Cyber Security Courses in India, Ethical Hacking Training, VAPT Course, SOC Analyst Training, AI Courses in India, Agentic AI, DevSecOps, Netcradus Academy Noida Delhi NCR',
  canonical,
  ogType = 'website',
  ogImage = 'https://academy.netcradus.com/images/logo.png',
  schema = null,
}) {
  const location = useLocation();
  const siteUrl = 'https://academy.netcradus.com';
  const currentCanonical = canonical || `${siteUrl}${location.pathname === '/' ? '' : location.pathname}`;

  useEffect(() => {
    // 1. Update Document Title
    document.title = title;

    // Helper to create or update meta tags
    const setMetaTag = (attrName, attrValue, content) => {
      if (!content) return;
      let el = document.querySelector(`meta[${attrName}="${attrValue}"]`);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attrName, attrValue);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    // 2. Standard Meta Tags
    setMetaTag('name', 'description', description);
    setMetaTag('name', 'keywords', keywords);
    setMetaTag('name', 'author', 'Netcradus Academy');
    setMetaTag('name', 'robots', 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1');

    // 3. Canonical Link Tag
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', currentCanonical);

    // 4. Open Graph Tags
    setMetaTag('property', 'og:title', title);
    setMetaTag('property', 'og:description', description);
    setMetaTag('property', 'og:url', currentCanonical);
    setMetaTag('property', 'og:type', ogType);
    setMetaTag('property', 'og:image', ogImage);
    setMetaTag('property', 'og:site_name', 'Netcradus Academy');
    setMetaTag('property', 'og:locale', 'en_IN');

    // 5. Twitter Card Tags
    setMetaTag('name', 'twitter:card', 'summary_large_image');
    setMetaTag('name', 'twitter:title', title);
    setMetaTag('name', 'twitter:description', description);
    setMetaTag('name', 'twitter:url', currentCanonical);
    setMetaTag('name', 'twitter:image', ogImage);

    // 6. JSON-LD Structured Data Injection
    const scriptId = 'page-structured-data';
    let scriptTag = document.getElementById(scriptId);

    if (schema) {
      if (!scriptTag) {
        scriptTag = document.createElement('script');
        scriptTag.id = scriptId;
        scriptTag.type = 'application/ld+json';
        document.head.appendChild(scriptTag);
      }
      scriptTag.textContent = JSON.stringify(schema);
    } else if (scriptTag) {
      scriptTag.remove();
    }

    // 7. Track page view in analytics
    trackPageView(location.pathname, title);

    // Scroll to top on navigation if needed
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [title, description, keywords, currentCanonical, ogType, ogImage, schema, location.pathname]);

  return null;
}

