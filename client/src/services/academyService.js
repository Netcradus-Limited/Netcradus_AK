const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api/v1';

/**
 * Centralized API Service for Netcradus Academy
 */
export const academyService = {
  /**
   * Fetch public course catalog (optional category filter)
   * @param {string} category - Optional category slug or name ('all', 'cyber', etc.)
   */
  async getCourses(category = 'all') {
    const url = new URL(`${API_BASE_URL}/courses`);
    if (category && category !== 'all') {
      url.searchParams.append('category', category);
    }

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const result = await response.json();
    if (!response.ok || !result.success) {
      throw new Error(result.message || 'Failed to load courses catalog.');
    }

    return result.data;
  },

  /**
   * Fetch single course details by slug
   * @param {string} slug - Course slug identifier
   */
  async getCourseBySlug(slug) {
    const response = await fetch(`${API_BASE_URL}/courses/${slug}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const result = await response.json();
    if (!response.ok || !result.success) {
      throw new Error(result.message || `Failed to fetch course details for '${slug}'.`);
    }

    return result.data;
  },

  /**
   * Fetch public course curriculum by slug (modules & lectures)
   * @param {string} slug - Course slug identifier
   */
  async getPublicCurriculum(slug) {
    const response = await fetch(`${API_BASE_URL}/courses/${slug}/curriculum`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const result = await response.json();
    if (!response.ok || !result.success) {
      throw new Error(result.message || `Failed to fetch curriculum for '${slug}'.`);
    }

    return result.data;
  },


  /**
   * Submit course enrollment application
   * @param {Object} payload - { fullName, email, phone, courseName, courseSlug, courseId }
   */
  async submitEnrollment(payload) {
    const response = await fetch(`${API_BASE_URL}/enrollments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();
    if (!response.ok || !result.success) {
      throw new Error(result.message || 'Failed to submit enrollment application.');
    }

    return result;
  },

  /**
   * Submit lead inquiry (Quick enquiry, Callback, Workshop demo)
   * @param {Object} payload - { fullName, email, phone, interestedCourse, message, source }
   */
  async submitInquiry(payload) {
    const response = await fetch(`${API_BASE_URL}/inquiries`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();
    if (!response.ok || !result.success) {
      throw new Error(result.message || 'Failed to submit inquiry.');
    }

    return result;
  },
};
