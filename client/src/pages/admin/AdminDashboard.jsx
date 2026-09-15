import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminService } from '../../services/adminService';

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const resData = await adminService.getDashboardStats();
      setData(resData);
    } catch (err) {
      console.error('[AdminDashboard] Fetch error:', err);
      setError(err.message || 'Unable to load dashboard statistics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="admin-loading-container">
        <div className="admin-spinner"></div>
        <p>Loading real-time database metrics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-error-card">
        <i className="fa-solid fa-triangle-exclamation"></i>
        <h3>Dashboard Error</h3>
        <p>{error}</p>
        <button type="button" onClick={fetchStats} className="btn-admin-primary">
          <i className="fa-solid fa-rotate-right"></i> Retry Loading
        </button>
      </div>
    );
  }

  const { stats, recentActivity } = data || {
    stats: {},
    recentActivity: { recentStudents: [], recentEnrollments: [], recentInquiries: [] },
  };

  return (
    <div className="admin-dashboard-page">
      {/* Overview Metric Cards */}
      <div className="admin-stats-grid">
        <div className="admin-stat-card">
          <div className="admin-stat-icon students">
            <i className="fa-solid fa-user-graduate"></i>
          </div>
          <div className="admin-stat-info">
            <span className="admin-stat-label">Total Students</span>
            <span className="admin-stat-value">{stats.totalStudents ?? 0}</span>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-icon courses">
            <i className="fa-solid fa-book-open"></i>
          </div>
          <div className="admin-stat-info">
            <span className="admin-stat-label">Total Courses</span>
            <span className="admin-stat-value">{stats.totalCourses ?? 0}</span>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-icon active-courses">
            <i className="fa-solid fa-circle-check"></i>
          </div>
          <div className="admin-stat-info">
            <span className="admin-stat-label">Active Published Courses</span>
            <span className="admin-stat-value">{stats.activeCourses ?? 0}</span>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-icon enrollments">
            <i className="fa-solid fa-graduation-cap"></i>
          </div>
          <div className="admin-stat-info">
            <span className="admin-stat-label">Total Enrollments</span>
            <span className="admin-stat-value">{stats.totalEnrollments ?? 0}</span>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-icon inquiries">
            <i className="fa-solid fa-envelope-open-text"></i>
          </div>
          <div className="admin-stat-info">
            <span className="admin-stat-label">Pending Inquiries</span>
            <span className="admin-stat-value">{stats.pendingInquiries ?? 0}</span>
          </div>
        </div>
      </div>

      {/* Recent Activity Grid */}
      <div className="admin-activity-grid">
        {/* Recent Students Card */}
        <div className="admin-card">
          <div className="admin-card-header">
            <h3>Recent Student Registrations</h3>
            <Link to="/admin/students" className="admin-card-link">
              View All <i className="fa-solid fa-arrow-right"></i>
            </Link>
          </div>
          <div className="admin-card-body">
            {recentActivity.recentStudents?.length === 0 ? (
              <div className="admin-empty-state">No student records found in database.</div>
            ) : (
              <div className="admin-table-responsive">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Joined</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentActivity.recentStudents.map((s) => (
                      <tr key={s._id}>
                        <td>
                          <strong style={{ color: 'var(--text-main)' }}>{s.fullName}</strong>
                        </td>
                        <td>{s.email}</td>
                        <td>{new Date(s.createdAt).toLocaleDateString()}</td>
                        <td>
                          <span className={`admin-badge ${s.status === 'active' ? 'success' : 'danger'}`}>
                            {s.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Recent Enrollments Card */}
        <div className="admin-card">
          <div className="admin-card-header">
            <h3>Recent Course Applications</h3>
            <Link to="/admin/enrollments" className="admin-card-link">
              View All <i className="fa-solid fa-arrow-right"></i>
            </Link>
          </div>
          <div className="admin-card-body">
            {recentActivity.recentEnrollments?.length === 0 ? (
              <div className="admin-empty-state">No enrollment applications found in database.</div>
            ) : (
              <div className="admin-table-responsive">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Student</th>
                      <th>Course</th>
                      <th>Date</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentActivity.recentEnrollments.map((e) => (
                      <tr key={e._id}>
                        <td>{e.userId?.fullName || e.userId?.email || 'N/A'}</td>
                        <td>{e.courseId?.title || 'Unknown Course'}</td>
                        <td>{new Date(e.createdAt).toLocaleDateString()}</td>
                        <td>
                          <span className={`admin-badge ${e.status === 'active' ? 'success' : 'warning'}`}>
                            {e.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Inquiries Section */}
      <div className="admin-card" style={{ marginTop: '24px' }}>
        <div className="admin-card-header">
          <h3>Recent Inquiries & Leads</h3>
          <Link to="/admin/inquiries" className="admin-card-link">
            View All <i className="fa-solid fa-arrow-right"></i>
          </Link>
        </div>
        <div className="admin-card-body">
          {recentActivity.recentInquiries?.length === 0 ? (
            <div className="admin-empty-state">No inquiry leads found in database.</div>
          ) : (
            <div className="admin-table-responsive">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email / Phone</th>
                    <th>Course Interest</th>
                    <th>Source</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recentActivity.recentInquiries.map((inq) => (
                    <tr key={inq._id}>
                      <td><strong style={{ color: 'var(--text-main)' }}>{inq.fullName}</strong></td>
                      <td>
                        {inq.email && <div>{inq.email}</div>}
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{inq.phone}</div>
                      </td>
                      <td>{inq.interestedCourse}</td>
                      <td>
                        <span className="admin-badge info">{inq.source}</span>
                      </td>
                      <td>
                        <span className={`admin-badge ${inq.status === 'new' ? 'warning' : 'success'}`}>
                          {inq.status}
                        </span>
                      </td>
                      <td>{new Date(inq.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
