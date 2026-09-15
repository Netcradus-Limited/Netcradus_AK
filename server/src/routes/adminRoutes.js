const express = require('express');
const router = express.Router();
const { protect, restrictTo } = require('../middleware/authMiddleware');
const adminController = require('../controllers/adminController');
const curriculumController = require('../controllers/curriculumController');

// All endpoints in this router MUST require authentication and admin / super_admin role
router.use(protect);
router.use(restrictTo('admin', 'super_admin'));

// Dashboard Overview
router.get('/dashboard/stats', adminController.getDashboardStats);
// Legacy compatibility ping
router.get('/dashboard-stats', adminController.getDashboardStats);

// Student Management
router.get('/students', adminController.getStudents);
router.patch('/students/:id/status', adminController.updateStudentStatus);

// Course Management
router.get('/courses', adminController.getAdminCourses);
router.post('/courses', adminController.createCourse);
router.put('/courses/:id', adminController.updateCourse);
router.delete('/courses/:id', adminController.deleteCourse);

// Curriculum Management (Modules & Lectures)
router.get('/courses/:courseId/curriculum', curriculumController.getAdminCurriculum);
router.post('/courses/:courseId/modules', curriculumController.createModule);
router.put('/modules/:moduleId', curriculumController.updateModule);
router.delete('/modules/:moduleId', curriculumController.deleteModule);
router.patch('/modules/:moduleId/reorder', curriculumController.reorderModule);
router.post('/modules/:moduleId/lectures', curriculumController.createLecture);
router.put('/lectures/:lectureId', curriculumController.updateLecture);
router.delete('/lectures/:lectureId', curriculumController.deleteLecture);
router.patch('/lectures/:lectureId/reorder', curriculumController.reorderLecture);

// Enrollment Management
router.get('/enrollments', adminController.getAdminEnrollments);
router.patch('/enrollments/:id/status', adminController.updateEnrollmentStatus);

// Inquiry / Lead Management
router.get('/inquiries', adminController.getAdminInquiries);
router.patch('/inquiries/:id/status', adminController.updateInquiryStatus);

module.exports = router;

