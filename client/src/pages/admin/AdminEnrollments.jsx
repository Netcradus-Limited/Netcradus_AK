import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import { useApp } from '../../App';

export default function AdminEnrollments() {
  const { showToast } = useApp();
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalEnrollments, setTotalEnrollments] = useState(0);
  const [updatingId, setUpdatingId] = useState(null);

  const fetchEnrollments = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminService.getEnrollments({
        status: statusFilter,
        page,
        limit: 15,
      });
      setEnrollments(res.data || []);
      setTotalPages(res.pages || 1);
      setTotalEnrollments(res.total || 0);
    } catch (err) {
      console.error('[AdminEnrollments] Fetch error:', err);
      setError(err.message || 'Failed to fetch enrollment records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnrollments();
  }, [statusFilter, page]);

  const handleStatusChange = async (enrollmentId, newStatus) => {
    setUpdatingId(enrollmentId);
    try {
      await adminService.updateEnrollmentStatus(enrollmentId, newStatus);
      showToast(`Enrollment status updated to '${newStatus}'`);
      fetchEnrollments();
    } catch (err) {
      alert(`Update failed: ${err.message}`);
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'completed':
        return 'info';
      case 'paused':
        return 'warning';
      case 'revoked':
        return 'danger';
      default:
        return 'secondary';
    }
  };

  return (
    <div className="admin-page">
      {/* Filter Bar */}
      <div className="admin-filter-bar">
        <div className="admin-filter-group">
          <label>Filter Status:</label>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="paused">Paused</option>
            <option value="revoked">Revoked</option>
          </select>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="admin-card">
        <div className="admin-card-header">
          <h3>
            Course Enrollments <span className="admin-count-pill">{totalEnrollments} Records</span>
          </h3>
        </div>

        <div className="admin-card-body">
          {loading ? (
            <div className="admin-loading-container">
              <div className="admin-spinner"></div>
              <p>Loading course enrollment applications...</p>
            </div>
          ) : error ? (
            <div className="admin-error-card">
              <i className="fa-solid fa-triangle-exclamation"></i>
              <p>{error}</p>
              <button onClick={fetchEnrollments} className="btn-admin-primary">
                Retry
              </button>
            </div>
          ) : enrollments.length === 0 ? (
            <div className="admin-empty-state">
              <i className="fa-solid fa-graduation-cap" style={{ fontSize: '2rem', marginBottom: '10px' }}></i>
              <p>No enrollment records match your current filter.</p>
            </div>
          ) : (
            <div className="admin-table-responsive">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Student Details</th>
                    <th>Course Title</th>
                    <th>Enrollment Type</th>
                    <th>Progress</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Update Status</th>
                  </tr>
                </thead>
                <tbody>
                  {enrollments.map((e) => (
                    <tr key={e._id}>
                      <td>
                        <strong style={{ color: 'var(--text-main)' }}>
                          {e.userId?.fullName || 'Anonymous Student'}
                        </strong>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          {e.userId?.email || 'N/A'}
                        </div>
                        {e.userId?.phone && (
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                            {e.userId.phone}
                          </div>
                        )}
                      </td>
                      <td>
                        <strong style={{ color: 'var(--cyan-primary)' }}>
                          {e.courseId?.title || 'Unknown Course'}
                        </strong>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          {e.courseId?.category}
                        </div>
                      </td>
                      <td>
                        <span className="admin-badge secondary" style={{ textTransform: 'uppercase' }}>
                          {e.enrollmentType}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div
                            style={{
                              width: '60px',
                              height: '6px',
                              background: '#1e293b',
                              borderRadius: '3px',
                              overflow: 'hidden',
                            }}
                          >
                            <div
                              style={{
                                width: `${e.progressPercentage || 0}%`,
                                height: '100%',
                                background: 'var(--cyan-primary)',
                              }}
                            ></div>
                          </div>
                          <span style={{ fontSize: '0.8rem' }}>{e.progressPercentage || 0}%</span>
                        </div>
                      </td>
                      <td>{new Date(e.createdAt).toLocaleDateString()}</td>
                      <td>
                        <span className={`admin-badge ${getStatusBadge(e.status)}`}>
                          {e.status}
                        </span>
                      </td>
                      <td>
                        <select
                          className="admin-inline-select"
                          value={e.status}
                          disabled={updatingId === e._id}
                          onChange={(evt) => handleStatusChange(e._id, evt.target.value)}
                        >
                          <option value="active">Active</option>
                          <option value="paused">Paused</option>
                          <option value="completed">Completed</option>
                          <option value="revoked">Revoked</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
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
    </div>
  );
}
