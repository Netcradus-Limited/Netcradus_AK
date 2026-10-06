import { API_BASE_URL } from '../config/api';

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

  /**
   * Mark a lesson as complete for authenticated student
   */
  async markLessonComplete(lessonId) {
    const response = await fetch(`${API_BASE_URL}/student/lessons/${lessonId}/complete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });
    const result = await handleResponse(response);
    return result.data;
  },

  /**
   * Fetch course progress breakdown for authenticated student
   */
  async getCourseProgress(courseId) {
    const response = await fetch(`${API_BASE_URL}/student/courses/${courseId}/progress`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });
    const result = await handleResponse(response);
    return result.data;
  },

  /**
   * Update last accessed lesson for authenticated student
   */
  async updateLastAccessed(courseId, lessonId) {
    const response = await fetch(`${API_BASE_URL}/student/courses/${courseId}/last-accessed`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ lessonId }),
    });
    const result = await handleResponse(response);
    return result.data;
  },

  /**
   * Fetch study materials (PDFs & resources) for enrolled courses
   */
  async getStudyMaterials() {
    const response = await fetch(`${API_BASE_URL}/student/materials`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });
    const result = await handleResponse(response);
    return result.data;
  },

  /**
   * Fetch live interactive mentoring sessions for enrolled courses
   */
  async getLiveSessions() {
    const response = await fetch(`${API_BASE_URL}/student/live-sessions`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });
    const result = await handleResponse(response);
    return result.data;
  },

  /**
   * Fetch assignments for enrolled courses
   */
  async getAssignments() {
    const response = await fetch(`${API_BASE_URL}/student/assignments`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });
    const result = await handleResponse(response);
    return result.data;
  },

  /**
   * Submit or update assignment submission
   */
  async submitAssignment(assignmentId, payload) {
    const response = await fetch(`${API_BASE_URL}/student/assignments/${assignmentId}/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(payload),
    });
    const result = await handleResponse(response);
    return result.data;
  },

  /**
   * Submit quiz answers for a quiz lesson and receive score results
   * @param {string} lessonId - Lesson ObjectId
   * @param {Array<{ questionId: string, selectedOptionIndex: number }>} answers - Student answers
   * @param {string} [startedAt] - Optional ISO timestamp when quiz was started
   */
  async submitQuiz(lessonId, answers, startedAt) {
    const response = await fetch(`${API_BASE_URL}/student/lessons/${lessonId}/quiz-submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ answers, startedAt }),
    });
    const result = await handleResponse(response);
    return result.data;
  },
};



