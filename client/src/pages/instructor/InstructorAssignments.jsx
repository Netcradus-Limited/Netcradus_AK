import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { instructorService } from '../../services/instructorService';

export default function InstructorAssignments() {
  const { courseId } = useParams();
  const [course, setCourse] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal State
  const [modal, setModal] = useState({
    isOpen: false,
    isEdit: false,
    assignmentId: null,
    title: '',
    description: '',
    instructions: '',
    dueDate: '',
    maxScore: 100,
    status: 'published',
  });

  const [saving, setSaving] = useState(false);
  const [modalError, setModalError] = useState(null);

  const fetchAssignments = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await instructorService.getAssignments(courseId);
      setCourse(data.course);
      setAssignments(data.assignments || []);
    } catch (err) {
      console.error('[InstructorAssignments] Fetch error:', err);
      setError(err.message || 'Failed to load course assignments.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, [courseId]);

  const handleOpenModal = (assignmentToEdit = null) => {
    setModalError(null);
    if (assignmentToEdit) {
      setModal({
        isOpen: true,
        isEdit: true,
        assignmentId: assignmentToEdit.id,
        title: assignmentToEdit.title || '',
        description: assignmentToEdit.description || '',
        instructions: assignmentToEdit.instructions || '',
        dueDate: assignmentToEdit.dueDate ? assignmentToEdit.dueDate.split('T')[0] : '',
        maxScore: assignmentToEdit.maxScore || 100,
        status: assignmentToEdit.status || 'published',
      });
    } else {
      setModal({
        isOpen: true,
        isEdit: false,
        assignmentId: null,
        title: '',
        description: '',
        instructions: '',
        dueDate: '',
        maxScore: 100,
        status: 'published',
      });
    }
  };

  const handleSaveAssignment = async (e) => {
    e.preventDefault();
    if (!modal.title.trim()) {
      setModalError('Assignment title is required.');
      return;
    }

    setSaving(true);
    setModalError(null);
    try {
      const payload = {
        title: modal.title.trim(),
        description: modal.description.trim(),
        instructions: modal.instructions.trim(),
        dueDate: modal.dueDate || null,
        maxScore: Number(modal.maxScore) || 100,
        status: modal.status,
      };

      if (modal.isEdit) {
        await instructorService.updateAssignment(modal.assignmentId, payload);
      } else {
        await instructorService.createAssignment(courseId, payload);
      }

      setModal((prev) => ({ ...prev, isOpen: false }));
      await fetchAssignments();
    } catch (err) {
      setModalError(err.message || 'Failed to save assignment.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAssignment = async (assignmentId, title) => {
    if (!window.confirm(`Are you sure you want to delete assignment "${title}"?`)) {
      return;
    }
    try {
      await instructorService.deleteAssignment(assignmentId);
      await fetchAssignments();
    } catch (err) {
      alert(err.message || 'Failed to delete assignment. It may have existing student submissions.');
    }
  };

  if (loading) {
    return (
      <div className="admin-loading-container">
        <div className="admin-spinner"></div>
        <p>Loading course assignments...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-error-card">
        <i className="fa-solid fa-triangle-exclamation"></i>
        <h3>Failed to Load Assignments</h3>
        <p>{error}</p>
        <Link to={`/instructor/courses/${courseId}`} className="btn-admin-primary">
          Back to Course
        </Link>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      {/* Top Header & Breadcrumbs */}
      <div style={{ marginBottom: '20px' }}>
        <Link to={`/instructor/courses/${courseId}`} style={{ color: 'var(--cyan-primary)', fontSize: '0.85rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
          <i className="fa-solid fa-arrow-left"></i> Back to Course Overview
        </Link>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px', flexWrap: 'wrap', gap: '15px' }}>
          <div>
            <h2 style={{ fontSize: '1.4rem', color: 'var(--white)', margin: 0 }}>
              Assignments: {course?.title}
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', margin: '4px 0 0' }}>
              Create hands-on lab tasks, set grading rubrics, and inspect student code repositories.
            </p>
          </div>

          <button
            type="button"
            onClick={() => handleOpenModal(null)}
            className="btn-admin-primary"
          >
            <i className="fa-solid fa-plus"></i> Create Assignment
          </button>
        </div>
      </div>

      {/* Assignment List */}
      {assignments.length === 0 ? (
        <div className="admin-card" style={{ padding: '50px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
          <i className="fa-solid fa-tasks" style={{ fontSize: '2.5rem', color: '#ffa502', marginBottom: '15px', display: 'block' }}></i>
          <h3 style={{ color: 'var(--white)', marginBottom: '8px' }}>No Assignments Configured</h3>
          <p style={{ maxWidth: '400px', margin: '0 auto 20px', fontSize: '0.9rem' }}>
            Practical projects give students the opportunity to apply theoretical knowledge and receive faculty feedback.
          </p>
          <button
            type="button"
            onClick={() => handleOpenModal(null)}
            className="btn-admin-primary"
          >
            <i className="fa-solid fa-plus"></i> Create First Assignment
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {assignments.map((assign) => (
            <div
              key={assign.id}
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '20px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '15px',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <h3 style={{ fontSize: '1.1rem', color: 'var(--white)', margin: 0 }}>
                    {assign.title}
                  </h3>
                  <span
                    style={{
                      padding: '2px 8px',
                      borderRadius: '4px',
                      fontSize: '0.72rem',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      background: assign.status === 'published' ? 'rgba(46, 213, 115, 0.15)' : 'rgba(255, 165, 2, 0.15)',
                      color: assign.status === 'published' ? '#2ed573' : '#ffa502',
                    }}
                  >
                    {assign.status}
                  </span>
                </div>

                <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '6px' }}>
                  Max Score: <span style={{ color: 'var(--white)', fontWeight: 600 }}>{assign.maxScore} pts</span> •
                  Due Date: {assign.dueDate ? new Date(assign.dueDate).toLocaleDateString() : 'No Deadline'} •
                  Submissions: <span style={{ color: 'var(--cyan-primary)', fontWeight: 600 }}>{assign.submissionCount} total</span>
                  {assign.pendingCount > 0 && (
                    <span style={{ color: '#eb4d4b', fontWeight: 600, marginLeft: '6px' }}>
                      ({assign.pendingCount} pending review)
                    </span>
                  )}
                </div>

                {assign.description && (
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: '8px 0 0', maxWidth: '650px' }}>
                    {assign.description}
                  </p>
                )}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Link
                  to={`/instructor/assignments/${assign.id}/submissions`}
                  className="btn-admin-primary"
                  style={{ padding: '6px 12px', fontSize: '0.82rem' }}
                >
                  <i className="fa-solid fa-list-check"></i> Submissions ({assign.submissionCount})
                </Link>
                <button
                  type="button"
                  onClick={() => handleOpenModal(assign)}
                  className="btn-admin-secondary"
                  style={{ padding: '6px 10px', fontSize: '0.82rem' }}
                >
                  <i className="fa-solid fa-pen"></i> Edit
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteAssignment(assign.id, assign.title)}
                  className="btn-admin-secondary"
                  style={{ padding: '6px 10px', fontSize: '0.82rem', color: '#eb4d4b' }}
                  title="Delete assignment"
                >
                  <i className="fa-solid fa-trash"></i>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ======================================================== */}
      {/* ASSIGNMENT CREATE / EDIT MODAL */}
      {/* ======================================================== */}
      {modal.isOpen && (
        <div className="admin-modal-backdrop" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div className="admin-modal" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-glow)', borderRadius: 'var(--radius-md)', width: '100%', maxWidth: '580px', padding: '24px' }}>
            <h3 style={{ color: 'var(--white)', margin: '0 0 16px', fontSize: '1.2rem' }}>
              {modal.isEdit ? 'Edit Assignment' : 'Create Assignment'}
            </h3>

            {modalError && (
              <div style={{ color: '#ff6b6b', fontSize: '0.85rem', marginBottom: '12px' }}>
                {modalError}
              </div>
            )}

            <form onSubmit={handleSaveAssignment}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                  Assignment Title *
                </label>
                <input
                  type="text"
                  value={modal.title}
                  onChange={(e) => setModal({ ...modal, title: e.target.value })}
                  placeholder="e.g. Lab 2: Active Network Mapping & Nmap Scanning"
                  required
                  style={{ width: '100%', padding: '8px 12px', background: 'var(--bg-dark)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', color: 'var(--text-main)', fontSize: '0.9rem' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                    Max Score (Points) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={modal.maxScore}
                    onChange={(e) => setModal({ ...modal, maxScore: e.target.value })}
                    required
                    style={{ width: '100%', padding: '8px 12px', background: 'var(--bg-dark)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', color: 'var(--text-main)', fontSize: '0.9rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                    Due Date (Optional)
                  </label>
                  <input
                    type="date"
                    value={modal.dueDate}
                    onChange={(e) => setModal({ ...modal, dueDate: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', background: 'var(--bg-dark)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', color: 'var(--text-main)', fontSize: '0.9rem' }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                  Overview Description
                </label>
                <textarea
                  value={modal.description}
                  onChange={(e) => setModal({ ...modal, description: e.target.value })}
                  rows={2}
                  placeholder="Brief summary of assignment objectives..."
                  style={{ width: '100%', padding: '8px 12px', background: 'var(--bg-dark)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', color: 'var(--text-main)', fontSize: '0.9rem', resize: 'vertical' }}
                />
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                  Detailed Instructions & Submission Rubric
                </label>
                <textarea
                  value={modal.instructions}
                  onChange={(e) => setModal({ ...modal, instructions: e.target.value })}
                  rows={4}
                  placeholder="Provide step-by-step requirements: e.g. submit GitHub repository link with report.pdf..."
                  style={{ width: '100%', padding: '8px 12px', background: 'var(--bg-dark)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', color: 'var(--text-main)', fontSize: '0.9rem', resize: 'vertical' }}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                  Status
                </label>
                <select
                  value={modal.status}
                  onChange={(e) => setModal({ ...modal, status: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', background: 'var(--bg-dark)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', color: 'var(--text-main)', fontSize: '0.9rem' }}
                >
                  <option value="published">Published (Open for Submissions)</option>
                  <option value="draft">Draft (Hidden from Students)</option>
                  <option value="archived">Archived (Closed)</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setModal({ ...modal, isOpen: false })}
                  className="btn-admin-secondary"
                  disabled={saving}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-admin-primary" disabled={saving}>
                  {saving ? 'Saving...' : 'Save Assignment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
