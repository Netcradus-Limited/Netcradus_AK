const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api/v1';

async function handleResponse(response) {
  const result = await response.json();
  if (!response.ok || !result.success) {
    throw new Error(result.message || 'Certificate request failed. Please try again.');
  }
  return result;
}

export const certificateService = {
  /**
   * Issue or claim a certificate for a completed course
   * @param {string} courseId - Course ID or slug
   */
  async issueCertificate(courseId) {
    const response = await fetch(`${API_BASE_URL}/certificates/issue/${courseId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    const result = await handleResponse(response);
    return result.data;
  },

  /**
   * Fetch all certificates issued to the authenticated student
   */
  async getMyCertificates() {
    const response = await fetch(`${API_BASE_URL}/certificates/my`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    const result = await handleResponse(response);
    return result.data;
  },

  /**
   * Fetch certificate for a specific completed course for the authenticated student
   * @param {string} courseId - Course ID or slug
   */
  async getMyCourseCertificate(courseId) {
    const response = await fetch(`${API_BASE_URL}/certificates/my/${courseId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    const result = await handleResponse(response);
    return result.data;
  },

  /**
   * Public verification of a certificate by certificate ID
   * @param {string} certificateId - Unique certificate ID (e.g. NC-2026-XXXXXXXX)
   */
  async verifyCertificate(certificateId) {
    const cleanId = encodeURIComponent(certificateId.trim().toUpperCase());
    const response = await fetch(`${API_BASE_URL}/certificates/verify/${cleanId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const result = await handleResponse(response);
    return result.data;
  },
};
