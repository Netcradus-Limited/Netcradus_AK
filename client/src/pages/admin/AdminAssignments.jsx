import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { adminService } from '../../services/adminService';
import { useApp } from '../../App';

export default function AdminAssignments() {
  const { courseId } = useParams();
  const { showToast } = useApp();

  const [course, setCourse] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Assignment Modal State (Create / Edit)
  const [isAssignmentModalOpen, setIsAssignmentModalOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState(null);
  const [submittingAssignment, setSubmittingAssignment] = useState(false);
  const [assignmentFormError, setAssignmentFormError] = useState(null);

  const defaultAssignmentForm = {
    title: '',
    description: '',
    instructions: '',
    dueDate: '',
    maxScore: 100,
    status: 'published',
  };

  const [assignmentFormData, setAssignmentFormData] = useState(defaultAssignmentForm);

  // Submissions View State
  const [activeAssignmentForSubmissions, setActiveAssignmentForSubmissions] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);
  const [submissionsError, setSubmissionsError] = useState(null);

  // Grading Modal State
  const [isGradingModalOpen, setIsGradingModalOpen] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [gradingScore, setGradingScore] = useState('');
  const [gradingFeedback, setGradingFeedback] = useState('');
  const [submittingGrade, setSubmittingGrade] = useState(false);
  const [gradingError, setGradingError] = useState(null);

  // Expanded notes toggle
  const [expandedNotesId, setExpandedNotesId] = useState(null);

  // Archive and Delete confirmation modals
  const [assignmentToArchive, setAssignmentToArchive] = useState(null);
  const [assignmentToDelete, setAssignmentToDelete] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchAssignments = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminService.getAdminAssignments(courseId);
      setCourse(data?.course || null);
      setAssignments(data?.assignments || []);
    } catch (err) {
      console.error('[AdminAssignments] Fetch error:', err);
      setError(err.message || 'Failed to load course assignments.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (courseId) {
      fetchAssignments();
    }
  }, [courseId]);

  // --- ASSIGNMENT MODAL HANDLERS ---
  const handleOpenCreateAssignment = () => {
    setEditingAssignment(null);
    setAssignmentFormData(defaultAssignmentForm);
    setAssignmentFormError(null);
    setIsAssignmentModalOpen(true);
  };

  const handleOpenEditAssignment = (assign) => {
    setEditingAssignment(assign);
    let formattedDueDate = '';
    if (assign.dueDate) {
      const d = new Date(assign.dueDate);
      if (!isNaN(d.getTime())) {
        formattedDueDate = d.toISOString().slice(0, 16);
      }
    }
    setAssignmentFormData({
      title: assign.title || '',
      description: assign.description || '',
      instructions: assign.instructions || '',
      dueDate: formattedDueDate,
      maxScore: assign.maxScore || 100,
      status: assign.status || 'published',
    });
    setAssignmentFormError(null);
    setIsAssignmentModalOpen(true);
  };

  const handleSaveAssignment = async (e) => {
    e.preventDefault();
    setAssignmentFormError(null);

    const trimmedTitle = assignmentFormData.title.trim();
    if (!trimmedTitle || trimmedTitle.length < 3) {
      setAssignmentFormError('Title must be at least 3 characters long.');
      return;
    }

    const numScore = Number(assignmentFormData.maxScore);
    if (isNaN(numScore) || numScore < 1) {
      setAssignmentFormError('Max score must be a number greater than or equal to 1.');
      return;
    }

    setSubmittingAssignment(true);
    try {
      const payload = {
        title: trimmedTitle,
        description: assignmentFormData.description.trim(),
        instructions: assignmentFormData.instructions.trim(),
        dueDate: assignmentFormData.dueDate ? new Date(assignmentFormData.dueDate).toISOString() : null,
        maxScore: numScore,
        status: assignmentFormData.status,
      };

      if (editingAssignment) {
        await adminService.updateAdminAssignment(editingAssignment.id, payload);
        showToast(`Assignment "${trimmedTitle}" updated successfully.`);
      } else {
        await adminService.createAdminAssignment(courseId, payload);
        showToast(`Assignment "${trimmedTitle}" created successfully.`);
      }

      setIsAssignmentModalOpen(false);
      fetchAssignments();
    } catch (err) {
      setAssignmentFormError(err.message || 'Failed to save assignment.');
    } finally {
      setSubmittingAssignment(false);
    }
  };

  const handleDeleteOrArchive = (assign) => {
    if (assign.submissionCount > 0) {
      setAssignmentToArchive(assign);
    } else {
      setAssignmentToDelete(assign);
    }
  };

  const executeArchive = async () => {
    if (!assignmentToArchive) return;
    setActionLoading(true);
    try {
      await adminService.updateAdminAssignment(assignmentToArchive.id, { status: 'archived' });
      showToast(`Assignment "${assignmentToArchive.title}" archived successfully.`);
      setAssignmentToArchive(null);
      fetchAssignments();
    } catch (err) {
      showToast(err.message || 'Failed to archive assignment.');
    } finally {
      setActionLoading(false);
    }
  };

  const executeDelete = async () => {
    if (!assignmentToDelete) return;
    setActionLoading(true);
    try {
      await adminService.deleteAdminAssignment(assignmentToDelete.id);
      showToast(`Assignment "${assignmentToDelete.title}" deleted.`);
      setAssignmentToDelete(null);
      fetchAssignments();
    } catch (err) {
      showToast(err.message || 'Failed to delete assignment.');
    } finally {
      setActionLoading(false);
    }
  };

  // --- SUBMISSIONS VIEW HANDLERS ---
  const handleOpenSubmissions = async (assign) => {
    setActiveAssignmentForSubmissions(assign);
    setLoadingSubmissions(true);
    setSubmissionsError(null);
    try {
      const data = await adminService.getAdminSubmissions(assign.id);
      setSubmissions(data?.submissions || []);
    } catch (err) {
      console.error('[AdminAssignments] Submissions fetch error:', err);
      setSubmissionsError(err.message || 'Failed to load submissions.');
    } finally {
      setLoadingSubmissions(false);
    }
  };

  const handleCloseSubmissions = () => {
    setActiveAssignmentForSubmissions(null);
    setSubmissions([]);
    setSubmissionsError(null);
    setExpandedNotesId(null);
  };

  // --- GRADING MODAL HANDLERS ---
  const handleOpenGradingModal = (submission) => {
    setSelectedSubmission(submission);
    setGradingScore(submission.score !== null ? submission.score : '');
    setGradingFeedback(submission.feedback || '');
    setGradingError(null);
    setIsGradingModalOpen(true);
  };

  const handleCloseGradingModal = () => {
    if (submittingGrade) return;
    setIsGradingModalOpen(false);
    setSelectedSubmission(null);
    setGradingScore('');
    setGradingFeedback('');
    setGradingError(null);
  };

  const handleGradeSubmission = async (targetStatus) => {
    if (!selectedSubmission || !activeAssignmentForSubmissions) return;
    setGradingError(null);

    const maxScore = activeAssignmentForSubmissions.maxScore;

    if (targetStatus === 'graded') {
      if (gradingScore === '' || gradingScore === null) {
        setGradingError('Please enter a valid numeric score.');
        return;
      }
      const numScore = Number(gradingScore);
      if (isNaN(numScore) || numScore < 0 || numScore > maxScore) {
        setGradingError(`Score must be a number between 0 and ${maxScore}.`);
        return;
      }
    } else if (targetStatus === 'resubmission_requested') {
      if (!gradingFeedback.trim()) {
        setGradingError('Feedback is required when requesting a resubmission so the student knows what to revise.');
        return;
      }
    }

    setSubmittingGrade(true);
    try {
      const payload = {
        status: targetStatus,
        feedback: gradingFeedback.trim(),
      };
      if (targetStatus === 'graded') {
        payload.score = Number(gradingScore);
      }

      const res = await adminService.gradeSubmission(selectedSubmission.id, payload);
      const updatedSub = res.data;

      // Update in local submissions list
      setSubmissions((prev) =>
        prev.map((s) => (s.id === selectedSubmission.id ? { ...s, ...updatedSub } : s))
      );

      showToast(
        targetStatus === 'graded'
          ? 'Submission graded successfully!'
          : 'Resubmission requested successfully.'
      );
      handleCloseGradingModal();
    } catch (err) {
      console.error('[AdminAssignments] Grading error:', err);
      setGradingError(err.message || 'Failed to submit grade. Please try again.');
    } finally {
      setSubmittingGrade(false);
    }
  };

  const isSafeUrl = (url) => {
    if (!url || typeof url !== 'string') return false;
    const trimmed = url.trim().toLowerCase();
    return trimmed.startsWith('https://') || trimmed.startsWith('http://');
  };

  return (
    <div className="admin-page">
      {/* PAGE HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px', marginBottom: '20px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <Link to="/admin/courses" className="btn btn-sm btn-outline-cyan" title="Back to Courses Catalog">
              <i className="fa-solid fa-arrow-left"></i> Courses
            </Link>
            <span style={{ color: 'var(--text-muted)' }}>/</span>
            <span style={{ color: 'var(--cyan-primary)', fontSize: '0.85rem', fontWeight: 600 }}>
              {course?.category || 'COURSE'}
            </span>
          </div>
          <h2 style={{ color: 'var(--white)', margin: 0, fontSize: '1.4rem' }}>
            {course ? course.title : 'Course Assignments'}
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', margin: '4px 0 0 0' }}>
            Manage practical laboratory assignments, view student repository submissions, and submit grading with feedback.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <Link
            to={`/admin/courses/${courseId}/curriculum`}
            className="btn btn-sm btn-outline-cyan"
            title="Switch to Curriculum & Lecture Management"
          >
            <i className="fa-solid fa-list-check"></i> View Curriculum
          </Link>
          <button
            type="button"
            onClick={handleOpenCreateAssignment}
            className="btn-admin-primary"
            style={{ padding: '8px 16px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
          >
            <i className="fa-solid fa-plus"></i> Create Assignment
          </button>
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      {loading ? (
        <div className="admin-loading-container">
          <div className="admin-spinner"></div>
          <p>Loading course assignments from server...</p>
        </div>
      ) : error ? (
        <div className="admin-error-card">
          <i className="fa-solid fa-triangle-exclamation"></i>
          <p>{error}</p>
          <button onClick={fetchAssignments} className="btn-admin-primary">
            <i className="fa-solid fa-rotate-right"></i> Retry
          </button>
        </div>
      ) : (
        <>
          {/* ASSIGNMENTS TABLE CARD */}
          <div className="admin-card" style={{ marginBottom: '30px' }}>
            <div className="admin-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3>
                <i className="fa-solid fa-pen-to-square" style={{ color: 'var(--cyan-primary)', marginRight: '8px' }}></i>
                Laboratory Assignments{' '}
                <span className="admin-count-pill">{assignments.length} Total</span>
              </h3>
              <button
                type="button"
                onClick={fetchAssignments}
                disabled={loading}
                className="btn btn-sm btn-outline-cyan"
                style={{ fontSize: '0.78rem', padding: '4px 10px' }}
                title="Refresh assignment list"
              >
                <i className={`fa-solid fa-rotate-right ${loading ? 'fa-spin' : ''}`}></i> Refresh
              </button>
            </div>

            <div className="admin-card-body">
              {assignments.length === 0 ? (
                <div className="admin-empty-state">
                  <i className="fa-solid fa-clipboard-check" style={{ fontSize: '2.5rem', marginBottom: '12px', color: 'var(--cyan-primary)' }}></i>
                  <p style={{ color: 'var(--white)', fontWeight: 600, marginBottom: '6px' }}>No assignments created yet</p>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', maxWidth: '460px', margin: '0 auto 16px' }}>
                    Create hands-on lab audits or coding assessments for enrolled students to complete.
                  </p>
                  <button onClick={handleOpenCreateAssignment} className="btn-admin-primary">
                    <i className="fa-solid fa-plus"></i> Create First Assignment
                  </button>
                </div>
              ) : (
                <div className="admin-table-responsive">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Title & Description</th>
                        <th>Due Date</th>
                        <th>Max Score</th>
                        <th>Status</th>
                        <th>Submissions</th>
                        <th style={{ textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {assignments.map((assign) => (
                        <tr key={assign.id}>
                          <td>
                            <strong style={{ color: 'var(--white)', fontSize: '0.96rem' }}>{assign.title}</strong>
                            {assign.description && (
                              <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '3px', maxWidth: '420px' }}>
                                {assign.description}
                              </div>
                            )}
                          </td>
                          <td>
                            {assign.dueDate ? (
                              <span style={{ fontSize: '0.85rem', color: 'var(--white)' }}>
                                <i className="fa-regular fa-calendar" style={{ marginRight: '6px', color: 'var(--cyan-primary)' }}></i>
                                {new Date(assign.dueDate).toLocaleDateString(undefined, {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric',
                                })}
                              </span>
                            ) : (
                              <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>No Due Date</span>
                            )}
                          </td>
                          <td>
                            <strong style={{ color: 'var(--cyan-primary)' }}>{assign.maxScore}</strong> pts
                          </td>
                          <td>
                            <span
                              className={`admin-badge ${
                                assign.status === 'published'
                                  ? 'success'
                                  : assign.status === 'draft'
                                  ? 'warning'
                                  : 'secondary'
                              }`}
                            >
                              {assign.status.toUpperCase()}
                            </span>
                          </td>
                          <td>
                            <button
                              type="button"
                              onClick={() => handleOpenSubmissions(assign)}
                              className="btn btn-sm btn-outline-cyan"
                              style={{ padding: '3px 10px', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                              title="View student submissions"
                            >
                              <i className="fa-solid fa-users"></i>
                              <span>{assign.submissionCount} Submissions</span>
                            </button>
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <div style={{ display: 'inline-flex', gap: '8px' }}>
                              <button
                                type="button"
                                className="btn-admin-action"
                                onClick={() => handleOpenSubmissions(assign)}
                                title="View Submissions & Grade"
                                style={{ background: 'rgba(0, 210, 255, 0.15)', color: 'var(--cyan-primary)' }}
                              >
                                <i className="fa-solid fa-award"></i> Review
                              </button>
                              <button
                                type="button"
                                className="btn-admin-action"
                                onClick={() => handleOpenEditAssignment(assign)}
                                title="Edit assignment"
                              >
                                <i className="fa-solid fa-pen-to-square"></i> Edit
                              </button>
                              <button
                                type="button"
                                className={`btn-admin-action ${assign.submissionCount > 0 ? '' : 'danger'}`}
                                onClick={() => handleDeleteOrArchive(assign)}
                                title={assign.submissionCount > 0 ? 'Archive assignment (submissions exist)' : 'Delete assignment'}
                              >
                                <i className={`fa-solid ${assign.submissionCount > 0 ? 'fa-box-archive' : 'fa-trash-can'}`}></i>{' '}
                                {assign.submissionCount > 0 ? 'Archive' : 'Delete'}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* SUBMISSIONS REVIEW SECTION (Active Assignment) */}
          {activeAssignmentForSubmissions && (
            <div
              className="admin-card"
              style={{
                border: '1px solid var(--border-glow)',
                boxShadow: '0 8px 30px rgba(0, 210, 255, 0.08)',
                marginBottom: '30px',
              }}
            >
              <div className="admin-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
                <div>
                  <span className="admin-badge info" style={{ marginBottom: '6px', display: 'inline-block' }}>
                    SUBMISSIONS REVIEW
                  </span>
                  <h3 style={{ margin: 0, color: 'var(--white)' }}>
                    {activeAssignmentForSubmissions.title}
                  </h3>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    Max Points: <strong style={{ color: 'var(--cyan-primary)' }}>{activeAssignmentForSubmissions.maxScore}</strong> | Total Student Submissions: <strong>{submissions.length}</strong>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={() => handleOpenSubmissions(activeAssignmentForSubmissions)}
                    disabled={loadingSubmissions}
                    className="btn btn-sm btn-outline-cyan"
                    title="Refresh Submissions"
                  >
                    <i className={`fa-solid fa-rotate-right ${loadingSubmissions ? 'fa-spin' : ''}`}></i>
                  </button>
                  <button
                    type="button"
                    onClick={handleCloseSubmissions}
                    className="btn btn-sm btn-outline-cyan"
                    title="Close Submissions View"
                  >
                    <i className="fa-solid fa-xmark"></i> Close
                  </button>
                </div>
              </div>

              <div className="admin-card-body">
                {loadingSubmissions ? (
                  <div className="admin-loading-container" style={{ padding: '30px 20px' }}>
                    <div className="admin-spinner"></div>
                    <p>Loading student submissions...</p>
                  </div>
                ) : submissionsError ? (
                  <div className="admin-error-card">
                    <i className="fa-solid fa-triangle-exclamation"></i>
                    <p>{submissionsError}</p>
                  </div>
                ) : submissions.length === 0 ? (
                  <div className="admin-empty-state" style={{ padding: '40px 20px' }}>
                    <i className="fa-solid fa-inbox" style={{ fontSize: '2rem', marginBottom: '10px', color: 'var(--text-muted)' }}></i>
                    <p style={{ color: 'var(--white)', fontWeight: 600 }}>No submissions received yet</p>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                      Enrolled students have not submitted lab reports for this assignment yet.
                    </p>
                  </div>
                ) : (
                  <div className="admin-table-responsive">
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>Student</th>
                          <th>Email</th>
                          <th>Status</th>
                          <th>Repository URL</th>
                          <th>Submitted Date</th>
                          <th>Score</th>
                          <th>Feedback</th>
                          <th style={{ textAlign: 'right' }}>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {submissions.map((sub) => {
                          const isGraded = sub.status === 'graded';
                          const isResubmission = sub.status === 'resubmission_requested';

                          return (
                            <tr key={sub.id}>
                              <td>
                                <strong style={{ color: 'var(--white)' }}>{sub.student?.fullName || 'Student'}</strong>
                              </td>
                              <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                                {sub.student?.email || 'N/A'}
                              </td>
                              <td>
                                <span
                                  className={`admin-badge ${
                                    isGraded ? 'success' : isResubmission ? 'warning' : 'info'
                                  }`}
                                >
                                  {isGraded ? 'Graded' : isResubmission ? 'Resubmission Requested' : 'Submitted'}
                                </span>
                              </td>
                              <td>
                                {sub.repoUrl ? (
                                  isSafeUrl(sub.repoUrl) ? (
                                    <a
                                      href={sub.repoUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      style={{ color: 'var(--cyan-primary)', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '5px' }}
                                    >
                                      <i className="fa-brands fa-github"></i>
                                      <span style={{ textDecoration: 'underline' }}>View Repo</span>
                                    </a>
                                  ) : (
                                    <code style={{ fontSize: '0.8rem' }}>{sub.repoUrl}</code>
                                  )
                                ) : (
                                  <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>None</span>
                                )}
                              </td>
                              <td style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                                {sub.submittedAt ? new Date(sub.submittedAt).toLocaleDateString(undefined, {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric',
                                }) : 'N/A'}
                              </td>
                              <td>
                                {sub.score !== null ? (
                                  <span style={{ fontWeight: 700, color: '#27c93f', fontSize: '0.92rem' }}>
                                    {sub.score} / {activeAssignmentForSubmissions.maxScore}
                                  </span>
                                ) : (
                                  <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>—</span>
                                )}
                              </td>
                              <td style={{ maxWidth: '240px' }}>
                                {sub.feedback ? (
                                  <div style={{ fontSize: '0.82rem', color: 'var(--text-main)', fontStyle: 'italic', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={sub.feedback}>
                                    "{sub.feedback}"
                                  </div>
                                ) : (
                                  <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>No feedback</span>
                                )}
                                {sub.submissionText && (
                                  <button
                                    type="button"
                                    onClick={() => setExpandedNotesId(expandedNotesId === sub.id ? null : sub.id)}
                                    style={{
                                      background: 'none',
                                      border: 'none',
                                      color: 'var(--cyan-primary)',
                                      fontSize: '0.75rem',
                                      cursor: 'pointer',
                                      padding: '2px 0',
                                      marginTop: '2px',
                                      display: 'block',
                                    }}
                                  >
                                    {expandedNotesId === sub.id ? 'Hide Notes' : 'Read Student Notes'}
                                  </button>
                                )}
                              </td>
                              <td style={{ textAlign: 'right' }}>
                                <button
                                  type="button"
                                  onClick={() => handleOpenGradingModal(sub)}
                                  className="btn-admin-action"
                                  style={{
                                    background: isGraded ? 'rgba(39, 201, 63, 0.15)' : 'rgba(0, 210, 255, 0.15)',
                                    color: isGraded ? '#27c93f' : 'var(--cyan-primary)',
                                    fontWeight: 600,
                                  }}
                                  title="Grade submission or request revision"
                                >
                                  <i className="fa-solid fa-pen"></i> {isGraded ? 'Update Grade' : 'Grade'}
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>

                    {/* EXPANDED STUDENT NOTES PREVIEW */}
                    {expandedNotesId && (() => {
                      const expandedSub = submissions.find((s) => s.id === expandedNotesId);
                      if (!expandedSub || !expandedSub.submissionText) return null;
                      return (
                        <div
                          style={{
                            background: 'var(--bg-dark)',
                            border: '1px solid var(--border-glow)',
                            borderRadius: 'var(--radius-md)',
                            padding: '16px 20px',
                            margin: '15px 0',
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                            <strong style={{ color: 'var(--cyan-primary)', fontSize: '0.88rem' }}>
                              <i className="fa-solid fa-file-lines" style={{ marginRight: '6px' }}></i>
                              Submission Notes from {expandedSub.student?.fullName}:
                            </strong>
                            <button
                              type="button"
                              onClick={() => setExpandedNotesId(null)}
                              style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                            >
                              <i className="fa-solid fa-xmark"></i>
                            </button>
                          </div>
                          <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--white)', whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>
                            {expandedSub.submissionText}
                          </p>
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}

      {/* CREATE / EDIT ASSIGNMENT MODAL */}
      {isAssignmentModalOpen && (
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
            if (e.target === e.currentTarget && !submittingAssignment) setIsAssignmentModalOpen(false);
          }}
        >
          <div
            className="modal-card"
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-glow)',
              borderRadius: 'var(--radius-lg)',
              padding: '28px',
              maxWidth: '600px',
              width: '100%',
              boxShadow: '0 10px 40px rgba(0,0,0,0.6)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '18px' }}>
              <div>
                <span className="admin-badge info" style={{ marginBottom: '6px', display: 'inline-block' }}>
                  {course?.title || 'COURSE'}
                </span>
                <h3 style={{ margin: 0, color: 'var(--white)', fontSize: '1.25rem' }}>
                  {editingAssignment ? 'Edit Assignment' : 'Create New Assignment'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAssignmentModalOpen(false)}
                disabled={submittingAssignment}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '1.3rem', cursor: 'pointer' }}
                aria-label="Close"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            {assignmentFormError && (
              <div className="admin-error-card" style={{ marginBottom: '16px' }}>
                <i className="fa-solid fa-triangle-exclamation"></i>
                <p>{assignmentFormError}</p>
              </div>
            )}

            <form onSubmit={handleSaveAssignment}>
              <div className="form-group" style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', color: 'var(--white)', fontWeight: 600 }}>
                  Assignment Title <span style={{ color: '#ff4757' }}>*</span>
                </label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g. Lab 1: Web Application Penetration Test"
                  value={assignmentFormData.title}
                  onChange={(e) => setAssignmentFormData({ ...assignmentFormData, title: e.target.value })}
                  disabled={submittingAssignment}
                  required
                  style={{ width: '100%' }}
                />
              </div>

              <div className="form-group" style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', color: 'var(--white)', fontWeight: 600 }}>
                  Description <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(Overview of the task)</span>
                </label>
                <textarea
                  className="input-field"
                  rows="3"
                  placeholder="Provide brief background or learning objective..."
                  value={assignmentFormData.description}
                  onChange={(e) => setAssignmentFormData({ ...assignmentFormData, description: e.target.value })}
                  disabled={submittingAssignment}
                  maxLength={2000}
                  style={{ width: '100%', resize: 'vertical' }}
                ></textarea>
              </div>

              <div className="form-group" style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', color: 'var(--white)', fontWeight: 600 }}>
                  Detailed Instructions <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(Deliverables, commands, submission format)</span>
                </label>
                <textarea
                  className="input-field"
                  rows="4"
                  placeholder="e.g. Submit your GitHub repo URL containing the exploit PoC and notes in report.md..."
                  value={assignmentFormData.instructions}
                  onChange={(e) => setAssignmentFormData({ ...assignmentFormData, instructions: e.target.value })}
                  disabled={submittingAssignment}
                  maxLength={5000}
                  style={{ width: '100%', resize: 'vertical' }}
                ></textarea>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '20px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', color: 'var(--white)', fontWeight: 600 }}>
                    Max Score <span style={{ color: '#ff4757' }}>*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    className="input-field"
                    value={assignmentFormData.maxScore}
                    onChange={(e) => setAssignmentFormData({ ...assignmentFormData, maxScore: e.target.value })}
                    disabled={submittingAssignment}
                    required
                    style={{ width: '100%' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', color: 'var(--white)', fontWeight: 600 }}>
                    Status
                  </label>
                  <select
                    className="input-field"
                    value={assignmentFormData.status}
                    onChange={(e) => setAssignmentFormData({ ...assignmentFormData, status: e.target.value })}
                    disabled={submittingAssignment}
                    style={{ width: '100%' }}
                  >
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', color: 'var(--white)', fontWeight: 600 }}>
                    Due Date
                  </label>
                  <input
                    type="datetime-local"
                    className="input-field"
                    value={assignmentFormData.dueDate}
                    onChange={(e) => setAssignmentFormData({ ...assignmentFormData, dueDate: e.target.value })}
                    disabled={submittingAssignment}
                    style={{ width: '100%' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setIsAssignmentModalOpen(false)}
                  disabled={submittingAssignment}
                  className="btn btn-sm btn-outline-cyan"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingAssignment}
                  className="btn-admin-primary"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                >
                  {submittingAssignment ? (
                    <>
                      <i className="fa-solid fa-spinner fa-spin"></i> Saving...
                    </>
                  ) : editingAssignment ? (
                    <>
                      <i className="fa-solid fa-check"></i> Save Changes
                    </>
                  ) : (
                    <>
                      <i className="fa-solid fa-plus"></i> Create Assignment
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* GRADING MODAL */}
      {isGradingModalOpen && selectedSubmission && activeAssignmentForSubmissions && (
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
            if (e.target === e.currentTarget && !submittingGrade) handleCloseGradingModal();
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
              boxShadow: '0 10px 40px rgba(0,0,0,0.6)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div>
                <span className="admin-badge info" style={{ marginBottom: '6px', display: 'inline-block' }}>
                  GRADING LAB REPORT
                </span>
                <h3 style={{ margin: 0, color: 'var(--white)', fontSize: '1.25rem' }}>
                  {selectedSubmission.student?.fullName || 'Student Submission'}
                </h3>
                <p style={{ margin: '3px 0 0', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  {activeAssignmentForSubmissions.title} (Max: {activeAssignmentForSubmissions.maxScore} pts)
                </p>
              </div>
              <button
                type="button"
                onClick={handleCloseGradingModal}
                disabled={submittingGrade}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '1.3rem', cursor: 'pointer' }}
                aria-label="Close"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            {/* SUBMISSION SNAPSHOT */}
            <div
              style={{
                background: 'var(--bg-dark)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-sm)',
                padding: '12px 14px',
                marginBottom: '16px',
                fontSize: '0.84rem',
              }}
            >
              {selectedSubmission.repoUrl && (
                <div style={{ marginBottom: '6px' }}>
                  <strong style={{ color: 'var(--white)' }}>Repository: </strong>
                  {isSafeUrl(selectedSubmission.repoUrl) ? (
                    <a
                      href={selectedSubmission.repoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: 'var(--cyan-primary)' }}
                    >
                      {selectedSubmission.repoUrl} <i className="fa-solid fa-arrow-up-right-from-square" style={{ fontSize: '0.75rem' }}></i>
                    </a>
                  ) : (
                    <code>{selectedSubmission.repoUrl}</code>
                  )}
                </div>
              )}
              {selectedSubmission.submissionText && (
                <div>
                  <strong style={{ color: 'var(--white)' }}>Student Notes: </strong>
                  <span style={{ color: 'var(--text-muted)', whiteSpace: 'pre-wrap' }}>
                    {selectedSubmission.submissionText}
                  </span>
                </div>
              )}
            </div>

            {gradingError && (
              <div className="admin-error-card" style={{ marginBottom: '14px' }}>
                <i className="fa-solid fa-triangle-exclamation"></i>
                <p>{gradingError}</p>
              </div>
            )}

            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', color: 'var(--white)', fontWeight: 600 }}>
                Awarded Score (0 to {activeAssignmentForSubmissions.maxScore})
              </label>
              <input
                type="number"
                min="0"
                max={activeAssignmentForSubmissions.maxScore}
                className="input-field"
                placeholder={`0 - ${activeAssignmentForSubmissions.maxScore}`}
                value={gradingScore}
                onChange={(e) => setGradingScore(e.target.value)}
                disabled={submittingGrade}
                style={{ width: '100%' }}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', color: 'var(--white)', fontWeight: 600 }}>
                Instructor Feedback & Comments
              </label>
              <textarea
                className="input-field"
                rows="4"
                placeholder="Provide constructive review remarks, security audit notes, or revision instructions..."
                value={gradingFeedback}
                onChange={(e) => setGradingFeedback(e.target.value)}
                disabled={submittingGrade}
                maxLength={5000}
                style={{ width: '100%', resize: 'vertical' }}
              ></textarea>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
              <button
                type="button"
                onClick={() => handleGradeSubmission('resubmission_requested')}
                disabled={submittingGrade}
                className="btn btn-sm btn-outline-cyan"
                style={{ color: '#ffbd2e', borderColor: 'rgba(255, 189, 46, 0.4)' }}
                title="Require student to update submission notes or repository"
              >
                <i className="fa-solid fa-rotate-left"></i> Request Resubmission
              </button>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  onClick={handleCloseGradingModal}
                  disabled={submittingGrade}
                  className="btn btn-sm btn-outline-cyan"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleGradeSubmission('graded')}
                  disabled={submittingGrade}
                  className="btn-admin-primary"
                  style={{ background: '#27c93f', borderColor: '#27c93f' }}
                >
                  {submittingGrade ? (
                    <>
                      <i className="fa-solid fa-spinner fa-spin"></i> Submitting...
                    </>
                  ) : (
                    <>
                      <i className="fa-solid fa-check"></i> Grade & Finalize
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Archive Confirmation Modal */}
      {assignmentToArchive && (
        <div className="modal-overlay" onClick={() => !actionLoading && setAssignmentToArchive(null)}>
          <div className="modal-card" style={{ maxWidth: '480px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>
                <i className="fa-solid fa-box-archive" style={{ color: 'var(--accent-orange, #ff6b00)', marginRight: '8px' }}></i>
                Archive Assignment
              </h3>
              <button
                type="button"
                className="btn-close"
                disabled={actionLoading}
                onClick={() => setAssignmentToArchive(null)}
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
            <div className="modal-body" style={{ padding: '20px 0' }}>
              <p style={{ color: 'var(--text-main)', fontSize: '0.95rem', lineHeight: '1.5', margin: 0 }}>
                Assignment <strong>"{assignmentToArchive.title}"</strong> has{' '}
                <strong>{assignmentToArchive.submissionCount} student submission(s)</strong> and cannot be permanently deleted.
              </p>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '10px', marginBottom: 0 }}>
                Archiving will hide this assignment from active student catalogs while preserving student submissions, grades, and academic records.
              </p>
            </div>
            <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                className="btn-admin-action"
                disabled={actionLoading}
                onClick={() => setAssignmentToArchive(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn-admin-action warning"
                disabled={actionLoading}
                onClick={executeArchive}
              >
                {actionLoading ? (
                  <>
                    <i className="fa-solid fa-spinner fa-spin"></i> Archiving...
                  </>
                ) : (
                  'Archive Assignment'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {assignmentToDelete && (
        <div className="modal-overlay" onClick={() => !actionLoading && setAssignmentToDelete(null)}>
          <div className="modal-card" style={{ maxWidth: '480px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>
                <i className="fa-solid fa-trash-can" style={{ color: '#ff4757', marginRight: '8px' }}></i>
                Confirm Assignment Deletion
              </h3>
              <button
                type="button"
                className="btn-close"
                disabled={actionLoading}
                onClick={() => setAssignmentToDelete(null)}
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
            <div className="modal-body" style={{ padding: '20px 0' }}>
              <p style={{ color: 'var(--text-main)', fontSize: '0.95rem', lineHeight: '1.5', margin: 0 }}>
                Are you sure you want to permanently delete assignment <strong>"{assignmentToDelete.title}"</strong>?
              </p>
              <p style={{ color: '#ff4757', fontSize: '0.85rem', marginTop: '10px', marginBottom: 0 }}>
                <i className="fa-solid fa-circle-exclamation"></i> This assignment currently has 0 submissions. This action cannot be undone.
              </p>
            </div>
            <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                className="btn-admin-action"
                disabled={actionLoading}
                onClick={() => setAssignmentToDelete(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn-admin-action danger"
                disabled={actionLoading}
                onClick={executeDelete}
              >
                {actionLoading ? (
                  <>
                    <i className="fa-solid fa-spinner fa-spin"></i> Deleting...
                  </>
                ) : (
                  'Delete Assignment'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
