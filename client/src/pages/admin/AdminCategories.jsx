import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import { useApp } from '../../App';

export default function AdminCategories() {
  const { showToast } = useApp();

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');

  // Create / Edit modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    isActive: true,
  });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);

  // Delete modal state
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchCategories = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminService.getCategories({ search });
      setCategories(res.data || []);
    } catch (err) {
      console.error('[AdminCategories] Fetch error:', err);
      setError(err.message || 'Failed to fetch course categories.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [search]);

  const handleOpenCreateModal = () => {
    setEditingCategory(null);
    setFormData({ name: '', description: '', isActive: true });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (cat) => {
    setEditingCategory(cat);
    setFormData({
      name: cat.name || '',
      description: cat.description || '',
      isActive: cat.isActive !== false,
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSubmitForm = async (e) => {
    e.preventDefault();
    setFormError(null);

    if (!formData.name.trim()) {
      setFormError('Category name is required.');
      return;
    }

    setSubmitting(true);
    try {
      if (editingCategory) {
        await adminService.updateCategory(editingCategory._id, {
          name: formData.name.trim(),
          description: formData.description.trim(),
          isActive: formData.isActive,
        });
        showToast('Category updated successfully!');
      } else {
        await adminService.createCategory({
          name: formData.name.trim(),
          description: formData.description.trim(),
          isActive: formData.isActive,
        });
        showToast('Category created successfully!');
      }
      setIsModalOpen(false);
      fetchCategories();
    } catch (err) {
      setFormError(err.message || 'Failed to save category.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCategory = (cat) => {
    setCategoryToDelete(cat);
  };

  const handleConfirmDelete = async () => {
    if (!categoryToDelete) return;
    setDeleting(true);
    try {
      await adminService.deleteCategory(categoryToDelete._id);
      showToast('Category deleted successfully!');
      setCategoryToDelete(null);
      fetchCategories();
    } catch (err) {
      showToast(err.message || 'Failed to delete category.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="admin-page-container">
      {/* Header section */}
      <div className="admin-header-row">
        <div>
          <h2 className="admin-page-title">
            <i className="fa-solid fa-tags" style={{ color: 'var(--cyan-primary)', marginRight: '10px' }}></i>
            Course Categories
          </h2>
          <p className="admin-page-subtitle">
            Manage domain categories, learning tracks, and course classification for Netcradus Academy.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreateModal}
          className="btn-admin-primary"
        >
          <i className="fa-solid fa-plus"></i> Add Category
        </button>
      </div>

      {/* Filter / Search Bar */}
      <div className="admin-filter-bar">
        <div className="admin-search-wrapper" style={{ maxWidth: '400px', flex: 1 }}>
          <i className="fa-solid fa-magnifying-glass admin-search-icon"></i>
          <input
            type="text"
            className="admin-search-input"
            placeholder="Search categories by name or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          Total: <strong style={{ color: 'var(--white)' }}>{categories.length}</strong> categories
        </div>
      </div>

      {/* Main Categories Table / Content */}
      {loading ? (
        <div className="admin-loading-container">
          <div className="admin-spinner"></div>
          <p>Loading course categories...</p>
        </div>
      ) : error ? (
        <div className="admin-error-card">
          <i className="fa-solid fa-triangle-exclamation"></i>
          <h3>Failed to Load Categories</h3>
          <p>{error}</p>
          <button type="button" onClick={fetchCategories} className="btn-admin-primary">
            Retry
          </button>
        </div>
      ) : categories.length === 0 ? (
        <div className="admin-card" style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
          <i className="fa-solid fa-tags" style={{ fontSize: '3rem', color: 'var(--cyan-primary)', marginBottom: '15px', display: 'block' }}></i>
          <h3 style={{ color: 'var(--white)', marginBottom: '8px' }}>No Categories Found</h3>
          <p style={{ maxWidth: '440px', margin: '0 auto 20px', fontSize: '0.9rem' }}>
            {search ? 'No categories matched your search term.' : 'Get started by creating your first course category.'}
          </p>
          <button type="button" onClick={handleOpenCreateModal} className="btn-admin-primary">
            <i className="fa-solid fa-plus"></i> Create First Category
          </button>
        </div>
      ) : (
        <div className="admin-card">
          <div className="admin-table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Category Name</th>
                  <th>Slug Identifier</th>
                  <th>Description</th>
                  <th style={{ textAlign: 'center' }}>Assigned Courses</th>
                  <th style={{ textAlign: 'center' }}>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((cat) => (
                  <tr key={cat._id}>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--white)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <i className="fa-solid fa-folder" style={{ color: 'var(--cyan-primary)', fontSize: '0.9rem' }}></i>
                        {cat.name}
                      </div>
                    </td>
                    <td>
                      <code style={{ background: 'rgba(245, 158, 11, 0.08)', padding: '2px 8px', borderRadius: '4px', color: 'var(--cyan-primary)', fontSize: '0.82rem' }}>
                        {cat.slug}
                      </code>
                    </td>
                    <td style={{ maxWidth: '280px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                      {cat.description || <em style={{ opacity: 0.6 }}>No description provided</em>}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <span
                        className="admin-badge"
                        style={{
                          background: cat.courseCount > 0 ? 'rgba(245, 158, 11, 0.15)' : 'rgba(255, 255, 255, 0.06)',
                          color: cat.courseCount > 0 ? 'var(--cyan-primary)' : 'var(--text-muted)',
                        }}
                      >
                        <i className="fa-solid fa-book-open" style={{ marginRight: '4px' }}></i>
                        {cat.courseCount} {cat.courseCount === 1 ? 'course' : 'courses'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <span className={`admin-badge ${cat.isActive !== false ? 'success' : 'neutral'}`}>
                        {cat.isActive !== false ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '6px' }}>
                        <button
                          type="button"
                          className="btn-admin-action"
                          onClick={() => handleOpenEditModal(cat)}
                          title="Edit category"
                        >
                          <i className="fa-solid fa-pen-to-square"></i> Edit
                        </button>
                        <button
                          type="button"
                          className="btn-admin-action danger"
                          onClick={() => handleDeleteCategory(cat)}
                          title={cat.courseCount > 0 ? 'Cannot delete: courses are actively using this category' : 'Delete category'}
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
        </div>
      )}

      {/* CREATE / EDIT CATEGORY MODAL */}
      {isModalOpen && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-card" style={{ maxWidth: '520px' }}>
            <div className="admin-modal-header">
              <h3>{editingCategory ? 'Edit Category' : 'Create New Category'}</h3>
              <button
                type="button"
                className="admin-modal-close"
                onClick={() => setIsModalOpen(false)}
              >
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
                <label>Category Name *</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  placeholder="e.g. Cloud Security"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Description (Optional)</label>
                <textarea
                  className="form-input"
                  rows="3"
                  placeholder="Brief summary of skills and topics covered under this category..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                ></textarea>
              </div>

              <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '10px' }}>
                <input
                  type="checkbox"
                  id="catActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  style={{ width: '18px', height: '18px', accentColor: 'var(--cyan-primary)' }}
                />
                <label htmlFor="catActive" style={{ cursor: 'pointer', margin: 0, color: 'var(--white)', fontSize: '0.9rem' }}>
                  Active (Visible for course categorization & public filtering)
                </label>
              </div>

              <div className="admin-modal-actions" style={{ marginTop: '25px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  className="btn-admin-secondary"
                  onClick={() => setIsModalOpen(false)}
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-admin-primary"
                  disabled={submitting}
                >
                  {submitting ? 'Saving...' : editingCategory ? 'Update Category' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL WITH SAFETY CHECKS */}
      {categoryToDelete && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-card" style={{ maxWidth: '480px' }}>
            <div className="admin-modal-header">
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--white)' }}>
                <i className="fa-solid fa-triangle-exclamation" style={{ color: categoryToDelete.courseCount > 0 ? 'var(--warning-color)' : '#eb4d4b' }}></i>
                {categoryToDelete.courseCount > 0 ? 'Cannot Delete Category' : 'Confirm Delete Category'}
              </h3>
              <button
                type="button"
                className="admin-modal-close"
                onClick={() => setCategoryToDelete(null)}
              >
                &times;
              </button>
            </div>

            <div style={{ padding: '20px', color: 'var(--text-secondary)', fontSize: '0.92rem' }}>
              {categoryToDelete.courseCount > 0 ? (
                <div style={{ background: 'rgba(235, 77, 75, 0.1)', border: '1px solid rgba(235, 77, 75, 0.3)', borderRadius: 'var(--radius-sm)', padding: '16px', color: '#ff7675' }}>
                  <p style={{ margin: '0 0 10px 0', fontWeight: 600 }}>
                    <i className="fa-solid fa-lock" style={{ marginRight: '6px' }}></i>
                    Safety Protection Active
                  </p>
                  <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--text-main)' }}>
                    Category <strong>"{categoryToDelete.name}"</strong> cannot be deleted while <strong>{categoryToDelete.courseCount}</strong> course(s) are actively using it.
                  </p>
                  <p style={{ margin: '10px 0 0 0', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                    Please reassign or delete the associated courses before deleting this category.
                  </p>
                </div>
              ) : (
                <div>
                  <p style={{ margin: '0 0 10px 0' }}>
                    Are you sure you want to delete category <strong>"{categoryToDelete.name}"</strong>?
                  </p>
                  <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                    This category currently has 0 assigned courses. Deletion is safe and permanent.
                  </p>
                </div>
              )}
            </div>

            <div className="admin-modal-actions" style={{ padding: '15px 20px', borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                className="btn-admin-secondary"
                onClick={() => setCategoryToDelete(null)}
                disabled={deleting}
              >
                {categoryToDelete.courseCount > 0 ? 'Close' : 'Cancel'}
              </button>
              {categoryToDelete.courseCount === 0 && (
                <button
                  type="button"
                  className="btn-admin-action danger"
                  style={{ background: '#eb4d4b', color: '#fff', borderColor: '#eb4d4b', padding: '8px 16px' }}
                  onClick={handleConfirmDelete}
                  disabled={deleting}
                >
                  {deleting ? 'Deleting...' : 'Delete Category'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
