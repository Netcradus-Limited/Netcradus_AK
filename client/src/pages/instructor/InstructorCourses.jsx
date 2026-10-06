import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { instructorService } from '../../services/instructorService';

export default function InstructorCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [togglingId, setTogglingId] = useState(null);

  const fetchCourses = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await instructorService.getCourses({
        search,
        published: statusFilter,
      });
      setCourses(data);
    } catch (err) {
      console.error('[InstructorCourses] Error:', err);
      setError(err.message || 'Unable to fetch your assigned courses.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, [statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchCourses();
  };

  const handleTogglePublish = async (courseId, currentPublished) => {
    setTogglingId(courseId);
    try {
      await instructorService.togglePublishCourse(courseId, !currentPublished);
      // Update locally
      setCourses((prev) =>
        prev.map((c) => (c._id === courseId ? { ...c, published: !currentPublished } : c))
      );
    } catch (err) {
      alert(err.message || 'Failed to update publication status.');
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <div className="admin-courses-page">
      {/* Action Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '15px' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', color: 'var(--white)', margin: 0 }}>My Assigned Courses</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', margin: '4px 0 0' }}>
            Manage curriculum, assignments, and student enrollments for courses under your faculty portfolio.
          </p>
        </div>
        <Link to="/instructor/courses/new" className="btn-admin-primary">
          <i className="fa-solid fa-plus"></i> Create New Course
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="admin-table-controls" style={{ display: 'flex', gap: '15px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '8px', flex: 1, minWidth: '260px' }}>
          <div style={{ position: 'relative', width: '100%' }}>
            <input
              type="text"
              placeholder="Search course title, category, or slug..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="admin-search-input"
              style={{ width: '100%', paddingLeft: '36px' }}
            />
            <i className="fa-solid fa-magnifying-glass" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}></i>
          </div>
          <button type="submit" className="btn-admin-secondary">
            Search
          </button>
        </form>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Status:</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="admin-filter-select"
          >
            <option value="all">All Courses</option>
            <option value="true">Published Only</option>
            <option value="false">Draft Only</option>
          </select>
        </div>
      </div>

      {/* Loading & Error States */}
      {loading ? (
        <div className="admin-loading-container">
          <div className="admin-spinner"></div>
          <p>Loading course directory...</p>
        </div>
      ) : error ? (
        <div className="admin-error-card">
          <i className="fa-solid fa-triangle-exclamation"></i>
          <h3>Failed to Load Courses</h3>
          <p>{error}</p>
          <button type="button" onClick={fetchCourses} className="btn-admin-primary">
            Retry
          </button>
        </div>
      ) : courses.length === 0 ? (
        <div className="admin-card" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
          <i className="fa-regular fa-folder-open" style={{ fontSize: '2.5rem', marginBottom: '15px', display: 'block', color: 'var(--cyan-primary)' }}></i>
          <h3 style={{ color: 'var(--white)', marginBottom: '8px' }}>No Courses Found</h3>
          <p style={{ maxWidth: '400px', margin: '0 auto 20px', fontSize: '0.9rem' }}>
            {search ? 'No courses match your current search query.' : 'You have not created or been assigned any courses yet.'}
          </p>
          <Link to="/instructor/courses/new" className="btn-admin-primary">
            <i className="fa-solid fa-plus"></i> Create New Course
          </Link>
        </div>
      ) : (
        /* Courses Table */
        <div className="admin-table-wrapper" style={{ overflowX: 'auto', background: 'var(--bg-card)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
          <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left', padding: '14px 16px' }}>Course Title</th>
                <th style={{ textAlign: 'left', padding: '14px 16px' }}>Category & Level</th>
                <th style={{ textAlign: 'center', padding: '14px 16px' }}>Enrollments</th>
                <th style={{ textAlign: 'center', padding: '14px 16px' }}>Modules / Tasks</th>
                <th style={{ textAlign: 'center', padding: '14px 16px' }}>Status</th>
                <th style={{ textAlign: 'right', padding: '14px 16px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {courses.map((course) => (
                <tr key={course._id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ fontWeight: 600, color: 'var(--white)', fontSize: '0.95rem' }}>
                      {course.title}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      slug: <span style={{ color: 'var(--cyan-primary)' }}>{course.slug}</span> • ₹{course.price ? (course.price / 100).toLocaleString('en-IN') : 'Free'}
                    </div>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: '4px', background: 'rgba(255, 255, 255, 0.05)', fontSize: '0.8rem', color: 'var(--text-main)', marginRight: '6px' }}>
                      {course.category}
                    </span>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      {course.level}
                    </span>
                  </td>
                  <td style={{ padding: '14px 16px', textAlign: 'center', fontWeight: 600, color: 'var(--white)' }}>
                    {course.enrollmentCount ?? 0}
                  </td>
                  <td style={{ padding: '14px 16px', textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    {course.moduleCount ?? 0} mods • {course.assignmentCount ?? 0} tasks
                  </td>
                  <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                    <button
                      type="button"
                      disabled={togglingId === course._id}
                      onClick={() => handleTogglePublish(course._id, course.published)}
                      style={{
                        padding: '4px 10px',
                        borderRadius: '12px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        border: 'none',
                        cursor: 'pointer',
                        background: course.published ? 'rgba(46, 213, 115, 0.15)' : 'rgba(255, 165, 2, 0.15)',
                        color: course.published ? '#2ed573' : '#ffa502',
                      }}
                      title="Click to toggle publish status"
                    >
                      {togglingId === course._id ? (
                        <i className="fa-solid fa-spinner fa-spin"></i>
                      ) : course.published ? (
                        'Published'
                      ) : (
                        'Draft'
                      )}
                    </button>
                  </td>
                  <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '8px' }}>
                      <Link
                        to={`/instructor/courses/${course._id}/curriculum`}
                        className="btn-admin-secondary"
                        style={{ padding: '6px 10px', fontSize: '0.8rem' }}
                        title="Manage Curriculum & Lessons"
                      >
                        <i className="fa-solid fa-sitemap"></i> Curriculum
                      </Link>
                      <Link
                        to={`/instructor/courses/${course._id}/assignments`}
                        className="btn-admin-secondary"
                        style={{ padding: '6px 10px', fontSize: '0.8rem' }}
                        title="Manage Course Assignments"
                      >
                        <i className="fa-solid fa-tasks"></i> Assignments
                      </Link>
                      <Link
                        to={`/instructor/courses/${course._id}`}
                        className="btn-admin-primary"
                        style={{ padding: '6px 10px', fontSize: '0.8rem' }}
                        title="Course Overview & Settings"
                      >
                        <i className="fa-solid fa-gear"></i> Manage
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
