const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api/v1';

async function handleResponse(response) {
  const result = await response.json();
  if (!response.ok || !result.success) {
    throw new Error(result.message || 'Request failed. Please try again.');
  }
  return result;
}

export const adminService = {
  /**
   * Fetch Dashboard overview statistics & recent activity
   */
  async getDashboardStats() {
    const response = await fetch(`${API_BASE_URL}/admin/dashboard/stats`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });
    const result = await handleResponse(response);
    return result.data;
  },

  /**
   * Fetch student accounts list
   */
  async getStudents(params = {}) {
    const query = new URLSearchParams();
    if (params.search) query.append('search', params.search);
    if (params.status) query.append('status', params.status);
    if (params.page) query.append('page', params.page);
    if (params.limit) query.append('limit', params.limit);

    const url = `${API_BASE_URL}/admin/students?${query.toString()}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });
    return await handleResponse(response);
  },

  /**
   * Toggle student account status (active ↔ disabled)
   */
  async updateStudentStatus(id, status) {
    const response = await fetch(`${API_BASE_URL}/admin/students/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ status }),
    });
    return await handleResponse(response);
  },

  /**
   * Fetch full courses catalog for admin
   */
  async getCourses(params = {}) {
    const query = new URLSearchParams();
    if (params.search) query.append('search', params.search);
    if (params.category) query.append('category', params.category);
    if (params.published !== undefined) query.append('published', params.published);

    const url = `${API_BASE_URL}/admin/courses?${query.toString()}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });
    return await handleResponse(response);
  },

  /**
   * Create a new course
   */
  async createCourse(courseData) {
    const response = await fetch(`${API_BASE_URL}/admin/courses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(courseData),
    });
    return await handleResponse(response);
  },

  /**
   * Update an existing course
   */
  async updateCourse(id, courseData) {
    const response = await fetch(`${API_BASE_URL}/admin/courses/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(courseData),
    });
    return await handleResponse(response);
  },

  /**
   * Delete a course
   */
  async deleteCourse(id) {
    const response = await fetch(`${API_BASE_URL}/admin/courses/${id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });
    return await handleResponse(response);
  },

  /**
   * Fetch enrollments list
   */
  async getEnrollments(params = {}) {
    const query = new URLSearchParams();
    if (params.status) query.append('status', params.status);
    if (params.page) query.append('page', params.page);
    if (params.limit) query.append('limit', params.limit);

    const url = `${API_BASE_URL}/admin/enrollments?${query.toString()}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });
    return await handleResponse(response);
  },

  /**
   * Update enrollment status
   */
  async updateEnrollmentStatus(id, status) {
    const response = await fetch(`${API_BASE_URL}/admin/enrollments/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ status }),
    });
    return await handleResponse(response);
  },

  /**
   * Fetch inquiries / lead applications
   */
  async getInquiries(params = {}) {
    const query = new URLSearchParams();
    if (params.search) query.append('search', params.search);
    if (params.status) query.append('status', params.status);
    if (params.source) query.append('source', params.source);
    if (params.page) query.append('page', params.page);

    const url = `${API_BASE_URL}/admin/inquiries?${query.toString()}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });
    return await handleResponse(response);
  },

  /**
   * Update inquiry status
   */
  async updateInquiryStatus(id, status) {
    const response = await fetch(`${API_BASE_URL}/admin/inquiries/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ status }),
    });
    return await handleResponse(response);
  },

  /**
   * Fetch full course curriculum for admin
   */
  async getAdminCurriculum(courseId) {
    const response = await fetch(`${API_BASE_URL}/admin/courses/${courseId}/curriculum`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });
    const result = await handleResponse(response);
    return result.data;
  },

  /**
   * Create a module in a course
   */
  async createModule(courseId, data) {
    const response = await fetch(`${API_BASE_URL}/admin/courses/${courseId}/modules`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data),
    });
    return await handleResponse(response);
  },

  /**
   * Update a module
   */
  async updateModule(moduleId, data) {
    const response = await fetch(`${API_BASE_URL}/admin/modules/${moduleId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data),
    });
    return await handleResponse(response);
  },

  /**
   * Delete a module and its child lectures
   */
  async deleteModule(moduleId) {
    const response = await fetch(`${API_BASE_URL}/admin/modules/${moduleId}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });
    return await handleResponse(response);
  },

  /**
   * Reorder a module (direction: 'up' | 'down')
   */
  async reorderModule(moduleId, direction) {
    const response = await fetch(`${API_BASE_URL}/admin/modules/${moduleId}/reorder`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ direction }),
    });
    return await handleResponse(response);
  },

  /**
   * Create a lecture in a module
   */
  async createLecture(moduleId, data) {
    const response = await fetch(`${API_BASE_URL}/admin/modules/${moduleId}/lectures`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data),
    });
    return await handleResponse(response);
  },

  /**
   * Update a lecture
   */
  async updateLecture(lectureId, data) {
    const response = await fetch(`${API_BASE_URL}/admin/lectures/${lectureId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data),
    });
    return await handleResponse(response);
  },

  /**
   * Delete a lecture
   */
  async deleteLecture(lectureId) {
    const response = await fetch(`${API_BASE_URL}/admin/lectures/${lectureId}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });
    return await handleResponse(response);
  },

  /**
   * Reorder a lecture (direction: 'up' | 'down')
   */
  async reorderLecture(lectureId, direction) {
    const response = await fetch(`${API_BASE_URL}/admin/lectures/${lectureId}/reorder`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ direction }),
    });
    return await handleResponse(response);
  },
};

