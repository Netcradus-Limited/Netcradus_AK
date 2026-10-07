import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { instructorService } from '../../services/instructorService';

export default function InstructorDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const resData = await instructorService.getDashboard();
      setData(resData);
    } catch (err) {
      console.error('[InstructorDashboard] Error:', err);
      setError(err.message || 'Unable to load instructor metrics.');
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
        <p>Loading your instructor dashboard metrics...</p>
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

  const { stats = {}, recentSubmissions = [], assignedCourses = [] } = data || {};

  return (
    <div className="admin-dashboard-page">
      {/* Quick Action Header Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', color: 'var(--white)', margin: 0 }}>Faculty Overview</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', margin: '4px 0 0' }}>
            Live performance indicators and student practical submissions across your assigned courses.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <Link to="/instructor/courses/new" className="btn-admin-primary">
            <i className="fa-solid fa-plus"></i> Create Course
          </Link>
          <Link to="/instructor/submissions" className="btn-admin-secondary">
            <i className="fa-solid fa-clipboard-check"></i> Review Submissions
            {stats.pendingSubmissions > 0 && (
              <span style={{ marginLeft: '6px', background: '#eb4d4b', color: '#fff', padding: '1px 7px', borderRadius: '10px', fontSize: '0.75rem', fontWeight: 'bold' }}>
                {stats.pendingSubmissions}
              </span>
            )}
          </Link>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="admin-stats-grid">
        <div className="admin-stat-card">
          <div className="admin-stat-icon courses" style={{ background: 'rgba(245, 158, 11, 0.12)', color: 'var(--cyan-primary)' }}>
            <i className="fa-solid fa-book-open"></i>
          </div>
          <div className="admin-stat-info">
            <span className="admin-stat-label">Assigned Courses</span>
            <span className="admin-stat-value">{stats.totalCourses ?? 0}</span>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-icon active-courses" style={{ background: 'rgba(46, 213, 115, 0.12)', color: '#2ed573' }}>
            <i className="fa-solid fa-circle-check"></i>
          </div>
          <div className="admin-stat-info">
            <span className="admin-stat-label">Published Courses</span>
            <span className="admin-stat-value">{stats.publishedCourses ?? 0}</span>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-icon students" style={{ background: 'rgba(112, 161, 255, 0.12)', color: '#70a1ff' }}>
            <i className="fa-solid fa-user-graduate"></i>
          </div>
          <div className="admin-stat-info">
            <span className="admin-stat-label">Enrolled Students</span>
            <span className="admin-stat-value">{stats.uniqueStudents ?? 0}</span>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-icon enrollments" style={{ background: 'rgba(255, 165, 2, 0.12)', color: '#ffa502' }}>
            <i className="fa-solid fa-tasks"></i>
          </div>
          <div className="admin-stat-info">
            <span className="admin-stat-label">Total Assignments</span>
            <span className="admin-stat-value">{stats.totalAssignments ?? 0}</span>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-icon inquiries" style={{ background: 'rgba(235, 77, 75, 0.12)', color: '#eb4d4b' }}>
            <i className="fa-solid fa-clock-rotate-left"></i>
          </div>
          <div className="admin-stat-info">
            <span className="admin-stat-label">Pending Submissions</span>
            <span className="admin-stat-value" style={{ color: stats.pendingSubmissions > 0 ? '#eb4d4b' : 'inherit' }}>
              {stats.pendingSubmissions ?? 0}
            </span>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-icon active-courses" style={{ background: 'rgba(46, 213, 115, 0.12)', color: '#2ed573' }}>
            <i className="fa-solid fa-award"></i>
          </div>
          <div className="admin-stat-info">
            <span className="admin-stat-label">Graded Submissions</span>
            <span className="admin-stat-value">{stats.gradedSubmissions ?? 0}</span>
          </div>
        </div>
      </div>

      {/* Main Content Grid: Recent Submissions & Assigned Courses */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '20px', marginTop: '25px' }}>
        {/* Recent Submissions Card */}
        <div className="admin-card" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '1.1rem', color: 'var(--white)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <i className="fa-solid fa-clipboard-list" style={{ color: 'var(--cyan-primary)' }}></i>
              Recent Student Submissions
            </h3>
            <Link to="/instructor/submissions" style={{ color: 'var(--cyan-primary)', fontSize: '0.85rem', textDecoration: 'none' }}>
              View All <i className="fa-solid fa-arrow-right"></i>
            </Link>
          </div>

          {recentSubmissions.length === 0 ? (
            <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)' }}>
              <i className="fa-regular fa-folder-open" style={{ fontSize: '2rem', marginBottom: '10px', display: 'block' }}></i>
              No student submissions yet for your assigned courses.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {recentSubmissions.map((sub) => (
                <div
                  key={sub.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '12px',
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-sm)',
                    flexWrap: 'wrap',
                    gap: '10px',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600, color: 'var(--white)', fontSize: '0.92rem' }}>
                      {sub.studentName}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {sub.assignmentTitle} • <span style={{ color: 'var(--cyan-primary)' }}>{sub.courseTitle}</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span
                      style={{
                        padding: '3px 8px',
                        borderRadius: '4px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        background: sub.status === 'graded' ? 'rgba(46, 213, 115, 0.15)' : 'rgba(235, 77, 75, 0.15)',
                        color: sub.status === 'graded' ? '#2ed573' : '#eb4d4b',
                      }}
                    >
                      {sub.status === 'graded' ? `${sub.score}/${sub.maxScore}` : sub.status}
                    </span>
                    <Link to="/instructor/submissions" className="btn-admin-secondary" style={{ padding: '4px 10px', fontSize: '0.78rem' }}>
                      Review
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Assigned Courses Overview Card */}
        <div className="admin-card" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '1.1rem', color: 'var(--white)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <i className="fa-solid fa-graduation-cap" style={{ color: 'var(--cyan-primary)' }}></i>
              My Teaching Curriculum
            </h3>
            <Link to="/instructor/courses" style={{ color: 'var(--cyan-primary)', fontSize: '0.85rem', textDecoration: 'none' }}>
              Manage All <i className="fa-solid fa-arrow-right"></i>
            </Link>
          </div>

          {assignedCourses.length === 0 ? (
            <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)' }}>
              <i className="fa-solid fa-book" style={{ fontSize: '2rem', marginBottom: '10px', display: 'block' }}></i>
              You do not have any courses assigned yet.
              <div style={{ marginTop: '12px' }}>
                <Link to="/instructor/courses/new" className="btn-admin-primary" style={{ display: 'inline-block' }}>
                  Create Your First Course
                </Link>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {assignedCourses.map((c) => (
                <div
                  key={c.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '12px',
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-sm)',
                    flexWrap: 'wrap',
                    gap: '10px',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600, color: 'var(--white)', fontSize: '0.92rem' }}>
                      {c.title}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      Category: {c.category} • Status: {c.published ? (
                        <span style={{ color: '#2ed573' }}>Published</span>
                      ) : (
                        <span style={{ color: '#ffa502' }}>Draft</span>
                      )}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <Link to={`/instructor/courses/${c.id}/curriculum`} className="btn-admin-secondary" style={{ padding: '4px 8px', fontSize: '0.78rem' }}>
                      <i className="fa-solid fa-sitemap"></i> Curriculum
                    </Link>
                    <Link to={`/instructor/courses/${c.id}`} className="btn-admin-primary" style={{ padding: '4px 8px', fontSize: '0.78rem' }}>
                      <i className="fa-solid fa-gear"></i> Manage
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
