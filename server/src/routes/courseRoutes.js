const express = require('express');
const router = express.Router();
const { optionalProtect } = require('../middleware/authMiddleware');
const { getCourses, getCourseBySlug } = require('../controllers/courseController');
const { getPublicCurriculum } = require('../controllers/curriculumController');
const { getCoursesQuerySchema } = require('../validators/courseValidator');
const validate = require('../middleware/validate');

router.get('/', validate(getCoursesQuerySchema, 'query'), getCourses);
router.get('/:slug/curriculum', optionalProtect, getPublicCurriculum);
router.get('/:slug', getCourseBySlug);

module.exports = router;


