import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useApp } from '../App';
import { useAuth } from '../context/AuthContext';
import { academyService } from '../services/academyService';

export default function CourseDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { openEnrollModalFor, showToast } = useApp();
  const { isAuthenticated, user } = useAuth();

  const [course, setCourse] = useState(null);
  const [curriculum, setCurriculum] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Preview Video Modal State
  const [previewVideoUrl, setPreviewVideoUrl] = useState(null);
  const [previewTitle, setPreviewTitle] = useState('');

  const fetchCourseData = async () => {
    setLoading(true);
    setError(null);
    try {
      const courseData = await academyService.getCourseBySlug(slug);
      setCourse(courseData);

      try {
        const currData = await academyService.getPublicCurriculum(slug);
        setCurriculum(currData.curriculum || []);
      } catch (currErr) {
        console.warn('[CourseDetail] Could not load curriculum:', currErr);
      }
    } catch (err) {
      console.error('[CourseDetail] Error fetching course by slug:', err);
      setError(err.message || 'Course not found or currently unavailable.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (slug) {
      fetchCourseData();
    }
  }, [slug]);

  const handleEnrollClick = () => {
    if (!isAuthenticated) {
      showToast('Please log in or sign up to enroll in this course.');
      navigate('/login');
    } else if (user?.role === 'student') {
      openEnrollModalFor(course?.title || 'Selected Program');
    } else {
      showToast('Enrollment is available for student accounts.');
    }
  };

  const handleOpenPreview = (lec) => {
    if (lec.videoUrl) {
      setPreviewVideoUrl(lec.videoUrl);
      setPreviewTitle(lec.title);
    } else {
      showToast('Preview video loading...');
      setPreviewVideoUrl('https://www.w3schools.com/html/mov_bbb.mp4');
      setPreviewTitle(lec.title);
    }
  };

  if (loading) {
    return (
      <div className="course-detail-page">
        <div className="container" style={{ padding: '80px 20px', textAlign: 'center' }}>
          <div className="admin-spinner"></div>
          <p style={{ marginTop: '15px', color: 'var(--text-muted)' }}>Loading course specifications...</p>
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="course-detail-page">
        <div className="container" style={{ padding: '80px 20px', textAlign: 'center' }}>
          <div className="admin-error-card" style={{ maxWidth: '600px', margin: '0 auto' }}>
            <i className="fa-solid fa-triangle-exclamation"></i>
            <h3>Course Not Found</h3>
            <p>{error || 'The requested course does not exist.'}</p>
            <Link to="/courses" className="btn btn-cyan" style={{ marginTop: '15px' }}>
              <i className="fa-solid fa-arrow-left"></i> Back to Courses Catalog
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const priceFormatted = course.price
    ? `₹${(course.price / 100).toLocaleString('en-IN')}`
    : 'Free';

  const discountPriceFormatted = course.discountPrice
    ? `₹${(course.discountPrice / 100).toLocaleString('en-IN')}`
    : null;

  return (
    <div className="course-detail-page">
      {/* COURSE BANNER */}
      <section className={`page-banner-section ${course.bannerClass || 'cyber-bg'}`}>
        <div className="container">
          <div style={{ display: 'flex', gap: '15px', alignItems: 'center', marginBottom: '15px', flexWrap: 'wrap' }}>
            <span className="section-badge" style={{ textTransform: 'uppercase' }}>
              <i className={course.bannerIcon || 'fa-solid fa-graduation-cap'}></i> {course.category || 'ACADEMY PROGRAM'}
            </span>
            <span className="badge badge-level" style={{ background: 'rgba(255,255,255,0.1)', color: 'var(--white)', padding: '4px 12px', borderRadius: '12px', fontSize: '0.8rem' }}>
              {course.level || 'All Levels'}
            </span>
          </div>

          <h1 className="page-title" style={{ textAlign: 'left', fontSize: '2.4rem', marginBottom: '15px' }}>
            {course.title}
          </h1>

          <p className="page-subtitle" style={{ textAlign: 'left', maxWidth: '800px', marginBottom: '25px', fontSize: '1.1rem' }}>
            {course.shortDescription || course.description}
          </p>

          <div style={{ display: 'flex', gap: '25px', flexWrap: 'wrap', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            <div><i className="fa-regular fa-clock" style={{ color: 'var(--cyan-primary)' }}></i> Duration: <strong>{course.duration || 'Flexible'}</strong></div>
            <div><i className="fa-solid fa-globe" style={{ color: 'var(--cyan-primary)' }}></i> Language: <strong>{course.language || 'English'}</strong></div>
            <div><i className="fa-solid fa-certificate" style={{ color: 'var(--cyan-primary)' }}></i> Certificate: <strong>{course.cert || 'Included'}</strong></div>
          </div>
        </div>
      </section>

      {/* COURSE BODY CONTENT */}
      <section className="section course-detail-body">
        <div className="container">
          <div className="course-detail-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '40px' }}>
            
            {/* LEFT MAIN DETAILS */}
            <div className="course-main-content">
              
              {/* Overview / Description */}
              <div className="detail-box" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-glow)', borderRadius: 'var(--radius-lg)', padding: '30px', marginBottom: '30px' }}>
                <h3 style={{ color: 'var(--white)', marginBottom: '15px', fontSize: '1.3rem' }}>
                  <i className="fa-solid fa-circle-info" style={{ color: 'var(--cyan-primary)', marginRight: '10px' }}></i>
                  Program Overview
                </h3>
                <p style={{ color: 'var(--text-muted)', lineHeight: '1.7', whiteSpace: 'pre-line' }}>
                  {course.description || course.shortDescription}
                </p>
              </div>

              {/* Learning Outcomes */}
              {course.learningOutcomes && course.learningOutcomes.length > 0 && (
                <div className="detail-box" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-glow)', borderRadius: 'var(--radius-lg)', padding: '30px', marginBottom: '30px' }}>
                  <h3 style={{ color: 'var(--white)', marginBottom: '20px', fontSize: '1.3rem' }}>
                    <i className="fa-solid fa-check-double" style={{ color: 'var(--cyan-primary)', marginRight: '10px' }}></i>
                    What You Will Learn
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '15px' }}>
                    {course.learningOutcomes.map((item, idx) => (
                      <div key={idx} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                        <i className="fa-solid fa-circle-check" style={{ color: 'var(--cyan-primary)', marginTop: '4px' }}></i>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Course Curriculum & Free Preview */}
              <div className="detail-box" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-glow)', borderRadius: 'var(--radius-lg)', padding: '30px', marginBottom: '30px' }}>
                <h3 style={{ color: 'var(--white)', marginBottom: '15px', fontSize: '1.3rem' }}>
                  <i className="fa-solid fa-list-check" style={{ color: 'var(--cyan-primary)', marginRight: '10px' }}></i>
                  Course Curriculum
                </h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '20px' }}>
                  Explore the module structure. Free preview lectures are marked and available for instant viewing.
                </p>

                {curriculum.length === 0 ? (
                  <div style={{ background: 'var(--bg-dark)', padding: '20px', borderRadius: 'var(--radius-md)', border: '1px dashed var(--border-subtle)', color: 'var(--text-muted)', fontSize: '0.9rem', textAlign: 'center' }}>
                    Curriculum outline is currently being updated by instructors.
                  </div>
                ) : (
                  <div className="curriculum-list" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {curriculum.map((mod) => (
                      <div key={mod._id} style={{ background: 'var(--bg-dark)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '18px 20px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                          <strong style={{ color: 'var(--cyan-primary)', fontSize: '1.05rem' }}>
                            {mod.title}
                          </strong>
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                            {mod.lessons ? `${mod.lessons.length} Lectures` : ''}
                          </span>
                        </div>

                        {mod.description && (
                          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '12px' }}>{mod.description}</p>
                        )}

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {(mod.lessons || []).map((les) => (
                            <div key={les._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: 'var(--bg-card)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <i className={`fa-solid ${les.type === 'lab_video' ? 'fa-flask' : les.type === 'text' ? 'fa-file-lines' : 'fa-circle-play'}`} style={{ color: les.isFreePreview ? 'var(--cyan-primary)' : 'var(--text-muted)' }}></i>
                                <span style={{ color: 'var(--white)', fontSize: '0.9rem' }}>{les.title}</span>
                              </div>

                              <div>
                                {les.isFreePreview ? (
                                  <button onClick={() => handleOpenPreview(les)} className="btn btn-sm btn-cyan" style={{ fontSize: '0.75rem', padding: '3px 10px' }}>
                                    <i className="fa-solid fa-circle-play"></i> Watch Free Preview
                                  </button>
                                ) : (
                                  <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                                    <i className="fa-solid fa-lock" style={{ marginRight: '5px' }}></i> Enrolled Only
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Tools & Prerequisites */}
              {(course.tools?.length > 0 || course.requirements?.length > 0) && (
                <div className="detail-box" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-glow)', borderRadius: 'var(--radius-lg)', padding: '30px' }}>
                  {course.tools?.length > 0 && (
                    <div style={{ marginBottom: '25px' }}>
                      <h4 style={{ color: 'var(--white)', marginBottom: '12px', fontSize: '1.1rem' }}>
                        <i className="fa-solid fa-screwdriver-wrench" style={{ color: 'var(--cyan-primary)', marginRight: '8px' }}></i>
                        Tools & Technologies Mastered
                      </h4>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                        {course.tools.map((t, idx) => (
                          <span key={idx} style={{ background: 'rgba(0, 210, 255, 0.1)', color: 'var(--cyan-primary)', padding: '6px 14px', borderRadius: '20px', fontSize: '0.82rem', border: '1px solid var(--border-glow)' }}>
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {course.requirements?.length > 0 && (
                    <div>
                      <h4 style={{ color: 'var(--white)', marginBottom: '12px', fontSize: '1.1rem' }}>
                        <i className="fa-solid fa-clipboard-list" style={{ color: 'var(--cyan-primary)', marginRight: '8px' }}></i>
                        Requirements & Prerequisites
                      </h4>
                      <ul style={{ color: 'var(--text-muted)', fontSize: '0.92rem', paddingLeft: '20px', lineHeight: '1.6' }}>
                        {course.requirements.map((r, idx) => (
                          <li key={idx}>{r}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

            </div>

            {/* RIGHT SIDEBAR ACTION CARD */}
            <div className="course-sidebar">
              <div
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-glow)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '30px',
                  position: 'sticky',
                  top: '100px',
                }}
              >
                <div style={{ marginBottom: '20px' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                    Tuition / Program Fee
                  </span>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
                    <span style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--cyan-primary)' }}>
                      {discountPriceFormatted || priceFormatted}
                    </span>
                    {discountPriceFormatted && (
                      <span style={{ textDecoration: 'line-through', color: 'var(--text-muted)', fontSize: '1.1rem' }}>
                        {priceFormatted}
                      </span>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleEnrollClick}
                  className="btn btn-cyan btn-full"
                  style={{ padding: '14px 20px', fontSize: '1rem', width: '100%', marginBottom: '15px' }}
                >
                  <i className="fa-solid fa-user-plus"></i> {isAuthenticated ? 'Enroll Now / Apply' : 'Register to Enroll'}
                </button>

                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center', marginBottom: '20px', lineHeight: '1.4' }}>
                  {isAuthenticated
                    ? 'Submit enrollment application for admin approval & access token.'
                    : 'Log in or register an account to apply for course enrollment.'}
                </p>

                <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '20px', display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.88rem', color: 'var(--text-muted)' }}>
                  <div><i className="fa-solid fa-shield-halved" style={{ color: 'var(--cyan-primary)', marginRight: '10px' }}></i> Official Netcradus Certification</div>
                  <div><i className="fa-solid fa-cloud" style={{ color: 'var(--cyan-primary)', marginRight: '10px' }}></i> Dedicated Cloud Sandbox Access</div>
                  <div><i className="fa-solid fa-headset" style={{ color: 'var(--cyan-primary)', marginRight: '10px' }}></i> Live 1-on-1 Mentor Support</div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* FREE PREVIEW VIDEO MODAL */}
      {previewVideoUrl && (
        <div className="modal-overlay" style={{ display: 'flex', position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 10000, alignItems: 'center', justifyContent: 'center' }}>
          <div className="modal-card" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-glow)', borderRadius: 'var(--radius-lg)', padding: '25px', maxWidth: '800px', width: '92%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
              <h3 style={{ color: 'var(--white)', fontSize: '1.2rem', margin: 0 }}>
                <i className="fa-solid fa-circle-play" style={{ color: 'var(--cyan-primary)', marginRight: '8px' }}></i>
                Free Preview: {previewTitle}
              </h3>
              <button onClick={() => setPreviewVideoUrl(null)} className="btn btn-sm btn-outline-cyan">
                <i className="fa-solid fa-xmark"></i> Close
              </button>
            </div>
            <div style={{ background: '#000', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
              <video controls autoPlay style={{ width: '100%', maxHeight: '450px', display: 'block' }} src={previewVideoUrl}>
                Your browser does not support HTML5 video.
              </video>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
