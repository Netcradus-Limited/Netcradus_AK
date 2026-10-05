const express = require('express');
const router = express.Router();
const certificateController = require('../controllers/certificateController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

// Public verification endpoint
router.get('/verify/:certificateId', certificateController.verifyCertificate);

// Protected student endpoints
router.use(protect);
router.use(restrictTo('student'));

router.post('/issue/:courseId', certificateController.issueCertificate);
router.get('/my', certificateController.getMyCertificates);
router.get('/my/:courseId', certificateController.getMyCourseCertificate);

module.exports = router;
