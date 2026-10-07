import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { instructorService } from '../../services/instructorService';

export default function InstructorSubmissions() {
  const { assignmentId } = useParams();
  const isAssignmentSpecific = Boolean(assignmentId);

  const [submissions, setSubmissions] = useState([]);
  const [assignmentInfo, setAssignmentInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Grading Modal State
  const [gradingModal, setGradingModal] = useState({
    isOpen: false,
    submission: null,
    score: '',
    feedback: '',
    status: 'graded',
  });
  const [gradingSaving, setGradingSaving] = useState(false);
  const [gradingError, setGradingError] = useState(null);

  const fetchSubmissions = async () => {
    setLoading(true);
    setError(null);
    try {
      if (isAssignmentSpecific) {
        const data = await instructorService.getAssignmentSubmissions(assignmentId);
        setAssignmentInfo(data.assignment);
        setSubmissions(data.submissions || []);
      } else {
        const data = await instructorService.getPendingSubmissions();
        setSubmissions(data || []);
      }
    } catch (err) {
      console.error('[InstructorSubmissions] Fetch error:', err);
      setError(err.message || 'Failed to fetch student submissions.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, [assignmentId]);

  const handleOpenGrading = (sub) => {
    setGradingError(null);
    setGradingModal({
      isOpen: true,
      submission: sub,
      score: sub.score !== null && sub.score !== undefined ? sub.score : '',
      feedback: sub.feedback || '',
      status: sub.status === 'resubmission_requested' ? 'resubmission_requested' : 'graded',
    });
  };

  const handleSaveGrade = async (e) => {
    e.preventDefault();
    setGradingError(null);

    const sub = gradingModal.submission;
    if (!sub) return;

    const maxScore = isAssignmentSpecific
      ? assignmentInfo?.maxScore || 100
      : sub.assignment?.maxScore || 100;

    if (gradingModal.status === 'graded') {
      const scoreNum = Number(gradingModal.score);
      if (isNaN(scoreNum) || scoreNum < 0 || scoreNum > maxScore) {
        setGradingError(`Score must be a number between 0 and ${maxScore}.`);
        return;
      }
    } else if (gradingModal.status === 'resubmission_requested') {
      if (!gradingModal.feedback.trim()) {
        setGradingError('Feedback is required when requesting a resubmission so the student knows what to revise.');
        return;
      }
    }

    setGradingSaving(true);
    try {
      const payload = {
        status: gradingModal.status,
        score: gradingModal.status === 'graded' ? Number(gradingModal.score) : undefined,
        feedback: gradingModal.feedback.trim(),
      };

      await instructorService.gradeSubmission(sub.id, payload);

      setGradingModal((prev) => ({ ...prev, isOpen: false }));
      await fetchSubmissions();
    } catch (err) {
      setGradingError(err.message || 'Failed to submit grade evaluation.');
    } finally {
      setGradingSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-loading-container">
        <div className="admin-spinner"></div>
        <p>Loading practical submissions...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-error-card">
        <i className="fa-solid fa-triangle-exclamation"></i>
        <h3>Submission Access Error</h3>
        <p>{error}</p>
        <button type="button" onClick={fetchSubmissions} className="btn-admin-primary">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1050px', margin: '0 auto' }}>
      {/* Top Header / Breadcrumbs */}
      <div style={{ marginBottom: '20px' }}>
        {isAssignmentSpecific ? (
          <>
            <Link
              to={`/instructor/courses/${assignmentInfo?.courseId}/assignments`}
              style={{ color: 'var(--cyan-primary)', fontSize: '0.85rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <i className="fa-solid fa-arrow-left"></i> Back to Course Assignments
            </Link>
            <h2 style={{ fontSize: '1.4rem', color: 'var(--white)', marginTop: '8px' }}>
              Submissions: {assignmentInfo?.title}
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', margin: '4px 0 0' }}>
              Course: <span style={{ color: 'var(--white)' }}>{assignmentInfo?.courseTitle}</span> • Max Score: {assignmentInfo?.maxScore} pts
            </p>
          </>
        ) : (
          <div>
            <h2 style={{ fontSize: '1.4rem', color: 'var(--white)', margin: 0 }}>
              Pending Submissions Queue
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', margin: '4px 0 0' }}>
              All practical lab tasks awaiting evaluation across your assigned courses.
            </p>
          </div>
        )}
      </div>

      {/* Submissions List */}
      {submissions.length === 0 ? (
        <div className="admin-card" style={{ padding: '50px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
          <i className="fa-solid fa-circle-check" style={{ fontSize: '2.5rem', color: '#2ed573', marginBottom: '15px', display: 'block' }}></i>
          <h3 style={{ color: 'var(--white)', marginBottom: '8px' }}>
            {isAssignmentSpecific ? 'No Submissions for this Assignment' : 'All Caught Up!'}
          </h3>
          <p style={{ maxWidth: '400px', margin: '0 auto', fontSize: '0.9rem' }}>
            {isAssignmentSpecific
              ? 'No students have submitted work for this assignment yet.'
              : 'There are currently no pending student submissions waiting for your grading.'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {submissions.map((sub) => (
            <div
              key={sub.id}
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '20px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                flexWrap: 'wrap',
                gap: '15px',
              }}
            >
              <div style={{ flex: 1, minWidth: '280px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      background: 'rgba(245, 158, 11, 0.12)',
                      color: 'var(--cyan-primary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1rem',
                    }}
                  >
                    <i className="fa-solid fa-user-graduate"></i>
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, color: 'var(--white)', fontSize: '0.95rem' }}>
                      {sub.student?.fullName || 'Student'}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {sub.student?.email}
                    </div>
                  </div>
                  <span
                    style={{
                      marginLeft: 'auto',
                      padding: '3px 8px',
                      borderRadius: '4px',
                      fontSize: '0.72rem',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      background:
                        sub.status === 'graded'
                          ? 'rgba(46, 213, 115, 0.15)'
                          : sub.status === 'resubmission_requested'
                          ? 'rgba(255, 165, 2, 0.15)'
                          : 'rgba(235, 77, 75, 0.15)',
                      color:
                        sub.status === 'graded'
                          ? '#2ed573'
                          : sub.status === 'resubmission_requested'
                          ? '#ffa502'
                          : '#eb4d4b',
                    }}
                  >
                    {sub.status === 'graded'
                      ? `Graded: ${sub.score} pts`
                      : sub.status === 'resubmission_requested'
                      ? 'Resubmission Requested'
                      : 'Pending Review'}
                  </span>
                </div>

                {!isAssignmentSpecific && sub.assignment && (
                  <div style={{ marginTop: '12px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    Task: <strong style={{ color: 'var(--white)' }}>{sub.assignment.title}</strong> •
                    Course: <span style={{ color: 'var(--cyan-primary)' }}>{sub.course?.title}</span>
                  </div>
                )}

                {/* Submission Repository Link */}
                {sub.repoUrl && (
                  <div style={{ marginTop: '10px' }}>
                    <a
                      href={sub.repoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        color: 'var(--cyan-primary)',
                        fontSize: '0.85rem',
                        textDecoration: 'none',
                        background: 'rgba(245, 158, 11, 0.08)',
                        padding: '4px 10px',
                        borderRadius: '4px',
                        border: '1px solid rgba(245, 158, 11, 0.2)',
                      }}
                    >
                      <i className="fa-brands fa-github"></i> View Student Repository
                      <i className="fa-solid fa-arrow-up-right-from-square" style={{ fontSize: '0.7rem' }}></i>
                    </a>
                  </div>
                )}

                {/* Submission Text */}
                {sub.submissionText && (
                  <div
                    style={{
                      marginTop: '10px',
                      padding: '10px 12px',
                      background: 'rgba(0, 0, 0, 0.2)',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-subtle)',
                      fontSize: '0.85rem',
                      color: 'var(--text-main)',
                      whiteSpace: 'pre-wrap',
                      maxHeight: '120px',
                      overflowY: 'auto',
                    }}
                  >
                    {sub.submissionText}
                  </div>
                )}

                {/* Existing Feedback if Graded */}
                {sub.feedback && (
                  <div style={{ marginTop: '10px', fontSize: '0.82rem', color: '#2ed573' }}>
                    <strong>Instructor Feedback:</strong> {sub.feedback}
                  </div>
                )}

                <div style={{ marginTop: '8px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Submitted: {sub.submittedAt ? new Date(sub.submittedAt).toLocaleString() : 'N/A'}
                </div>
              </div>

              {/* Grade Action Button */}
              <div>
                <button
                  type="button"
                  onClick={() => handleOpenGrading(sub)}
                  className="btn-admin-primary"
                  style={{ padding: '8px 14px', fontSize: '0.85rem' }}
                >
                  <i className="fa-solid fa-graduation-cap"></i>
                  {sub.status === 'graded' ? ' Re-grade' : ' Grade Submission'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ======================================================== */}
      {/* GRADING MODAL */}
      {/* ======================================================== */}
      {gradingModal.isOpen && (
        <div className="admin-modal-backdrop" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div className="admin-modal" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-glow)', borderRadius: 'var(--radius-md)', width: '100%', maxWidth: '540px', padding: '24px' }}>
            <h3 style={{ color: 'var(--white)', margin: '0 0 16px', fontSize: '1.2rem' }}>
              Evaluate Student Lab Submission
            </h3>

            {gradingError && (
              <div style={{ background: 'rgba(235, 77, 75, 0.15)', border: '1px solid #eb4d4b', color: '#ff6b6b', padding: '10px 12px', borderRadius: '4px', fontSize: '0.85rem', marginBottom: '14px' }}>
                {gradingError}
              </div>
            )}

            <form onSubmit={handleSaveGrade}>
              <div style={{ marginBottom: '14px', fontSize: '0.88rem', color: 'var(--text-muted)' }}>
                Student: <strong style={{ color: 'var(--white)' }}>{gradingModal.submission?.student?.fullName}</strong> ({gradingModal.submission?.student?.email})
              </div>

              {/* Status Select */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
                  Evaluation Outcome *
                </label>
                <select
                  value={gradingModal.status}
                  onChange={(e) => setGradingModal({ ...gradingModal, status: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', background: 'var(--bg-dark)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', color: 'var(--text-main)', fontSize: '0.9rem' }}
                >
                  <option value="graded">Grade and Accept Submission</option>
                  <option value="resubmission_requested">Request Revision / Resubmission</option>
                </select>
              </div>

              {/* Score Input (Only if graded) */}
              {gradingModal.status === 'graded' && (
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
                    Score Awarded (Max:{' '}
                    {isAssignmentSpecific
                      ? assignmentInfo?.maxScore || 100
                      : gradingModal.submission?.assignment?.maxScore || 100}{' '}
                    points) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    max={
                      isAssignmentSpecific
                        ? assignmentInfo?.maxScore || 100
                        : gradingModal.submission?.assignment?.maxScore || 100
                    }
                    value={gradingModal.score}
                    onChange={(e) => setGradingModal({ ...gradingModal, score: e.target.value })}
                    required
                    style={{ width: '100%', padding: '10px 12px', background: 'var(--bg-dark)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', color: 'var(--text-main)', fontSize: '0.9rem' }}
                  />
                </div>
              )}

              {/* Feedback Input */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
                  Faculty Feedback {gradingModal.status === 'resubmission_requested' ? '*' : '(Optional)'}
                </label>
                <textarea
                  value={gradingModal.feedback}
                  onChange={(e) => setGradingModal({ ...gradingModal, feedback: e.target.value })}
                  rows={4}
                  required={gradingModal.status === 'resubmission_requested'}
                  placeholder={
                    gradingModal.status === 'resubmission_requested'
                      ? 'Explain what requirements were missed and how the student should improve their work...'
                      : 'Provide constructive feedback or praise for student code quality...'
                  }
                  style={{ width: '100%', padding: '10px 12px', background: 'var(--bg-dark)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', color: 'var(--text-main)', fontSize: '0.9rem', resize: 'vertical' }}
                />
              </div>

              {/* Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setGradingModal({ ...gradingModal, isOpen: false })}
                  className="btn-admin-secondary"
                  disabled={gradingSaving}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-admin-primary" disabled={gradingSaving}>
                  {gradingSaving ? 'Saving...' : 'Submit Evaluation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
