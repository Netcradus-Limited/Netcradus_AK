import React, { useState, useEffect } from 'react';
import { PROGRAMMES, CONTACT_INFO } from '../data/programmesData';
import { academyService } from '../services/academyService';

export default function EnquiryForm({
  defaultProgramme = '',
  source = 'admissions_enquiry',
  title = 'Enquire About Admissions',
  subtitle = 'Submit your details to receive curriculum guidance and batch details from an admissions advisor.',
  onSuccess,
}) {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    interestedCourse: defaultProgramme || PROGRAMMES[0]?.title || 'VAPT Analyst',
    qualification: '',
    message: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [hasSubmitted, setHasSubmitted] = useState(false);

  useEffect(() => {
    if (defaultProgramme) {
      setFormData((prev) => ({ ...prev, interestedCourse: defaultProgramme }));
    }
  }, [defaultProgramme]);

  const validate = () => {
    if (!formData.fullName.trim() || formData.fullName.trim().length < 2) {
      return 'Please enter your full name (minimum 2 characters).';
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim() || !emailRegex.test(formData.email.trim())) {
      return 'Please provide a valid email address.';
    }
    const cleanPhone = formData.phone.replace(/[\s-]/g, '');
    if (!cleanPhone || cleanPhone.length < 7 || cleanPhone.length > 15) {
      return 'Please enter a valid phone number (minimum 7 digits).';
    }
    if (!formData.interestedCourse.trim()) {
      return 'Please select a programme of interest.';
    }
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (hasSubmitted) {
      setError('You have already submitted an enquiry for this session. Our team will contact you shortly.');
      return;
    }

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      const payload = {
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        interestedCourse: formData.interestedCourse.trim(),
        qualification: formData.qualification ? formData.qualification.trim() : '',
        message: formData.message ? formData.message.trim() : '',
        source,
      };

      const result = await academyService.submitInquiry(payload);
      setHasSubmitted(true);
      setSuccessMsg(
        result.message ||
          'Thank you! Your enquiry has been received. An admissions advisor will contact you within 24 hours.'
      );

      if (typeof onSuccess === 'function') {
        onSuccess(result);
      }
    } catch (err) {
      console.error('[EnquiryForm Error]:', err);
      setError(err.message || 'Unable to submit enquiry right now. Please try again or reach us via WhatsApp.');
    } finally {
      setLoading(false);
    }
  };

  const whatsappUrl = CONTACT_INFO.getWhatsAppUrl(formData.interestedCourse);

  return (
    <div className="unified-enquiry-card">
      <div className="ue-header">
        <h3 className="ue-title">{title}</h3>
        {subtitle && <p className="ue-subtitle">{subtitle}</p>}
      </div>

      {error && (
        <div className="ue-alert ue-alert-error" role="alert">
          <i className="fa-solid fa-triangle-exclamation"></i>
          <span>{error}</span>
        </div>
      )}

      {successMsg ? (
        <div className="ue-success-box">
          <div className="ue-success-icon">
            <i className="fa-solid fa-circle-check"></i>
          </div>
          <h4>Enquiry Submitted Successfully</h4>
          <p>{successMsg}</p>
          <div className="ue-success-actions">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-whatsapp-direct"
            >
              <i className="fa-brands fa-whatsapp"></i> Chat with Advisor on WhatsApp
            </a>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="ue-form" noValidate>
          {/* Full Name */}
          <div className="ue-field-group">
            <label className="ue-label" htmlFor="enq-fullname">
              Full Name <span className="req">*</span>
            </label>
            <div className="ue-input-wrapper">
              <i className="fa-regular fa-user ue-field-icon"></i>
              <input
                id="enq-fullname"
                type="text"
                className="ue-input"
                placeholder="e.g. Rahul Sharma"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                required
              />
            </div>
          </div>

          {/* Email Address & Phone */}
          <div className="ue-fields-row">
            <div className="ue-field-group">
              <label className="ue-label" htmlFor="enq-email">
                Email Address <span className="req">*</span>
              </label>
              <div className="ue-input-wrapper">
                <i className="fa-regular fa-envelope ue-field-icon"></i>
                <input
                  id="enq-email"
                  type="email"
                  className="ue-input"
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="ue-field-group">
              <label className="ue-label" htmlFor="enq-phone">
                Mobile Number <span className="req">*</span>
              </label>
              <div className="ue-input-wrapper">
                <i className="fa-solid fa-phone ue-field-icon"></i>
                <input
                  id="enq-phone"
                  type="tel"
                  className="ue-input"
                  placeholder="+91 98765 43210"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                />
              </div>
            </div>
          </div>

          {/* Interested Programme Dropdown */}
          <div className="ue-field-group">
            <label className="ue-label" htmlFor="enq-course">
              Interested Programme <span className="req">*</span>
            </label>
            <div className="ue-input-wrapper select-wrapper">
              <i className="fa-solid fa-graduation-cap ue-field-icon"></i>
              <select
                id="enq-course"
                className="ue-input ue-select"
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
          </div>

          {/* Current Education / Qualification */}
          <div className="ue-field-group">
            <label className="ue-label" htmlFor="enq-qual">
              Current Education / Qualification
            </label>
            <div className="ue-input-wrapper">
              <i className="fa-solid fa-award ue-field-icon"></i>
              <input
                id="enq-qual"
                type="text"
                className="ue-input"
                placeholder="e.g. B.Tech CS Final Year / Working IT Professional"
                value={formData.qualification}
                onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
              />
            </div>
          </div>

          {/* Message */}
          <div className="ue-field-group">
            <label className="ue-label" htmlFor="enq-msg">
              Your Questions or Career Goals
            </label>
            <textarea
              id="enq-msg"
              className="ue-textarea"
              rows={3}
              placeholder="Tell us what you'd like to learn or ask about upcoming batches..."
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            />
          </div>

          {/* Submit CTA */}
          <button
            type="submit"
            className="btn btn-submit-enquiry"
            disabled={loading}
          >
            {loading ? (
              <>
                <i className="fa-solid fa-spinner fa-spin"></i> Submitting Enquiry...
              </>
            ) : (
              <>
                Submit Enquiry <i className="fa-solid fa-arrow-right"></i>
              </>
            )}
          </button>

          <p className="ue-disclaimer">
            <i className="fa-solid fa-lock"></i> Your information is held securely. Submitting an enquiry does not constitute confirmed admission.
          </p>

          <div className="ue-whatsapp-alt">
            <span>Prefer instant chat?</span>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="ue-wa-link"
            >
              <i className="fa-brands fa-whatsapp"></i> Chat with Admissions (+91 7290909574)
            </a>
          </div>
        </form>
      )}
    </div>
  );
}

