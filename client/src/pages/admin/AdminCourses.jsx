import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminService } from '../../services/adminService';
import { useApp } from '../../App';

export default function AdminCourses() {
  const { showToast } = useApp();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);

  const defaultFormData = {
    title: '',
    slug: '',
    shortDescription: '',
    description: '',
    category: 'CYBER SECURITY',
    level: 'Beginner to Advanced',
    price: 99900, // stored in paise, e.g. ₹999
    discountPrice: 0,
    duration: '8 Weeks',
    thumbnail: '',
    published: true,
  };

  const [formData, setFormData] = useState(defaultFormData);

  const fetchCourses = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminService.getCourses({
        search,
        category: categoryFilter,
      });
      setCourses(res.data || []);
    } catch (err) {
      console.error('[AdminCourses] Fetch error:', err);
      setError(err.message || 'Failed to fetch course catalog.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, [search, categoryFilter]);

  const handleOpenCreateModal = () => {
    setEditingCourse(null);
    setFormData(defaultFormData);
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (course) => {
    setEditingCourse(course);
    setFormData({
      title: course.title || '',
      slug: course.slug || '',
      shortDescription: course.shortDescription || '',
      description: course.description || '',
      category: course.category || 'CYBER SECURITY',
      level: course.level || 'Beginner',
      price: course.price || 0,
      discountPrice: course.discountPrice || 0,
      duration: course.duration || '8 Weeks',
      thumbnail: course.thumbnail || '',
      published: course.published !== undefined ? course.published : true,
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleTitleChange = (e) => {
    const titleVal = e.target.value;
    if (!editingCourse) {
      // Auto-generate slug for new courses
      const autoSlug = titleVal.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      setFormData((prev) => ({ ...prev, title: titleVal, slug: autoSlug }));
    } else {
      setFormData((prev) => ({ ...prev, title: titleVal }));
    }
  };

  const handleSubmitForm = async (e) => {
    e.preventDefault();
    setFormError(null);

    if (!formData.title.trim() || !formData.slug.trim() || !formData.category || !formData.level) {
      setFormError('Please fill in all required fields (Title, Slug, Category, Level, Price).');
      return;
    }

    setSubmitting(true);
    try {
      if (editingCourse) {
        await adminService.updateCourse(editingCourse._id, formData);
        showToast(`Course '${formData.title}' updated successfully.`);
      } else {
        await adminService.createCourse(formData);
        showToast(`Course '${formData.title}' created successfully.`);
      }
      setIsModalOpen(false);
      fetchCourses();
    } catch (err) {
      setFormError(err.message || 'Failed to save course. Please check inputs.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCourse = async (course) => {
    const confirmMsg = `Are you sure you want to delete '${course.title}'?\nThis action cannot be undone.`;
    if (!window.confirm(confirmMsg)) return;

    try {
      await adminService.deleteCourse(course._id);
      showToast(`Course '${course.title}' deleted successfully.`);
      fetchCourses();
    } catch (err) {
      alert(`Deletion blocked: ${err.message}`);
    }
  };

  return (
    <div className="admin-page">
      {/* Top Controls */}
      <div className="admin-filter-bar">
        <div className="admin-search-box">
          <i className="fa-solid fa-magnifying-glass"></i>
          <input
            type="text"
            placeholder="Search courses by title, slug or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="admin-filter-group">
          <label>Category:</label>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="all">All Categories</option>
            <option value="cyber">CYBER SECURITY</option>
            <option value="ai">ARTIFICIAL INTELLIGENCE</option>
            <option value="cloud">CLOUD COMPUTING</option>
            <option value="data">DATA SCIENCE</option>
            <option value="fullstack">FULL STACK DEVELOPMENT</option>
          </select>
        </div>

        <button type="button" className="btn-admin-primary" onClick={handleOpenCreateModal}>
          <i className="fa-solid fa-plus"></i> Create New Course
        </button>
      </div>

      {/* Course Catalog Table */}
      <div className="admin-card">
        <div className="admin-card-header">
          <h3>
            Course Catalog <span className="admin-count-pill">{courses.length} Courses</span>
          </h3>
        </div>

        <div className="admin-card-body">
          {loading ? (
            <div className="admin-loading-container">
              <div className="admin-spinner"></div>
              <p>Loading course catalog...</p>
            </div>
          ) : error ? (
            <div className="admin-error-card">
              <i className="fa-solid fa-triangle-exclamation"></i>
              <p>{error}</p>
              <button onClick={fetchCourses} className="btn-admin-primary">
                Retry
              </button>
            </div>
          ) : courses.length === 0 ? (
            <div className="admin-empty-state">
              <i className="fa-solid fa-book-open" style={{ fontSize: '2rem', marginBottom: '10px' }}></i>
              <p>No courses found in database.</p>
            </div>
          ) : (
            <div className="admin-table-responsive">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Course Title</th>
                    <th>Category</th>
                    <th>Level</th>
                    <th>Price (INR)</th>
                    <th>Duration</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {courses.map((c) => (
                    <tr key={c._id}>
                      <td>
                        <strong style={{ color: 'var(--text-main)' }}>{c.title}</strong>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>slug: /{c.slug}</div>
                      </td>
                      <td>
                        <span className="admin-badge info">{c.category}</span>
                      </td>
                      <td>{c.level}</td>
                      <td>₹{(c.price / 100).toLocaleString('en-IN')}</td>
                      <td>{c.duration}</td>
                      <td>
                        <span className={`admin-badge ${c.published ? 'success' : 'warning'}`}>
                          {c.published ? 'Published' : 'Draft'}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <Link
                            to={`/admin/courses/${c._id}/curriculum`}
                            className="btn-admin-action"
                            style={{ background: 'rgba(0, 210, 255, 0.15)', color: 'var(--cyan-primary)', border: '1px solid var(--border-glow)' }}
                            title="Manage Course Curriculum & Lectures"
                          >
                            <i className="fa-solid fa-list-check"></i> Curriculum
                          </Link>
                          <button
                            type="button"
                            className="btn-admin-action"
                            onClick={() => handleOpenEditModal(c)}
                            title="Edit course"
                          >
                            <i className="fa-solid fa-pen-to-square"></i> Edit
                          </button>
                          <button
                            type="button"
                            className="btn-admin-action danger"
                            onClick={() => handleDeleteCourse(c)}
                            title="Delete course"
                          >
                            <i className="fa-solid fa-trash-can"></i> Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Create / Edit Modal Dialog */}
      {isModalOpen && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-card">
            <div className="admin-modal-header">
              <h3>{editingCourse ? 'Edit Course' : 'Create New Course'}</h3>
              <button type="button" className="admin-modal-close" onClick={() => setIsModalOpen(false)}>
                &times;
              </button>
            </div>

            {formError && (
              <div className="admin-modal-error">
                <i className="fa-solid fa-circle-exclamation"></i> {formError}
              </div>
            )}

            <form onSubmit={handleSubmitForm} noValidate className="admin-form">
              <div className="form-group">
                <label>Course Title *</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  value={formData.title}
                  onChange={handleTitleChange}
                  placeholder="e.g. Master's in Ethical Hacking"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Slug URL Identifier *</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    placeholder="e.g. masters-ethical-hacking"
                  />
                </div>

                <div className="form-group">
                  <label>Category *</label>
                  <select
                    className="form-input"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  >
                    <option value="CYBER SECURITY">CYBER SECURITY</option>
                    <option value="ARTIFICIAL INTELLIGENCE">ARTIFICIAL INTELLIGENCE</option>
                    <option value="CLOUD COMPUTING">CLOUD COMPUTING</option>
                    <option value="DATA SCIENCE">DATA SCIENCE</option>
                    <option value="FULL STACK DEVELOPMENT">FULL STACK DEVELOPMENT</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Skill Level *</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    value={formData.level}
                    onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                    placeholder="e.g. Beginner to Advanced"
                  />
                </div>

                <div className="form-group">
                  <label>Price in Paise (e.g. 99900 = ₹999) *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    className="form-input"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Duration</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    placeholder="e.g. 8 Weeks"
                  />
                </div>

                <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '25px' }}>
                  <input
                    type="checkbox"
                    id="publishedCheck"
                    checked={formData.published}
                    onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                    style={{ width: '18px', height: '18px', accentColor: 'var(--cyan-primary)' }}
                  />
                  <label htmlFor="publishedCheck" style={{ cursor: 'pointer', margin: 0 }}>
                    Publish Course Immediately
                  </label>
                </div>
              </div>

              <div className="form-group">
                <label>Short Description</label>
                <textarea
                  rows="2"
                  className="form-input"
                  value={formData.shortDescription}
                  onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                  placeholder="Brief 1-2 sentence overview of the course"
                ></textarea>
              </div>

              <div className="admin-modal-actions">
                <button
                  type="button"
                  className="btn-admin-secondary"
                  onClick={() => setIsModalOpen(false)}
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-admin-primary" disabled={submitting}>
                  {submitting ? (
                    <span>
                      <i className="fa-solid fa-spinner fa-spin"></i> Saving...
                    </span>
                  ) : editingCourse ? (
                    'Save Changes'
                  ) : (
                    'Create Course'
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
