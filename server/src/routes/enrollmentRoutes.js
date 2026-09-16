const express = require('express');
const router = express.Router();
const { createEnrollment } = require('../controllers/enrollmentController');
const { optionalProtect } = require('../middleware/authMiddleware');

router.post('/', optionalProtect, createEnrollment);

module.exports = router;

