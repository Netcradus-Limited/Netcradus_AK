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

  const formatCurrency = (rupees) => {
    if (typeof rupees !== 'number' || isNaN(rupees)) return '₹0.00';
    return `₹${rupees.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  if (loading) {
    return (
      <div className="admin-loading-container">
        <div className="admin-spinner"></div>
        <p>Loading real-time platform analytics & financial metrics...</p>
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

  const {
    stats = {},
    financial = {},
    coursePerformance: _coursePerformance = [],
    topCourses = [],
    instructorAnalytics = [],
    operationalOverview = {},
    recentActivity = { recentStudents: [], recentEnrollments: [], recentInquiries: [] },
  } = data || {};

  const grossRev = financial.grossRevenueRupees ?? 0;
  const hasTransactions = (financial.successfulPaymentsCount ?? 0) > 0;

  return (
    <div className="admin-dashboard-page">
      {/* 1. TOP OVERVIEW METRIC CARDS */}
      <div className="admin-stats-grid">
        {/* Students */}
        <div className="admin-stat-card">
          <div className="admin-stat-icon students">
            <i className="fa-solid fa-user-graduate"></i>
          </div>
          <div className="admin-stat-info">
            <span className="admin-stat-label">Total Students</span>
            <span className="admin-stat-value">{stats.totalStudents ?? 0}</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              {stats.activeStudents ?? 0} active accounts
            </span>
          </div>
        </div>

        {/* Instructors */}
        <div className="admin-stat-card">
          <div className="admin-stat-icon" style={{ background: 'rgba(56, 189, 248, 0.12)', color: '#38bdf8' }}>
            <i className="fa-solid fa-chalkboard-user"></i>
          </div>
          <div className="admin-stat-info">
            <span className="admin-stat-label">Instructors</span>
            <span className="admin-stat-value">{stats.totalInstructors ?? 0}</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              {stats.activeInstructors ?? 0} active teaching
            </span>
          </div>
        </div>

        {/* Courses */}
        <div className="admin-stat-card">
          <div className="admin-stat-icon courses">
            <i className="fa-solid fa-book-open"></i>
          </div>
          <div className="admin-stat-info">
            <span className="admin-stat-label">Total Courses</span>
            <span className="admin-stat-value">{stats.totalCourses ?? 0}</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              {stats.publishedCourses ?? 0} published · {stats.draftCourses ?? 0} drafts
            </span>
          </div>
        </div>

        {/* Enrollments */}
        <div className="admin-stat-card">
          <div className="admin-stat-icon enrollments">
            <i className="fa-solid fa-graduation-cap"></i>
          </div>
          <div className="admin-stat-info">
            <span className="admin-stat-label">Total Enrollments</span>
            <span className="admin-stat-value">{stats.totalEnrollments ?? 0}</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              {stats.activeEnrollments ?? 0} active · {stats.completedEnrollments ?? 0} completed
            </span>
          </div>
        </div>

        {/* Operational Inquiries */}
        <div className="admin-stat-card">
          <div className="admin-stat-icon inquiries">
            <i className="fa-solid fa-envelope-open-text"></i>
          </div>
          <div className="admin-stat-info">
            <span className="admin-stat-label">Pending Inquiries</span>
            <span className="admin-stat-value">{stats.pendingInquiries ?? 0}</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Awaiting outreach
            </span>
          </div>
        </div>
      </div>

      {/* 2. FINANCIAL & REVENUE ANALYTICS SECTION */}
      <div className="admin-card" style={{ marginBottom: '28px' }}>
        <div className="admin-card-header">
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <i className="fa-solid fa-chart-pie" style={{ color: 'var(--cyan-primary, #00ffc2)' }}></i>
            Financial Analytics & Revenue
          </h3>
          <Link to="/admin/payments" className="admin-card-link">
            Payment Ledger <i className="fa-solid fa-arrow-right"></i>
          </Link>
        </div>
        <div className="admin-card-body">
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '16px',
              marginBottom: '20px',
            }}
          >
            {/* Gross Revenue Card */}
            <div
              style={{
                background: 'rgba(0, 255, 194, 0.05)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '8px',
                padding: '16px',
              }}
            >
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                Gross Revenue (Paid)
              </div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--cyan-primary, #00ffc2)' }}>
                {formatCurrency(grossRev)}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                {hasTransactions
                  ? `${financial.successfulPaymentsCount} successful transactions`
                  : 'No payment transactions available.'}
              </div>
            </div>

            {/* Average Transaction Value */}
            <div
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '8px',
                padding: '16px',
              }}
            >
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                Avg Transaction Value
              </div>
              <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-main)' }}>
                {formatCurrency(financial.averageTransactionValueRupees ?? 0)}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                Per verified payment
              </div>
            </div>

            {/* Last 30 Days */}
            <div
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '8px',
                padding: '16px',
              }}
            >
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                Last 30 Days Revenue
              </div>
              <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-main)' }}>
                {formatCurrency(financial.periodMetrics?.last30DaysRupees ?? 0)}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                {financial.periodMetrics?.comparisonText || 'No comparison available'}
              </div>
            </div>

            {/* Last 7 Days */}
            <div
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '8px',
                padding: '16px',
              }}
            >
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                Last 7 Days Revenue
              </div>
              <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-main)' }}>
                {formatCurrency(financial.periodMetrics?.last7DaysRupees ?? 0)}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                Rolling weekly intake
              </div>
            </div>

            {/* Refunds & Exceptions */}
            <div
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '8px',
                padding: '16px',
              }}
            >
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                Refunds & Exceptions
              </div>
              <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#ff4757' }}>
                {formatCurrency(financial.refundedAmountRupees ?? 0)}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                {financial.refundedPaymentsCount ?? 0} refunded · {financial.failedPaymentsCount ?? 0} failed
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. OPERATIONAL OVERVIEW & PENDING TASKS */}
      <div className="admin-card" style={{ marginBottom: '28px' }}>
        <div className="admin-card-header">
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <i className="fa-solid fa-list-check" style={{ color: '#38bdf8' }}></i>
            Operational Workload & Tasks
          </h3>
        </div>
        <div className="admin-card-body">
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '14px',
            }}
          >
            <div style={{ padding: '12px 16px', background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: '6px' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Pending Grading</div>
              <div style={{ fontSize: '1.3rem', fontWeight: 700, color: operationalOverview.pendingSubmissions > 0 ? '#ffab00' : 'var(--text-main)' }}>
                {operationalOverview.pendingSubmissions ?? 0}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Submissions awaiting evaluation</div>
            </div>

            <div style={{ padding: '12px 16px', background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: '6px' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Resubmissions Requested</div>
              <div style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--text-main)' }}>
                {operationalOverview.resubmissionRequested ?? 0}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Pending student revision</div>
            </div>

            <div style={{ padding: '12px 16px', background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: '6px' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Active Enrollments</div>
              <div style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--cyan-primary, #00ffc2)' }}>
                {operationalOverview.activeEnrollments ?? 0}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Students actively studying</div>
            </div>

            <div style={{ padding: '12px 16px', background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: '6px' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Active Faculty</div>
              <div style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--text-main)' }}>
                {operationalOverview.activeInstructors ?? 0}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Instructors with active accounts</div>
            </div>

            <div style={{ padding: '12px 16px', background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: '6px' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Unpublished Drafts</div>
              <div style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--text-main)' }}>
                {operationalOverview.draftCourses ?? 0}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Courses in development</div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. TOP COURSES & PERFORMANCE ANALYTICS */}
      <div className="admin-card" style={{ marginBottom: '28px' }}>
        <div className="admin-card-header">
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <i className="fa-solid fa-ranking-star" style={{ color: '#ffab00' }}></i>
            Top Courses & Completion Analytics
          </h3>
          <Link to="/admin/courses" className="admin-card-link">
            Manage Courses <i className="fa-solid fa-arrow-right"></i>
          </Link>
        </div>
        <div className="admin-card-body">
          {topCourses.length === 0 ? (
            <div className="admin-empty-state">No course performance data available.</div>
          ) : (
            <div className="admin-table-responsive">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Rank</th>
                    <th>Course Track</th>
                    <th>Instructor</th>
                    <th>Enrollments</th>
                    <th>Completed</th>
                    <th>Completion Rate</th>
                    <th>Attributable Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {topCourses.map((c, index) => (
                    <tr key={c.courseId}>
                      <td style={{ fontWeight: 700, color: index === 0 ? '#ffab00' : 'var(--text-muted)' }}>
                        #{index + 1}
                      </td>
                      <td>
                        <strong style={{ color: 'var(--text-main)' }}>{c.title}</strong>
                        {c.category && (
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            {c.category}
                          </div>
                        )}
                      </td>
                      <td>{c.instructor?.fullName || 'Unassigned'}</td>
                      <td>
                        <strong style={{ color: 'var(--cyan-primary)' }}>{c.totalEnrollments}</strong>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: '4px' }}>
                          ({c.activeEnrollments} active)
                        </span>
                      </td>
                      <td>{c.completedEnrollments}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: '120px' }}>
                          <div
                            style={{
                              flex: 1,
                              height: '6px',
                              background: 'rgba(255, 255, 255, 0.08)',
                              borderRadius: '3px',
                              overflow: 'hidden',
                            }}
                          >
                            <div
                              style={{
                                width: `${Math.min(100, Math.max(0, c.completionRate))}%`,
                                height: '100%',
                                background: 'var(--cyan-primary, #00ffc2)',
                              }}
                            />
                          </div>
                          <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>{c.completionRate}%</span>
                        </div>
                      </td>
                      <td>
                        <strong style={{ color: 'var(--text-main)' }}>{formatCurrency(c.revenueRupees)}</strong>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* 5. INSTRUCTOR ANALYTICS */}
      <div className="admin-card" style={{ marginBottom: '28px' }}>
        <div className="admin-card-header">
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <i className="fa-solid fa-users-gear" style={{ color: '#a855f7' }}></i>
            Instructor Faculty Performance
          </h3>
          <Link to="/admin/instructors" className="admin-card-link">
            Manage Instructors <i className="fa-solid fa-arrow-right"></i>
          </Link>
        </div>
        <div className="admin-card-body">
          {instructorAnalytics.length === 0 ? (
            <div className="admin-empty-state">No instructor records available.</div>
          ) : (
            <div className="admin-table-responsive">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Instructor</th>
                    <th>Status</th>
                    <th>Assigned Courses</th>
                    <th>Published</th>
                    <th>Students Enrolled</th>
                    <th>Completions</th>
                    <th>Pending Grading</th>
                  </tr>
                </thead>
                <tbody>
                  {instructorAnalytics.map((inst) => (
                    <tr key={inst.instructorId}>
                      <td>
                        <strong style={{ color: 'var(--text-main)' }}>{inst.fullName}</strong>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{inst.email}</div>
                      </td>
                      <td>
                        <span className={`admin-badge ${inst.status === 'active' ? 'success' : 'danger'}`}>
                          {inst.status}
                        </span>
                      </td>
                      <td>{inst.assignedCoursesCount}</td>
                      <td>{inst.publishedCoursesCount}</td>
                      <td>
                        <strong style={{ color: 'var(--cyan-primary)' }}>{inst.totalStudentsCount}</strong>
                      </td>
                      <td>{inst.completedStudentsCount}</td>
                      <td>
                        <span
                          className={`admin-badge ${inst.pendingSubmissionsCount > 0 ? 'warning' : 'secondary'}`}
                        >
                          {inst.pendingSubmissionsCount}
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

      {/* 6. RECENT ACTIVITY GRID */}
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

      {/* 7. RECENT INQUIRIES SECTION */}
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
