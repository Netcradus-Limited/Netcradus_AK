import { API_BASE_URL } from '../config/api';

async function handleResponse(response) {
  const result = await response.json();
  if (!response.ok || !result.success) {
    const error = new Error(result.message || 'Request failed. Please try again.');
    error.status = response.status;
    error.data = result;
    throw error;
  }
  return result;
}

export const instructorService = {
  // ==========================================
  // DASHBOARD
  // ==========================================
  async getDashboard() {
    const response = await fetch(`${API_BASE_URL}/instructor/dashboard`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });
    const result = await handleResponse(response);
    return result.data;
  },

  // ==========================================
  // COURSES
  // ==========================================
  async getCourses(params = {}) {
    const query = new URLSearchParams();
    if (params.search) query.append('search', params.search);
    if (params.published !== undefined && params.published !== 'all') {
      query.append('published', params.published);
    }

    const url = `${API_BASE_URL}/instructor/courses${query.toString() ? `?${query.toString()}` : ''}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });
    const result = await handleResponse(response);
    return result.data;
  },

  async getCourse(id) {
    const response = await fetch(`${API_BASE_URL}/instructor/courses/${id}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });
    const result = await handleResponse(response);
    return result.data;
  },

  async createCourse(data) {
    const response = await fetch(`${API_BASE_URL}/instructor/courses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data),
    });
    const result = await handleResponse(response);
    return result.data;
  },

  async updateCourse(id, data) {
    const response = await fetch(`${API_BASE_URL}/instructor/courses/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data),
    });
    const result = await handleResponse(response);
    return result.data;
  },

  async togglePublishCourse(id, published) {
    const response = await fetch(`${API_BASE_URL}/instructor/courses/${id}/publish`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(published !== undefined ? { published } : {}),
    });
    const result = await handleResponse(response);
    return result.data;
  },

  // ==========================================
  // CURRICULUM (MODULES & LECTURES)
  // ==========================================
  async getCurriculum(courseId) {
    const response = await fetch(`${API_BASE_URL}/instructor/courses/${courseId}/curriculum`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });
    const result = await handleResponse(response);
    return result.data;
  },

  async createModule(courseId, data) {
    const response = await fetch(`${API_BASE_URL}/instructor/courses/${courseId}/modules`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data),
    });
    const result = await handleResponse(response);
    return result.data;
  },

  async updateModule(moduleId, data) {
    const response = await fetch(`${API_BASE_URL}/instructor/modules/${moduleId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data),
    });
    const result = await handleResponse(response);
    return result.data;
  },

  async deleteModule(moduleId) {
    const response = await fetch(`${API_BASE_URL}/instructor/modules/${moduleId}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });
    return await handleResponse(response);
  },

  async reorderModule(moduleId, direction) {
    const response = await fetch(`${API_BASE_URL}/instructor/modules/${moduleId}/reorder`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ direction }),
    });
    return await handleResponse(response);
  },

  async createLecture(moduleId, data) {
    const response = await fetch(`${API_BASE_URL}/instructor/modules/${moduleId}/lectures`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data),
    });
    const result = await handleResponse(response);
    return result.data;
  },

  async getLecture(lectureId) {
    const response = await fetch(`${API_BASE_URL}/instructor/lectures/${lectureId}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });
    const result = await handleResponse(response);
    return result.data;
  },

  async updateLecture(lectureId, data) {
    const response = await fetch(`${API_BASE_URL}/instructor/lectures/${lectureId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data),
    });
    const result = await handleResponse(response);
    return result.data;
  },

  async deleteLecture(lectureId) {
    const response = await fetch(`${API_BASE_URL}/instructor/lectures/${lectureId}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });
    return await handleResponse(response);
  },

  async reorderLecture(lectureId, direction) {
    const response = await fetch(`${API_BASE_URL}/instructor/lectures/${lectureId}/reorder`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ direction }),
    });
    return await handleResponse(response);
  },

  // ==========================================
  // ASSIGNMENTS & SUBMISSIONS
  // ==========================================
  async getAssignments(courseId) {
    const response = await fetch(`${API_BASE_URL}/instructor/courses/${courseId}/assignments`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });
    const result = await handleResponse(response);
    return result.data;
  },

  async createAssignment(courseId, data) {
    const response = await fetch(`${API_BASE_URL}/instructor/courses/${courseId}/assignments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data),
    });
    const result = await handleResponse(response);
    return result.data;
  },

  async updateAssignment(assignmentId, data) {
    const response = await fetch(`${API_BASE_URL}/instructor/assignments/${assignmentId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data),
    });
    const result = await handleResponse(response);
    return result.data;
  },

  async deleteAssignment(assignmentId) {
    const response = await fetch(`${API_BASE_URL}/instructor/assignments/${assignmentId}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });
    return await handleResponse(response);
  },

  async getAssignmentSubmissions(assignmentId) {
    const response = await fetch(`${API_BASE_URL}/instructor/assignments/${assignmentId}/submissions`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });
    const result = await handleResponse(response);
    return result.data;
  },

  async getPendingSubmissions() {
    const response = await fetch(`${API_BASE_URL}/instructor/submissions/pending`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });
    const result = await handleResponse(response);
    return result.data;
  },

  async gradeSubmission(submissionId, data) {
    const response = await fetch(`${API_BASE_URL}/instructor/submissions/${submissionId}/grade`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data),
    });
    const result = await handleResponse(response);
    return result.data;
  },

  // ==========================================
  // STUDENT ROSTER
  // ==========================================
  async getStudents(params = {}) {
    const query = new URLSearchParams();
    if (params.courseId) query.append('courseId', params.courseId);
    if (params.status && params.status !== 'all') query.append('status', params.status);

    const url = `${API_BASE_URL}/instructor/students${query.toString() ? `?${query.toString()}` : ''}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });
    const result = await handleResponse(response);
    return result.data;
  },
};
