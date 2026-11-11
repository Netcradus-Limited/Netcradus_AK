/**
 * Analytics and Event Tracking Utility for Netcradus Academy
 * Supports Google Analytics 4 (gtag), Google Tag Manager (dataLayer), and console fallbacks
 */

export const trackEvent = (eventName, params = {}) => {
  try {
    if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
      window.gtag('event', eventName, params);
    } else if (typeof window !== 'undefined' && Array.isArray(window.dataLayer)) {
      window.dataLayer.push({
        event: eventName,
        ...params,
        timestamp: new Date().toISOString(),
      });
    } else {
      // In development or if ad blocker is active, log cleanly
      if (process.env.NODE_ENV !== 'production') {
        console.debug(`[Analytics Event] ${eventName}:`, params);
      }
    }
  } catch (err) {
    console.warn('[Analytics Error]', err);
  }
};

export const trackPageView = (pagePath, pageTitle) => {
  trackEvent('page_view', {
    page_path: pagePath,
    page_title: pageTitle,
    page_location: typeof window !== 'undefined' ? window.location.href : '',
  });
};

export const trackEnquiry = (programmeOrTrack, source = 'general_form') => {
  trackEvent('generate_lead', {
    programme: programmeOrTrack,
    lead_source: source,
    value: 1,
    currency: 'INR',
  });
};

export const trackBrochureDownload = (programmeTitle) => {
  trackEvent('download_brochure', {
    item_name: programmeTitle,
    item_category: 'Curriculum Brochure',
  });
};

export const trackWhatsAppClick = (sourcePage) => {
  trackEvent('whatsapp_click', {
    source_page: sourcePage,
    contact_number: '+91 7290909574',
  });
};

