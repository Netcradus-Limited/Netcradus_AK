import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import { useApp } from '../../App';

export default function AdminInstructors() {
  const { showToast } = useApp();
  const [instructors, setInstructors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalInstructors, setTotalInstructors] = useState(0);

  // Status toggle confirmation modal
  const [instructorToToggle, setInstructorToToggle] = useState(null);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  // Create Instructor modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createSubmitting, setCreateSubmitting] = useState(false);
  const [createError, setCreateError] = useState(null);
  const [createFormData, setCreateFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    phone: '',
  });

  const fetchInstructors = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminService.getInstructors({
        search,
        status: statusFilter,
        page,
        limit: 15,
      });
      setInstructors(res.data || []);
      setTotalPages(res.pages || 1);
      setTotalInstructors(res.total || 0);
    } catch (err) {
      console.error('[AdminInstructors] Fetch error:', err);
      setError(err.message || 'Failed to fetch instructor accounts.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInstructors();
  }, [search, statusFilter, page]);

  const handleOpenCreateModal = () => {
    setCreateFormData({
      fullName: '',
      email: '',
      password: '',
      phone: '',
    });
    setCreateError(null);
    setShowCreateModal(true);
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setCreateError(null);

    if (!createFormData.fullName.trim() || !createFormData.email.trim() || !createFormData.password) {
      setCreateError('Please fill in all required fields (Full Name, Email, Temporary Password).');
      return;
    }

    if (createFormData.password.length < 8) {
      setCreateError('Temporary password must be at least 8 characters long.');
      return;
    }

    setCreateSubmitting(true);
    try {
      const res = await adminService.createInstructor(createFormData);
      showToast(res.message || 'Instructor account created successfully.');
      setShowCreateModal(false);
      fetchInstructors();
    } catch (err) {
      setCreateError(err.message || 'Failed to create instructor account.');
    } finally {
      setCreateSubmitting(false);
    }
  };

  const handleToggleStatus = (inst) => {
    setInstructorToToggle(inst);
  };

  const executeToggleStatus = async () => {
    if (!instructorToToggle) return;
    const inst = instructorToToggle;
    const newStatus = inst.status === 'active' ? 'disabled' : 'active';

    setActionLoadingId(inst._id);
    try {
      await adminService.updateInstructorStatus(inst._id, newStatus);
      showToast(`Instructor account status updated to '${newStatus}'.`);
      setInstructorToToggle(null);
      fetchInstructors();
    } catch (err) {
      showToast(err.message || 'Instructor status update failed.');
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="admin-page">
      {/* Filter and Top Action Bar */}
      <div className="admin-filter-bar">
        <div className="admin-search-box">
          <i className="fa-solid fa-magnifying-glass"></i>
          <input
            type="text"
            placeholder="Search instructors by name, email or phone..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>

        <div className="admin-filter-group">
          <label>Status:</label>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
          >
            <option value="all">All Statuses</option>
            <option value="active">Active Faculty</option>
            <option value="disabled">Disabled Accounts</option>
          </select>
        </div>

        <button
          type="button"
          className="btn-admin-primary"
          onClick={handleOpenCreateModal}
          style={{ marginLeft: 'auto' }}
        >
          <i className="fa-solid fa-user-plus"></i> Add New Instructor
        </button>
      </div>

      {/* Main Table Card */}
      <div className="admin-card">
        <div className="admin-card-header">
          <h3>
            Faculty & Instructors <span className="admin-count-pill">{totalInstructors} Total</span>
          </h3>
        </div>

        <div className="admin-card-body">
          {loading ? (
            <div className="admin-loading-container">
              <div className="admin-spinner"></div>
              <p>Fetching faculty accounts...</p>
            </div>
          ) : error ? (
            <div className="admin-error-card">
              <i className="fa-solid fa-triangle-exclamation"></i>
              <p>{error}</p>
              <button onClick={fetchInstructors} className="btn-admin-primary">
                Retry
              </button>
            </div>
          ) : instructors.length === 0 ? (
            <div className="admin-empty-state">
              <i className="fa-solid fa-chalkboard-user" style={{ fontSize: '2rem', marginBottom: '10px' }}></i>
              <p>No instructor accounts match your search/filter criteria.</p>
            </div>
          ) : (
            <div className="admin-table-responsive">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Instructor</th>
                    <th>Email Address</th>
                    <th>Phone</th>
                    <th>Status</th>
                    <th>Joined Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {instructors.map((inst) => (
                    <tr key={inst._id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div
                            style={{
                              width: '34px',
                              height: '34px',
                              borderRadius: '50%',
                              background: 'rgba(0, 255, 194, 0.15)',
                              border: '1px solid var(--border-glow, rgba(0, 255, 194, 0.4))',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: 'var(--cyan-primary, #00ffc2)',
                              fontSize: '0.9rem',
                            }}
                          >
                            <i className="fa-solid fa-chalkboard-user"></i>
                          </div>
                          <div>
                            <strong style={{ color: 'var(--text-main, #fff)' }}>{inst.fullName}</strong>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted, #7c8ba1)' }}>
                              Role: Faculty Instructor
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>{inst.email}</td>
                      <td>{inst.phone || 'N/A'}</td>
                      <td>
                        <span className={`admin-badge ${inst.status === 'active' ? 'success' : 'danger'}`}>
                          {inst.status === 'active' ? 'Active' : 'Disabled'}
                        </span>
                      </td>
                      <td>{new Date(inst.createdAt).toLocaleDateString()}</td>
                      <td>
                        <button
                          type="button"
                          className="btn-admin-action"
                          style={{
                            color: inst.status === 'active' ? 'var(--danger, #ff4d6d)' : 'var(--cyan-primary, #00ffc2)',
                          }}
                          disabled={actionLoadingId === inst._id}
                          onClick={() => handleToggleStatus(inst)}
                          title={inst.status === 'active' ? 'Disable instructor account' : 'Activate instructor account'}
                        >
                          {actionLoadingId === inst._id ? (
                            <i className="fa-solid fa-spinner fa-spin"></i>
                          ) : inst.status === 'active' ? (
                            <>
                              <i className="fa-solid fa-user-xmark"></i> Disable
                            </>
                          ) : (
                            <>
                              <i className="fa-solid fa-user-check"></i> Activate
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="admin-pagination">
              <button
                type="button"
                className="btn-admin-secondary"
                disabled={page <= 1}
                onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              >
                Previous
              </button>
              <span className="admin-page-indicator">
                Page {page} of {totalPages}
              </span>
              <button
                type="button"
                className="btn-admin-secondary"
                disabled={page >= totalPages}
                onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>

      {/* CREATE INSTRUCTOR MODAL */}
      {showCreateModal && (
        <div className="modal-overlay">
          <div className="modal-card" style={{ maxWidth: '520px' }}>
            <div className="modal-header">
              <h3 style={{ margin: 0, color: 'var(--white, #fff)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <i className="fa-solid fa-user-plus" style={{ color: 'var(--cyan-primary, #00ffc2)' }}></i>
                Create Instructor Account
              </h3>
              <button
                type="button"
                className="btn-close"
                onClick={() => setShowCreateModal(false)}
                disabled={createSubmitting}
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleCreateSubmit}>
              <div className="modal-body">
                {createError && (
                  <div className="admin-alert danger" style={{ marginBottom: '16px' }}>
                    <i className="fa-solid fa-circle-exclamation"></i>
                    <span>{createError}</span>
                  </div>
                )}

                <div className="form-group" style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', marginBottom: '6px', color: 'var(--text-muted, #7c8ba1)' }}>
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    className="form-control"
                    placeholder="e.g. Dr. Rajesh Kumar"
                    value={createFormData.fullName}
                    onChange={(e) => setCreateFormData({ ...createFormData, fullName: e.target.value })}
                  />
                </div>

                <div className="form-group" style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', marginBottom: '6px', color: 'var(--text-muted, #7c8ba1)' }}>
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    className="form-control"
                    placeholder="instructor@netcradus.com"
                    value={createFormData.email}
                    onChange={(e) => setCreateFormData({ ...createFormData, email: e.target.value })}
                  />
                </div>

                <div className="form-group" style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', marginBottom: '6px', color: 'var(--text-muted, #7c8ba1)' }}>
                    Temporary Password (min. 8 characters) *
                  </label>
                  <input
                    type="password"
                    required
                    minLength={8}
                    className="form-control"
                    placeholder="Minimum 8 characters"
                    value={createFormData.password}
                    onChange={(e) => setCreateFormData({ ...createFormData, password: e.target.value })}
                  />
                  <small style={{ color: 'var(--text-muted, #7c8ba1)', display: 'block', marginTop: '4px' }}>
                    Share this temporary password securely with the faculty member for initial login.
                  </small>
                </div>

                <div className="form-group" style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', marginBottom: '6px', color: 'var(--text-muted, #7c8ba1)' }}>
                    Phone Number (Optional)
                  </label>
                  <input
                    type="tel"
                    className="form-control"
                    placeholder="+91 98765 43210"
                    value={createFormData.phone}
                    onChange={(e) => setCreateFormData({ ...createFormData, phone: e.target.value })}
                  />
                </div>
              </div>

              <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  className="btn-admin-secondary"
                  onClick={() => setShowCreateModal(false)}
                  disabled={createSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-admin-primary"
                  disabled={createSubmitting}
                >
                  {createSubmitting ? (
                    <>
                      <i className="fa-solid fa-spinner fa-spin"></i> Creating...
                    </>
                  ) : (
                    'Create Instructor'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* STATUS TOGGLE CONFIRMATION MODAL */}
      {instructorToToggle && (
        <div className="modal-overlay">
          <div className="modal-card" style={{ maxWidth: '440px' }}>
            <div className="modal-header">
              <h3 style={{ margin: 0, color: 'var(--white, #fff)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <i
                  className={instructorToToggle.status === 'active' ? 'fa-solid fa-triangle-exclamation' : 'fa-solid fa-circle-check'}
                  style={{ color: instructorToToggle.status === 'active' ? 'var(--danger, #ff4d6d)' : 'var(--cyan-primary, #00ffc2)' }}
                ></i>
                {instructorToToggle.status === 'active' ? 'Disable Instructor Account' : 'Reactivate Instructor Account'}
              </h3>
              <button
                type="button"
                className="btn-close"
                onClick={() => setInstructorToToggle(null)}
              >
                &times;
              </button>
            </div>
            <div className="modal-body" style={{ color: 'var(--text-secondary, #b4c2dc)', fontSize: '0.95rem' }}>
              {instructorToToggle.status === 'active' ? (
                <>
                  Are you sure you want to disable <strong>{instructorToToggle.fullName}</strong> ({instructorToToggle.email})?
                  This instructor will lose access to the Instructor Portal until reactivated.
                </>
              ) : (
                <>
                  Are you sure you want to reactivate <strong>{instructorToToggle.fullName}</strong> ({instructorToToggle.email})?
                  This instructor will regain access to their assigned courses and grading queues.
                </>
              )}
            </div>
            <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                className="btn-admin-secondary"
                onClick={() => setInstructorToToggle(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className={instructorToToggle.status === 'active' ? 'btn-admin-danger' : 'btn-admin-primary'}
                onClick={executeToggleStatus}
              >
                {instructorToToggle.status === 'active' ? 'Confirm Disable' : 'Confirm Activate'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
