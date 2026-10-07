import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { instructorService } from '../../services/instructorService';

export default function InstructorCourseManage() {
  const { courseId } = useParams();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toggling, setToggling] = useState(false);

  const fetchCourseData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await instructorService.getCourse(courseId);
      setCourse(data);
    } catch (err) {
      console.error('[InstructorCourseManage] Error:', err);
      setError(err.message || 'Failed to load course details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourseData();
  }, [courseId]);

  const handleTogglePublish = async () => {
    if (!course) return;
    setToggling(true);
    try {
      const updated = await instructorService.togglePublishCourse(course._id, !course.published);
      setCourse((prev) => ({ ...prev, published: updated.published }));
    } catch (err) {
      alert(err.message || 'Failed to toggle publication status.');
    } finally {
      setToggling(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-loading-container">
        <div className="admin-spinner"></div>
        <p>Loading course dashboard...</p>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="admin-error-card">
        <i className="fa-solid fa-triangle-exclamation"></i>
        <h3>Course Access Error</h3>
        <p>{error || 'Course not found or access denied.'}</p>
        <Link to="/instructor/courses" className="btn-admin-primary">
          Back to My Courses
        </Link>
      </div>
    );
  }

  return (
    <div>
      {/* Breadcrumb & Header */}
      <div style={{ marginBottom: '24px' }}>
        <Link to="/instructor/courses" style={{ color: 'var(--cyan-primary)', fontSize: '0.85rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
          <i className="fa-solid fa-arrow-left"></i> Back to My Courses
        </Link>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px', flexWrap: 'wrap', gap: '15px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <h2 style={{ fontSize: '1.5rem', color: 'var(--white)', margin: 0 }}>
                {course.title}
              </h2>
              <span
                style={{
                  padding: '3px 10px',
                  borderRadius: '12px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  background: course.published ? 'rgba(46, 213, 115, 0.15)' : 'rgba(255, 165, 2, 0.15)',
                  color: course.published ? '#2ed573' : '#ffa502',
                }}
              >
                {course.published ? 'Published' : 'Draft'}
              </span>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', margin: '4px 0 0' }}>
              Category: {course.category} • Level: {course.level} • Slug: <span style={{ color: 'var(--cyan-primary)' }}>{course.slug}</span>
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              type="button"
              onClick={handleTogglePublish}
              disabled={toggling}
              className="btn-admin-secondary"
            >
              {toggling ? (
                <i className="fa-solid fa-spinner fa-spin"></i>
              ) : course.published ? (
                <>
                  <i className="fa-solid fa-eye-slash"></i> Unpublish
                </>
              ) : (
                <>
                  <i className="fa-solid fa-globe"></i> Publish Live
                </>
              )}
            </button>
            <Link to={`/instructor/courses/${course._id}/edit`} className="btn-admin-primary">
              <i className="fa-solid fa-pen-to-square"></i> Edit Details
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="admin-stats-grid" style={{ marginBottom: '28px' }}>
        <div className="admin-stat-card">
          <div className="admin-stat-icon students" style={{ background: 'rgba(112, 161, 255, 0.12)', color: '#70a1ff' }}>
            <i className="fa-solid fa-users"></i>
          </div>
          <div className="admin-stat-info">
            <span className="admin-stat-label">Enrolled Students</span>
            <span className="admin-stat-value">{course.enrollmentCount ?? 0}</span>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-icon courses" style={{ background: 'rgba(245, 158, 11, 0.12)', color: 'var(--cyan-primary)' }}>
            <i className="fa-solid fa-sitemap"></i>
          </div>
          <div className="admin-stat-info">
            <span className="admin-stat-label">Curriculum Modules</span>
            <span className="admin-stat-value">{course.moduleCount ?? 0}</span>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-icon enrollments" style={{ background: 'rgba(255, 165, 2, 0.12)', color: '#ffa502' }}>
            <i className="fa-solid fa-tasks"></i>
          </div>
          <div className="admin-stat-info">
            <span className="admin-stat-label">Practical Tasks</span>
            <span className="admin-stat-value">{course.assignmentCount ?? 0}</span>
          </div>
        </div>
      </div>

      {/* Management Navigation Hub */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
        {/* Curriculum Card */}
        <div className="admin-card" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ width: '48px', height: '48px', borderRadius: '8px', background: 'rgba(245, 158, 11, 0.12)', color: 'var(--cyan-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', marginBottom: '14px' }}>
              <i className="fa-solid fa-sitemap"></i>
            </div>
            <h3 style={{ fontSize: '1.2rem', color: 'var(--white)', marginBottom: '8px' }}>Curriculum & Lectures</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: '1.5', marginBottom: '20px' }}>
              Build and sequence learning modules, upload video lectures, lab instructions, and create multiple-choice quizzes.
            </p>
          </div>
          <Link to={`/instructor/courses/${course._id}/curriculum`} className="btn-admin-primary" style={{ textAlign: 'center' }}>
            Open Curriculum Builder <i className="fa-solid fa-arrow-right" style={{ marginLeft: '6px' }}></i>
          </Link>
        </div>

        {/* Assignments Card */}
        <div className="admin-card" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ width: '48px', height: '48px', borderRadius: '8px', background: 'rgba(255, 165, 2, 0.12)', color: '#ffa502', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', marginBottom: '14px' }}>
              <i className="fa-solid fa-tasks"></i>
            </div>
            <h3 style={{ fontSize: '1.2rem', color: 'var(--white)', marginBottom: '8px' }}>Assignments & Labs</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: '1.5', marginBottom: '20px' }}>
              Configure hands-on practical assignments, set max scoring parameters, define submission requirements, and review submissions.
            </p>
          </div>
          <Link to={`/instructor/courses/${course._id}/assignments`} className="btn-admin-primary" style={{ textAlign: 'center' }}>
            Manage Course Assignments <i className="fa-solid fa-arrow-right" style={{ marginLeft: '6px' }}></i>
          </Link>
        </div>

        {/* Enrolled Students Card */}
        <div className="admin-card" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ width: '48px', height: '48px', borderRadius: '8px', background: 'rgba(112, 161, 255, 0.12)', color: '#70a1ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', marginBottom: '14px' }}>
              <i className="fa-solid fa-user-graduate"></i>
            </div>
            <h3 style={{ fontSize: '1.2rem', color: 'var(--white)', marginBottom: '8px' }}>Student Roster</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: '1.5', marginBottom: '20px' }}>
              Inspect enrolled student roster, check course progress percentages, and monitor learning engagement.
            </p>
          </div>
          <Link to={`/instructor/students?courseId=${course._id}`} className="btn-admin-primary" style={{ textAlign: 'center' }}>
            View Enrolled Students <i className="fa-solid fa-arrow-right" style={{ marginLeft: '6px' }}></i>
          </Link>
        </div>
      </div>
    </div>
  );
}
