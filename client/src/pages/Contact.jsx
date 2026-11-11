import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../App';
import { CONTACT_INFO, PROGRAMMES } from '../data/programmesData';
import { academyService } from '../services/academyService';
import SEOHead from '../components/SEOHead';

export default function Contact() {
  const { showToast } = useApp() || {};
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    interestedCourse: PROGRAMMES[0].title,
    qualification: '',
    message: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (hasSubmitted) return;

    if (!formData.fullName.trim() || formData.fullName.trim().length < 2) {
      setErrorMsg('Please enter your full name (at least 2 characters).');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim() || !emailRegex.test(formData.email.trim())) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }
    const cleanPhone = formData.phone.replace(/[\s-]/g, '');
    if (!cleanPhone || cleanPhone.length < 7) {
      setErrorMsg('Please enter a valid mobile number.');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');

    try {
      const payload = {
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        interestedCourse: formData.interestedCourse,
        qualification: formData.qualification.trim(),
        message: formData.message.trim(),
        source: 'contact_page',
      };

      const result = await academyService.submitInquiry(payload);
      setHasSubmitted(true);
      setSuccessMsg(
        result.message ||
          'Thank you! Your message has been received. Our admissions team will contact you shortly.'
      );
      if (showToast) {
        showToast('Enquiry received! Our team will contact you shortly.');
      }
    } catch (err) {
      console.error('[Contact Form Error]:', err);
      setErrorMsg(err.message || 'Unable to submit enquiry right now. Please try again or chat via WhatsApp.');
    } finally {
      setSubmitting(false);
    }
  };

  const whatsappUrl = CONTACT_INFO.getWhatsAppUrl(formData.interestedCourse);

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
        name: 'Contact Us',
        item: 'https://academy.netcradus.com/contact',
      },
    ],
  };

  return (
    <>
      <SEOHead
        title="Contact Netcradus Academy | Noida Training Center & Admissions Desk"
        description="Connect with Netcradus Academy. Visit our physical learning center at G-260, Sector 63, Noida (UP) or call/WhatsApp +91 7290909574 for admissions and curriculum guidance."
        keywords="Netcradus Academy contact, Cyber Security institute Sector 63 Noida, Noida cyber security training, phone +91 7290909574"
        canonical="https://academy.netcradus.com/contact"
        schema={breadcrumbSchema}
      />

      <div className="contact-page">
      {/* PAGE HEADER */}
      <section className="page-banner-section">
        <div className="container text-center">
          <span className="section-badge badge-orange">GET IN TOUCH</span>
          <h1 className="page-title">Contact Netcradus Academy</h1>
          <p className="page-subtitle">
            Speak with our admissions counselors and technical advisors for curriculum guidance and batch details.
          </p>
        </div>
      </section>

      {/* CONTACT MAIN SECTION */}
      <section className="section contact-section" id="contact">
        <div className="container">
          <div className="contact-grid">
            {/* Contact Information Cards */}
            <div className="contact-info">
              <span className="section-badge badge-cyan">ADMISSIONS & SUPPORT</span>
              <h2 className="section-title">We are Here to Guide Your Career Path</h2>
              <p className="contact-text">
                Whether you need advice on selecting the right programme from our 11 offerings,
                prerequisites, or wish to arrange an institutional batch for your college, our team is available to assist you.
              </p>

              <div className="info-items">
                {/* 1. Phone & WhatsApp */}
                <div className="info-item">
                  <div className="info-icon"><i className="fa-solid fa-phone"></i></div>
                  <div>
                    <h5>Phone & WhatsApp Support</h5>
                    <p>
                      <a href={`tel:${CONTACT_INFO.phoneClean}`}>{CONTACT_INFO.phone}</a>
                    </p>
                    <span className="contact-subtext">Mon - Sat, 9:00 AM - 8:00 PM</span>
                  </div>
                </div>

                {/* 2. Direct Email */}
                <div className="info-item">
                  <div className="info-icon"><i className="fa-regular fa-envelope"></i></div>
                  <div>
                    <h5>Email Admissions Desk</h5>
                    <p>
                      <a href={`mailto:${CONTACT_INFO.email}`}>{CONTACT_INFO.email}</a>
                    </p>
                    <span className="contact-subtext">We reply within 24 business hours</span>
                  </div>
                </div>

                {/* 3. Official Website */}
                <div className="info-item">
                  <div className="info-icon"><i className="fa-solid fa-globe"></i></div>
                  <div>
                    <h5>Official Portal</h5>
                    <p>
                      <a href={`https://${CONTACT_INFO.website}`} target="_blank" rel="noopener noreferrer">
                        {CONTACT_INFO.website}
                      </a>
                    </p>
                    <span className="contact-subtext">Netcradus Academy Official Website</span>
                  </div>
                </div>

                {/* 4. Headquarters Location */}
                <div className="info-item">
                  <div className="info-icon"><i className="fa-solid fa-location-dot"></i></div>
                  <div>
                    <h5>Headquarters & Learning Hub</h5>
                    <p>{CONTACT_INFO.address}</p>
                    <span className="contact-subtext">NCR Technology Centre</span>
                  </div>
                </div>
              </div>

              {/* Direct CTAs */}
              <div className="contact-action-pills">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-whatsapp-direct"
                >
                  <i className="fa-brands fa-whatsapp"></i> WhatsApp Admissions (+91 7290909574)
                </a>
                <Link to="/institutions" className="btn btn-outline-cyan">
                  <i className="fa-solid fa-building-columns"></i> Institution Enquiry
                </Link>
              </div>
            </div>

            {/* Contact & Enquiry Form Card */}
            <div className="contact-form-card">
              <div className="cfc-header">
                <h3>Send an Admissions Enquiry</h3>
                <p>Complete the form below to receive syllabus breakdowns and advisor assistance.</p>
              </div>

              {errorMsg && (
                <div className="ue-alert ue-alert-error" role="alert">
                  <i className="fa-solid fa-triangle-exclamation"></i>
                  <span>{errorMsg}</span>
                </div>
              )}

              {successMsg ? (
                <div className="ue-success-box">
                  <div className="ue-success-icon">
                    <i className="fa-solid fa-circle-check"></i>
                  </div>
                  <h4>Enquiry Received</h4>
                  <p>{successMsg}</p>
                  <div className="ue-success-actions">
                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-whatsapp-direct"
                    >
                      <i className="fa-brands fa-whatsapp"></i> Chat on WhatsApp Now
                    </a>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} noValidate>
                  <div className="form-group">
                    <label>Full Name <span className="req">*</span></label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Rahul Sharma"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Email Address <span className="req">*</span></label>
                      <input
                        type="email"
                        className="form-input"
                        placeholder="e.g. rahul@example.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Mobile Number <span className="req">*</span></label>
                      <input
                        type="tel"
                        className="form-input"
                        placeholder="e.g. +91 98765 43210"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Interested Programme <span className="req">*</span></label>
                    <select
                      className="form-input"
                      value={formData.interestedCourse}
                      onChange={(e) => setFormData({ ...formData, interestedCourse: e.target.value })}
                      required
                    >
                      <optgroup label="Track 1: Offensive Security">
                        <option value="VAPT Analyst">VAPT Analyst</option>
                        <option value="Penetration Tester">Penetration Tester</option>
                      </optgroup>
                      <optgroup label="Track 2: Defence & Governance">
                        <option value="SOC Analyst">SOC Analyst</option>
                        <option value="Cloud Security Analyst">Cloud Security Analyst</option>
                        <option value="GRC Analyst">GRC Analyst</option>
                      </optgroup>
                      <optgroup label="Track 3: Secure Engineering">
                        <option value="AI Security Engineer">AI Security Engineer</option>
                        <option value="DevSecOps">DevSecOps</option>
                      </optgroup>
                      <optgroup label="Track 4: AI & Automation">
                        <option value="AI Developer">AI Developer</option>
                        <option value="AI Automation">AI Automation</option>
                        <option value="Agentic AI">Agentic AI</option>
                        <option value="Prompt Engineer">Prompt Engineer</option>
                      </optgroup>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Current Education / Qualification</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. B.Tech CS / BCA / Working Professional"
                      value={formData.qualification}
                      onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label>Message / Career Goals</label>
                    <textarea
                      className="form-input"
                      rows={3}
                      placeholder="Tell us what you'd like to achieve or ask about batch dates..."
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn btn-cyan btn-block"
                    disabled={submitting}
                  >
                    {submitting ? (
                      <span><i className="fa-solid fa-spinner fa-spin"></i> Submitting...</span>
                    ) : (
                      'SUBMIT ADMISSIONS ENQUIRY'
                    )}
                  </button>

                  <p className="cfc-disclaimer">
                    <i className="fa-solid fa-lock"></i> Your data is stored safely. Submitting this form does not confirm admission or make financial commitments.
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
    </>
  );
}
