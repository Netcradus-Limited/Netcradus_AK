import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useApp } from '../App';
import { useAuth } from '../context/AuthContext';
import { studentService } from '../services/studentService';

export default function Dashboard() {
  const location = useLocation();
  const { user: authUser } = useAuth();
  const { showToast } = useApp();

  const [activeTab, setActiveTab] = useState('courses');
  const [dashData, setDashData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await studentService.getDashboard();
      setDashData(data);
    } catch (err) {
      console.error('[StudentDashboard] Fetch error:', err);
      setError(err.message || 'Failed to load your student dashboard.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tabParam = params.get('tab');
    const hash = location.hash.replace('#', '').toLowerCase();
    const tabKey = hash || (tabParam ? tabParam.toLowerCase() : '');

    const tabMap = {
      'courses': 'courses',
      'my-courses': 'courses',
      'assignments': 'assignments',
      'live': 'live',
      'recorded': 'recorded',
      'notes': 'notes',
      'labs': 'labs',
    };

    if (tabKey && tabMap[tabKey]) {
      setActiveTab(tabMap[tabKey]);
    }
  }, [location]);

  const user = dashData?.user || authUser || {};
  const summary = dashData?.summary || { totalEnrollments: 0, activeEnrollments: 0, completedEnrollments: 0 };
  const enrollments = dashData?.enrollments || [];

  return (
    <div className="dashboard-page">
      {/* PAGE HEADER */}
      <section className="page-banner-section">
        <div className="container text-center">
          <span className="section-badge"><i className="fa-solid fa-gauge-high"></i> STUDENT PORTAL</span>
          <h1 className="page-title">Learning Management Dashboard</h1>
          <p className="page-subtitle">
            Welcome back, {user.fullName || 'Student'}! Manage your courses, enrollments, and academic progress.
          </p>
        </div>
      </section>

      {/* STUDENT DASHBOARD PORTAL SECTION */}
      <section className="section dashboard-section" id="dashboard">
        <div className="container">
          <div className="dashboard-portal-card">

            {/* Student Header Info Bar */}
            <div className="dash-user-header">
              <div className="dash-user-profile">
                <div className="dash-avatar">
                  <i className="fa-solid fa-user-graduate"></i>
                </div>
                <div className="dash-user-details">
                  <h3>
                    {user.fullName || 'Student'}{' '}
                    <span className={`dash-user-badge ${user.status === 'disabled' ? 'disabled' : ''}`}>
                      <i className={`fa-solid ${user.status === 'disabled' ? 'fa-user-xmark' : 'fa-circle-check'}`}></i>{' '}
                      {user.status === 'disabled' ? 'Account Disabled' : 'Active Student'}
                    </span>
                  </h3>
                  <p>
                    <i className="fa-solid fa-envelope"></i> {user.email || 'N/A'}{' '}
                    {user.phone && <>| <i className="fa-solid fa-phone"></i> {user.phone}</>}{' '}
                    | Joined: <strong>{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</strong>
                  </p>
                </div>
              </div>

              {/* Real Summary Metrics Pills */}
              <div className="dash-user-quick-stats">
                <div className="dash-stat-pill">
                  <span className="stat-pill-icon"><i className="fa-solid fa-book-open"></i></span>
                  <div>
                    <strong>{summary.totalEnrollments}</strong>
                    <span>Total Enrolled</span>
                  </div>
                </div>
                <div className="dash-stat-pill">
                  <span className="stat-pill-icon cyan"><i className="fa-solid fa-circle-play"></i></span>
                  <div>
                    <strong>{summary.activeEnrollments}</strong>
                    <span>Active Courses</span>
                  </div>
                </div>
                <div className="dash-stat-pill">
                  <span className="stat-pill-icon green" style={{ background: 'rgba(46, 213, 115, 0.15)', color: '#2ed573' }}>
                    <i className="fa-solid fa-graduation-cap"></i>
                  </span>
                  <div>
                    <strong>{summary.completedEnrollments}</strong>
                    <span>Completed</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Loading / Error States */}
            {loading ? (
              <div className="admin-loading-container" style={{ padding: '60px 20px' }}>
                <div className="admin-spinner"></div>
                <p>Loading your courses & enrollment data from server...</p>
              </div>
            ) : error ? (
              <div className="admin-error-card" style={{ margin: '30px' }}>
                <i className="fa-solid fa-triangle-exclamation"></i>
                <p>{error}</p>
                <button onClick={fetchDashboard} className="btn btn-sm btn-cyan" style={{ marginTop: '10px' }}>
                  Retry Loading
                </button>
              </div>
            ) : (
              <>
                {/* Dashboard Navigation Tabs */}
                <div className="dash-tabs-bar" style={{ marginTop: '20px' }}>
                  <button
                    className={`dash-tab-btn ${activeTab === 'courses' ? 'active' : ''}`}
                    onClick={() => setActiveTab('courses')}
                  >
                    <i className="fa-solid fa-book-open"></i> My Courses ({enrollments.length})
                  </button>
                  <button
                    className={`dash-tab-btn ${activeTab === 'assignments' ? 'active' : ''}`}
                    onClick={() => setActiveTab('assignments')}
                  >
                    <i className="fa-solid fa-pen-to-square"></i> Assignments
                  </button>
                  <button
                    className={`dash-tab-btn ${activeTab === 'live' ? 'active' : ''}`}
                    onClick={() => setActiveTab('live')}
                  >
                    <i className="fa-solid fa-video"></i> Live Sessions
                  </button>
                  <button
                    className={`dash-tab-btn ${activeTab === 'notes' ? 'active' : ''}`}
                    onClick={() => setActiveTab('notes')}
                  >
                    <i className="fa-solid fa-file-lines"></i> Study Materials
                  </button>
                  <button
                    className={`dash-tab-btn ${activeTab === 'labs' ? 'active' : ''}`}
                    onClick={() => setActiveTab('labs')}
                  >
                    <i className="fa-solid fa-terminal"></i> Cloud Sandbox
                  </button>
                </div>

                {/* Tab 1: My Courses & Enrollments */}
                <div className={`dash-panel ${activeTab === 'courses' ? 'active' : ''}`}>
                  {enrollments.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '50px 20px', background: 'var(--bg-card)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', margin: '20px 0' }}>
                      <i className="fa-solid fa-book-bookmark" style={{ fontSize: '3rem', color: 'var(--cyan-primary)', marginBottom: '15px' }}></i>
                      <h3 style={{ color: 'var(--white)', marginBottom: '8px' }}>You are not enrolled in any courses yet</h3>
                      <p style={{ color: 'var(--text-muted)', marginBottom: '20px', maxWidth: '500px', margin: '0 auto 20px' }}>
                        Browse our industry-accredited Cybersecurity, AI, Cloud Computing, and Full Stack courses to start learning.
                      </p>
                      <Link to="/courses" className="btn btn-cyan">
                        <i className="fa-solid fa-compass"></i> Explore Courses Catalog
                      </Link>
                    </div>
                  ) : (
                    <div className="dash-grid-2col" style={{ marginTop: '20px' }}>
                      {enrollments.map((item) => {
                        const course = item.courseId || {};
                        return (
                          <div key={item._id} className="dash-box" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-glow)', borderRadius: 'var(--radius-md)', padding: '24px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                              <span className="dash-tag" style={{ background: 'rgba(0, 210, 255, 0.12)', color: 'var(--cyan-primary)', border: '1px solid var(--border-glow)', fontSize: '0.75rem' }}>
                                {course.category || 'ACADEMY COURSE'}
                              </span>
                              <span className={`admin-badge ${item.status === 'active' ? 'success' : item.status === 'completed' ? 'info' : 'warning'}`}>
                                {item.status}
                              </span>
                            </div>

                            <h3 style={{ fontSize: '1.25rem', color: 'var(--white)', marginBottom: '8px' }}>
                              {course.title || 'Enrolled Course'}
                            </h3>

                            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '16px', minHeight: '40px' }}>
                              {course.shortDescription || 'Hands-on practical training with lab access and certification.'}
                            </p>

                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '18px', borderTop: '1px solid var(--border-subtle)', paddingTop: '12px' }}>
                              <div><i className="fa-regular fa-calendar"></i> Enrolled: <strong>{new Date(item.createdAt).toLocaleDateString()}</strong></div>
                              {course.duration && <div><i className="fa-regular fa-clock"></i> Duration: <strong>{course.duration}</strong></div>}
                              {item.enrollmentType && <div><i className="fa-solid fa-tag"></i> Type: <strong style={{ textTransform: 'uppercase' }}>{item.enrollmentType}</strong></div>}
                            </div>

                            {/* Progress bar */}
                            <div style={{ marginBottom: '18px' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
                                <span>Course Progress</span>
                                <strong>{item.progressPercentage || 0}%</strong>
                              </div>
                              <div style={{ height: '6px', background: 'var(--bg-dark)', borderRadius: '3px', overflow: 'hidden' }}>
                                <div style={{ width: `${item.progressPercentage || 0}%`, height: '100%', background: 'var(--cyan-primary)', transition: 'var(--transition)' }}></div>
                              </div>
                            </div>

                            <div style={{ display: 'flex', gap: '10px' }}>
                              <Link to={`/learn/${course._id || course.slug}`} className="btn btn-sm btn-cyan" style={{ flex: 1, textAlign: 'center' }}>
                                <i className="fa-solid fa-circle-play"></i> Access Course
                              </Link>
                              <button type="button" className="btn btn-sm btn-outline-cyan" onClick={() => showToast(`Course info: ${course.title}`)}>
                                <i className="fa-solid fa-circle-info"></i> Details
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Tab 2: Assignments (Standard Learning Support) */}
                <div className={`dash-panel ${activeTab === 'assignments' ? 'active' : ''}`}>
                  <div className="dash-box" style={{ padding: '30px', margin: '20px 0' }}>
                    <h4><i className="fa-solid fa-pen-to-square"></i> Practical Lab Assignments</h4>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '20px' }}>
                      Submit your hands-on laboratory audit reports and code repositories for instructor feedback.
                    </p>

                    <div className="dash-cards-list">
                      <div className="assignment-item">
                        <div className="as-icon pending"><i className="fa-solid fa-clock"></i></div>
                        <div className="as-details">
                          <h4>Module Audit: Practical Security Assessment</h4>
                          <p>Submit your penetration testing or code audit report for enrolled courses.</p>
                          <div className="as-tags">
                            <span className="as-tag warning">Standard Lab</span>
                            <span className="as-tag">Points: 100</span>
                          </div>
                        </div>
                        <div className="as-actions">
                          <button className="btn btn-sm btn-cyan" onClick={() => showToast('Opening Lab Submission Portal...')}>
                            Submit Lab Report
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tab 3: Live Sessions */}
                <div className={`dash-panel ${activeTab === 'live' ? 'active' : ''}`}>
                  <div className="dash-box" style={{ padding: '30px', margin: '20px 0' }}>
                    <h4><i className="fa-solid fa-video"></i> Interactive Live Classroom</h4>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '20px' }}>
                      Join live interactive mentoring sessions and Q&A classrooms with Senior Netcradus Engineers.
                    </p>
                    <button className="btn btn-cyan" onClick={() => showToast('Connecting to Live Interactive Zoom Classroom...')}>
                      <i className="fa-solid fa-video"></i> Join Live Classroom Stream
                    </button>
                  </div>
                </div>

                {/* Tab 4: Study Materials */}
                <div className={`dash-panel ${activeTab === 'notes' ? 'active' : ''}`}>
                  <div className="dash-box" style={{ padding: '30px', margin: '20px 0' }}>
                    <h4><i className="fa-solid fa-file-lines"></i> Course Handouts & Resources</h4>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '20px' }}>
                      Download official Netcradus syllabus documents, lab setup manuals, and architecture guides.
                    </p>
                    <div className="notes-grid">
                      <div className="note-card">
                        <div className="note-icon pdf"><i className="fa-solid fa-file-pdf"></i></div>
                        <div className="note-info">
                          <h4>Netcradus Academy Official Student Guide (2026)</h4>
                          <p>PDF Document • Official Student Portal Manual</p>
                        </div>
                        <button className="btn btn-sm btn-outline-cyan" onClick={() => showToast('Downloading Official Student Guide PDF...')}>
                          <i className="fa-solid fa-download"></i> Download
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tab 5: Cloud Sandbox */}
                <div className={`dash-panel ${activeTab === 'labs' ? 'active' : ''}`}>
                  <div className="dash-box" style={{ padding: '30px', margin: '20px 0' }}>
                    <h4><i className="fa-solid fa-terminal"></i> Cloud Virtual Sandbox Environment</h4>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '20px' }}>
                      Access isolated cloud sandbox virtual terminals pre-loaded with security tools and dev stacks.
                    </p>
                    <button className="btn btn-cyan" onClick={() => showToast('Provisioning Cloud Sandbox Terminal... Ready in 5 seconds!')}>
                      <i className="fa-solid fa-terminal"></i> Launch Cloud Sandbox Terminal
                    </button>
                  </div>
                </div>
              </>
            )}

          </div>
        </div>
      </section>
    </div>
  );
}
