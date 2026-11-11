import React, { useState } from 'react';
import { CONTACT_INFO, TRACKS } from '../data/programmesData';
import { academyService } from '../services/academyService';
import SEOHead from '../components/SEOHead';

export default function Institutions() {
  const [formData, setFormData] = useState({
    institutionName: '',
    fullName: '', // Contact Person
    email: '',
    phone: '',
    interestedCourse: 'Institutional College Partnership',
    message: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitted) return;

    if (!formData.institutionName.trim()) {
      setError('Please provide your college or institution name.');
      return;
    }
    if (!formData.fullName.trim()) {
      setError('Please provide the name of the contact person.');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim() || !emailRegex.test(formData.email.trim())) {
      setError('Please provide a valid official email address.');
      return;
    }
    const cleanPhone = formData.phone.replace(/[\s-]/g, '');
    if (!cleanPhone || cleanPhone.length < 7) {
      setError('Please provide a valid phone number.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const payload = {
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        institutionName: formData.institutionName.trim(),
        interestedCourse: 'Institutional Skill Programme / College Workshop',
        message: formData.message.trim(),
        source: 'institution_enquiry',
      };

      const result = await academyService.submitInquiry(payload);
      setSubmitted(true);
      setSuccess(
        result.message ||
          'Thank you! Your institutional programme enquiry has been received. Our academic partnerships team will contact you shortly.'
      );
    } catch (err) {
      console.error('[Institutions Form Error]:', err);
      setError(err.message || 'Unable to submit enquiry right now. Please try again or email us directly.');
    } finally {
      setLoading(false);
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
        name: 'For Institutions',
        item: 'https://academy.netcradus.com/institutions',
      },
    ],
  };

  return (
    <>
      <SEOHead
        title="For Institutions & Universities | Cyber & AI Academic Partnerships – Netcradus"
        description="Partner with Netcradus Academy to establish state-of-the-art Cyber Security and AI Centers of Excellence, faculty development programmes, and student immersion labs."
        keywords="College cyber security partnership, AI university lab, Netcradus institutional training, faculty development programme India"
        canonical="https://academy.netcradus.com/institutions"
        schema={breadcrumbSchema}
      />

      <div className="institutions-page">
      {/* PAGE BANNER */}
      <section className="page-banner-section">
        <div className="container text-center">
          <span className="section-badge badge-cyan">ACADEMIC & INSTITUTIONAL PROGRAMMES</span>
          <h1 className="page-title">Build Industry-Ready Technology Skills at Your Institution</h1>
          <p className="page-subtitle">
            Netcradus Academy can discuss workshops, skill programmes and placement-oriented batches for colleges and institutions.
          </p>
        </div>
      </section>

      {/* INSTITUTIONAL OFFERINGS OVERVIEW */}
      <section className="section institutions-overview-section">
        <div className="container">
          <div className="institutions-split-grid">
            <div className="institutions-info-col">
              <span className="section-badge badge-orange">COLLABORATION MODELS</span>
              <h2 className="section-title">
                Equip Your Students with Practical, Enterprise-Grade Competence
              </h2>
              <p className="institutions-lead-text">
                Netcradus Academy can discuss workshops, skill programmes and placement-oriented
                batches for colleges and institutions looking to provide their students with practical
                exposure to cybersecurity, cloud security, and artificial intelligence.
              </p>
              <p className="institutions-body-text">
                Our programmes are built on real-world toolchains, structured virtual ranges, and
                hands-on lab projects. We collaborate with college academic leaders, department heads,
                and placement cells to deliver high-impact training modules tailored to student schedules.
              </p>

              <div className="institutions-offerings-list">
                <div className="inst-offering-item">
                  <div className="inst-offering-icon">
                    <i className="fa-solid fa-chalkboard-user"></i>
                  </div>
                  <div>
                    <h4>Hands-on Technical Workshops</h4>
                    <p>Intensive 2 to 5-day immersive workshops on ethical hacking, web security (OWASP Top 10), or agentic AI workflows.</p>
                  </div>
                </div>

                <div className="inst-offering-item">
                  <div className="inst-offering-icon">
                    <i className="fa-solid fa-laptop-code"></i>
                  </div>
                  <div>
                    <h4>Semester Skill Programmes</h4>
                    <p>Modular weekend or semester-integrated batches covering offensive security, SOC analysis, DevSecOps, or AI development.</p>
                  </div>
                </div>

                <div className="inst-offering-item">
                  <div className="inst-offering-icon">
                    <i className="fa-solid fa-graduation-cap"></i>
                  </div>
                  <div>
                    <h4>Placement-Oriented Batches</h4>
                    <p>Capstone-driven cohorts designed to prepare pre-final and final year engineering and BCA/MCA students for technical interviews.</p>
                  </div>
                </div>
              </div>

              <div className="inst-contact-box">
                <div className="icb-item">
                  <i className="fa-regular fa-envelope"></i>
                  <div>
                    <span>Institutional Enquiries Email:</span>
                    <a href={`mailto:${CONTACT_INFO.email}?subject=Institutional%20Training%20Enquiry`}>
                      {CONTACT_INFO.email}
                    </a>
                  </div>
                </div>
                <div className="icb-item">
                  <i className="fa-solid fa-phone"></i>
                  <div>
                    <span>Phone & WhatsApp Coordination:</span>
                    <a href={`tel:${CONTACT_INFO.phoneClean}`}>{CONTACT_INFO.phone}</a>
                  </div>
                </div>
              </div>
            </div>

            {/* INSTITUTIONAL ENQUIRY FORM */}
            <div className="institutions-form-col">
              <div className="institutional-enquiry-card">
                <div className="iec-header">
                  <h3>Institutional Programme Enquiry</h3>
                  <p>Submit your institution's details to schedule an exploratory discussion.</p>
                </div>

                {error && (
                  <div className="ue-alert ue-alert-error" role="alert">
                    <i className="fa-solid fa-triangle-exclamation"></i>
                    <span>{error}</span>
                  </div>
                )}

                {success ? (
                  <div className="ue-success-box">
                    <div className="ue-success-icon">
                      <i className="fa-solid fa-circle-check"></i>
                    </div>
                    <h4>Enquiry Submitted Successfully</h4>
                    <p>{success}</p>
                    <div className="ue-success-actions">
                      <a
                        href={`https://wa.me/917290909574?text=${encodeURIComponent(
                          `Hello Netcradus Academy, I have submitted an institutional training enquiry on behalf of ${formData.institutionName}.`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-whatsapp-direct"
                      >
                        <i className="fa-brands fa-whatsapp"></i> WhatsApp Institutional Desk
                      </a>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="iec-form" noValidate>
                    <div className="ue-field-group">
                      <label className="ue-label" htmlFor="inst-name">
                        College / Institution Name <span className="req">*</span>
                      </label>
                      <div className="ue-input-wrapper">
                        <i className="fa-solid fa-building-columns ue-field-icon"></i>
                        <input
                          id="inst-name"
                          type="text"
                          className="ue-input"
                          placeholder="e.g. National Institute of Technology"
                          value={formData.institutionName}
                          onChange={(e) => setFormData({ ...formData, institutionName: e.target.value })}
                          required
                        />
                      </div>
                    </div>

                    <div className="ue-field-group">
                      <label className="ue-label" htmlFor="inst-contact">
                        Contact Person (Name & Designation) <span className="req">*</span>
                      </label>
                      <div className="ue-input-wrapper">
                        <i className="fa-regular fa-user ue-field-icon"></i>
                        <input
                          id="inst-contact"
                          type="text"
                          className="ue-input"
                          placeholder="e.g. Dr. Rajesh Kumar, HOD Computer Science"
                          value={formData.fullName}
                          onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                          required
                        />
                      </div>
                    </div>

                    <div className="ue-fields-row">
                      <div className="ue-field-group">
                        <label className="ue-label" htmlFor="inst-email">
                          Official Email Address <span className="req">*</span>
                        </label>
                        <div className="ue-input-wrapper">
                          <i className="fa-regular fa-envelope ue-field-icon"></i>
                          <input
                            id="inst-email"
                            type="email"
                            className="ue-input"
                            placeholder="e.g. hod.cs@institution.edu"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            required
                          />
                        </div>
                      </div>

                      <div className="ue-field-group">
                        <label className="ue-label" htmlFor="inst-phone">
                          Phone / Mobile Number <span className="req">*</span>
                        </label>
                        <div className="ue-input-wrapper">
                          <i className="fa-solid fa-phone ue-field-icon"></i>
                          <input
                            id="inst-phone"
                            type="tel"
                            className="ue-input"
                            placeholder="e.g. +91 98765 43210"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            required
                          />
                        </div>
                      </div>
                    </div>

                    <div className="ue-field-group">
                      <label className="ue-label" htmlFor="inst-msg">
                        Collaboration Interests / Message
                      </label>
                      <textarea
                        id="inst-msg"
                        className="ue-textarea"
                        rows={3}
                        placeholder="Please describe your requirements, student batch size, preferred tracks, or proposed timelines..."
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      />
                    </div>

                    <button
                      type="submit"
                      className="btn btn-submit-enquiry"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <i className="fa-solid fa-spinner fa-spin"></i> Submitting Institutional Enquiry...
                        </>
                      ) : (
                        <>
                          Submit Institutional Enquiry <i className="fa-solid fa-arrow-right"></i>
                        </>
                      )}
                    </button>

                    <p className="ue-disclaimer">
                      <i className="fa-solid fa-shield-halved"></i> Netcradus Academy engages directly with authorized representatives to tailor workshop curricula and batch calendars.
                    </p>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TRACKS COVERED FOR INSTITUTIONS */}
      <section className="section inst-tracks-section">
        <div className="container">
          <div className="section-header text-center">
            <span className="section-badge badge-emerald">AVAILABLE DOMAINS</span>
            <h2 className="section-title">Tracks Available for Institutional Delivery</h2>
            <p className="section-subtitle">
              Choose from any of our four emerging technology domains for college batches.
            </p>
          </div>

          <div className="tracks-grid-4">
            {TRACKS.map((t) => (
              <div key={t.id} className="inst-track-card" style={{ '--track-accent': t.accentColor }}>
                <div className="itc-icon" style={{ color: t.accentColor }}>
                  <i className={t.icon}></i>
                </div>
                <h3>{t.title}</h3>
                <span className="itc-count">{t.badge}</span>
                <p>{t.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
    </>
  );
}

