const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');

/**
 * @desc    Get authenticated student dashboard data (profile, enrollments, stats)
 * @route   GET /api/v1/student/dashboard
 * @access  Private (Authenticated User / Student)
 */
exports.getStudentDashboard = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  // 1. Fetch authenticated user's enrollment documents populated with course info
  const enrollments = await Enrollment.find({ userId })
    .populate('courseId', 'title slug category level price duration thumbnail bannerClass bannerIcon published shortDescription')
    .sort({ createdAt: -1 });

  // 2. Calculate summary statistics
  const totalEnrollments = enrollments.length;
  const activeEnrollments = enrollments.filter((e) => e.status === 'active').length;
  const completedEnrollments = enrollments.filter((e) => e.status === 'completed').length;

  // 3. User profile data from authenticated session
  const userProfile = {
    _id: req.user._id,
    fullName: req.user.fullName,
    email: req.user.email,
    phone: req.user.phone || '',
    avatar: req.user.avatar || '',
    status: req.user.status,
    role: req.user.role,
    createdAt: req.user.createdAt,
  };

  res.status(200).json({
    success: true,
    data: {
      user: userProfile,
      summary: {
        totalEnrollments,
        activeEnrollments,
        completedEnrollments,
      },
      enrollments,
    },
  });
});

/**
 * @desc    Get authenticated student's enrolled courses list
 * @route   GET /api/v1/student/enrollments
 * @access  Private (Authenticated Student)
 */
exports.getStudentEnrollments = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const enrollments = await Enrollment.find({ userId })
    .populate('courseId', 'title slug category level price duration thumbnail bannerClass bannerIcon published shortDescription description requirements learningOutcomes skills tools')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    data: enrollments,
  });
});

