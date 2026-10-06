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

// Instructor Management
router.get('/instructors', adminController.getInstructors);
router.post('/instructors', adminController.createInstructor);
router.patch('/instructors/:id/status', adminController.updateInstructorStatus);

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
router.post('/enrollments', adminController.createAdminEnrollment);
router.patch('/enrollments/:id/status', adminController.updateEnrollmentStatus);

// Payment Ledger (Read-Only)
router.get('/payments', adminController.getAdminPayments);

// Inquiry / Lead Management
router.get('/inquiries', adminController.getAdminInquiries);
router.patch('/inquiries/:id/status', adminController.updateInquiryStatus);

// Assignment & Submission Management
router.get('/courses/:courseId/assignments', adminController.getAdminAssignments);
router.post('/courses/:courseId/assignments', adminController.createAdminAssignment);
router.put('/assignments/:assignmentId', adminController.updateAdminAssignment);
router.delete('/assignments/:assignmentId', adminController.deleteAdminAssignment);
router.get('/assignments/:assignmentId/submissions', adminController.getAdminSubmissions);
router.patch('/submissions/:submissionId/grade', adminController.gradeSubmission);

module.exports = router;

