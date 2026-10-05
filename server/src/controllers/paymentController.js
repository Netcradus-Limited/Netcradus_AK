const mongoose = require('mongoose');
const Payment = require('../models/Payment');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const asyncHandler = require('../utils/asyncHandler');
const { createRazorpayOrder, verifyRazorpaySignature } = require('../services/razorpayService');

/**
 * @desc    Create a Razorpay order for paid course checkout
 * @route   POST /api/v1/payments/create-order
 * @access  Private (Authenticated Student)
 */
const createOrder = asyncHandler(async (req, res) => {
  const { courseId } = req.body;

  if (!courseId || !mongoose.Types.ObjectId.isValid(courseId)) {
    return res.status(400).json({
      success: false,
      message: 'Valid Course ID is required',
    });
  }

  // 1. Fetch Course from MongoDB (Backend is sole source of truth for pricing)
  const course = await Course.findById(courseId);
  if (!course || !course.published) {
    return res.status(404).json({
      success: false,
      message: 'The requested course was not found or is currently inactive.',
    });
  }

  // 2. Determine effective price from MongoDB
  const effectiveAmount =
    course.discountPrice && course.discountPrice > 0
      ? course.discountPrice
      : course.price;

  // 3. Reject if course is free (client must use free enrollment flow)
  if (!effectiveAmount || effectiveAmount <= 0) {
    return res.status(400).json({
      success: false,
      message: 'This course is free. Please use the standard enrollment option.',
    });
  }

  // 4. Duplicate enrollment check
  const existingEnrollment = await Enrollment.findOne({
    userId: req.user._id,
    courseId: course._id,
    status: { $in: ['active', 'completed'] },
  });

  if (existingEnrollment) {
    return res.status(400).json({
      success: false,
      message: `You are already enrolled in '${course.title}'.`,
    });
  }

  // 5. Double-click / recent order reuse (within 10 minutes)
  const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
  const recentPayment = await Payment.findOne({
    userId: req.user._id,
    courseId: course._id,
    status: { $in: ['created', 'pending'] },
    amount: effectiveAmount,
    createdAt: { $gte: tenMinutesAgo },
  }).sort({ createdAt: -1 });

  if (recentPayment && recentPayment.razorpayOrderId) {
    return res.status(200).json({
      success: true,
      data: {
        orderId: recentPayment.razorpayOrderId,
        amount: recentPayment.amount,
        currency: recentPayment.currency || 'INR',
        keyId: process.env.RAZORPAY_KEY_ID || (process.env.NODE_ENV !== 'production' ? 'rzp_test_mock' : ''),
      },
    });
  }

  // 6. Create Razorpay order
  const receipt = `rcpt_${req.user._id.toString().slice(-6)}_${Date.now().toString().slice(-8)}`;
  const order = await createRazorpayOrder({
    amount: effectiveAmount,
    currency: course.currency || 'INR',
    receipt,
    notes: {
      userId: req.user._id.toString(),
      courseId: course._id.toString(),
    },
  });

  // 7. Create local Payment record
  await Payment.create({
    userId: req.user._id,
    courseId: course._id,
    provider: 'razorpay',
    razorpayOrderId: order.id,
    amount: effectiveAmount,
    currency: order.currency || course.currency || 'INR',
    status: 'created',
  });

  // 8. Return client data (NEVER expose secrets)
  return res.status(201).json({
    success: true,
    data: {
      orderId: order.id,
      amount: effectiveAmount,
      currency: order.currency || 'INR',
      keyId: process.env.RAZORPAY_KEY_ID || (process.env.NODE_ENV !== 'production' ? 'rzp_test_mock' : ''),
    },
  });
});

/**
 * @desc    Verify Razorpay payment signature and activate course enrollment
 * @route   POST /api/v1/payments/verify
 * @access  Private (Authenticated Student)
 */
const verifyPayment = asyncHandler(async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, courseId } = req.body;

  // 1. Look up Payment using order ID AND authenticated user (user isolation)
  const payment = await Payment.findOne({
    razorpayOrderId: razorpay_order_id,
    userId: req.user._id,
  });

  if (!payment) {
    return res.status(404).json({
      success: false,
      message: 'Payment record not found or does not belong to the authenticated user.',
    });
  }

  // 2. Validate courseId if provided in payload
  if (courseId && courseId !== payment.courseId.toString()) {
    return res.status(400).json({
      success: false,
      message: 'Course ID does not match the payment order.',
    });
  }

  // 3. Idempotent check: if payment already marked paid, return existing enrollment
  if (payment.status === 'paid') {
    const existingEnrollment = await Enrollment.findOne({
      userId: req.user._id,
      courseId: payment.courseId,
    });

    return res.status(200).json({
      success: true,
      message: 'Payment has already been verified and processed.',
      data: {
        paymentId: payment._id,
        enrollmentId: existingEnrollment ? existingEnrollment._id : null,
        courseId: payment.courseId,
        status: 'paid',
      },
    });
  }

  // 4. Verify HMAC-SHA256 signature using Razorpay secret
  let isSignatureValid = false;
  try {
    isSignatureValid = verifyRazorpaySignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    );
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Payment signature verification error: ' + err.message,
    });
  }

  if (!isSignatureValid) {
    return res.status(400).json({
      success: false,
      message: 'Invalid payment signature. Verification failed.',
    });
  }

  // 5. Update local Payment record
  payment.razorpayPaymentId = razorpay_payment_id;
  payment.razorpaySignature = razorpay_signature;
  payment.status = 'paid';
  payment.paidAt = new Date();
  await payment.save();

  // 6. Activate course enrollment
  let enrollment;
  try {
    enrollment = await Enrollment.findOne({
      userId: payment.userId,
      courseId: payment.courseId,
    });

    if (!enrollment) {
      enrollment = await Enrollment.create({
        userId: payment.userId,
        courseId: payment.courseId,
        paymentId: payment._id,
        enrollmentType: 'paid',
        pricePaid: payment.amount,
        currency: payment.currency || 'INR',
        status: 'active',
        progressPercentage: 0,
      });
    } else {
      enrollment.status = 'active';
      enrollment.paymentId = payment._id;
      enrollment.enrollmentType = 'paid';
      enrollment.pricePaid = payment.amount;
      await enrollment.save();
    }
  } catch (enrollErr) {
    if (enrollErr.code === 11000) {
      // Handled duplicate key race condition safely
      enrollment = await Enrollment.findOne({
        userId: payment.userId,
        courseId: payment.courseId,
      });
    } else {
      console.error('Enrollment activation error post-payment:', enrollErr);
      return res.status(500).json({
        success: false,
        message: 'Payment verified, but an error occurred activating course enrollment. Please contact support.',
        data: {
          paymentId: payment._id,
          status: 'paid',
          enrollmentPending: true,
        },
      });
    }
  }

  return res.status(200).json({
    success: true,
    message: 'Payment verified and enrollment activated successfully!',
    data: {
      paymentId: payment._id,
      enrollmentId: enrollment ? enrollment._id : null,
      courseId: payment.courseId,
      status: 'paid',
    },
  });
});

module.exports = {
  createOrder,
  verifyPayment,
};
