const crypto = require('crypto');
const Certificate = require('../models/Certificate');
const User = require('../models/User');
const Course = require('../models/Course');

/**
 * Generate a cryptographically secure, unique certificate ID.
 * Format: NC-2026-XXXXXXXX (where XXXXXXXX is an 8-char uppercase alphanumeric string)
 */
const generateUniqueCertificateId = async () => {
  const currentYear = new Date().getFullYear();
  const maxAttempts = 10;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    // Generate 4 random bytes = 8 hex chars, uppercase
    const randomHex = crypto.randomBytes(4).toString('hex').toUpperCase();
    const candidateId = `NC-${currentYear}-${randomHex}`;

    // Verify uniqueness in MongoDB
    const existing = await Certificate.findOne({ certificateId: candidateId });
    if (!existing) {
      return candidateId;
    }
  }

  // Fallback with timestamp component if extreme collision occurs
  const fallbackHex = crypto.randomBytes(6).toString('hex').toUpperCase().slice(0, 8);
  return `NC-${currentYear}-${fallbackHex}`;
};

/**
 * Issue or retrieve a Certificate for a completed enrollment idempotently.
 * @param {Object} enrollment - Enrollment Mongoose document or plain object
 * @returns {Promise<Object>} Certificate document
 */
const issueCertificateForEnrollment = async (enrollment) => {
  if (!enrollment) {
    throw new Error('Enrollment document is required to issue a certificate.');
  }

  // 1. Completion prerequisite checks
  if (enrollment.status !== 'completed' || enrollment.progressPercentage !== 100) {
    const error = new Error('Cannot issue certificate. Course completion requirements (100% progress) have not been met.');
    error.statusCode = 400;
    throw error;
  }

  const userId = enrollment.userId._id || enrollment.userId;
  const courseId = enrollment.courseId._id || enrollment.courseId;

  // 2. Check if a certificate has already been issued for this user & course (Idempotency)
  const existingCert = await Certificate.findOne({ userId, courseId });
  if (existingCert) {
    return existingCert;
  }

  // 3. Fetch User and Course to capture accurate snapshots
  const [user, course] = await Promise.all([
    User.findById(userId),
    Course.findById(courseId),
  ]);

  if (!user) {
    const error = new Error('Student account associated with enrollment not found.');
    error.statusCode = 404;
    throw error;
  }

  if (!course) {
    const error = new Error('Course associated with enrollment not found.');
    error.statusCode = 404;
    throw error;
  }

  // 4. Generate unique certificate ID
  const certificateId = await generateUniqueCertificateId();

  // 5. Create new Certificate document safely handling concurrency
  try {
    const newCertificate = await Certificate.create({
      certificateId,
      userId: user._id,
      courseId: course._id,
      studentName: user.fullName,
      courseName: course.title,
      issueDate: enrollment.completedAt || new Date(),
      status: 'active',
    });

    return newCertificate;
  } catch (err) {
    // E11000 duplicate key race condition: return existing certificate
    if (err.code === 11000) {
      const raceCert = await Certificate.findOne({ userId, courseId });
      if (raceCert) {
        return raceCert;
      }
    }
    throw err;
  }
};

module.exports = {
  generateUniqueCertificateId,
  issueCertificateForEnrollment,
};
