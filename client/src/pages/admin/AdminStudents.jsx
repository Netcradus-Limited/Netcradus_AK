import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import { useApp } from '../../App';

export default function AdminStudents() {
  const { showToast } = useApp();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalStudents, setTotalStudents] = useState(0);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [studentToToggle, setStudentToToggle] = useState(null);

  const fetchStudents = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminService.getStudents({
        search,
        status: statusFilter,
        page,
        limit: 15,
      });
      setStudents(res.data || []);
      setTotalPages(res.pages || 1);
      setTotalStudents(res.total || 0);
    } catch (err) {
      console.error('[AdminStudents] Fetch error:', err);
      setError(err.message || 'Failed to fetch student accounts.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [search, statusFilter, page]);

  const handleToggleStatus = (student) => {
    setStudentToToggle(student);
  };

  const executeToggleStatus = async () => {
    if (!studentToToggle) return;
    const student = studentToToggle;
    const newStatus = student.status === 'active' ? 'disabled' : 'active';

    setActionLoadingId(student._id);
    try {
      await adminService.updateStudentStatus(student._id, newStatus);
      showToast(`Student status updated to '${newStatus}'`);
      setStudentToToggle(null);
      fetchStudents();
    } catch (err) {
      showToast(err.message || 'Status update failed.');
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="admin-page">
      {/* Filter Bar */}
      <div className="admin-filter-bar">
        <div className="admin-search-box">
          <i className="fa-solid fa-magnifying-glass"></i>
          <input
            type="text"
            placeholder="Search students by name, email or phone..."
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
            <option value="active">Active Accounts</option>
            <option value="disabled">Disabled Accounts</option>
          </select>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="admin-card">
        <div className="admin-card-header">
          <h3>
            Student Accounts <span className="admin-count-pill">{totalStudents} Total</span>
          </h3>
        </div>

        <div className="admin-card-body">
          {loading ? (
            <div className="admin-loading-container">
              <div className="admin-spinner"></div>
              <p>Fetching student accounts...</p>
            </div>
          ) : error ? (
            <div className="admin-error-card">
              <i className="fa-solid fa-triangle-exclamation"></i>
              <p>{error}</p>
              <button onClick={fetchStudents} className="btn-admin-primary">
                Retry
              </button>
            </div>
          ) : students.length === 0 ? (
            <div className="admin-empty-state">
              <i className="fa-solid fa-user-slash" style={{ fontSize: '2rem', marginBottom: '10px' }}></i>
              <p>No student accounts match your search/filter criteria.</p>
            </div>
          ) : (
            <div className="admin-table-responsive">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Student Name</th>
                    <th>Email Address</th>
                    <th>Phone</th>
                    <th>Status</th>
                    <th>Joined Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student) => (
                    <tr key={student._id}>
                      <td>
                        <strong style={{ color: 'var(--text-main)' }}>{student.fullName}</strong>
                      </td>
                      <td>{student.email}</td>
                      <td>{student.phone || 'N/A'}</td>
                      <td>
                        <span className={`admin-badge ${student.status === 'active' ? 'success' : 'danger'}`}>
                          {student.status}
                        </span>
                      </td>
                      <td>{new Date(student.createdAt).toLocaleDateString()}</td>
                      <td>
                        <button
                          type="button"
                          className={`btn-admin-action ${student.status === 'active' ? 'danger' : 'success'}`}
                          onClick={() => handleToggleStatus(student)}
                          disabled={actionLoadingId === student._id}
                        >
                          {actionLoadingId === student._id ? (
                            <i className="fa-solid fa-spinner fa-spin"></i>
                          ) : student.status === 'active' ? (
                            <>
                              <i className="fa-solid fa-user-xmark"></i> Disable
                            </>
                          ) : (
                            <>
                              <i className="fa-solid fa-user-check"></i> Enable
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
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                className="btn-pagination"
              >
                <i className="fa-solid fa-chevron-left"></i> Prev
              </button>
              <span>
                Page {page} of {totalPages}
              </span>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
                className="btn-pagination"
              >
                Next <i className="fa-solid fa-chevron-right"></i>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Account Status Confirmation Modal */}
      {studentToToggle && (
        <div className="modal-overlay" onClick={() => setStudentToToggle(null)}>
          <div className="modal-card" style={{ maxWidth: '460px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>
                <i className="fa-solid fa-triangle-exclamation" style={{ color: 'var(--accent-orange, #ff6b00)', marginRight: '8px' }}></i>
                Confirm Account Status Change
              </h3>
              <button type="button" className="btn-close" onClick={() => setStudentToToggle(null)}>
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
            <div className="modal-body" style={{ padding: '20px 0' }}>
              <p style={{ color: 'var(--text-main)', fontSize: '0.95rem', lineHeight: '1.5', margin: 0 }}>
                Are you sure you want to set account status for <strong>{studentToToggle.email}</strong> to{' '}
                <strong style={{ color: studentToToggle.status === 'active' ? '#ff4757' : '#2ed573' }}>
                  '{studentToToggle.status === 'active' ? 'disabled' : 'active'}'
                </strong>?
              </p>
              {studentToToggle.status === 'active' && (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '10px', marginBottom: 0 }}>
                  Disabled accounts cannot log in or access enrolled course materials.
                </p>
              )}
            </div>
            <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                className="btn-admin-action"
                disabled={actionLoadingId === studentToToggle._id}
                onClick={() => setStudentToToggle(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className={`btn-admin-action ${studentToToggle.status === 'active' ? 'danger' : 'success'}`}
                disabled={actionLoadingId === studentToToggle._id}
                onClick={executeToggleStatus}
              >
                {actionLoadingId === studentToToggle._id ? (
                  <>
                    <i className="fa-solid fa-spinner fa-spin"></i> Updating...
                  </>
                ) : (
                  `Set to ${studentToToggle.status === 'active' ? 'Disabled' : 'Active'}`
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
