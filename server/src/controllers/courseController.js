const Course = require('../models/Course');
const asyncHandler = require('../utils/asyncHandler');
const escapeRegex = require('../utils/escapeRegex');

// Category slug/key mapping to DB category values
const categoryMap = {
  cyber: 'Cyber Security',
  cloud: 'Cloud',
  aiml: 'AI/ML',
  ai: 'AI/ML',
  linux: 'Linux',
  networking: 'Networking',
};

/**
 * @desc    Get all active/published Academy courses (supports optional category filter & safe search)
 * @route   GET /api/v1/courses
 * @access  Public
 */
const getCourses = asyncHandler(async (req, res, next) => {
  const query = { published: true };

  // Parse category filter safely
  if (req.query.category && req.query.category.toLowerCase() !== 'all') {
    const rawCategory = req.query.category.toLowerCase().trim();
    const mappedCategory = categoryMap[rawCategory] || req.query.category.trim();
    const safeCategory = escapeRegex(mappedCategory);
    const categoryRegex = new RegExp(`^${safeCategory}$`, 'i');

    // Perform case-insensitive match on category or tags for multi-category inclusion
    query.$or = [
      { category: categoryRegex },
      { tags: categoryRegex }
    ];
  }

  // Parse optional search query safely (escaping regex special characters)
  if (req.query.search) {
    const safeSearch = escapeRegex(req.query.search.trim());
    if (safeSearch.length > 0) {
      const searchRegex = new RegExp(safeSearch, 'i');
      query.$or = [
        { title: searchRegex },
        { shortDescription: searchRegex },
        { category: searchRegex },
        { tags: searchRegex },
      ];
    }
  }

  const courses = await Course.find(query).sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: courses.length,
    data: courses,
  });
});

/**
 * @desc    Get single course by slug identifier
 * @route   GET /api/v1/courses/:slug
 * @access  Public
 */
const getCourseBySlug = asyncHandler(async (req, res, next) => {
  const { slug } = req.params;
  const safeSlug = (slug || '').toLowerCase().trim();

  const course = await Course.findOne({
    slug: safeSlug,
    published: true,
  });

  if (!course) {
    return res.status(404).json({
      success: false,
      message: `Course with slug '${slug}' was not found or is currently inactive.`,
    });
  }

  res.status(200).json({
    success: true,
    data: course,
  });
});

module.exports = {
  getCourses,
  getCourseBySlug,
};
