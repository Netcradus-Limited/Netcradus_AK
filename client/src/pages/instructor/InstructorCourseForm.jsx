import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { instructorService } from '../../services/instructorService';

export default function InstructorCourseForm() {
  const { courseId } = useParams();
  const isEdit = Boolean(courseId);
  const navigate = useNavigate();

  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    shortDescription: '',
    description: '',
    category: 'Cyber Security',
    level: 'Beginner',
    price: 999, // In rupees for UI
    discountPrice: '',
    duration: '8 Weeks',
    thumbnail: '',
    published: false,
  });

  useEffect(() => {
    if (isEdit) {
      const loadCourse = async () => {
        setLoading(true);
        setError(null);
        try {
          const course = await instructorService.getCourse(courseId);
          setFormData({
            title: course.title || '',
            slug: course.slug || '',
            shortDescription: course.shortDescription || '',
            description: course.description || '',
            category: course.category || 'Cyber Security',
            level: course.level || 'Beginner',
            price: course.price !== undefined ? course.price / 100 : 0,
            discountPrice: course.discountPrice !== undefined ? course.discountPrice / 100 : '',
            duration: course.duration || '8 Weeks',
            thumbnail: course.thumbnail || '',
            published: Boolean(course.published),
          });
        } catch (err) {
          console.error('[InstructorCourseForm] Fetch error:', err);
          setError(err.message || 'Failed to load course details.');
        } finally {
          setLoading(false);
        }
      };
      loadCourse();
    }
  }, [courseId, isEdit]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => {
      const updated = {
        ...prev,
        [name]: type === 'checkbox' ? checked : value,
      };

      // Auto-generate slug from title if new course and slug not manually edited
      if (name === 'title' && !isEdit) {
        updated.slug = value
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '');
      }

      return updated;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Client-side validations
    if (!formData.title.trim()) {
      setError('Course title is required.');
      return;
    }
    if (!formData.slug.trim()) {
      setError('Course slug is required.');
      return;
    }
    const priceNum = Number(formData.price);
    if (isNaN(priceNum) || priceNum < 0) {
      setError('Price must be a positive number.');
      return;
    }

    let discountPaise = undefined;
    if (formData.discountPrice !== '' && formData.discountPrice !== null && formData.discountPrice !== undefined) {
      const discNum = Number(formData.discountPrice);
      if (isNaN(discNum) || discNum < 0) {
        setError('Discount price cannot be negative.');
        return;
      }
      if (discNum > priceNum) {
        setError('Discount price must be less than or equal to the regular price.');
        return;
      }
      discountPaise = Math.round(discNum * 100);
    }

    const payload = {
      title: formData.title.trim(),
      slug: formData.slug.trim().toLowerCase(),
      shortDescription: formData.shortDescription.trim(),
      description: formData.description.trim(),
      category: formData.category.trim(),
      level: formData.level.trim(),
      price: Math.round(priceNum * 100), // convert to paise
      discountPrice: discountPaise,
      duration: formData.duration.trim(),
      thumbnail: formData.thumbnail.trim(),
      published: Boolean(formData.published),
    };

    setSubmitting(true);
    try {
      if (isEdit) {
        await instructorService.updateCourse(courseId, payload);
        navigate(`/instructor/courses/${courseId}`);
      } else {
        const created = await instructorService.createCourse(payload);
        navigate(`/instructor/courses/${created._id}`);
      }
    } catch (err) {
      console.error('[InstructorCourseForm] Submit error:', err);
      setError(err.message || 'Failed to save course. Please check inputs.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-loading-container">
        <div className="admin-spinner"></div>
        <p>Loading course information...</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '850px', margin: '0 auto' }}>
      {/* Back Link & Header */}
      <div style={{ marginBottom: '20px' }}>
        <Link to="/instructor/courses" style={{ color: 'var(--cyan-primary)', fontSize: '0.85rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
          <i className="fa-solid fa-arrow-left"></i> Back to My Courses
        </Link>
        <h2 style={{ fontSize: '1.4rem', color: 'var(--white)', marginTop: '8px' }}>
          {isEdit ? 'Edit Assigned Course' : 'Create New Course'}
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
          {isEdit ? 'Update course specifications and publishing parameters.' : 'Define basic syllabus details and publishing state for your new course program.'}
        </p>
      </div>

      {error && (
        <div style={{ background: 'rgba(235, 77, 75, 0.15)', border: '1px solid #eb4d4b', color: '#ff6b6b', padding: '12px 16px', borderRadius: 'var(--radius-sm)', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <i className="fa-solid fa-circle-exclamation"></i>
          <span>{error}</span>
        </div>
      )}

      {/* Form Card */}
      <form onSubmit={handleSubmit} style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '28px' }}>
        {/* Title */}
        <div style={{ marginBottom: '18px' }}>
          <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 600, color: 'var(--white)', marginBottom: '6px' }}>
            Course Title *
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            placeholder="e.g. Offensive Cyber Operations & Penetration Testing"
            style={{ width: '100%', padding: '10px 14px', background: 'var(--bg-dark)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', color: 'var(--text-main)', fontSize: '0.92rem' }}
          />
        </div>

        {/* Slug */}
        <div style={{ marginBottom: '18px' }}>
          <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 600, color: 'var(--white)', marginBottom: '6px' }}>
            URL Slug identifier *
          </label>
          <input
            type="text"
            name="slug"
            value={formData.slug}
            onChange={handleChange}
            required
            placeholder="e.g. offensive-cyber-operations"
            style={{ width: '100%', padding: '10px 14px', background: 'var(--bg-dark)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', color: 'var(--text-main)', fontSize: '0.92rem' }}
          />
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Unique URL path key for public course registration.</span>
        </div>

        {/* Category & Level */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px', marginBottom: '18px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 600, color: 'var(--white)', marginBottom: '6px' }}>
              Category *
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              style={{ width: '100%', padding: '10px 14px', background: 'var(--bg-dark)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', color: 'var(--text-main)', fontSize: '0.92rem' }}
            >
              <option value="Cyber Security">Cyber Security</option>
              <option value="Cloud">Cloud</option>
              <option value="AI/ML">AI/ML</option>
              <option value="Linux">Linux</option>
              <option value="Networking">Networking</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 600, color: 'var(--white)', marginBottom: '6px' }}>
              Experience Level *
            </label>
            <select
              name="level"
              value={formData.level}
              onChange={handleChange}
              style={{ width: '100%', padding: '10px 14px', background: 'var(--bg-dark)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', color: 'var(--text-main)', fontSize: '0.92rem' }}
            >
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
              <option value="Comprehensive">Comprehensive</option>
            </select>
          </div>
        </div>

        {/* Price & Discount Price */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px', marginBottom: '18px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 600, color: 'var(--white)', marginBottom: '6px' }}>
              Regular Price (₹ INR) *
            </label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              min="0"
              required
              style={{ width: '100%', padding: '10px 14px', background: 'var(--bg-dark)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', color: 'var(--text-main)', fontSize: '0.92rem' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 600, color: 'var(--white)', marginBottom: '6px' }}>
              Discount Price (₹ INR, optional)
            </label>
            <input
              type="number"
              name="discountPrice"
              value={formData.discountPrice}
              onChange={handleChange}
              min="0"
              placeholder="Leave empty if none"
              style={{ width: '100%', padding: '10px 14px', background: 'var(--bg-dark)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', color: 'var(--text-main)', fontSize: '0.92rem' }}
            />
          </div>
        </div>

        {/* Duration & Thumbnail */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px', marginBottom: '18px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 600, color: 'var(--white)', marginBottom: '6px' }}>
              Duration
            </label>
            <input
              type="text"
              name="duration"
              value={formData.duration}
              onChange={handleChange}
              placeholder="e.g. 8 Weeks (64 Hours)"
              style={{ width: '100%', padding: '10px 14px', background: 'var(--bg-dark)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', color: 'var(--text-main)', fontSize: '0.92rem' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 600, color: 'var(--white)', marginBottom: '6px' }}>
              Thumbnail Image URL
            </label>
            <input
              type="text"
              name="thumbnail"
              value={formData.thumbnail}
              onChange={handleChange}
              placeholder="https://... or /images/..."
              style={{ width: '100%', padding: '10px 14px', background: 'var(--bg-dark)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', color: 'var(--text-main)', fontSize: '0.92rem' }}
            />
          </div>
        </div>

        {/* Short Description */}
        <div style={{ marginBottom: '18px' }}>
          <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 600, color: 'var(--white)', marginBottom: '6px' }}>
            Short Description
          </label>
          <input
            type="text"
            name="shortDescription"
            value={formData.shortDescription}
            onChange={handleChange}
            placeholder="Brief 1-line overview of this training track"
            style={{ width: '100%', padding: '10px 14px', background: 'var(--bg-dark)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', color: 'var(--text-main)', fontSize: '0.92rem' }}
          />
        </div>

        {/* Full Description */}
        <div style={{ marginBottom: '22px' }}>
          <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 600, color: 'var(--white)', marginBottom: '6px' }}>
            Detailed Syllabus Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={5}
            placeholder="Provide a detailed overview of the learning outcomes, labs, and career applications..."
            style={{ width: '100%', padding: '10px 14px', background: 'var(--bg-dark)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', color: 'var(--text-main)', fontSize: '0.92rem', resize: 'vertical' }}
          />
        </div>

        {/* Publish Checkbox */}
        <div style={{ marginBottom: '28px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <input
            type="checkbox"
            id="published-check"
            name="published"
            checked={formData.published}
            onChange={handleChange}
            style={{ width: '18px', height: '18px', accentColor: 'var(--cyan-primary)' }}
          />
          <label htmlFor="published-check" style={{ color: 'var(--white)', fontSize: '0.9rem', cursor: 'pointer' }}>
            Publish this course immediately (Visible in the public course catalog)
          </label>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="btn-admin-secondary"
            disabled={submitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn-admin-primary"
            disabled={submitting}
          >
            {submitting ? (
              <>
                <i className="fa-solid fa-spinner fa-spin"></i> Saving...
              </>
            ) : (
              <>
                <i className="fa-solid fa-check"></i> {isEdit ? 'Save Changes' : 'Create Course'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
