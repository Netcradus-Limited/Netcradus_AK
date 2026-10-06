const express = require('express');
const router = express.Router();
const { protect, restrictTo } = require('../middleware/authMiddleware');
const instructorController = require('../controllers/instructorController');

// All endpoints in this router MUST require authentication and instructor role
router.use(protect);
router.use(restrictTo('instructor'));

// ==========================================
// 1. Instructor Dashboard
// ==========================================
router.get('/dashboard', instructorController.getInstructorDashboard);
router.get('/dashboard/stats', instructorController.getInstructorDashboard);

// ==========================================
// 2. Instructor Course Management
// ==========================================
router.get('/courses', instructorController.getMyCourses);
router.post('/courses', instructorController.createCourse);
router.get('/courses/:id', instructorController.getMyCourse);
router.put('/courses/:id', instructorController.updateMyCourse);
router.patch('/courses/:id/publish', instructorController.togglePublishCourse);

// ==========================================
// 3. Curriculum Management (Modules & Lessons)
// ==========================================
router.get('/courses/:courseId/curriculum', instructorController.getCourseCurriculum);
router.post('/courses/:courseId/modules', instructorController.createModule);
router.put('/modules/:moduleId', instructorController.updateModule);
router.delete('/modules/:moduleId', instructorController.deleteModule);
router.patch('/modules/:moduleId/reorder', instructorController.reorderModule);

router.post('/modules/:moduleId/lectures', instructorController.createLecture);
router.get('/lectures/:lectureId', instructorController.getLecture);
router.put('/lectures/:lectureId', instructorController.updateLecture);
router.delete('/lectures/:lectureId', instructorController.deleteLecture);
router.patch('/lectures/:lectureId/reorder', instructorController.reorderLecture);

// ==========================================
// 4. Assignment & Grading Management
// ==========================================
router.get('/courses/:courseId/assignments', instructorController.getCourseAssignments);
router.post('/courses/:courseId/assignments', instructorController.createAssignment);
router.put('/assignments/:assignmentId', instructorController.updateAssignment);
router.delete('/assignments/:assignmentId', instructorController.deleteAssignment);
router.get('/assignments/:assignmentId/submissions', instructorController.getAssignmentSubmissions);
router.get('/submissions/pending', instructorController.getPendingSubmissions);
router.patch('/submissions/:submissionId/grade', instructorController.gradeSubmission);

// ==========================================
// 5. Enrolled Student Roster
// ==========================================
router.get('/students', instructorController.getEnrolledStudents);

module.exports = router;
