import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { instructorService } from '../../services/instructorService';

export default function InstructorStudents() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCourseId = searchParams.get('courseId') || '';

  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(initialCourseId);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchRoster = async () => {
    setLoading(true);
    setError(null);
    try {
      const [rosterData, coursesData] = await Promise.all([
        instructorService.getStudents({
          courseId: selectedCourse || undefined,
          status: statusFilter,
        }),
        instructorService.getCourses(),
      ]);
      setStudents(rosterData || []);
      setCourses(coursesData || []);
    } catch (err) {
      console.error('[InstructorStudents] Error:', err);
      setError(err.message || 'Failed to load enrolled student roster.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoster();
  }, [selectedCourse, statusFilter]);

  const handleCourseFilterChange = (val) => {
    setSelectedCourse(val);
    if (val) {
      setSearchParams({ courseId: val });
    } else {
      setSearchParams({});
    }
  };

  // Filter students by name/email locally for snappy search
  const filteredStudents = students.filter((item) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase().trim();
    const nameMatch = item.student?.fullName?.toLowerCase().includes(q);
    const emailMatch = item.student?.email?.toLowerCase().includes(q);
    const courseMatch = item.course?.title?.toLowerCase().includes(q);
    return nameMatch || emailMatch || courseMatch;
  });

  return (
    <div style={{ maxWidth: '1050px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '15px' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', color: 'var(--white)', margin: 0 }}>Enrolled Student Roster</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', margin: '4px 0 0' }}>
            Monitor student academic progress and cohort engagement across your assigned courses.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="admin-table-controls" style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
          <input
            type="text"
            placeholder="Search student name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="admin-search-input"
            style={{ width: '100%', paddingLeft: '36px' }}
          />
          <i className="fa-solid fa-magnifying-glass" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}></i>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Course:</label>
          <select
            value={selectedCourse}
            onChange={(e) => handleCourseFilterChange(e.target.value)}
            className="admin-filter-select"
          >
            <option value="">All My Courses</option>
            {courses.map((c) => (
              <option key={c._id} value={c._id}>
                {c.title}
              </option>
            ))}
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Status:</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="admin-filter-select"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active Only</option>
            <option value="completed">Completed (100%)</option>
          </select>
        </div>
      </div>

      {/* Loading & Error */}
      {loading ? (
        <div className="admin-loading-container">
          <div className="admin-spinner"></div>
          <p>Loading student directory...</p>
        </div>
      ) : error ? (
        <div className="admin-error-card">
          <i className="fa-solid fa-triangle-exclamation"></i>
          <h3>Failed to Load Student Roster</h3>
          <p>{error}</p>
          <button type="button" onClick={fetchRoster} className="btn-admin-primary">
            Retry
          </button>
        </div>
      ) : filteredStudents.length === 0 ? (
        <div className="admin-card" style={{ padding: '50px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
          <i className="fa-solid fa-user-graduate" style={{ fontSize: '2.5rem', color: 'var(--cyan-primary)', marginBottom: '15px', display: 'block' }}></i>
          <h3 style={{ color: 'var(--white)', marginBottom: '8px' }}>No Enrolled Students Found</h3>
          <p style={{ maxWidth: '400px', margin: '0 auto', fontSize: '0.9rem' }}>
            {search || selectedCourse
              ? 'No students matched your active filter parameters.'
              : 'There are currently no students enrolled in your courses.'}
          </p>
        </div>
      ) : (
        <div className="admin-table-wrapper" style={{ overflowX: 'auto', background: 'var(--bg-card)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
          <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left', padding: '14px 16px' }}>Student</th>
                <th style={{ textAlign: 'left', padding: '14px 16px' }}>Enrolled Course</th>
                <th style={{ textAlign: 'center', padding: '14px 16px' }}>Status</th>
                <th style={{ textAlign: 'left', padding: '14px 16px', minWidth: '160px' }}>Progress</th>
                <th style={{ textAlign: 'right', padding: '14px 16px' }}>Enrolled On</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((item) => (
                <tr key={item.enrollmentId} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div
                        style={{
                          width: '34px',
                          height: '34px',
                          borderRadius: '50%',
                          background: 'rgba(0, 210, 255, 0.12)',
                          color: 'var(--cyan-primary)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 600,
                          fontSize: '0.85rem',
                        }}
                      >
                        {item.student?.fullName ? item.student.fullName.charAt(0).toUpperCase() : 'S'}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, color: 'var(--white)', fontSize: '0.92rem' }}>
                          {item.student?.fullName || 'Unknown Student'}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                          {item.student?.email}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ fontWeight: 500, color: 'var(--text-main)', fontSize: '0.88rem' }}>
                      {item.course?.title || 'Course'}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {item.course?.category}
                    </div>
                  </td>

                  <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                    <span
                      style={{
                        padding: '3px 8px',
                        borderRadius: '4px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        background: item.status === 'completed' ? 'rgba(46, 213, 115, 0.15)' : 'rgba(0, 210, 255, 0.15)',
                        color: item.status === 'completed' ? '#2ed573' : 'var(--cyan-primary)',
                      }}
                    >
                      {item.status}
                    </span>
                  </td>

                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ flex: 1, height: '6px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '3px', overflow: 'hidden' }}>
                        <div
                          style={{
                            width: `${item.progressPercentage || 0}%`,
                            height: '100%',
                            background: item.progressPercentage === 100 ? '#2ed573' : 'var(--cyan-primary)',
                            borderRadius: '3px',
                          }}
                        />
                      </div>
                      <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)', width: '35px', textAlign: 'right' }}>
                        {item.progressPercentage || 0}%
                      </span>
                    </div>
                  </td>

                  <td style={{ padding: '14px 16px', textAlign: 'right', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                    {item.enrolledAt ? new Date(item.enrolledAt).toLocaleDateString() : 'N/A'}
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
