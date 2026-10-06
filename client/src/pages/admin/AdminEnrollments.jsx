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

  // Manual Enrollment Modal State
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [studentsList, setStudentsList] = useState([]);
  const [coursesList, setCoursesList] = useState([]);
  const [loadingOptions, setLoadingOptions] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [studentSearch, setStudentSearch] = useState('');
  const [enrollSubmitting, setEnrollSubmitting] = useState(false);
  const [enrollError, setEnrollError] = useState(null);

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

  const handleOpenEnrollModal = async () => {
    setShowEnrollModal(true);
    setSelectedStudentId('');
    setSelectedCourseId('');
    setStudentSearch('');
    setEnrollError(null);
    setLoadingOptions(true);

    try {
      const [studentsRes, coursesRes] = await Promise.all([
        adminService.getStudents({ status: 'active', limit: 100 }),
        adminService.getCourses(),
      ]);
      setStudentsList(studentsRes.data || []);
      setCoursesList(coursesRes.data || []);
    } catch (err) {
      console.error('[AdminEnrollments] Error loading options:', err);
      setEnrollError('Failed to load active students or course catalog.');
    } finally {
      setLoadingOptions(false);
    }
  };

  const handleEnrollSubmit = async (e) => {
    e.preventDefault();
    setEnrollError(null);

    if (!selectedStudentId) {
      setEnrollError('Please select a student.');
      return;
    }

    if (!selectedCourseId) {
      setEnrollError('Please select a course.');
      return;
    }

    setEnrollSubmitting(true);
    try {
      const res = await adminService.createEnrollment({
        userId: selectedStudentId,
        courseId: selectedCourseId,
      });
      showToast(res.message || 'Student enrolled successfully.');
      setShowEnrollModal(false);
      fetchEnrollments();
    } catch (err) {
      setEnrollError(err.message || 'Failed to complete manual enrollment.');
    } finally {
      setEnrollSubmitting(false);
    }
  };

  const handleStatusChange = async (enrollmentId, newStatus) => {
    setUpdatingId(enrollmentId);
    try {
      await adminService.updateEnrollmentStatus(enrollmentId, newStatus);
      showToast(`Enrollment status updated to '${newStatus}'`);
      fetchEnrollments();
    } catch (err) {
      showToast(err.message || 'Enrollment status update failed.');
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

  // Filter students based on search within modal
  const filteredStudents = studentsList.filter((s) => {
    if (!studentSearch.trim()) return true;
    const query = studentSearch.toLowerCase().trim();
    return (
      (s.fullName && s.fullName.toLowerCase().includes(query)) ||
      (s.email && s.email.toLowerCase().includes(query))
    );
  });

  const selectedStudentObj = studentsList.find((s) => s._id === selectedStudentId);
  const selectedCourseObj = coursesList.find((c) => c._id === selectedCourseId);

  return (
    <div className="admin-page">
      {/* Filter & Action Bar */}
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

        <button
          type="button"
          className="btn-admin-primary"
          onClick={handleOpenEnrollModal}
          style={{ marginLeft: 'auto' }}
        >
          <i className="fa-solid fa-user-plus"></i> Enroll Student
        </button>
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
                        <span
                          className={`admin-badge ${e.enrollmentType === 'manual' ? 'info' : 'secondary'}`}
                          style={{ textTransform: 'uppercase' }}
                        >
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

      {/* MANUAL ENROLLMENT MODAL */}
      {showEnrollModal && (
        <div className="modal-overlay">
          <div className="modal-card" style={{ maxWidth: '560px' }}>
            <div className="modal-header">
              <h3 style={{ margin: 0, color: 'var(--white, #fff)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <i className="fa-solid fa-user-graduate" style={{ color: 'var(--cyan-primary, #00ffc2)' }}></i>
                Manual Student Enrollment
              </h3>
              <button
                type="button"
                className="btn-close"
                onClick={() => setShowEnrollModal(false)}
                disabled={enrollSubmitting}
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleEnrollSubmit}>
              <div className="modal-body">
                {enrollError && (
                  <div className="admin-alert danger" style={{ marginBottom: '16px' }}>
                    <i className="fa-solid fa-circle-exclamation"></i>
                    <span>{enrollError}</span>
                  </div>
                )}

                {loadingOptions ? (
                  <div style={{ textAlign: 'center', padding: '30px 0', color: 'var(--text-muted)' }}>
                    <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '1.5rem', marginBottom: '8px' }}></i>
                    <p>Loading available students and courses...</p>
                  </div>
                ) : (
                  <>
                    {/* Student Selection */}
                    <div className="form-group" style={{ marginBottom: '16px' }}>
                      <label style={{ display: 'block', marginBottom: '6px', color: 'var(--text-muted, #7c8ba1)' }}>
                        Select Active Student *
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Search student by name or email..."
                        value={studentSearch}
                        onChange={(e) => setStudentSearch(e.target.value)}
                        style={{ marginBottom: '8px' }}
                      />
                      <select
                        required
                        className="form-control"
                        value={selectedStudentId}
                        onChange={(e) => setSelectedStudentId(e.target.value)}
                      >
                        <option value="">-- Choose a Student ({filteredStudents.length} available) --</option>
                        {filteredStudents.map((s) => (
                          <option key={s._id} value={s._id}>
                            {s.fullName} ({s.email})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Course Selection */}
                    <div className="form-group" style={{ marginBottom: '16px' }}>
                      <label style={{ display: 'block', marginBottom: '6px', color: 'var(--text-muted, #7c8ba1)' }}>
                        Select Target Course *
                      </label>
                      <select
                        required
                        className="form-control"
                        value={selectedCourseId}
                        onChange={(e) => setSelectedCourseId(e.target.value)}
                      >
                        <option value="">-- Choose a Course ({coursesList.length} available) --</option>
                        {coursesList.map((c) => (
                          <option key={c._id} value={c._id}>
                            {c.title} [{c.category || 'General'}] {c.instructor ? `— Instructor: ${c.instructor.fullName}` : ''}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Enrollment Details Summary */}
                    {selectedStudentObj && selectedCourseObj && (
                      <div
                        style={{
                          background: 'rgba(0, 255, 194, 0.05)',
                          border: '1px solid var(--border-glow, rgba(0, 255, 194, 0.25))',
                          borderRadius: '8px',
                          padding: '12px 16px',
                          marginBottom: '16px',
                          fontSize: '0.88rem',
                        }}
                      >
                        <div style={{ color: 'var(--cyan-primary, #00ffc2)', fontWeight: 600, marginBottom: '6px' }}>
                          <i className="fa-solid fa-circle-info"></i> Enrollment Summary
                        </div>
                        <div style={{ color: 'var(--text-main, #fff)', marginBottom: '4px' }}>
                          <strong>Student:</strong> {selectedStudentObj.fullName} ({selectedStudentObj.email})
                        </div>
                        <div style={{ color: 'var(--text-main, #fff)', marginBottom: '4px' }}>
                          <strong>Course:</strong> {selectedCourseObj.title}
                        </div>
                        <div style={{ color: 'var(--text-muted, #7c8ba1)' }}>
                          <strong>Grant:</strong> Complimentary Full Access (Type: manual, Fee: ₹0, Status: active)
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>

              <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  className="btn-admin-secondary"
                  onClick={() => setShowEnrollModal(false)}
                  disabled={enrollSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-admin-primary"
                  disabled={enrollSubmitting || loadingOptions || !selectedStudentId || !selectedCourseId}
                >
                  {enrollSubmitting ? (
                    <>
                      <i className="fa-solid fa-spinner fa-spin"></i> Enrolling...
                    </>
                  ) : (
                    'Confirm Enrollment'
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
