const mongoose = require('mongoose');
const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const { createEnrollmentSchema } = require('../validators/enrollmentValidator');
const escapeRegex = require('../utils/escapeRegex');

/**
 * @desc    Submit an Academy course enrollment application
 * @route   POST /api/v1/enrollments
 * @access  Public / Student
 */
const createEnrollment = asyncHandler(async (req, res, next) => {
  // 1. Validate incoming request body via Joi
  const { error, value } = createEnrollmentSchema.validate(req.body, { abortEarly: false });
  if (error) {
    const errorMessage = error.details.map((detail) => detail.message).join(', ');
    return res.status(400).json({
      success: false,
      message: errorMessage,
    });
  }

  const { fullName, email, phone, courseId, courseSlug, courseName } = value;

  // 2. Resolve target Course document (Priority: ID -> Slug -> Title match)
  let targetCourse = null;

  if (courseId && mongoose.Types.ObjectId.isValid(courseId)) {
    targetCourse = await Course.findById(courseId);
  }

  if (!targetCourse && (courseSlug || courseName)) {
    const searchSlug = (courseSlug || '').trim().toLowerCase();
    const searchName = (courseName || '').trim();

    if (searchSlug) {
      targetCourse = await Course.findOne({ slug: searchSlug, published: true });
    }

    if (!targetCourse && searchName) {
      const safeName = escapeRegex(searchName);
      targetCourse = await Course.findOne({
        $or: [
          { title: { $regex: new RegExp(`^${safeName}$`, 'i') } },
          { title: { $regex: new RegExp(safeName, 'i') } },
          { shortDescription: { $regex: new RegExp(safeName, 'i') } },
        ],
        published: true,
      });
    }
  }

  if (!targetCourse) {
    return res.status(404).json({
      success: false,
      message: 'The requested course was not found or is currently inactive.',
    });
  }

  // 3. Resolve target User identity (Priority: Authenticated Session -> Email Lookup -> New Guest Account)
  let user = null;

  if (req.user) {
    // Authenticated student session: ALWAYS derive userId directly from JWT (req.user)
    user = req.user;
  } else {
    // Unauthenticated guest user
    const lowerEmail = email.toLowerCase().trim();
    user = await User.findOne({ email: lowerEmail });

    if (!user) {
      // Generate a secure random password for guest account creation so Mongoose validation passes cleanly
      const tempPassword = `GuestPass_${Math.random().toString(36).slice(-8)}${Date.now()}`;
      user = await User.create({
        email: lowerEmail,
        fullName: fullName.trim(),
        phone: phone ? phone.trim() : '',
        password: tempPassword,
        role: 'student',
        status: 'active',
      });
    }
  }

  // 4. Duplicate enrollment check (check if enrollment already exists for this user and course)
  const existingEnrollment = await Enrollment.findOne({
    userId: user._id,
    courseId: targetCourse._id,
    status: { $in: ['active', 'completed'] },
  });

  if (existingEnrollment) {
    return res.status(400).json({
      success: false,
      message: `You are already enrolled in '${targetCourse.title}'.`,
    });
  }

  // 5. Create new Enrollment record using existing Enrollment model
  const enrollment = await Enrollment.create({
    userId: user._id,
    courseId: targetCourse._id,
    enrollmentType: 'free',
    pricePaid: 0,
    currency: 'INR',
    status: 'active',
  });

  res.status(201).json({
    success: true,
    message: `Enrollment submitted successfully for ${targetCourse.title}!`,
    data: {
      enrollmentId: enrollment._id,
      courseTitle: targetCourse.title,
      studentName: user.fullName,
      studentEmail: user.email,
      status: enrollment.status,
      createdAt: enrollment.createdAt,
    },
  });
});

module.exports = {
  createEnrollment,
};
