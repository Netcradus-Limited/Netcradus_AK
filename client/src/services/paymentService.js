const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api/v1';

async function handleResponse(response) {
  const result = await response.json();
  if (!response.ok || !result.success) {
    throw new Error(result.message || 'Payment request failed. Please try again.');
  }
  return result;
}

export const paymentService = {
  /**
   * Create Razorpay payment order for a paid course
   * @param {string} courseId - MongoDB Course ID
   */
  async createPaymentOrder(courseId) {
    const response = await fetch(`${API_BASE_URL}/payments/create-order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ courseId }),
    });

    const result = await handleResponse(response);
    return result.data;
  },

  /**
   * Verify Razorpay payment signature and activate enrollment
   * @param {Object} paymentData - { razorpay_order_id, razorpay_payment_id, razorpay_signature, courseId }
   */
  async verifyPayment(paymentData) {
    const response = await fetch(`${API_BASE_URL}/payments/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(paymentData),
    });

    const result = await handleResponse(response);
    return result.data;
  },
};
