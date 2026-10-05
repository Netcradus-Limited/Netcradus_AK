const Razorpay = require('razorpay');
const crypto = require('crypto');

/**
 * Lazy initializer for Razorpay SDK client
 */
let razorpayInstance = null;

const getRazorpayClient = () => {
  if (razorpayInstance) return razorpayInstance;

  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Razorpay API keys (RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET) missing.');
    }
    // Return dummy client if unconfigured in development
    return {
      orders: {
        create: async (opts) => ({
          id: `order_dev_${Date.now().toString(36)}`,
          amount: opts.amount,
          currency: opts.currency || 'INR',
          receipt: opts.receipt,
        }),
      },
    };
  }

  razorpayInstance = new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
  });

  return razorpayInstance;
};

/**
 * Create a new Razorpay payment order
 * @param {Object} options - { amount, currency, receipt, notes }
 */
const createRazorpayOrder = async ({ amount, currency = 'INR', receipt, notes = {} }) => {
  const client = getRazorpayClient();
  const order = await client.orders.create({
    amount, // amount in paise (integer)
    currency,
    receipt,
    notes,
  });

  return order;
};

/**
 * Verify Razorpay HMAC-SHA256 signature
 * @param {string} orderId - Razorpay order ID
 * @param {string} paymentId - Razorpay payment ID
 * @param {string} signature - Razorpay signature received from client
 */
const verifyRazorpaySignature = (orderId, paymentId, signature) => {
  const secret = process.env.RAZORPAY_KEY_SECRET || (process.env.NODE_ENV !== 'production' ? 'dev_razorpay_mock_secret' : null);
  if (!secret) {
    throw new Error('RAZORPAY_KEY_SECRET is not configured on the server.');
  }

  if (!orderId || !paymentId || !signature) {
    return false;
  }

  const payload = `${orderId}|${paymentId}`;
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');

  // Secure constant-time comparison
  const expectedBuffer = Buffer.from(expectedSignature, 'utf-8');
  const signatureBuffer = Buffer.from(signature, 'utf-8');

  if (expectedBuffer.length !== signatureBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(expectedBuffer, signatureBuffer);
};

module.exports = {
  createRazorpayOrder,
  verifyRazorpaySignature,
};
