import React, { useState } from 'react';
import { useApp } from '../App';
import { academyService } from '../services/academyService';

export default function Contact() {
  const { showToast } = useApp();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    interestedCourse: '',
    message: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg('');

    try {
      const payload = {
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        interestedCourse: formData.interestedCourse || 'General Academic Counseling',
        message: formData.message,
        source: 'contact_page',
      };

      const result = await academyService.submitInquiry(payload);
      showToast(result.message || 'Thank you! Your career counseling inquiry has been received.');
      setFormData({
        fullName: '',
        email: '',
        phone: '',
        interestedCourse: '',
        message: '',
      });
    } catch (err) {
      console.error('[Contact Form Error]:', err);
      setErrorMsg(err.message || 'Unable to submit inquiry right now. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="contact-page">
      {/* PAGE HEADER */}
      <section className="page-banner-section">
        <div className="container text-center">
          <span className="section-badge">GET IN TOUCH</span>
          <h1 className="page-title">Contact Career Desk</h1>
          <p className="page-subtitle">Speak with our certified tech advisors for personalized course counseling.</p>
        </div>
      </section>

      {/* CONTACT US SECTION */}
      <section className="section contact-section" id="contact">
        <div className="container">
          <div className="contact-grid">
            <div className="contact-info">
              <span className="section-badge">CAREER COUNSELING</span>
              <h2 className="section-title">Talk to Our Tech Career Expert</h2>
              <p className="contact-text">
                Whether you want to select the right course, inquire about fees, or schedule a campus visit, our career counselors are here to help you.
              </p>

              <div className="info-items">
                <div className="info-item">
                  <div className="info-icon"><i className="fa-solid fa-phone"></i></div>
                  <div>
                    <h5>Call Us Toll-Free</h5>
                    <p>7290909574 (Mon - Sat, 9 AM - 8 PM)</p>
                  </div>
                </div>

                <div className="info-item">
                  <div className="info-icon"><i className="fa-regular fa-envelope"></i></div>
                  <div>
                    <h5>Email Support</h5>
                    <p>academy@netcradus.com</p>
                  </div>
                </div>

                <div className="info-item">
                  <div className="info-icon"><i className="fa-solid fa-location-dot"></i></div>
                  <div>
                    <h5>Headquarters Location</h5>
                    <p>G-260, Sector 63
Noida, UP, India, India</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="contact-form-card">
              <h3>Request Free Career Counseling</h3>

              {errorMsg && (
                <div style={{ background: 'rgba(255, 50, 50, 0.1)', color: '#ff4757', padding: '10px 14px', borderRadius: '6px', fontSize: '0.88rem', marginBottom: '15px', border: '1px solid rgba(255,50,50,0.3)' }}>
                  <i className="fa-solid fa-circle-exclamation" style={{ marginRight: '6px' }}></i> {errorMsg}
                </div>
              )}

              <form id="mainContactForm" onSubmit={handleSubmit}>
                <div className="form-group">
                  <label htmlFor="cName">Full Name *</label>
                  <input
                    type="text"
                    id="cName"
                    className="form-input"
                    placeholder="e.g. Rahul Sharma"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    required
                  />
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="cEmail">Email Address *</label>
                    <input
                      type="email"
                      id="cEmail"
                      className="form-input"
                      placeholder="name@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="cPhone">Phone Number *</label>
                    <input
                      type="tel"
                      id="cPhone"
                      className="form-input"
                      placeholder="+91 9876543210"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="cCourse">Interested Course *</label>
                  <select
                    id="cCourse"
                    className="form-input"
                    value={formData.interestedCourse}
                    onChange={(e) => setFormData({ ...formData, interestedCourse: e.target.value })}
                    required
                  >
                    <option value="" disabled>Select a course...</option>
                    <option value="Ethical Hacking & VAPT Professional Program">Ethical Hacking & VAPT</option>
                    <option value="Artificial Intelligence & ML with Generative AI">AI & Machine Learning With GenAI</option>
                    <option value="AWS, Azure & Google Cloud Masterclass">AWS, Azure & GCP Cloud</option>
                    <option value="Data Analytics & Visualization Masterclass">Data Science & Analytics</option>
                    <option value="Full Stack MERN & Next.js Development">Full Stack MERN Development</option>
                    <option value="SOC Analyst & Incident Response Specialist">SOC Analyst & Incident Response</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="cMessage">Your Message / Query</label>
                  <textarea
                    id="cMessage"
                    className="form-input"
                    rows={3}
                    placeholder="Tell us about your background or requirements..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  ></textarea>
                </div>

                <button type="submit" className="btn btn-cyan btn-block" disabled={submitting}>
                  {submitting ? (
                    <span><i className="fa-solid fa-spinner fa-spin" style={{ marginRight: '8px' }}></i> SUBMITTING...</span>
                  ) : (
                    'SUBMIT REQUEST'
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
