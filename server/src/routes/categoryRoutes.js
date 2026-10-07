const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');

// Public catalog categories
router.get('/', categoryController.getPublicCategories);

module.exports = router;
