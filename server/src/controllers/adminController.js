const User = require('../models/User');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const Inquiry = require('../models/Inquiry');
const asyncHandler = require('../utils/asyncHandler');
const escapeRegex = require('../utils/escapeRegex');

/**
 * @desc    Get Admin Dashboard Overview Stats & Recent Records
 * @route   GET /api/v1/admin/dashboard/stats
 * @access  Private (Admin / Super Admin)
 */
exports.getDashboardStats = asyncHandler(async (req, res) => {
  const [
    totalStudents,
    totalCourses,
    activeCourses,
    totalEnrollments,
    pendingInquiries,
    recentStudents,
    recentEnrollments,
    recentInquiries,
  ] = await Promise.all([
    User.countDocuments({ role: 'student' }),
    Course.countDocuments({}),
    Course.countDocuments({ published: true }),
    Enrollment.countDocuments({}),
    Inquiry.countDocuments({ status: 'new' }),
    User.find({ role: 'student' })
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(5),
    Enrollment.find({})
      .populate('userId', 'fullName email phone avatar')
      .populate('courseId', 'title slug category price')
      .sort({ createdAt: -1 })
      .limit(5),
    Inquiry.find({})
      .sort({ createdAt: -1 })
      .limit(5),
  ]);

  res.status(200).json({
    success: true,
    data: {
      stats: {
        totalStudents,
        totalCourses,
        activeCourses,
        totalEnrollments,
        pendingInquiries,
      },
      recentActivity: {
        recentStudents,
        recentEnrollments,
        recentInquiries,
      },
    },
  });
});

/**
 * @desc    Get all students (role = 'student') with search, status filter, and pagination
 * @route   GET /api/v1/admin/students
 * @access  Private (Admin / Super Admin)
 */
exports.getStudents = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;
  const skip = (page - 1) * limit;

  const query = { role: 'student' };

  if (req.query.status && req.query.status !== 'all') {
    query.status = req.query.status;
  }

  if (req.query.search) {
    const safeSearch = escapeRegex(req.query.search.trim());
    if (safeSearch.length > 0) {
      const searchRegex = new RegExp(safeSearch, 'i');
      query.$or = [
        { fullName: searchRegex },
        { email: searchRegex },
        { phone: searchRegex },
      ];
    }
  }

  const [students, total] = await Promise.all([
    User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    User.countDocuments(query),
  ]);

  res.status(200).json({
    success: true,
    count: students.length,
    total,
    page,
    pages: Math.ceil(total / limit),
    data: students,
  });
});

/**
 * @desc    Update student account status (active ↔ disabled)
 * @route   PATCH /api/v1/admin/students/:id/status
 * @access  Private (Admin / Super Admin)
 */
exports.updateStudentStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!['active', 'disabled'].includes(status)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid status value. Allowed values: active, disabled.',
    });
  }

  const student = await User.findOne({ _id: id, role: 'student' });
  if (!student) {
    return res.status(404).json({
      success: false,
      message: 'Student account not found.',
    });
  }

  student.status = status;
  await student.save();

  res.status(200).json({
    success: true,
    message: `Student account ${student.email} updated to '${status}'.`,
    data: {
      _id: student._id,
      fullName: student.fullName,
      email: student.email,
      status: student.status,
    },
  });
});

/**
 * @desc    Get all courses (including draft/unpublished) with search & category filter
 * @route   GET /api/v1/admin/courses
 * @access  Private (Admin / Super Admin)
 */
