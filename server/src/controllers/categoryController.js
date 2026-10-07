const mongoose = require('mongoose');
const slugify = require('slugify');
const Category = require('../models/Category');
const Course = require('../models/Course');
const asyncHandler = require('../utils/asyncHandler');
const escapeRegex = require('../utils/escapeRegex');

/**
 * Helper to compute real count of courses associated with a category name
 * @param {string} categoryName
 * @returns {Promise<number>}
 */
async function getCourseCountForCategory(categoryName) {
  if (!categoryName) return 0;
  const safeName = escapeRegex(categoryName.trim());
  return await Course.countDocuments({
    category: { $regex: new RegExp(`^${safeName}$`, 'i') },
  });
}

/**
 * @desc    Create a new course category
 * @route   POST /api/v1/admin/categories
 * @access  Private (Admin & Super Admin)
 */
exports.createCategory = asyncHandler(async (req, res) => {
  const { name, description, isActive } = req.body;

  if (!name || typeof name !== 'string' || !name.trim()) {
    return res.status(400).json({
      success: false,
      message: 'Category name is required and must be a valid text string.',
    });
  }

  const trimmedName = name.trim();
  const safeRegex = new RegExp(`^${escapeRegex(trimmedName)}$`, 'i');

  // Verify uniqueness (case-insensitive)
  const existing = await Category.findOne({ name: safeRegex });
  if (existing) {
    return res.status(400).json({
      success: false,
      message: `Category with name '${trimmedName}' already exists.`,
    });
  }

  const generatedSlug = slugify(trimmedName, { lower: true, strict: true }) || `cat-${Date.now()}`;

  const category = await Category.create({
    name: trimmedName,
    slug: generatedSlug,
    description: description && typeof description === 'string' ? description.trim() : '',
    isActive: isActive !== false,
  });

  const courseCount = await getCourseCountForCategory(trimmedName);

  res.status(201).json({
    success: true,
    message: 'Category created successfully.',
    data: {
      ...category.toObject(),
      courseCount,
    },
  });
});

/**
 * @desc    Get all categories for Admin (supports search, active filter, pagination, course count)
 * @route   GET /api/v1/admin/categories
 * @access  Private (Admin & Super Admin)
 */
exports.getAdminCategories = asyncHandler(async (req, res) => {
  const { search, isActive, page, limit } = req.query;

  const query = {};

  if (search && typeof search === 'string' && search.trim()) {
    const safeSearch = escapeRegex(search.trim());
    const searchRegex = new RegExp(safeSearch, 'i');
    query.$or = [{ name: searchRegex }, { description: searchRegex }, { slug: searchRegex }];
  }

  if (isActive !== undefined && isActive !== '') {
    query.isActive = isActive === 'true';
  }

  // Count total matching
  const total = await Category.countDocuments(query);

  let categoryQuery = Category.find(query).sort({ name: 1, createdAt: -1 });

  const hasPagination = page !== undefined || limit !== undefined;
  let parsedPage = 1;
  let parsedLimit = 50;

  if (hasPagination) {
    parsedPage = Math.max(1, parseInt(page, 10) || 1);
    parsedLimit = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    categoryQuery = categoryQuery.skip((parsedPage - 1) * parsedLimit).limit(parsedLimit);
  }

  const categories = await categoryQuery.lean();

  // Attach dynamically derived courseCount for each category
  const categoriesWithCounts = await Promise.all(
    categories.map(async (cat) => {
      const courseCount = await getCourseCountForCategory(cat.name);
      return {
        ...cat,
        courseCount,
      };
    })
  );

  res.status(200).json({
    success: true,
    count: categoriesWithCounts.length,
    total,
    page: hasPagination ? parsedPage : 1,
    limit: hasPagination ? parsedLimit : total,
    totalPages: hasPagination ? Math.ceil(total / parsedLimit) : 1,
    data: categoriesWithCounts,
  });
});

/**
 * @desc    Get single category by ID
 * @route   GET /api/v1/admin/categories/:id
 * @access  Private (Admin & Super Admin)
 */
exports.getCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid category identifier provided.',
    });
  }

  const category = await Category.findById(id).lean();
  if (!category) {
    return res.status(404).json({
      success: false,
      message: 'Category not found.',
    });
  }

  const courseCount = await getCourseCountForCategory(category.name);

  res.status(200).json({
    success: true,
    data: {
      ...category,
      courseCount,
    },
  });
});

/**
 * @desc    Update an existing category
 * @route   PUT /api/v1/admin/categories/:id
 * @access  Private (Admin & Super Admin)
 */
exports.updateCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, description, isActive } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid category identifier provided.',
    });
  }

  const category = await Category.findById(id);
  if (!category) {
    return res.status(404).json({
      success: false,
      message: 'Category not found.',
    });
  }

  if (name !== undefined) {
    if (typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Category name cannot be empty.',
      });
    }

    const trimmedName = name.trim();
    // Check if new name is already taken by another category
    const safeRegex = new RegExp(`^${escapeRegex(trimmedName)}$`, 'i');
    const existing = await Category.findOne({ _id: { $ne: id }, name: safeRegex });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: `Category with name '${trimmedName}' already exists.`,
      });
    }

    category.name = trimmedName;
    category.slug = slugify(trimmedName, { lower: true, strict: true }) || category.slug;
  }

  if (description !== undefined) {
    category.description = typeof description === 'string' ? description.trim() : '';
  }

  if (isActive !== undefined) {
    category.isActive = Boolean(isActive);
  }

  await category.save();

  const courseCount = await getCourseCountForCategory(category.name);

  res.status(200).json({
    success: true,
    message: 'Category updated successfully.',
    data: {
      ...category.toObject(),
      courseCount,
    },
  });
});

/**
 * @desc    Delete category (safely prevented if courses reference it)
 * @route   DELETE /api/v1/admin/categories/:id
 * @access  Private (Admin & Super Admin)
 */
exports.deleteCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid category identifier provided.',
    });
  }

  const category = await Category.findById(id);
  if (!category) {
    return res.status(404).json({
      success: false,
      message: 'Category not found.',
    });
  }

  // Safety inspection: check whether any courses currently reference this category
  const courseCount = await getCourseCountForCategory(category.name);

  if (courseCount > 0) {
    return res.status(400).json({
      success: false,
      message: 'Category cannot be deleted while courses are using it.',
      courseCount,
    });
  }

  await category.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Category deleted successfully.',
  });
});

/**
 * @desc    Public list of active categories for course filtering
 * @route   GET /api/v1/categories
 * @access  Public
 */
exports.getPublicCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find({ isActive: true }).sort({ name: 1 }).lean();

  const categoriesWithCounts = await Promise.all(
    categories.map(async (cat) => {
      const courseCount = await getCourseCountForCategory(cat.name);
      return {
        _id: cat._id,
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
        courseCount,
      };
    })
  );

  res.status(200).json({
    success: true,
    count: categoriesWithCounts.length,
    data: categoriesWithCounts,
  });
});
