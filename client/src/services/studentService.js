const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api/v1';

async function handleResponse(response) {
  const result = await response.json();
  if (!response.ok || !result.success) {
    throw new Error(result.message || 'Request failed. Please try again.');
  }
  return result;
}

export const studentService = {
  /**
   * Fetch authenticated student dashboard data
   */
  async getDashboard() {
    const response = await fetch(`${API_BASE_URL}/student/dashboard`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });
    const result = await handleResponse(response);
    return result.data;
  },

  /**
   * Fetch authenticated student's enrolled courses list
   */
  async getMyEnrollments() {
    const response = await fetch(`${API_BASE_URL}/student/enrollments`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });
    const result = await handleResponse(response);
    return result.data;
  },

  /**
   * Fetch secure lecture content by ID (Free Preview or Enrolled access)
   */
  async getLectureContent(lectureId) {
    const response = await fetch(`${API_BASE_URL}/lectures/${lectureId}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });
    const result = await handleResponse(response);
    return result.data;
  },
};


