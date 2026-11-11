import React, { useState, useEffect } from 'react';
import { useApp } from '../App';
import { useAuth } from '../context/AuthContext';
import { PROGRAMMES, CONTACT_INFO, getProgrammeBySlug } from '../data/programmesData';
import { academyService } from '../services/academyService';

export default function Modals() {
  const {
    activeModal,
    activeDrawer,
    closeModal,
    closeDrawer,
    enrollCourseName,
    setEnrollCourseName,
    selectedCourseKey,
    showToast,
    courses,
  } = useApp() || {};

  const { user } = useAuth() || {};

  // Resolve selected course
  const localProg = getProgrammeBySlug(selectedCourseKey);
  const apiCourse = (courses || []).find((c) => c.slug === selectedCourseKey);

  const selectedCourse = localProg || (apiCourse
    ? {
        title: apiCourse.title,
        track: apiCourse.category,
        category: apiCourse.category,
        thumbnail: apiCourse.thumbnail || '/images/cyber.png',
        tagline: apiCourse.tagline || '',
        overview: apiCourse.shortDescription || apiCourse.description,
        idealFor: apiCourse.level || 'Beginners to advanced',
        tools: apiCourse.tools || ['Metasploit', 'Wireshark', 'Python'],
        modules: Array.isArray(apiCourse.curriculum)
          ? apiCourse.curriculum.map((m, idx) => ({ number: idx + 1, title: m, topics: [] }))
          : [],
        careerRoles: apiCourse.roles || ['Security Analyst'],
      }
    : PROGRAMMES[0]);

  // Enrollment / Admissions Form State
  const [enrollForm, setEnrollForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    qualification: '',
    message: '',
  });
  const [enrollSubmitting, setEnrollSubmitting] = useState(false);
  const [enrollError, setEnrollError] = useState('');
  const [enrollSuccess, setEnrollSuccess] = useState('');
  const [enrollSubmitted, setEnrollSubmitted] = useState(false);

  // Auto-prefill authenticated user details & course selection
  useEffect(() => {
    if (activeModal === 'enroll') {
      if (user) {
        setEnrollForm((prev) => ({
          ...prev,
          fullName: user.fullName || user.name || prev.fullName,
          email: user.email || prev.email,
          phone: user.phone || prev.phone,
        }));
      }
      if (!enrollCourseName) {
        setEnrollCourseName(PROGRAMMES[0].title);
      }
      setEnrollError('');
      setEnrollSuccess('');
      setEnrollSubmitted(false);
    }
  }, [activeModal, user, enrollCourseName, setEnrollCourseName]);

  // Quick Enquiry Drawer Form State
  const [enquireForm, setEnquireForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    interestedCourse: PROGRAMMES[0].title,
    qualification: '',
    message: '',
  });
  const [enquireSubmitting, setEnquireSubmitting] = useState(false);
  const [enquireError, setEnquireError] = useState('');
  const [enquireSuccess, setEnquireSuccess] = useState('');
  const [enquireSubmitted, setEnquireSubmitted] = useState(false);

  // Callback Modal State
  const [callForm, setCallForm] = useState({ fullName: '', email: '', phone: '' });
  const [callSubmitting, setCallSubmitting] = useState(false);
  const [callError, setCallError] = useState('');

  // Demo Modal State
  const [demoForm, setDemoForm] = useState({ fullName: '', email: '', phone: '', interestedCourse: 'VAPT Analyst' });
  const [demoSubmitting, setDemoSubmitting] = useState(false);
  const [demoError, setDemoError] = useState('');

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const validatePhone = (phone) => phone.replace(/[\s-]/g, '').length >= 7;

  // 1. ENROLLMENT / ADMISSIONS APPLICATION SUBMISSION
  const handleEnrollSubmit = async (e) => {
    e.preventDefault();
    if (enrollSubmitted) return;

    if (!enrollForm.fullName.trim() || enrollForm.fullName.trim().length < 2) {
      setEnrollError('Please enter your full name (minimum 2 characters).');
      return;
    }
    if (!validateEmail(enrollForm.email)) {
      setEnrollError('Please enter a valid email address.');
      return;
    }
    if (!validatePhone(enrollForm.phone)) {
      setEnrollError('Please enter a valid mobile number.');
      return;
    }

    setEnrollSubmitting(true);
    setEnrollError('');

    try {
      const payload = {
        fullName: enrollForm.fullName.trim(),
        email: enrollForm.email.trim(),
        phone: enrollForm.phone.trim(),
        interestedCourse: enrollCourseName || PROGRAMMES[0].title,
        qualification: enrollForm.qualification.trim(),
        message: enrollForm.message.trim(),
        source: 'admissions_enquiry',
      };

      const result = await academyService.submitInquiry(payload);
      setEnrollSubmitted(true);
      setEnrollSuccess(
        result.message ||
          'Thank you! Your enquiry has been received. Our admissions team will contact you shortly.'
      );
      if (showToast) {
        showToast('Enquiry received! Our team will contact you shortly.');
      }
    } catch (err) {
      console.error('[Enrollment Submission Error]:', err);
      setEnrollError(err.message || 'Unable to submit enquiry right now. Please try again.');
    } finally {
      setEnrollSubmitting(false);
    }
  };

  // 2. QUICK ENQUIRY SUBMISSION (DRAWER)
  const handleEnquireSubmit = async (e) => {
    e.preventDefault();
    if (enquireSubmitted) return;

    if (!enquireForm.fullName.trim() || enquireForm.fullName.trim().length < 2) {
      setEnquireError('Please enter your full name.');
      return;
    }
    if (!validateEmail(enquireForm.email)) {
      setEnquireError('Please enter a valid email address.');
      return;
    }
    if (!validatePhone(enquireForm.phone)) {
      setEnquireError('Please enter a valid phone number.');
      return;
    }

    setEnquireSubmitting(true);
    setEnquireError('');

    try {
      const payload = {
        fullName: enquireForm.fullName.trim(),
        email: enquireForm.email.trim(),
        phone: enquireForm.phone.trim(),
        interestedCourse: enquireForm.interestedCourse,
        qualification: enquireForm.qualification.trim(),
        message: enquireForm.message.trim(),
        source: 'quick_enquiry',
      };

      const result = await academyService.submitInquiry(payload);
      setEnquireSubmitted(true);
      setEnquireSuccess(
        result.message ||
          'Thank you! Your inquiry has been received. An admissions advisor will contact you within 24 hours.'
      );
      if (showToast) {
        showToast('Thank you! Your enquiry has been received.');
      }
    } catch (err) {
      console.error('[Quick Enquiry Error]:', err);
      setEnquireError(err.message || 'Unable to submit inquiry right now. Please try again.');
    } finally {
      setEnquireSubmitting(false);
    }
  };

  // 3. CALLBACK REQUEST SUBMISSION
  const handleCallSubmit = async (e) => {
    e.preventDefault();
    if (!callForm.fullName.trim() || !validatePhone(callForm.phone)) {
      setCallError('Please provide your name and a valid phone number.');
      return;
    }

    setCallSubmitting(true);
    setCallError('');

    try {
      const payload = {
        fullName: callForm.fullName.trim(),
        email: callForm.email ? callForm.email.trim() : '',
        phone: callForm.phone.trim(),
        interestedCourse: 'Callback Request',
        source: 'callback_request',
      };

      const result = await academyService.submitInquiry(payload);
      if (showToast) {
        showToast(result.message || 'Callback request submitted! Our team will call you shortly.');
      }
      setCallForm({ fullName: '', email: '', phone: '' });
      closeModal('call');
    } catch (err) {
      console.error('[Callback Request Error]:', err);
      setCallError(err.message || 'Unable to request callback right now. Please try again.');
    } finally {
      setCallSubmitting(false);
    }
  };

  // 4. DEMO WORKSHOP SUBMISSION
  const handleDemoSubmit = async (e) => {
    e.preventDefault();
    if (!demoForm.fullName.trim() || !validatePhone(demoForm.phone)) {
      setDemoError('Please provide your name and a valid phone number.');
      return;
    }

    setDemoSubmitting(true);
    setDemoError('');

    try {
      const payload = {
        fullName: demoForm.fullName.trim(),
        email: demoForm.email ? demoForm.email.trim() : '',
        phone: demoForm.phone.trim(),
        interestedCourse: demoForm.interestedCourse || 'Live Practical Workshop Demo',
        source: 'workshop_registration',
      };

      const result = await academyService.submitInquiry(payload);
      if (showToast) {
        showToast(result.message || 'Workshop seat registered successfully!');
      }
      setDemoForm({ fullName: '', email: '', phone: '', interestedCourse: 'VAPT Analyst' });
      closeModal('demo');
    } catch (err) {
      console.error('[Demo Workshop Error]:', err);
      setDemoError(err.message || 'Unable to register for demo workshop right now. Please try again.');
    } finally {
      setDemoSubmitting(false);
    }
  };

  return (
    <>
      {/* ====================================================================
          1. ENROLL / ADMISSIONS MODAL
          ==================================================================== */}
      <div className={`modal-backdrop ${activeModal === 'enroll' ? 'active' : ''}`} id="enrollModal">
        <div className="modal-card">
          <button className="modal-close" onClick={() => closeModal('enroll')}>&times;</button>

          <div className="modal-header">
            <div className="modal-icon"><i className="fa-solid fa-graduation-cap"></i></div>
            <h3>Enquire About Admissions</h3>
            <p>Netcradus Emerging Technologies Programme</p>
          </div>

          {enrollError && (
            <div className="modal-alert modal-alert-error">
              <i className="fa-solid fa-circle-exclamation"></i> {enrollError}
            </div>
          )}

          {enrollSuccess ? (
            <div className="modal-success-pane">
              <i className="fa-solid fa-circle-check modal-success-icon"></i>
              <h4>Enquiry Received!</h4>
              <p>{enrollSuccess}</p>
              <div className="modal-success-actions">
                <a
                  href={CONTACT_INFO.getWhatsAppUrl(enrollCourseName)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-whatsapp-direct"
                >
                  <i className="fa-brands fa-whatsapp"></i> Chat on WhatsApp (+91 7290909574)
                </a>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => closeModal('enroll')}
                >
                  Close
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleEnrollSubmit} className="modal-form">
              <div className="form-group">
                <label htmlFor="enrollCourseSelect">Selected Programme *</label>
                <select
                  id="enrollCourseSelect"
                  className="form-input"
                  value={enrollCourseName}
                  onChange={(e) => setEnrollCourseName(e.target.value)}
                  required
                >
                  <optgroup label="Offensive Security">
                    <option value="VAPT Analyst">VAPT Analyst</option>
                    <option value="Penetration Tester">Penetration Tester</option>
                  </optgroup>
                  <optgroup label="Defence & Governance">
                    <option value="SOC Analyst">SOC Analyst</option>
                    <option value="Cloud Security Analyst">Cloud Security Analyst</option>
                    <option value="GRC Analyst">GRC Analyst</option>
                  </optgroup>
                  <optgroup label="Secure Engineering">
                    <option value="AI Security Engineer">AI Security Engineer</option>
                    <option value="DevSecOps">DevSecOps</option>
                  </optgroup>
                  <optgroup label="AI & Automation">
                    <option value="AI Developer">AI Developer</option>
                    <option value="AI Automation">AI Automation</option>
                    <option value="Agentic AI">Agentic AI</option>
                    <option value="Prompt Engineer">Prompt Engineer</option>
                  </optgroup>
                </select>
              </div>

              <div className="form-group">
                <label>Full Name *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Rahul Sharma"
                  value={enrollForm.fullName}
                  onChange={(e) => setEnrollForm({ ...enrollForm, fullName: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Email Address *</label>
                <input
                  type="email"
                  className="form-input"
                  placeholder="e.g. rahul@example.com"
                  value={enrollForm.email}
                  onChange={(e) => setEnrollForm({ ...enrollForm, email: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Mobile Number *</label>
                <input
                  type="tel"
                  className="form-input"
                  placeholder="e.g. +91 98765 43210"
                  value={enrollForm.phone}
                  onChange={(e) => setEnrollForm({ ...enrollForm, phone: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Current Education / Qualification</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. B.Tech / BCA / Working IT Professional"
                  value={enrollForm.qualification}
                  onChange={(e) => setEnrollForm({ ...enrollForm, qualification: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Message / Goals</label>
                <textarea
                  className="form-input"
                  rows={2}
                  placeholder="Any questions on prerequisites or batches?"
                  value={enrollForm.message}
                  onChange={(e) => setEnrollForm({ ...enrollForm, message: e.target.value })}
                />
              </div>

              <button type="submit" className="btn btn-cyan btn-block" disabled={enrollSubmitting}>
                {enrollSubmitting ? (
                  <span><i className="fa-solid fa-spinner fa-spin"></i> SUBMITTING...</span>
                ) : (
                  'SUBMIT ADMISSIONS ENQUIRY'
                )}
              </button>

              <div className="modal-whatsapp-row">
                <span>Or connect directly:</span>
                <a
                  href={CONTACT_INFO.getWhatsAppUrl(enrollCourseName)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="modal-wa-link"
                >
                  <i className="fa-brands fa-whatsapp"></i> WhatsApp +91 7290909574
                </a>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* ====================================================================
          2. COURSE / PROGRAMME DETAILS QUICK MODAL
          ==================================================================== */}
      <div className={`modal-backdrop ${activeModal === 'courseDetail' ? 'active' : ''}`} id="courseDetailModal">
        <div className="modal-card modal-lg">
          <button className="modal-close" onClick={() => closeModal('courseDetail')}>&times;</button>
          {selectedCourse && (
            <div id="courseDetailContent">
              <div className="quick-modal-media">
                <img src={selectedCourse.thumbnail || '/images/cyber.png'} alt={selectedCourse.title} />
                <div className="quick-modal-overlay"></div>
                <div className="quick-modal-header-content">
                  <span className="course-badge">{selectedCourse.track || selectedCourse.category}</span>
                  <h2>{selectedCourse.title}</h2>
                  {selectedCourse.tagline && <p className="quick-modal-tagline">“{selectedCourse.tagline}”</p>}
                </div>
              </div>

              <div className="quick-modal-body">
                <p className="quick-modal-overview">{selectedCourse.overview}</p>

                <div className="quick-modal-info-grid">
                  <div>
                    <h5>Ideal For</h5>
                    <p>{selectedCourse.idealFor}</p>
                  </div>
                  <div>
                    <h5>Target Career Roles</h5>
                    <p>{selectedCourse.careerRoles ? selectedCourse.careerRoles.join(', ') : 'Security Analyst'}</p>
                  </div>
                </div>

                <h4>Tools & Technologies Covered</h4>
                <div className="tools-chips-row">
                  {(selectedCourse.tools || []).map((t, idx) => (
                    <span key={idx} className="tool-chip-badge">{t}</span>
                  ))}
                </div>

                <h4>Core Curriculum Modules</h4>
                <div className="curriculum-preview-list">
                  {(selectedCourse.modules || []).map((m, idx) => (
                    <div key={idx} className="curr-preview-item">
                      <i className="fa-solid fa-angle-right"></i>
                      <span>Module {m.number || idx + 1}: {m.title}</span>
                    </div>
                  ))}
                </div>

                <div className="quick-modal-actions">
                  <button
                    type="button"
                    className="btn btn-cyan btn-block"
                    onClick={() => {
                      closeModal('courseDetail');
                      if (setEnrollCourseName) {
                        setEnrollCourseName(selectedCourse.title);
                      }
                      setTimeout(() => closeModal('enroll', true), 100);
                    }}
                  >
                    ENQUIRE ABOUT THIS PROGRAMME
                  </button>
                  <a
                    href={CONTACT_INFO.getWhatsAppUrl(selectedCourse.title)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-outline btn-block"
                  >
                    <i className="fa-brands fa-whatsapp"></i> CHAT WITH ADVISOR
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ====================================================================
          3. CALL ADVISORY MODAL
          ==================================================================== */}
      <div className={`modal-backdrop ${activeModal === 'call' ? 'active' : ''}`} id="callModal">
        <div className="modal-card">
          <button className="modal-close" onClick={() => closeModal('call')}>&times;</button>
          <div className="modal-header">
            <div className="modal-icon"><i className="fa-solid fa-phone-volume"></i></div>
            <h3>Contact Admissions Advisory</h3>
            <p>Connect with a Netcradus Academy advisor</p>
          </div>

          <div className="direct-call-box">
            <a href={`tel:${CONTACT_INFO.phoneClean}`} className="call-number-link">
              <i className="fa-solid fa-phone"></i> {CONTACT_INFO.phone}
            </a>
            <div className="toll-free-tag">Phone & WhatsApp Admissions Desk (Mon-Sat, 9am - 8pm)</div>
          </div>

          {callError && (
            <div className="modal-alert modal-alert-error">
              <i className="fa-solid fa-circle-exclamation"></i> {callError}
            </div>
          )}

          <form onSubmit={handleCallSubmit} className="modal-form">
            <div className="form-group">
              <label>Your Name *</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Rahul Sharma"
                value={callForm.fullName}
                onChange={(e) => setCallForm({ ...callForm, fullName: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                className="form-input"
                placeholder="e.g. rahul@example.com"
                value={callForm.email}
                onChange={(e) => setCallForm({ ...callForm, email: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Mobile Number for Callback *</label>
              <input
                type="tel"
                className="form-input"
                placeholder="e.g. +91 98765 43210"
                value={callForm.phone}
                onChange={(e) => setCallForm({ ...callForm, phone: e.target.value })}
                required
              />
            </div>
            <button type="submit" className="btn btn-cyan btn-block" disabled={callSubmitting}>
              {callSubmitting ? 'SUBMITTING...' : 'REQUEST IMMEDIATE CALLBACK'}
            </button>
          </form>
        </div>
      </div>

      {/* ====================================================================
          4. QUICK ENQUIRY DRAWER (SLIDE-IN FROM RIGHT)
          ==================================================================== */}
      <div className={`drawer-backdrop ${activeDrawer === 'enquire' ? 'active' : ''}`} id="enquireDrawer">
        <div className="drawer-panel">
          <button className="drawer-close" onClick={() => closeDrawer('enquire')}>&times;</button>
          <div className="drawer-header">
            <i className="fa-solid fa-pen-to-square"></i>
            <h3>Admissions Enquiry</h3>
            <p>Speak with an advisor for curriculum insights and batch details</p>
          </div>

          {enquireError && (
            <div className="modal-alert modal-alert-error">
              <i className="fa-solid fa-circle-exclamation"></i> {enquireError}
            </div>
          )}

          {enquireSuccess ? (
            <div className="modal-success-pane">
              <i className="fa-solid fa-circle-check modal-success-icon"></i>
              <h4>Enquiry Submitted!</h4>
              <p>{enquireSuccess}</p>
              <a
                href={CONTACT_INFO.getWhatsAppUrl(enquireForm.interestedCourse)}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-whatsapp-direct"
              >
                <i className="fa-brands fa-whatsapp"></i> Chat on WhatsApp (+91 7290909574)
              </a>
            </div>
          ) : (
            <form onSubmit={handleEnquireSubmit} className="drawer-form">
              <div className="form-group">
                <label>Interested Programme *</label>
                <select
                  className="form-input"
                  value={enquireForm.interestedCourse}
                  onChange={(e) => setEnquireForm({ ...enquireForm, interestedCourse: e.target.value })}
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
                <label>Full Name *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Rahul Sharma"
                  value={enquireForm.fullName}
                  onChange={(e) => setEnquireForm({ ...enquireForm, fullName: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Email Address *</label>
                <input
                  type="email"
                  className="form-input"
                  placeholder="e.g. rahul@example.com"
                  value={enquireForm.email}
                  onChange={(e) => setEnquireForm({ ...enquireForm, email: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Mobile Number *</label>
                <input
                  type="tel"
                  className="form-input"
                  placeholder="e.g. +91 98765 43210"
                  value={enquireForm.phone}
                  onChange={(e) => setEnquireForm({ ...enquireForm, phone: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Current Education / Qualification</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Final Year CS / Working Professional"
                  value={enquireForm.qualification}
                  onChange={(e) => setEnquireForm({ ...enquireForm, qualification: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Questions / Comments</label>
                <textarea
                  className="form-input"
                  rows={2}
                  placeholder="Tell us what you are looking to achieve..."
                  value={enquireForm.message}
                  onChange={(e) => setEnquireForm({ ...enquireForm, message: e.target.value })}
                />
              </div>

              <button type="submit" className="btn btn-cyan btn-block" disabled={enquireSubmitting}>
                {enquireSubmitting ? 'SUBMITTING...' : 'SUBMIT ENQUIRY'}
              </button>

              <div className="drawer-whatsapp-option">
                <span>Direct WhatsApp Consultation:</span>
                <a
                  href={CONTACT_INFO.getWhatsAppUrl(enquireForm.interestedCourse)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="drawer-wa-btn"
                >
                  <i className="fa-brands fa-whatsapp"></i> Chat with Advisor (+91 7290909574)
                </a>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* ====================================================================
          5. DEMO WORKSHOP MODAL
          ==================================================================== */}
      <div className={`modal-backdrop ${activeModal === 'demo' ? 'active' : ''}`} id="demoModal">
        <div className="modal-card">
          <button className="modal-close" onClick={() => closeModal('demo')}>&times;</button>
          <div className="modal-header">
            <div className="modal-icon"><i className="fa-solid fa-laptop-code"></i></div>
            <h3>Practical Tech Sandbox Demo</h3>
            <p>Experience hands-on cybersecurity and AI labs</p>
          </div>

          {demoError && (
            <div className="modal-alert modal-alert-error">
              <i className="fa-solid fa-circle-exclamation"></i> {demoError}
            </div>
          )}

          <form onSubmit={handleDemoSubmit} className="modal-form">
            <div className="form-group">
              <label>Select Programme Demo</label>
              <select
                className="form-input"
                value={demoForm.interestedCourse}
                onChange={(e) => setDemoForm({ ...demoForm, interestedCourse: e.target.value })}
              >
                {PROGRAMMES.map((p) => (
                  <option key={p.slug} value={p.title}>{p.title} ({p.track})</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Full Name *</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Rahul Sharma"
                value={demoForm.fullName}
                onChange={(e) => setDemoForm({ ...demoForm, fullName: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                className="form-input"
                placeholder="e.g. rahul@example.com"
                value={demoForm.email}
                onChange={(e) => setDemoForm({ ...demoForm, email: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Mobile Number *</label>
              <input
                type="tel"
                className="form-input"
                placeholder="e.g. +91 98765 43210"
                value={demoForm.phone}
                onChange={(e) => setDemoForm({ ...demoForm, phone: e.target.value })}
                required
              />
            </div>
            <button type="submit" className="btn btn-cyan btn-block" disabled={demoSubmitting}>
              {demoSubmitting ? 'REGISTERING...' : 'REGISTER FOR DEMO LAB'}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
