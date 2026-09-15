const express = require('express');
const router = express.Router();
const { optionalProtect } = require('../middleware/authMiddleware');
const { getLectureContent } = require('../controllers/curriculumController');

/**
 * @desc    Get secure lecture content (Free Preview or Authenticated Active Enrollment)
 * @route   GET /api/v1/lectures/:lectureId
 * @access  Public for Free Preview / Private for Locked
 */
router.get('/:lectureId', optionalProtect, getLectureContent);

module.exports = router;