exports.getAdminCourses = asyncHandler(async (req, res) => {
  const query = {};

  if (req.query.category && req.query.category.toLowerCase() !== 'all') {
    const safeCategory = escapeRegex(req.query.category.trim());
    query.category = { $regex: new RegExp(safeCategory, 'i') };
  }

  if (req.query.published !== undefined && req.query.published !== 'all') {
    query.published = req.query.published === 'true';
  }

  if (req.query.search) {
    const safeSearch = escapeRegex(req.query.search.trim());
    if (safeSearch.length > 0) {
      const searchRegex = new RegExp(safeSearch, 'i');
      query.$or = [
        { title: searchRegex },
        { slug: searchRegex },
        { category: searchRegex },
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
 * @desc    Create a new Course
 * @route   POST /api/v1/admin/courses
 * @access  Private (Admin / Super Admin)
 */
exports.createCourse = asyncHandler(async (req, res) => {
  const {
    title,
    slug,
    shortDescription,
    description,
    category,
    level,
    price,
    discountPrice,
    duration,
    published,
    featured,
    thumbnail,
  } = req.body;

  if (!title || !slug || !category || !level || price === undefined) {
    return res.status(400).json({
      success: false,
      message: 'Please provide all required fields: title, slug, category, level, price.',
    });
  }

  const cleanSlug = slug.toLowerCase().trim().replace(/[^a-z0-9-]/g, '-');

  const existingCourse = await Course.findOne({ slug: cleanSlug });
  if (existingCourse) {
    return res.status(400).json({
      success: false,
      message: `A course with slug '${cleanSlug}' already exists. Please choose a unique slug.`,
    });
  }

  const newCourse = await Course.create({
    title: title.trim(),
    slug: cleanSlug,
    shortDescription: shortDescription ? shortDescription.trim() : '',
    description: description ? description.trim() : '',
    category: category.trim(),
    level: level.trim(),
    price: Number(price),
    discountPrice: discountPrice !== undefined && discountPrice !== '' ? Number(discountPrice) : undefined,
    duration: duration ? duration.trim() : '8 Weeks',
    published: published !== undefined ? Boolean(published) : true,
    featured: featured !== undefined ? Boolean(featured) : false,
    thumbnail: thumbnail ? thumbnail.trim() : '',
  });

  res.status(201).json({
    success: true,
    message: `Course '${newCourse.title}' created successfully.`,
    data: newCourse,
  });
});

/**
 * @desc    Update an existing Course
 * @route   PUT /api/v1/admin/courses/:id
 * @access  Private (Admin / Super Admin)
 */
exports.updateCourse = asyncHandler(async (req, res) => {
  const { id } = req.params;

  let course = await Course.findById(id);
  if (!course) {
    return res.status(404).json({
      success: false,
      message: 'Course not found.',
    });
  }

  if (req.body.slug && req.body.slug !== course.slug) {
    const cleanSlug = req.body.slug.toLowerCase().trim().replace(/[^a-z0-9-]/g, '-');
    const slugExists = await Course.findOne({ slug: cleanSlug, _id: { $ne: id } });
    if (slugExists) {
      return res.status(400).json({
        success: false,
        message: `Slug '${cleanSlug}' is already used by another course.`,
      });
    }
    req.body.slug = cleanSlug;
  }

  const updatedCourse = await Course.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    message: `Course '${updatedCourse.title}' updated successfully.`,
    data: updatedCourse,
  });
});

/**
 * @desc    Delete a Course (with active enrollment protection check)
 * @route   DELETE /api/v1/admin/courses/:id
 * @access  Private (Admin / Super Admin)
 */
exports.deleteCourse = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const course = await Course.findById(id);
  if (!course) {
    return res.status(404).json({
      success: false,
      message: 'Course not found.',
    });
  }

  // Safety check: verify if course has active or completed enrollments
  const activeEnrollmentsCount = await Enrollment.countDocuments({
    courseId: id,
    status: { $in: ['active', 'completed'] },
  });

  if (activeEnrollmentsCount > 0) {
    return res.status(400).json({
      success: false,
      message: `Cannot delete course '${course.title}' because it has ${activeEnrollmentsCount} active/completed student enrollment(s). Unpublish the course instead.`,
    });
  }

  await Course.findByIdAndDelete(id);

  res.status(200).json({
    success: true,
    message: `Course '${course.title}' deleted successfully.`,
  });
});

/**
 * @desc    Get all Enrollments with student & course populated
 * @route   GET /api/v1/admin/enrollments
 * @access  Private (Admin / Super Admin)
 */
exports.getAdminEnrollments = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;
  const skip = (page - 1) * limit;

  const query = {};

  if (req.query.status && req.query.status !== 'all') {
    query.status = req.query.status;
  }

  const [enrollments, total] = await Promise.all([
    Enrollment.find(query)
      .populate('userId', 'fullName email phone avatar status')
      .populate('courseId', 'title slug category price level')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Enrollment.countDocuments(query),
  ]);

  res.status(200).json({
    success: true,
    count: enrollments.length,
    total,
    page,
    pages: Math.ceil(total / limit),
    data: enrollments,
  });
});

/**
 * @desc    Update Enrollment status (active, paused, completed, revoked)
 * @route   PATCH /api/v1/admin/enrollments/:id/status
 * @access  Private (Admin / Super Admin)
 */
exports.updateEnrollmentStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const validStatuses = ['active', 'paused', 'completed', 'revoked'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({
      success: false,
      message: `Invalid status value. Allowed: ${validStatuses.join(', ')}.`,
    });
  }

  const enrollment = await Enrollment.findById(id);
  if (!enrollment) {
    return res.status(404).json({
      success: false,
      message: 'Enrollment record not found.',
    });
  }

  enrollment.status = status;
  if (status === 'completed' && !enrollment.completedAt) {
    enrollment.completedAt = new Date();
    enrollment.progressPercentage = 100;
  }
  await enrollment.save();

  const updated = await Enrollment.findById(id)
    .populate('userId', 'fullName email')
    .populate('courseId', 'title');

  res.status(200).json({
    success: true,
    message: `Enrollment status updated to '${status}'.`,
    data: updated,
  });
});

/**
 * @desc    Get all Inquiries with search, status, and source filter
 * @route   GET /api/v1/admin/inquiries
 * @access  Private (Admin / Super Admin)
 */
exports.getAdminInquiries = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;
  const skip = (page - 1) * limit;

  const query = {};

  if (req.query.status && req.query.status !== 'all') {
    query.status = req.query.status;
  }

  if (req.query.source && req.query.source !== 'all') {
    query.source = req.query.source;
  }

  if (req.query.search) {
    const safeSearch = escapeRegex(req.query.search.trim());
    if (safeSearch.length > 0) {
      const searchRegex = new RegExp(safeSearch, 'i');
      query.$or = [
        { fullName: searchRegex },
        { email: searchRegex },
        { phone: searchRegex },
        { interestedCourse: searchRegex },
        { message: searchRegex },
      ];
    }
  }

  const [inquiries, total] = await Promise.all([
    Inquiry.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Inquiry.countDocuments(query),
  ]);

  res.status(200).json({
    success: true,
    count: inquiries.length,
    total,
    page,
    pages: Math.ceil(total / limit),
    data: inquiries,
  });
});

/**
 * @desc    Update Inquiry status (new, contacted, converted, closed)
 * @route   PATCH /api/v1/admin/inquiries/:id/status
 * @access  Private (Admin / Super Admin)
 */
exports.updateInquiryStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const validStatuses = ['new', 'contacted', 'converted', 'closed'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({
      success: false,
      message: `Invalid status value. Allowed: ${validStatuses.join(', ')}.`,
    });
  }

  const inquiry = await Inquiry.findById(id);
  if (!inquiry) {
    return res.status(404).json({
      success: false,
      message: 'Inquiry record not found.',
    });
  }

  inquiry.status = status;
  await inquiry.save();

  res.status(200).json({
    success: true,
    message: `Inquiry status updated to '${status}'.`,
    data: inquiry,
  });
});
