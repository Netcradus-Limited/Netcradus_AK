import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../App';
import { studentService } from '../services/studentService';

export default function MyCourses() {
  const { showToast } = useApp();
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchEnrollments = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await studentService.getMyEnrollments();
      setEnrollments(data || []);
    } catch (err) {
      console.error('[MyCourses] Fetch error:', err);
      setError(err.message || 'Failed to load your enrolled courses.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnrollments();
  }, []);

  return (
    <div className="my-courses-page">
      {/* PAGE HEADER */}
      <section className="page-banner-section">
        <div className="container text-center">
          <span className="section-badge">
            <i className="fa-solid fa-graduation-cap"></i> MY ACADEMIC ENROLLMENTS
          </span>
          <h1 className="page-title">My Enrolled Courses</h1>
          <p className="page-subtitle">
            Access your registered practical training programs, learning materials, and course progression.
          </p>
        </div>
      </section>

      {/* MY COURSES CONTENT SECTION */}
      <section className="section my-courses-section">
        <div className="container">
          {loading ? (
            <div className="admin-loading-container" style={{ padding: '60px 20px', textAlign: 'center' }}>
              <div className="admin-spinner"></div>
              <p style={{ marginTop: '15px', color: 'var(--text-muted)' }}>
                Loading your enrolled courses from server...
              </p>
            </div>
          ) : error ? (
            <div className="admin-error-card" style={{ maxWidth: '600px', margin: '40px auto' }}>
              <i className="fa-solid fa-triangle-exclamation"></i>
              <p>{error}</p>
              <button onClick={fetchEnrollments} className="btn btn-sm btn-cyan" style={{ marginTop: '12px' }}>
                <i className="fa-solid fa-rotate-right"></i> Try Again
              </button>
            </div>
          ) : enrollments.length === 0 ? (
            /* EMPTY ENROLLMENT STATE */
            <div
              className="empty-enrollments-card"
              style={{
                textAlign: 'center',
                padding: '60px 20px',
                background: 'var(--bg-card)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border-glow)',
                maxWidth: '650px',
                margin: '30px auto',
              }}
            >
              <div
                style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  background: 'rgba(0, 210, 255, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 20px',
                  border: '1px solid var(--border-glow)',
                }}
              >
                <i className="fa-solid fa-book-bookmark" style={{ fontSize: '2.2rem', color: 'var(--cyan-primary)' }}></i>
              </div>
              <h3 style={{ color: 'var(--white)', fontSize: '1.5rem', marginBottom: '10px' }}>
                You are not enrolled in any courses yet.
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '25px', lineHeight: '1.6' }}>
                Explore our industry-accredited Cyber Security, AI & Machine Learning, Cloud Computing, and Full Stack Development programs to start your learning journey.
              </p>
              <Link to="/courses" className="btn btn-cyan">
                <i className="fa-solid fa-compass"></i> Explore Courses Catalog
              </Link>
            </div>
          ) : (
            /* ENROLLED COURSES GRID */
            <div className="courses-grid" style={{ marginTop: '10px' }}>
              {enrollments.map((item) => {
                const course = item.courseId || {};
                const priceFormatted = course.price
                  ? `₹${(course.price / 100).toLocaleString('en-IN')}`
                  : 'Free';

                return (
                  <div
                    key={item._id}
                    className="course-card"
                    style={{
                      background: 'var(--bg-card)',
                      border: '1px solid var(--border-glow)',
                      borderRadius: 'var(--radius-lg)',
                      overflow: 'hidden',
                      display: 'flex',
                      flexDirection: 'column',
                    }}
                  >
                    <div
                      className={`course-card-header ${course.bannerClass || 'cyber-bg'}`}
                      style={{
                        padding: '25px 20px',
                        position: 'relative',
                        borderBottom: '1px solid var(--border-subtle)',
                      }}
                    >
                      <span
                        className="badge badge-category"
                        style={{
                          background: 'rgba(0, 0, 0, 0.6)',
                          color: 'var(--cyan-primary)',
                          border: '1px solid var(--border-glow)',
                          fontSize: '0.75rem',
                        }}
                      >
                        {course.category || 'ACADEMY COURSE'}
                      </span>
                      <span
                        className={`admin-badge ${
                          item.status === 'active'
                            ? 'success'
                            : item.status === 'completed'
                            ? 'info'
                            : 'warning'
                        }`}
                        style={{ position: 'absolute', top: '20px', right: '20px' }}
                      >
                        {item.status}
                      </span>

                      <h3 style={{ color: 'var(--white)', marginTop: '20px', fontSize: '1.25rem' }}>
                        {course.title || 'Enrolled Program'}
                      </h3>
                    </div>

                    <div className="course-card-body" style={{ padding: '24px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '18px', flex: 1, lineHeight: '1.5' }}>
                        {course.shortDescription || 'Hands-on practical training with cloud sandbox access and live mentorship.'}
                      </p>

                      <div
                        style={{
                          display: 'flex',
                          flexWrap: 'wrap',
                          gap: '15px',
                          fontSize: '0.82rem',
                          color: 'var(--text-muted)',
                          marginBottom: '18px',
                          borderTop: '1px solid var(--border-subtle)',
                          paddingTop: '12px',
                        }}
                      >
                        <div>
                          <i className="fa-regular fa-calendar" style={{ marginRight: '5px', color: 'var(--cyan-primary)' }}></i>
                          Enrolled: <strong>{new Date(item.createdAt).toLocaleDateString('en-IN')}</strong>
                        </div>
                        {course.duration && (
                          <div>
                            <i className="fa-regular fa-clock" style={{ marginRight: '5px', color: 'var(--cyan-primary)' }}></i>
                            Duration: <strong>{course.duration}</strong>
                          </div>
                        )}
                        {item.enrollmentType && (
                          <div>
                            <i className="fa-solid fa-tag" style={{ marginRight: '5px', color: 'var(--cyan-primary)' }}></i>
                            Type: <strong style={{ textTransform: 'uppercase' }}>{item.enrollmentType}</strong>
                          </div>
                        )}
                      </div>

                      {/* Course Progress */}
                      <div style={{ marginBottom: '20px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
                          <span>Course Progress</span>
                          <strong>{item.progressPercentage || 0}%</strong>
                        </div>
                        <div style={{ height: '6px', background: 'var(--bg-dark)', borderRadius: '3px', overflow: 'hidden' }}>
                          <div
                            style={{
                              width: `${item.progressPercentage || 0}%`,
                              height: '100%',
                              background: 'var(--cyan-primary)',
                              transition: 'var(--transition)',
                            }}
                          ></div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '10px' }}>
                        <Link
                          to={`/learn/${course._id || course.slug}`}
                          className="btn btn-sm btn-cyan"
                          style={{ flex: 1, textAlign: 'center' }}
                        >
                          <i className="fa-solid fa-circle-play"></i> Continue Learning
                        </Link>
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-cyan"
                          onClick={() => showToast(`Course Details: ${course.title || 'Program'}`)}
                        >
                          <i className="fa-solid fa-circle-info"></i> Info
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
