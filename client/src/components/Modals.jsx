import React, { useState, useEffect } from 'react';
import { useApp } from '../App';
import { useAuth } from '../context/AuthContext';
import { courseData as fallbackCourseData } from '../data/coursesData';
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
  } = useApp();

  const { user } = useAuth();

  // Dynamic Course Lookup (from API courses or fallback dictionary)
  const apiCourse = courses.find((c) => c.slug === selectedCourseKey);
  const fallbackCourse = fallbackCourseData[selectedCourseKey];

  const selectedCourse = apiCourse
    ? {
        title: apiCourse.title,
        category: apiCourse.category,
        image: apiCourse.thumbnail || '/images/cyber.png',
        duration: apiCourse.duration || '6 Months',
        level: apiCourse.level || 'Beginner to Advanced',
        prereq: apiCourse.prereq || (apiCourse.requirements && apiCourse.requirements[0]) || 'Basic tech concepts',
        cert: apiCourse.cert || 'Netcradus Industry Certification',
        tools: apiCourse.tools && apiCourse.tools.length > 0 ? apiCourse.tools : ['Metasploit', 'Wireshark', 'Python'],
        curriculum: apiCourse.learningOutcomes && apiCourse.learningOutcomes.length > 0 ? apiCourse.learningOutcomes : ['Module 1: Foundations'],
      }
    : fallbackCourse;

  // Enrollment Form State
  const [enrollForm, setEnrollForm] = useState({ fullName: '', email: '', phone: '' });
  const [enrollSubmitting, setEnrollSubmitting] = useState(false);
  const [enrollError, setEnrollError] = useState('');

  // Auto-prefill authenticated user details & course selection
  useEffect(() => {
    if (activeModal === 'enroll') {
      if (user) {
        setEnrollForm((prev) => ({
          fullName: user.fullName || user.name || prev.fullName,
          email: user.email || prev.email,
          phone: user.phone || prev.phone,
        }));
      }
      if (!enrollCourseName && courses && courses.length > 0) {
        setEnrollCourseName(courses[0].title);
      }
    }
  }, [activeModal, user, courses, enrollCourseName, setEnrollCourseName]);

  // Quick Enquiry Form State
  const [enquireForm, setEnquireForm] = useState({ fullName: '', email: '', phone: '', interestedCourse: '' });
  const [enquireSubmitting, setEnquireSubmitting] = useState(false);
  const [enquireError, setEnquireError] = useState('');

  // Callback Modal State
  const [callForm, setCallForm] = useState({ fullName: '', email: '', phone: '' });
  const [callSubmitting, setCallSubmitting] = useState(false);
  const [callError, setCallError] = useState('');

  // Demo Modal State
  const [demoForm, setDemoForm] = useState({ fullName: '', email: '', phone: '' });
  const [demoSubmitting, setDemoSubmitting] = useState(false);
  const [demoError, setDemoError] = useState('');

  // 1. ENROLLMENT SUBMISSION
  const handleEnrollSubmit = async (e) => {
    e.preventDefault();
    setEnrollSubmitting(true);
    setEnrollError('');

    try {
      // Find target course from API courses list to resolve courseId and canonical slug
      const matchedCourse = (courses || []).find(
        (c) =>
          c.title === enrollCourseName ||
          c.slug === selectedCourseKey ||
          c.shortDescription === enrollCourseName
      );

      const payload = {
        fullName: enrollForm.fullName,
        email: enrollForm.email,
        phone: enrollForm.phone,
        courseName: enrollCourseName,
        courseSlug: matchedCourse ? matchedCourse.slug : selectedCourseKey,
        ...(matchedCourse && matchedCourse._id ? { courseId: matchedCourse._id } : {}),
      };

      const result = await academyService.submitEnrollment(payload);
      showToast(result.message || `Enrollment submitted successfully for ${enrollCourseName}!`);
      setEnrollForm({ fullName: '', email: '', phone: '' });
      closeModal('enroll');
    } catch (err) {
      console.error('[Enrollment Submission Error]:', err);
      setEnrollError(err.message || 'Unable to submit enrollment right now. Please try again.');
    } finally {
      setEnrollSubmitting(false);
    }
  };

  // 2. QUICK ENQUIRY SUBMISSION
  const handleEnquireSubmit = async (e) => {
    e.preventDefault();
    setEnquireSubmitting(true);
    setEnquireError('');

    try {
      const payload = {
        fullName: enquireForm.fullName,
        email: enquireForm.email,
        phone: enquireForm.phone,
        interestedCourse: enquireForm.interestedCourse || 'General Tech Program',
        source: 'quick_enquiry',
      };

      const result = await academyService.submitInquiry(payload);
      showToast(result.message || 'Thank you! Your inquiry has been received.');
      setEnquireForm({ fullName: '', email: '', phone: '', interestedCourse: '' });
      closeDrawer('enquire');
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
    setCallSubmitting(true);
    setCallError('');

    try {
      const payload = {
        fullName: callForm.fullName,
        email: callForm.email ? callForm.email.trim() : '',
        phone: callForm.phone,
        interestedCourse: 'Callback Request',
        source: 'callback_request',
      };

      const result = await academyService.submitInquiry(payload);
      showToast(result.message || 'Callback request submitted! Our team will call you shortly.');
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
    setDemoSubmitting(true);
    setDemoError('');

    try {
      const payload = {
        fullName: demoForm.fullName,
        email: demoForm.email ? demoForm.email.trim() : '',
        phone: demoForm.phone,
        interestedCourse: 'Live Cybersecurity Workshop Demo',
        source: 'workshop_registration',
      };

      const result = await academyService.submitInquiry(payload);
      showToast(result.message || 'Workshop seat registered successfully!');
      setDemoForm({ fullName: '', email: '', phone: '' });
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
      {/* 1. ENROLL MODAL */}
      <div className={`modal-backdrop ${activeModal === 'enroll' ? 'active' : ''}`} id="enrollModal">
        <div className="modal-card">
          <button className="modal-close" onClick={() => closeModal('enroll')}>&times;</button>
          <div className="modal-header">
            <div className="modal-icon"><i className="fa-solid fa-graduation-cap"></i></div>
            <h3>Enroll in Netcradus Academia</h3>
            <p>Select your preferred course track and submit your application</p>
          </div>

          {enrollError && (
            <div style={{ background: 'rgba(255, 50, 50, 0.1)', color: '#ff4757', padding: '10px 14px', borderRadius: '6px', fontSize: '0.88rem', marginBottom: '15px', border: '1px solid rgba(255,50,50,0.3)' }}>
              <i className="fa-solid fa-circle-exclamation" style={{ marginRight: '6px' }}></i> {enrollError}
            </div>
          )}

          <form onSubmit={handleEnrollSubmit}>
            <div className="form-group">
              <label htmlFor="enrollCourseName">Select Course / Program *</label>
              <select
                id="enrollCourseName"
                className="form-input"
                value={enrollCourseName}
                onChange={(e) => setEnrollCourseName(e.target.value)}
                required
              >
                <option value="" disabled>-- Select a Course or Track --</option>
                {(courses || []).map((c) => (
                  <option key={c._id || c.slug} value={c.title}>
                    {c.title}
                  </option>
                ))}
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
              <label>Phone / Mobile *</label>
              <input
                type="tel"
                className="form-input"
                placeholder="e.g. +91 98765 43210"
                value={enrollForm.phone}
                onChange={(e) => setEnrollForm({ ...enrollForm, phone: e.target.value })}
                required
              />
            </div>

            <button type="submit" className="btn btn-cyan btn-block" disabled={enrollSubmitting}>
              {enrollSubmitting ? (
                <span><i className="fa-solid fa-spinner fa-spin" style={{ marginRight: '8px' }}></i> SUBMITTING...</span>
              ) : (
                'CONFIRM ENROLLMENT'
              )}
            </button>
          </form>
        </div>
      </div>

      {/* 2. COURSE DETAILS MODAL */}
      <div className={`modal-backdrop ${activeModal === 'courseDetail' ? 'active' : ''}`} id="courseDetailModal">
        <div className="modal-card modal-lg">
          <button className="modal-close" onClick={() => closeModal('courseDetail')}>&times;</button>
          {selectedCourse && (
            <div id="courseDetailContent">
              <div style={{ position: 'relative', height: '180px', margin: '-25px -25px 20px -25px', borderRadius: '12px 12px 0 0', overflow: 'hidden' }}>
                <img src={selectedCourse.image} alt={selectedCourse.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(6,12,25,0.4) 0%, rgba(6,12,25,0.95) 100%)' }}></div>
                <div style={{ position: 'absolute', bottom: '15px', left: '20px', right: '20px', zIndex: 2 }}>
                  <span className="course-badge" style={{ display: 'inline-block', marginBottom: '6px' }}>{selectedCourse.category}</span>
                  <h2 style={{ fontSize: '1.6rem', color: '#ffffff', margin: 0 }}>{selectedCourse.title}</h2>
                </div>
              </div>
              
              <div style={{ marginBottom: '15px' }}>
                <p style={{ color: 'var(--cyan-primary)', fontSize: '0.95rem', fontWeight: 600 }}>
                  <i className="fa-regular fa-clock"></i> {selectedCourse.duration} | <i className="fa-solid fa-graduation-cap"></i> {selectedCourse.level}
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px', background: 'rgba(245, 158, 11,0.05)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-glow)' }}>
                <div>
                  <h5 style={{ color: 'var(--text-main)', marginBottom: '4px' }}>Global Certification</h5>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{selectedCourse.cert}</p>
                </div>
                <div>
                  <h5 style={{ color: 'var(--text-main)', marginBottom: '4px' }}>Prerequisites</h5>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{selectedCourse.prereq}</p>
                </div>
              </div>

              <h4 style={{ color: 'var(--text-main)', marginBottom: '10px' }}>Tools & Technologies Covered</h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '20px' }}>
                {(selectedCourse.tools || []).map((t, idx) => (
                  <span key={idx} style={{ background: 'var(--bg-dark)', color: 'var(--cyan-primary)', padding: '6px 14px', borderRadius: 'var(--radius-full)', fontSize: '0.82rem', fontWeight: 600, border: '1px solid var(--border-subtle)' }}>{t}</span>
                ))}
              </div>

              <h4 style={{ color: 'var(--text-main)', marginBottom: '10px' }}>Course Modules & Syllabus</h4>
              <div style={{ marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {(selectedCourse.curriculum || []).map((m, idx) => (
                  <div key={idx} style={{ background: 'var(--bg-dark)', padding: '10px 15px', borderRadius: 'var(--radius-sm)', fontSize: '0.88rem', color: 'var(--text-main)', borderLeft: '3px solid var(--cyan-primary)' }}>
                    <i className="fa-solid fa-angle-right" style={{ color: 'var(--cyan-primary)', marginRight: '8px' }}></i> {m}
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', gap: '15px', marginTop: '20px' }}>
                <button
                  className="btn btn-cyan btn-block"
                  onClick={() => {
                    closeModal('courseDetail');
                    setEnrollCourseName(selectedCourse.title);
                    setTimeout(() => closeModal('enroll', true), 100);
                  }}
                >
                  ENROLL IN THIS COURSE
                </button>
                <button className="btn btn-outline btn-block" onClick={() => showToast(`Official syllabus download initiated for ${selectedCourse.title}.`)}>
                  <i className="fa-solid fa-file-pdf"></i> DOWNLOAD SYLLABUS
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 3. CALL MODAL */}
      <div className={`modal-backdrop ${activeModal === 'call' ? 'active' : ''}`} id="callModal">
        <div className="modal-card">
          <button className="modal-close" onClick={() => closeModal('call')}>&times;</button>
          <div className="modal-header">
            <div className="modal-icon"><i className="fa-solid fa-phone-volume"></i></div>
            <h3>Contact Academic Advisory</h3>
            <p>Speak directly with our expert career counselors</p>
          </div>

          <div className="direct-call-box">
            <a href="tel:1800121008800" className="call-number-link"><i className="fa-solid fa-phone"></i> 1800 121 008800</a>
            <div className="toll-free-tag">Toll-Free Support Line (Mon-Sat, 9am - 8pm)</div>
          </div>

          {callError && (
            <div style={{ background: 'rgba(255, 50, 50, 0.1)', color: '#ff4757', padding: '10px 14px', borderRadius: '6px', fontSize: '0.88rem', marginBottom: '15px', border: '1px solid rgba(255,50,50,0.3)' }}>
              <i className="fa-solid fa-circle-exclamation" style={{ marginRight: '6px' }}></i> {callError}
            </div>
          )}

          <form onSubmit={handleCallSubmit}>
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
              <label>Email Address (Optional)</label>
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

      {/* 4. LOGIN MODAL */}
      <div className={`modal-backdrop ${activeModal === 'login' ? 'active' : ''}`} id="loginModal">
        <div className="modal-card">
          <button className="modal-close" onClick={() => closeModal('login')}>&times;</button>
          <div className="modal-header">
            <div className="modal-icon"><i className="fa-regular fa-user"></i></div>
            <h3>Login / Sign Up</h3>
            <p>Access your Netcradus Student Portal & Courses</p>
          </div>
          <form onSubmit={(e) => {
            e.preventDefault();
            closeModal('login');
            showToast('Student authentication portal login will be enabled in future phase.');
          }}>
            <div className="form-group">
              <label>Email Address or Student ID *</label>
              <input type="text" className="form-input" placeholder="e.g. rahul@example.com or NC-2026-8842" required />
            </div>
            <div className="form-group">
              <label>Password *</label>
              <input type="password" className="form-input" placeholder="••••••••" required />
            </div>
            <button type="submit" className="btn btn-blue-glow btn-block">LOGIN TO DASHBOARD</button>
          </form>
        </div>
      </div>

      {/* 5. ENQUIRE DRAWER */}
      <div className={`drawer-backdrop ${activeDrawer === 'enquire' ? 'active' : ''}`} id="enquireDrawer">
        <div className="drawer-panel">
          <button className="drawer-close" onClick={() => closeDrawer('enquire')}>&times;</button>
          <div className="drawer-header">
            <i className="fa-solid fa-pen-to-square"></i>
            <h3>Quick Enquiry</h3>
            <p>Get instant course details, fee structure & batch timings</p>
          </div>

          {enquireError && (
            <div style={{ background: 'rgba(255, 50, 50, 0.1)', color: '#ff4757', padding: '10px 14px', borderRadius: '6px', fontSize: '0.88rem', marginBottom: '15px', border: '1px solid rgba(255,50,50,0.3)' }}>
              <i className="fa-solid fa-circle-exclamation" style={{ marginRight: '6px' }}></i> {enquireError}
            </div>
          )}

          <form onSubmit={handleEnquireSubmit}>
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
              <label>Phone Number *</label>
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
              <label>Course Choice *</label>
              <select
                className="form-input"
                value={enquireForm.interestedCourse}
                onChange={(e) => setEnquireForm({ ...enquireForm, interestedCourse: e.target.value })}
                required
              >
                <option value="" disabled>-- Select Course --</option>
                <option value="Ethical Hacking & VAPT Professional Program">Ethical Hacking & VAPT</option>
                <option value="Artificial Intelligence & ML with Generative AI">AI & Machine Learning With Generative AI</option>
                <option value="AWS, Azure & Google Cloud Masterclass">AWS, Azure & Google Cloud Architecture</option>
                <option value="Data Analytics & Visualization Masterclass">Data Analytics & Visualization</option>
                <option value="Full Stack MERN & Next.js Development">MERN Stack Development</option>
                <option value="SOC Analyst & Incident Response Specialist">SOC Analyst & Network Defense</option>
              </select>
            </div>
            <button type="submit" className="btn btn-cyan btn-block" disabled={enquireSubmitting}>
              {enquireSubmitting ? 'SUBMITTING...' : 'SUBMIT ENQUIRY'}
            </button>
          </form>
        </div>
      </div>

      {/* 6. DEMO MODAL */}
      <div className={`modal-backdrop ${activeModal === 'demo' ? 'active' : ''}`} id="demoModal">
        <div className="modal-card">
          <button className="modal-close" onClick={() => closeModal('demo')}>&times;</button>
          <div className="modal-header">
            <div className="modal-icon"><i className="fa-solid fa-laptop-code"></i></div>
            <h3>Free Demo Workshops</h3>
            <p>Secure a seat in our upcoming live cybersecurity sandbox workshop</p>
          </div>
          <div style={{ background: 'rgba(245, 158, 11, 0.05)', padding: '15px', borderRadius: '8px', border: '1px dashed var(--border-glow)', marginBottom: '20px', textAlign: 'center' }}>
            <h4 style={{ color: 'var(--white)', marginBottom: '6px' }}>🔴 Next Session: Penetration Testing Live Hack</h4>
            <p style={{ color: 'var(--cyan-primary)', fontSize: '0.85rem', fontWeight: 600 }}>Saturday at 6:00 PM | Duration: 2 Hours</p>
          </div>

          {demoError && (
            <div style={{ background: 'rgba(255, 50, 50, 0.1)', color: '#ff4757', padding: '10px 14px', borderRadius: '6px', fontSize: '0.88rem', marginBottom: '15px', border: '1px solid rgba(255,50,50,0.3)' }}>
              <i className="fa-solid fa-circle-exclamation" style={{ marginRight: '6px' }}></i> {demoError}
            </div>
          )}

          <form onSubmit={handleDemoSubmit}>
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
              <label>Email Address (Optional)</label>
              <input
                type="email"
                className="form-input"
                placeholder="e.g. rahul@example.com"
                value={demoForm.email}
                onChange={(e) => setDemoForm({ ...demoForm, email: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>WhatsApp Number *</label>
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
              {demoSubmitting ? 'REGISTERING...' : 'REGISTER & RESERVED SEAT'}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
