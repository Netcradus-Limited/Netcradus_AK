const mongoose = require('mongoose');
const Certificate = require('../models/Certificate');
const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course');
const asyncHandler = require('../utils/asyncHandler');
const { issueCertificateForEnrollment } = require('../services/certificateService');

/**
 * @desc    Issue or claim a Certificate for a completed course
 * @route   POST /api/v1/certificates/issue/:courseId
 * @access  Private (Authenticated Student)
 */
const issueCertificate = asyncHandler(async (req, res) => {
  const { courseId } = req.params;
  const userId = req.user._id;

  // 1. Validate courseId parameter
  let targetCourseId = courseId;
  if (!mongoose.Types.ObjectId.isValid(courseId)) {
    const course = await Course.findOne({ slug: courseId.toLowerCase().trim() });
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'The requested course was not found.',
      });
    }
    targetCourseId = course._id;
  }

  // 2. Fetch authenticated student's enrollment
  const enrollment = await Enrollment.findOne({
    userId,
    courseId: targetCourseId,
  });

  if (!enrollment) {
    return res.status(404).json({
      success: false,
      message: 'You are not enrolled in this course.',
    });
  }

  // 3. Strictly enforce 100% completion requirement
  if (enrollment.status !== 'completed' || enrollment.progressPercentage !== 100) {
    return res.status(400).json({
      success: false,
      message: 'Cannot issue certificate. You must complete 100% of course lessons before claiming your certificate.',
    });
  }

  // 4. Issue or retrieve existing certificate idempotently
  const certificate = await issueCertificateForEnrollment(enrollment);

  return res.status(200).json({
    success: true,
    message: 'Certificate issued successfully.',
    data: certificate,
  });
});

/**
 * @desc    Get all certificates issued to the authenticated student
 * @route   GET /api/v1/certificates/my
 * @access  Private (Authenticated Student)
 */
const getMyCertificates = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const certificates = await Certificate.find({ userId })
    .populate('courseId', 'title slug category thumbnail')
    .sort({ issueDate: -1 });

  return res.status(200).json({
    success: true,
    count: certificates.length,
    data: certificates,
  });
});

/**
 * @desc    Get specific course certificate for authenticated student
 * @route   GET /api/v1/certificates/my/:courseId
 * @access  Private (Authenticated Student)
 */
const getMyCourseCertificate = asyncHandler(async (req, res) => {
  const { courseId } = req.params;
  const userId = req.user._id;

  let targetCourseId = courseId;
  if (!mongoose.Types.ObjectId.isValid(courseId)) {
    const course = await Course.findOne({ slug: courseId.toLowerCase().trim() });
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found.',
      });
    }
    targetCourseId = course._id;
  }

  const certificate = await Certificate.findOne({
    userId,
    courseId: targetCourseId,
  }).populate('courseId', 'title slug category cert');

  if (!certificate) {
    return res.status(404).json({
      success: false,
      message: 'No certificate found for this course.',
    });
  }

  return res.status(200).json({
    success: true,
    data: certificate,
  });
});

/**
 * @desc    Public verification of a Certificate by unique certificate ID
 * @route   GET /api/v1/certificates/verify/:certificateId
 * @access  Public
 */
const verifyCertificate = asyncHandler(async (req, res) => {
  const { certificateId } = req.params;

  if (!certificateId || typeof certificateId !== 'string') {
    return res.status(400).json({
      success: false,
      message: 'Certificate ID is required.',
    });
  }

  const cleanId = certificateId.trim().toUpperCase();

  const certificate = await Certificate.findOne({
    certificateId: cleanId,
  });

  if (!certificate) {
    return res.status(404).json({
      success: false,
      message: 'Credential Not Found. The specified Certificate ID is not in our verified registry.',
    });
  }

  // Return strictly sanitized public information - NEVER leak emails, user IDs, or internal data
  return res.status(200).json({
    success: true,
    data: {
      certificateId: certificate.certificateId,
      studentName: certificate.studentName,
      courseName: certificate.courseName,
      issueDate: certificate.issueDate,
      status: certificate.status, // 'active' or 'revoked'
    },
  });
});

module.exports = {
  issueCertificate,
  getMyCertificates,
  getMyCourseCertificate,
  verifyCertificate,
};
