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

  const [materials, setMaterials] = useState([]);
  const [loadingMaterials, setLoadingMaterials] = useState(false);
  const [materialsError, setMaterialsError] = useState(null);
  const [materialsLoaded, setMaterialsLoaded] = useState(false);

  const [sessions, setSessions] = useState([]);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [sessionsError, setSessionsError] = useState(null);
  const [sessionsLoaded, setSessionsLoaded] = useState(false);

  const [assignments, setAssignments] = useState([]);
  const [loadingAssignments, setLoadingAssignments] = useState(false);
  const [assignmentsError, setAssignmentsError] = useState(null);
  const [assignmentsLoaded, setAssignmentsLoaded] = useState(false);

  // Assignment submission modal state
  const [activeAssignmentForSubmit, setActiveAssignmentForSubmit] = useState(null);
  const [submissionRepoUrl, setSubmissionRepoUrl] = useState('');
  const [submissionNotes, setSubmissionNotes] = useState('');
  const [submittingAssignment, setSubmittingAssignment] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const fetchAssignments = async () => {
    setLoadingAssignments(true);
    setAssignmentsError(null);
    try {
      const data = await studentService.getAssignments();
      setAssignments(data?.assignments || []);
      setAssignmentsLoaded(true);
    } catch (err) {
      console.error('[StudentDashboard] Assignments fetch error:', err);
      setAssignmentsError(err.message || 'Failed to load assignments.');
    } finally {
      setLoadingAssignments(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'assignments' && !assignmentsLoaded && !loadingAssignments) {
      fetchAssignments();
    }
  }, [activeTab, assignmentsLoaded, loadingAssignments]);

  const handleOpenSubmitModal = (assignment) => {
    setActiveAssignmentForSubmit(assignment);
    setSubmissionRepoUrl(assignment.submission?.repoUrl || '');
    setSubmissionNotes(assignment.submission?.submissionText || '');
    setSubmitError(null);
  };

  const handleCloseSubmitModal = () => {
    if (submittingAssignment) return;
    setActiveAssignmentForSubmit(null);
    setSubmissionRepoUrl('');
    setSubmissionNotes('');
    setSubmitError(null);
  };

  const handleSubmitAssignment = async (e) => {
    e.preventDefault();
    if (!activeAssignmentForSubmit || submittingAssignment) return;

    const trimmedRepo = submissionRepoUrl.trim();
    if (trimmedRepo && !trimmedRepo.startsWith('http://') && !trimmedRepo.startsWith('https://')) {
      setSubmitError('Repository URL must begin with http:// or https://');
      return;
    }

    setSubmittingAssignment(true);
    setSubmitError(null);

    try {
      const res = await studentService.submitAssignment(activeAssignmentForSubmit.id, {
        repoUrl: trimmedRepo,
        submissionText: submissionNotes.trim(),
      });

      const updatedSubmission = res?.submission || res;
      setAssignments((prev) =>
        prev.map((a) =>
          a.id === activeAssignmentForSubmit.id
            ? { ...a, submission: updatedSubmission }
            : a
        )
      );

      showToast(
        activeAssignmentForSubmit.submission
          ? 'Assignment submission updated successfully!'
          : 'Assignment submitted successfully!'
      );
      handleCloseSubmitModal();
    } catch (err) {
      console.error('[StudentDashboard] Submit error:', err);
      setSubmitError(err.message || 'Failed to submit assignment. Please try again.');
    } finally {
      setSubmittingAssignment(false);
    }
  };

  const fetchLiveSessions = async () => {
    setLoadingSessions(true);
    setSessionsError(null);
    try {
      const data = await studentService.getLiveSessions();
      setSessions(data || []);
      setSessionsLoaded(true);
    } catch (err) {
      console.error('[StudentDashboard] Live sessions fetch error:', err);
      setSessionsError(err.message || 'Failed to load live sessions.');
    } finally {
      setLoadingSessions(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'live' && !sessionsLoaded && !loadingSessions) {
      fetchLiveSessions();
    }
  }, [activeTab, sessionsLoaded, loadingSessions]);

  const fetchMaterials = async () => {
    setLoadingMaterials(true);
    setMaterialsError(null);
    try {
      const data = await studentService.getStudyMaterials();
      setMaterials(data || []);
      setMaterialsLoaded(true);
    } catch (err) {
      console.error('[StudentDashboard] Materials fetch error:', err);
      setMaterialsError(err.message || 'Failed to load study materials.');
    } finally {
      setLoadingMaterials(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'notes' && !materialsLoaded && !loadingMaterials) {
      fetchMaterials();
    }
  }, [activeTab, materialsLoaded, loadingMaterials]);

  const isSafeUrl = (url) => {
    if (!url || typeof url !== 'string') return false;
    const trimmed = url.trim();
    return trimmed.startsWith('https://') || trimmed.startsWith('http://') || trimmed.startsWith('/');
  };

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

                            {/* Progress bar & Lesson Counter */}
                            <div style={{ marginBottom: '18px' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
                                <span>{item.completedLessonsCount !== undefined ? `${item.completedLessonsCount} / ${item.totalLessons} Lessons Completed` : 'Course Progress'}</span>
                                <strong style={{ color: item.progressPercentage === 100 ? '#2ed573' : 'var(--cyan-primary)' }}>{item.progressPercentage || 0}%</strong>
                              </div>
                              <div style={{ height: '6px', background: 'var(--bg-dark)', borderRadius: '3px', overflow: 'hidden' }}>
                                <div style={{ width: `${item.progressPercentage || 0}%`, height: '100%', background: item.progressPercentage === 100 ? '#2ed573' : 'var(--cyan-primary)', transition: 'var(--transition)' }}></div>
                              </div>
                            </div>

                            <div style={{ display: 'flex', gap: '10px' }}>
                              <Link
                                to={`/learn/${course._id || course.slug}${item.continueLessonId ? `?lesson=${item.continueLessonId}` : ''}`}
                                className={`btn btn-sm ${item.progressPercentage === 100 ? 'btn-outline-green' : 'btn-cyan'}`}
                                style={{ flex: 1, textAlign: 'center', borderColor: item.progressPercentage === 100 ? '#2ed573' : undefined, color: item.progressPercentage === 100 ? '#2ed573' : undefined }}
                              >
                                <i className={`fa-solid ${item.progressPercentage === 100 ? 'fa-circle-check' : 'fa-circle-play'}`}></i>{' '}
                                {item.progressPercentage === 100 ? 'Review Course' : 'Continue Learning'}
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


                {/* Tab 2: Assignments (Real Published Enrolled Lab Assignments) */}
                <div className={`dash-panel ${activeTab === 'assignments' ? 'active' : ''}`}>
                  <div className="dash-box" style={{ padding: '30px', margin: '20px 0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '8px' }}>
                      <h4 style={{ margin: 0 }}>
                        <i className="fa-solid fa-pen-to-square" style={{ color: 'var(--cyan-primary)', marginRight: '8px' }}></i>
                        Practical Lab Assignments
                      </h4>
                      {assignmentsLoaded && assignments.length > 0 && (
                        <button
                          type="button"
                          onClick={fetchAssignments}
                          disabled={loadingAssignments}
                          className="btn btn-sm btn-outline-cyan"
                          style={{ fontSize: '0.78rem', padding: '4px 10px' }}
                          title="Refresh Assignments"
                        >
                          <i className={`fa-solid fa-rotate-right ${loadingAssignments ? 'fa-spin' : ''}`}></i> Refresh
                        </button>
                      )}
                    </div>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '20px' }}>
                      Submit your hands-on laboratory audit reports and code repositories for instructor feedback.
                    </p>

                    {/* Loading State */}
                    {loadingAssignments ? (
                      <div className="admin-loading-container" style={{ padding: '40px 20px', textAlign: 'center' }}>
                        <div className="admin-spinner"></div>
                        <p style={{ marginTop: '12px', color: 'var(--text-muted)' }}>Loading assignments from server...</p>
                      </div>
                    ) : assignmentsError ? (
                      /* Error State + Retry */
                      <div className="admin-error-card" style={{ margin: '15px 0' }}>
                        <i className="fa-solid fa-triangle-exclamation"></i>
                        <p>{assignmentsError}</p>
                        <button onClick={fetchAssignments} className="btn btn-sm btn-cyan" style={{ marginTop: '10px' }}>
                          <i className="fa-solid fa-rotate-right"></i> Retry Loading
                        </button>
                      </div>
                    ) : assignments.length === 0 ? (
                      /* Empty State */
                      <div
                        style={{
                          textAlign: 'center',
                          padding: '50px 20px',
                          background: 'var(--bg-dark)',
                          borderRadius: 'var(--radius-md)',
                          border: '1px solid var(--border-subtle)',
                          margin: '15px 0',
                        }}
                      >
                        <i className="fa-solid fa-clipboard-check" style={{ fontSize: '2.5rem', color: 'var(--cyan-primary)', marginBottom: '14px' }}></i>
                        <h4 style={{ color: 'var(--white)', marginBottom: '8px' }}>No Published Assignments</h4>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: '520px', margin: '0 auto 16px', lineHeight: '1.5' }}>
                          {summary.totalEnrollments === 0
                            ? 'You are not enrolled in any courses yet. Enroll in courses to access hands-on lab assignments and assessments.'
                            : 'There are currently no assignments published for your enrolled courses.'}
                        </p>
                        {summary.totalEnrollments === 0 && (
                          <Link to="/courses" className="btn btn-sm btn-cyan">
                            <i className="fa-solid fa-compass"></i> Explore Courses Catalog
                          </Link>
                        )}
                      </div>
                    ) : (
                      /* Assignments List */
                      <div className="dash-cards-list">
                        {assignments.map((item) => {
                          const submission = item.submission;
                          const isSubmitted = submission && submission.status === 'submitted';
                          const isGraded = submission && submission.status === 'graded';
                          const isResubmission = submission && submission.status === 'resubmission_requested';
                          const isPending = !submission;

                          let iconClass = 'as-icon pending';
                          let iconElement = <i className="fa-solid fa-clock"></i>;
                          let statusTagClass = 'as-tag warning';
                          let statusLabel = 'Pending Submission';

                          if (isSubmitted) {
                            iconClass = 'as-icon success';
                            iconElement = <i className="fa-solid fa-file-lines"></i>;
                            statusTagClass = 'as-tag';
                            statusLabel = 'Submitted / Under Review';
                          } else if (isGraded) {
                            iconClass = 'as-icon success';
                            iconElement = <i className="fa-solid fa-circle-check"></i>;
                            statusTagClass = 'as-tag';
                            statusLabel = 'Graded';
                          } else if (isResubmission) {
                            iconClass = 'as-icon pending';
                            iconElement = <i className="fa-solid fa-rotate-left"></i>;
                            statusTagClass = 'as-tag warning';
                            statusLabel = 'Resubmission Requested';
                          }

                          return (
                            <div key={item.id} className="assignment-item" style={{ alignItems: 'flex-start' }}>
                              <div className={iconClass} style={{ marginTop: '4px' }}>
                                {iconElement}
                              </div>

                              <div className="as-details">
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
                                  <div>
                                    <h4 style={{ margin: 0, fontSize: '1.05rem', color: 'var(--white)' }}>{item.title}</h4>
                                    {item.courseTitle && (
                                      <span style={{ fontSize: '0.8rem', color: 'var(--cyan-primary)', fontWeight: 600 }}>
                                        {item.courseTitle}
                                      </span>
                                    )}
                                  </div>
                                  {isGraded && (
                                    <div className="score-pill">
                                      {submission.score ?? 0} / {item.maxScore}
                                    </div>
                                  )}
                                </div>

                                {item.description && (
                                  <p style={{ margin: '8px 0', fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                                    {item.description}
                                  </p>
                                )}

                                {item.instructions && (
                                  <p style={{ margin: '4px 0 8px', fontSize: '0.82rem', color: 'rgba(255,255,255,0.7)', fontStyle: 'italic' }}>
                                    <strong style={{ fontStyle: 'normal', color: 'var(--cyan-primary)' }}>Instructions:</strong> {item.instructions}
                                  </p>
                                )}

                                {/* Existing submission info */}
                                {submission && (
                                  <div style={{ margin: '8px 0', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                                    {submission.repoUrl && (
                                      <div style={{ marginBottom: '4px' }}>
                                        <strong style={{ color: 'var(--white)' }}>Repository: </strong>
                                        {isSafeUrl(submission.repoUrl) ? (
                                          <a href={submission.repoUrl} target="_blank" rel="noopener noreferrer">
                                            <code>{submission.repoUrl}</code>
                                          </a>
                                        ) : (
                                          <code>{submission.repoUrl}</code>
                                        )}
                                      </div>
                                    )}
                                    {submission.submissionText && (
                                      <div style={{ marginBottom: '4px' }}>
                                        <strong style={{ color: 'var(--white)' }}>Notes: </strong>
                                        <span>{submission.submissionText}</span>
                                      </div>
                                    )}
                                    {submission.submittedAt && (
                                      <div>
                                        <span>Submitted: {new Date(submission.submittedAt).toLocaleDateString(undefined, {
                                          month: 'short',
                                          day: 'numeric',
                                          year: 'numeric',
                                        })}</span>
                                      </div>
                                    )}
                                  </div>
                                )}

                                {/* Instructor feedback */}
                                {submission?.feedback && (
                                  <div className="instructor-feedback" style={{ color: isResubmission ? '#ffbd2e' : 'var(--cyan-primary)', marginTop: '8px', padding: '8px 12px', background: 'rgba(0, 210, 255, 0.05)', borderRadius: '4px', borderLeft: `3px solid ${isResubmission ? '#ffbd2e' : 'var(--cyan-primary)'}` }}>
                                    <i className="fa-solid fa-comment-dots"></i> <strong>Instructor Feedback:</strong> {submission.feedback}
                                  </div>
                                )}

                                <div className="as-tags" style={{ marginTop: '12px' }}>
                                  <span className={statusTagClass}>
                                    {statusLabel}
                                  </span>
                                  <span className="as-tag">Points: {item.maxScore}</span>
                                  {item.dueDate && (
                                    <span className="as-tag">
                                      <i className="fa-regular fa-calendar" style={{ marginRight: '4px' }}></i>
                                      Due: {new Date(item.dueDate).toLocaleDateString(undefined, {
                                        month: 'short',
                                        day: 'numeric',
                                        year: 'numeric',
                                      })}
                                    </span>
                                  )}
                                </div>
                              </div>

                              <div className="as-actions" style={{ flexShrink: 0, alignSelf: 'center' }}>
                                {isPending && (
                                  <button
                                    className="btn btn-sm btn-cyan"
                                    onClick={() => handleOpenSubmitModal(item)}
                                  >
                                    <i className="fa-solid fa-paper-plane" style={{ marginRight: '5px' }}></i> Submit Lab Report
                                  </button>
                                )}
                                {isSubmitted && (
                                  <button
                                    className="btn btn-sm btn-outline-cyan"
                                    onClick={() => handleOpenSubmitModal(item)}
                                  >
                                    <i className="fa-solid fa-pen-to-square" style={{ marginRight: '5px' }}></i> Update Submission
                                  </button>
                                )}
                                {isResubmission && (
                                  <button
                                    className="btn btn-sm btn-cyan"
                                    onClick={() => handleOpenSubmitModal(item)}
                                  >
                                    <i className="fa-solid fa-rotate-left" style={{ marginRight: '5px' }}></i> Submit Revision
                                  </button>
                                )}
                                {isGraded && (
                                  <button
                                    className="btn btn-sm btn-outline-cyan"
                                    onClick={() => handleOpenSubmitModal(item)}
                                    title="Update lab report or repository"
                                  >
                                    <i className="fa-solid fa-pen-to-square" style={{ marginRight: '5px' }}></i> Update
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                {/* Tab 3: Live Sessions (Real Enrolled Mentoring Classrooms) */}
                <div className={`dash-panel ${activeTab === 'live' ? 'active' : ''}`}>
                  <div className="dash-box" style={{ padding: '30px', margin: '20px 0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '8px' }}>
                      <h4 style={{ margin: 0 }}>
                        <i className="fa-solid fa-video" style={{ color: 'var(--cyan-primary)', marginRight: '8px' }}></i>
                        Interactive Live Mentoring Classrooms
                      </h4>
                      {sessionsLoaded && sessions.length > 0 && (
                        <button
                          type="button"
                          onClick={fetchLiveSessions}
                          disabled={loadingSessions}
                          className="btn btn-sm btn-outline-cyan"
                          style={{ fontSize: '0.78rem', padding: '4px 10px' }}
                          title="Refresh Live Sessions"
                        >
                          <i className={`fa-solid fa-rotate-right ${loadingSessions ? 'fa-spin' : ''}`}></i> Refresh
                        </button>
                      )}
                    </div>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '20px' }}>
                      Attend live interactive mentoring sessions, technical workshops, and Q&A classrooms with Senior Netcradus Engineers.
                    </p>

                    {/* Loading State */}
                    {loadingSessions ? (
                      <div className="admin-loading-container" style={{ padding: '40px 20px', textAlign: 'center' }}>
                        <div className="admin-spinner"></div>
                        <p style={{ marginTop: '12px', color: 'var(--text-muted)' }}>Loading scheduled live sessions from server...</p>
                      </div>
                    ) : sessionsError ? (
                      /* Error State + Retry */
                      <div className="admin-error-card" style={{ margin: '15px 0' }}>
                        <i className="fa-solid fa-triangle-exclamation"></i>
                        <p>{sessionsError}</p>
                        <button onClick={fetchLiveSessions} className="btn btn-sm btn-cyan" style={{ marginTop: '10px' }}>
                          <i className="fa-solid fa-rotate-right"></i> Retry Loading
                        </button>
                      </div>
                    ) : sessions.length === 0 ? (
                      /* Empty State */
                      <div
                        style={{
                          textAlign: 'center',
                          padding: '50px 20px',
                          background: 'var(--bg-dark)',
                          borderRadius: 'var(--radius-md)',
                          border: '1px solid var(--border-subtle)',
                          margin: '15px 0',
                        }}
                      >
                        <i className="fa-solid fa-video-slash" style={{ fontSize: '2.5rem', color: 'var(--cyan-primary)', marginBottom: '14px' }}></i>
                        <h4 style={{ color: 'var(--white)', marginBottom: '8px' }}>No Upcoming Live Sessions</h4>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: '520px', margin: '0 auto 16px', lineHeight: '1.5' }}>
                          {summary.totalEnrollments === 0
                            ? 'You are not enrolled in any courses yet. Enroll in courses to attend live interactive classrooms and Q&A sessions.'
                            : 'There are currently no live mentoring sessions or Q&A classrooms scheduled for your enrolled courses.'}
                        </p>
                        {summary.totalEnrollments === 0 && (
                          <Link to="/courses" className="btn btn-sm btn-cyan">
                            <i className="fa-solid fa-compass"></i> Explore Courses Catalog
                          </Link>
                        )}
                      </div>
                    ) : (
                      /* Populated Live Sessions List */
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '15px' }}>
                        {sessions.map((item) => {
                          const isLive = item.status === 'live';
                          const isUpcoming = item.status === 'upcoming';
                          const isCompleted = item.status === 'completed';
                          const safe = isSafeUrl(item.meetingUrl);

                          const startDate = new Date(item.startTime);
                          const endDate = new Date(item.endTime);
                          const dateStr = startDate.toLocaleDateString(undefined, {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          });
                          const startTimeStr = startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                          const endTimeStr = endDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                          const durationMins = Math.max(1, Math.round((endDate - startDate) / (1000 * 60)));

                          return (
                            <div
                              key={item.id}
                              className="live-card-featured"
                              style={{
                                borderRadius: 'var(--radius-md)',
                                border: isLive ? '1px solid #ff4757' : '1px solid var(--border-glow)',
                                boxShadow: isLive ? '0 0 20px rgba(255, 71, 87, 0.25)' : undefined,
                              }}
                            >
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '12px' }}>
                                <span
                                  className="live-status-badge"
                                  style={{
                                    background: isLive ? 'rgba(255, 71, 87, 0.2)' : isUpcoming ? 'rgba(0, 210, 255, 0.15)' : 'rgba(255, 255, 255, 0.08)',
                                    color: isLive ? '#ff4757' : isUpcoming ? 'var(--cyan-primary)' : 'var(--text-muted)',
                                    border: `1px solid ${isLive ? 'rgba(255, 71, 87, 0.4)' : isUpcoming ? 'rgba(0, 210, 255, 0.3)' : 'var(--border-subtle)'}`,
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    padding: '4px 10px',
                                    borderRadius: 'var(--radius-sm)',
                                    fontSize: '0.75rem',
                                    fontWeight: 700,
                                    letterSpacing: '0.5px',
                                  }}
                                >
                                  {isLive && <i className="fa-solid fa-circle fa-fade" style={{ color: '#ff4757', fontSize: '0.6rem' }}></i>}
                                  {isLive ? 'LIVE NOW' : isUpcoming ? 'UPCOMING' : 'COMPLETED'}
                                </span>
                                <span
                                  className="badge"
                                  style={{
                                    background: 'rgba(0, 210, 255, 0.12)',
                                    color: 'var(--cyan-primary)',
                                    border: '1px solid var(--border-glow)',
                                    fontSize: '0.75rem',
                                  }}
                                >
                                  {item.courseTitle}
                                </span>
                              </div>

                              <h3 style={{ color: 'var(--white)', fontSize: '1.25rem', marginBottom: '8px' }}>
                                {item.title}
                              </h3>

                              {item.description && (
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '16px', lineHeight: '1.5' }}>
                                  {item.description}
                                </p>
                              )}

                              <div className="live-meta" style={{ display: 'flex', flexWrap: 'wrap', gap: '18px', alignItems: 'center', marginBottom: '16px' }}>
                                <div>
                                  <i className="fa-regular fa-calendar" style={{ marginRight: '6px' }}></i> {dateStr}
                                </div>
                                <div>
                                  <i className="fa-regular fa-clock" style={{ marginRight: '6px' }}></i> {startTimeStr} – {endTimeStr} ({durationMins} mins)
                                </div>
                              </div>

                              {/* Instructor Row */}
                              <div className="instructor-row">
                                <div className="inst-avatar">
                                  <i className="fa-solid fa-chalkboard-user"></i>
                                </div>
                                <div>
                                  <h5>{item.instructorName}</h5>
                                  <p>Lead Technical Mentor</p>
                                </div>
                              </div>

                              {/* Join Action */}
                              <div style={{ display: 'flex', justifyContent: 'flex-start', marginTop: '10px' }}>
                                {item.isJoinable && safe ? (
                                  <a
                                    href={item.meetingUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`btn ${isLive ? 'btn-red' : 'btn-cyan'}`}
                                    style={{
                                      background: isLive ? '#ff4757' : undefined,
                                      borderColor: isLive ? '#ff4757' : undefined,
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '8px',
                                      fontWeight: 600,
                                      boxShadow: isLive ? '0 0 15px rgba(255, 71, 87, 0.4)' : undefined,
                                    }}
                                  >
                                    <i className={`fa-solid ${isLive ? 'fa-video fa-beat-fade' : 'fa-arrow-up-right-from-square'}`}></i>
                                    {isLive ? 'Join Live Classroom Now' : 'Join Classroom Link'}
                                  </a>
                                ) : isCompleted ? (
                                  <button type="button" disabled className="btn btn-sm btn-outline" style={{ opacity: 0.6 }}>
                                    <i className="fa-solid fa-circle-check"></i> Session Concluded
                                  </button>
                                ) : (
                                  <button type="button" disabled className="btn btn-sm btn-outline" style={{ opacity: 0.6 }}>
                                    Meeting Link Unavailable
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                {/* Tab 4: Study Materials (Real Enrolled Handouts & Resources) */}
                <div className={`dash-panel ${activeTab === 'notes' ? 'active' : ''}`}>
                  <div className="dash-box" style={{ padding: '30px', margin: '20px 0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '8px' }}>
                      <h4 style={{ margin: 0 }}>
                        <i className="fa-solid fa-file-lines" style={{ color: 'var(--cyan-primary)', marginRight: '8px' }}></i>
                        Course Handouts & Resources
                      </h4>
                      {materialsLoaded && materials.length > 0 && (
                        <button
                          type="button"
                          onClick={fetchMaterials}
                          disabled={loadingMaterials}
                          className="btn btn-sm btn-outline-cyan"
                          style={{ fontSize: '0.78rem', padding: '4px 10px' }}
                          title="Refresh Study Materials"
                        >
                          <i className={`fa-solid fa-rotate-right ${loadingMaterials ? 'fa-spin' : ''}`}></i> Refresh
                        </button>
                      )}
                    </div>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '20px' }}>
                      Access official lecture PDFs, lab guidebooks, and practical architecture resources attached to your enrolled courses.
                    </p>

                    {/* Loading State */}
                    {loadingMaterials ? (
                      <div className="admin-loading-container" style={{ padding: '40px 20px', textAlign: 'center' }}>
                        <div className="admin-spinner"></div>
                        <p style={{ marginTop: '12px', color: 'var(--text-muted)' }}>Loading your enrolled study materials from server...</p>
                      </div>
                    ) : materialsError ? (
                      /* Error State + Retry */
                      <div className="admin-error-card" style={{ margin: '15px 0' }}>
                        <i className="fa-solid fa-triangle-exclamation"></i>
                        <p>{materialsError}</p>
                        <button onClick={fetchMaterials} className="btn btn-sm btn-cyan" style={{ marginTop: '10px' }}>
                          <i className="fa-solid fa-rotate-right"></i> Retry Loading
                        </button>
                      </div>
                    ) : materials.length === 0 ? (
                      /* Empty State */
                      <div
                        style={{
                          textAlign: 'center',
                          padding: '50px 20px',
                          background: 'var(--bg-dark)',
                          borderRadius: 'var(--radius-md)',
                          border: '1px solid var(--border-subtle)',
                          margin: '15px 0',
                        }}
                      >
                        <i className="fa-solid fa-folder-open" style={{ fontSize: '2.5rem', color: 'var(--cyan-primary)', marginBottom: '14px' }}></i>
                        <h4 style={{ color: 'var(--white)', marginBottom: '8px' }}>No Study Materials Available Yet</h4>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: '520px', margin: '0 auto 16px', lineHeight: '1.5' }}>
                          {summary.totalEnrollments === 0
                            ? 'You are not enrolled in any courses yet. Enroll in courses to access lecture handouts, PDF notes, and lab guides.'
                            : 'Your enrolled courses do not currently have any attached PDF lecture notes or resource downloads.'}
                        </p>
                        {summary.totalEnrollments === 0 && (
                          <Link to="/courses" className="btn btn-sm btn-cyan">
                            <i className="fa-solid fa-compass"></i> Explore Courses Catalog
                          </Link>
                        )}
                      </div>
                    ) : (
                      /* Populated Dynamic Materials List */
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '15px' }}>
                        {materials.map((item) => {
                          const safe = isSafeUrl(item.url);
                          const isPdf = item.type === 'pdf';
                          return (
                            <div
                              key={item.id}
                              style={{
                                background: 'var(--bg-dark)',
                                padding: '18px 22px',
                                borderRadius: 'var(--radius-md)',
                                border: '1px solid var(--border-subtle)',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                flexWrap: 'wrap',
                                gap: '15px',
                                transition: 'var(--transition)',
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: '1 1 320px' }}>
                                <div
                                  style={{
                                    width: '46px',
                                    height: '46px',
                                    borderRadius: 'var(--radius-md)',
                                    background: isPdf ? 'rgba(255, 71, 87, 0.12)' : 'rgba(0, 210, 255, 0.12)',
                                    border: `1px solid ${isPdf ? 'rgba(255, 71, 87, 0.3)' : 'var(--border-glow)'}`,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: isPdf ? '#ff4757' : 'var(--cyan-primary)',
                                    fontSize: '1.3rem',
                                    flexShrink: 0,
                                  }}
                                >
                                  <i className={isPdf ? 'fa-solid fa-file-pdf' : 'fa-solid fa-link'}></i>
                                </div>
                                <div>
                                  <h4 style={{ color: 'var(--white)', fontSize: '1rem', marginBottom: '4px' }}>
                                    {item.title}
                                  </h4>
                                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                    <span
                                      className="badge"
                                      style={{
                                        background: isPdf ? 'rgba(255, 71, 87, 0.15)' : 'rgba(0, 210, 255, 0.15)',
                                        color: isPdf ? '#ff4757' : 'var(--cyan-primary)',
                                        fontSize: '0.7rem',
                                        padding: '2px 6px',
                                      }}
                                    >
                                      {item.type.toUpperCase()}
                                    </span>
                                    <span>Course: <strong style={{ color: 'var(--text-main)' }}>{item.courseTitle}</strong></span>
                                    {item.lessonTitle && (
                                      <span>• Lesson: <strong style={{ color: 'var(--text-main)' }}>{item.lessonTitle}</strong></span>
                                    )}
                                  </div>
                                </div>
                              </div>

                              <div>
                                {safe ? (
                                  <a
                                    href={item.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn btn-sm btn-outline-cyan"
                                    style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                                  >
                                    <i className={isPdf ? 'fa-solid fa-download' : 'fa-solid fa-arrow-up-right-from-square'}></i>
                                    {isPdf ? 'Download PDF' : 'Open Resource'}
                                  </a>
                                ) : (
                                  <button
                                    type="button"
                                    disabled
                                    className="btn btn-sm btn-outline"
                                    title="Invalid material link"
                                  >
                                    Unavailable
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
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

      {/* ASSIGNMENT SUBMISSION MODAL */}
      {activeAssignmentForSubmit && (
        <div
          className="modal-overlay"
          style={{
            display: 'flex',
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.85)',
            zIndex: 10000,
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) handleCloseSubmitModal();
          }}
        >
          <div
            className="modal-card"
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-glow)',
              borderRadius: 'var(--radius-lg)',
              padding: '28px',
              maxWidth: '560px',
              width: '100%',
              boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div>
                {activeAssignmentForSubmit.courseTitle && (
                  <span className="as-tag" style={{ marginBottom: '6px', display: 'inline-block' }}>
                    {activeAssignmentForSubmit.courseTitle}
                  </span>
                )}
                <h3 style={{ margin: 0, color: 'var(--white)', fontSize: '1.2rem' }}>
                  {activeAssignmentForSubmit.submission?.status === 'resubmission_requested'
                    ? 'Submit Revision'
                    : activeAssignmentForSubmit.submission
                    ? 'Update Lab Submission'
                    : 'Submit Lab Report'}
                </h3>
                <p style={{ margin: '4px 0 0', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  {activeAssignmentForSubmit.title}
                </p>
              </div>
              <button
                type="button"
                onClick={handleCloseSubmitModal}
                disabled={submittingAssignment}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  fontSize: '1.3rem',
                  cursor: 'pointer',
                  padding: '4px',
                }}
                aria-label="Close modal"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            {activeAssignmentForSubmit.instructions && (
              <div
                style={{
                  background: 'var(--bg-dark)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '12px 14px',
                  marginBottom: '16px',
                  fontSize: '0.84rem',
                  color: 'var(--text-muted)',
                  lineHeight: 1.5,
                }}
              >
                <strong style={{ color: 'var(--cyan-primary)' }}>Instructions: </strong>
                {activeAssignmentForSubmit.instructions}
              </div>
            )}

            {activeAssignmentForSubmit.submission?.status === 'resubmission_requested' && activeAssignmentForSubmit.submission?.feedback && (
              <div
                style={{
                  background: 'rgba(255, 189, 46, 0.08)',
                  border: '1px solid rgba(255, 189, 46, 0.3)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '12px 14px',
                  marginBottom: '16px',
                  fontSize: '0.84rem',
                  color: '#ffbd2e',
                  lineHeight: 1.5,
                }}
              >
                <i className="fa-solid fa-triangle-exclamation" style={{ marginRight: '6px' }}></i>
                <strong>Revision Feedback from Instructor: </strong>
                {activeAssignmentForSubmit.submission.feedback}
              </div>
            )}

            {submitError && (
              <div className="admin-error-card" style={{ marginBottom: '16px' }}>
                <i className="fa-solid fa-triangle-exclamation"></i>
                <p>{submitError}</p>
              </div>
            )}

            <form onSubmit={handleSubmitAssignment}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', color: 'var(--white)', fontWeight: 600 }}>
                  Repository URL <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(Optional - GitHub, GitLab, Bitbucket)</span>
                </label>
                <input
                  type="url"
                  className="input-field"
                  placeholder="https://github.com/username/project"
                  value={submissionRepoUrl}
                  onChange={(e) => setSubmissionRepoUrl(e.target.value)}
                  disabled={submittingAssignment}
                  style={{ width: '100%' }}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', color: 'var(--white)', fontWeight: 600 }}>
                  Submission Notes & Report Details <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(Optional)</span>
                </label>
                <textarea
                  className="input-field"
                  rows="5"
                  placeholder="Provide a summary of your findings, architecture, or reproduction steps..."
                  value={submissionNotes}
                  onChange={(e) => setSubmissionNotes(e.target.value)}
                  disabled={submittingAssignment}
                  style={{ width: '100%', resize: 'vertical' }}
                  maxLength={10000}
                ></textarea>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button
                  type="button"
                  className="btn btn-sm btn-outline-cyan"
                  onClick={handleCloseSubmitModal}
                  disabled={submittingAssignment}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-sm btn-cyan"
                  disabled={submittingAssignment}
                >
                  {submittingAssignment ? (
                    <>
                      <i className="fa-solid fa-spinner fa-spin"></i> Submitting...
                    </>
                  ) : activeAssignmentForSubmit.submission ? (
                    <>
                      <i className="fa-solid fa-arrow-up-from-bracket"></i> Update Submission
                    </>
                  ) : (
                    <>
                      <i className="fa-solid fa-paper-plane"></i> Submit Lab Report
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
