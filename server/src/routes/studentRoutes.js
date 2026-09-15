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

module.exports = router;

