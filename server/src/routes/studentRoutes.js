const express = require('express');
const router = express.Router();
const { protect, restrictTo } = require('../middleware/authMiddleware');
const studentController = require('../controllers/studentController');

// All endpoints in this router MUST require authentication & student role
router.use(protect);
router.use(restrictTo('student'));

/**
 * @desc    Get authenticated student's dashboard data
 * @route   GET /api/v1/student/dashboard
 * @access  Private (Authenticated Student)
 */
router.get('/dashboard', studentController.getStudentDashboard);

/**
 * @desc    Get authenticated student's enrolled courses list
 * @route   GET /api/v1/student/enrollments
 * @access  Private (Authenticated Student)
 */
router.get('/enrollments', studentController.getStudentEnrollments);

/**
 * @desc    Mark a lesson as complete
 * @route   POST /api/v1/student/lessons/:lessonId/complete
 * @access  Private (Authenticated Student)
 */
router.post('/lessons/:lessonId/complete', studentController.markLessonComplete);

/**
 * @desc    Get course progress breakdown
 * @route   GET /api/v1/student/courses/:courseId/progress
 * @access  Private (Authenticated Student)
 */
router.get('/courses/:courseId/progress', studentController.getCourseProgress);

/**
 * @desc    Update last accessed lesson for a course
 * @route   POST /api/v1/student/courses/:courseId/last-accessed
 * @access  Private (Authenticated Student)
 */
router.post('/courses/:courseId/last-accessed', studentController.updateLastAccessed);

module.exports = router;
