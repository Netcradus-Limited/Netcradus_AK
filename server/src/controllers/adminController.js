const mongoose = require('mongoose');
const User = require('../models/User');
const Course = require('../models/Course');
const Module = require('../models/Module');
const Lesson = require('../models/Lesson');
const Enrollment = require('../models/Enrollment');
const Payment = require('../models/Payment');
const Inquiry = require('../models/Inquiry');
const Assignment = require('../models/Assignment');
const Submission = require('../models/Submission');
const LiveSession = require('../models/LiveSession');
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
 * Validate instructor eligibility for course assignment
 */
async function validateInstructorForAssignment(instructorId) {
  if (instructorId === null || instructorId === undefined || instructorId === '') {
    return { valid: true, instructorId: null };
  }

  if (!mongoose.Types.ObjectId.isValid(instructorId)) {
    return { valid: false, status: 400, message: 'Invalid instructor ID format.' };
  }

  const user = await User.findById(instructorId);
  if (!user) {
    return { valid: false, status: 400, message: 'Assigned instructor does not exist.' };
  }

  if (user.role !== 'instructor') {
    return { valid: false, status: 400, message: 'Assigned user is not an instructor.' };
  }

  if (user.status !== 'active') {
    return { valid: false, status: 400, message: 'Assigned instructor account is not active.' };
  }

  return { valid: true, instructorId: user._id };
}

/**
 * @desc    Get all instructors (role = 'instructor') with search, status filter, and pagination
 * @route   GET /api/v1/admin/instructors
 * @access  Private (Admin / Super Admin)
 */
exports.getInstructors = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;
  const skip = (page - 1) * limit;

  const query = { role: 'instructor' };

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

  const [instructors, total] = await Promise.all([
    User.find(query)
      .select('-password -passwordResetToken -passwordResetExpires')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    User.countDocuments(query),
  ]);

  res.status(200).json({
    success: true,
    count: instructors.length,
    total,
    page,
    pages: Math.ceil(total / limit),
    data: instructors,
  });
});

/**
 * @desc    Create a new instructor account
 * @route   POST /api/v1/admin/instructors
 * @access  Private (Admin / Super Admin)
 */
exports.createInstructor = asyncHandler(async (req, res) => {
  const { fullName, email, password, phone } = req.body;

  if (!fullName || typeof fullName !== 'string' || !fullName.trim()) {
    return res.status(400).json({
      success: false,
      message: 'Full name is required.',
    });
  }

  if (!email || typeof email !== 'string' || !email.trim()) {
    return res.status(400).json({
      success: false,
      message: 'Email address is required.',
    });
  }

  const lowerEmail = email.toLowerCase().trim();
  const emailRegex = /\S+@\S+\.\S+/;
  if (!emailRegex.test(lowerEmail)) {
    return res.status(400).json({
      success: false,
      message: 'Please provide a valid email address.',
    });
  }

  if (!password || typeof password !== 'string' || password.length < 8) {
    return res.status(400).json({
      success: false,
      message: 'Temporary password is required and must be at least 8 characters long.',
    });
  }

  const existingUser = await User.findOne({ email: lowerEmail });
  if (existingUser) {
    return res.status(400).json({
      success: false,
      message: `A user account with email '${lowerEmail}' already exists.`,
    });
  }

  // Force role to 'instructor' - never allow client to supply role
  const instructor = await User.create({
    fullName: fullName.trim(),
    email: lowerEmail,
    password, // Automatically hashed by User pre-save hook
    phone: phone ? phone.trim() : '',
    role: 'instructor',
    status: 'active',
  });

  res.status(201).json({
    success: true,
    message: `Instructor account for '${instructor.fullName}' created successfully.`,
    data: {
      _id: instructor._id,
      fullName: instructor.fullName,
      email: instructor.email,
      phone: instructor.phone || '',
      role: instructor.role,
      status: instructor.status,
      createdAt: instructor.createdAt,
    },
  });
});

/**
 * @desc    Update instructor account status (active ↔ disabled)
 * @route   PATCH /api/v1/admin/instructors/:id/status
 * @access  Private (Admin / Super Admin)
 */
exports.updateInstructorStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid instructor ID format.',
    });
  }

  if (!['active', 'disabled'].includes(status)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid status value. Allowed values: active, disabled.',
    });
  }

  // Strictly target role === 'instructor' to prevent modifying students/admins/super_admins
  const instructor = await User.findOne({ _id: id, role: 'instructor' });
  if (!instructor) {
    return res.status(404).json({
      success: false,
      message: 'Instructor account not found.',
    });
  }

  instructor.status = status;
  await instructor.save();

  res.status(200).json({
    success: true,
    message: `Instructor account ${instructor.email} updated to '${status}'.`,
    data: {
      _id: instructor._id,
      fullName: instructor.fullName,
      email: instructor.email,
      role: instructor.role,
      status: instructor.status,
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

  const courses = await Course.find(query)
    .populate('instructor', 'fullName email _id status avatar')
    .sort({ createdAt: -1 });

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
    instructor,
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

  // Validate instructor if provided
  let assignedInstructorId = null;
  if (instructor !== undefined && instructor !== null && instructor !== '') {
    const valResult = await validateInstructorForAssignment(instructor);
    if (!valResult.valid) {
      return res.status(valResult.status).json({
        success: false,
        message: valResult.message,
      });
    }
    assignedInstructorId = valResult.instructorId;
  }

  const newCourse = await Course.create({
    title: title.trim(),
    slug: cleanSlug,
    shortDescription: shortDescription ? shortDescription.trim() : '',
    description: description ? description.trim() : '',
    category: category.trim(),
    level: level.trim(),
    instructor: assignedInstructorId,
    price: Number(price),
    discountPrice: discountPrice !== undefined && discountPrice !== '' ? Number(discountPrice) : undefined,
    duration: duration ? duration.trim() : '8 Weeks',
    published: published !== undefined ? Boolean(published) : true,
    featured: featured !== undefined ? Boolean(featured) : false,
    thumbnail: thumbnail ? thumbnail.trim() : '',
  });

  const populatedCourse = await Course.findById(newCourse._id)
    .populate('instructor', 'fullName email _id status avatar');

  res.status(201).json({
    success: true,
    message: `Course '${populatedCourse.title}' created successfully.`,
    data: populatedCourse,
  });
});

/**
 * @desc    Update an existing Course
 * @route   PUT /api/v1/admin/courses/:id
 * @access  Private (Admin / Super Admin)
 */
exports.updateCourse = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid course ID format.',
    });
  }

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
    course.slug = cleanSlug;
  }

  // Handle instructor assignment with strict validation
  if (req.body.instructor !== undefined) {
    if (req.body.instructor === null || req.body.instructor === '') {
      course.instructor = null;
    } else {
      const valResult = await validateInstructorForAssignment(req.body.instructor);
      if (!valResult.valid) {
        return res.status(valResult.status).json({
          success: false,
          message: valResult.message,
        });
      }
      course.instructor = valResult.instructorId;
    }
  }

  // Explicit allowlist of editable course fields (prevents arbitrary injection)
  const allowedFields = [
    'title',
    'shortDescription',
    'description',
    'thumbnail',
    'category',
    'level',
    'language',
    'price',
    'discountPrice',
    'currency',
    'duration',
    'requirements',
    'learningOutcomes',
    'skills',
    'tags',
    'published',
    'featured',
    'highlights',
    'tools',
    'cert',
    'roles',
    'prereq',
    'bannerClass',
    'bannerIcon',
  ];

  for (const field of allowedFields) {
    if (req.body[field] !== undefined) {
      course[field] = req.body[field];
    }
  }

  await course.save();

  const updatedCourse = await Course.findById(id)
    .populate('instructor', 'fullName email _id status avatar');

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

  // Cascade delete all course-owned academic/scheduling records
  // 3. delete child curriculum records
  await Module.deleteMany({ courseId: id });
  await Lesson.deleteMany({ courseId: id });

  // 4. delete Assignment records
  await Assignment.deleteMany({ courseId: id });

  // 5. delete LiveSession records
  await LiveSession.deleteMany({ courseId: id });

  // 6. delete Course
  await Course.findByIdAndDelete(id);

  res.status(200).json({
    success: true,
    message: `Course '${course.title}' and all associated records deleted successfully.`,
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
 * @desc    Manually enroll a student in a course
 * @route   POST /api/v1/admin/enrollments
 * @access  Private (Admin / Super Admin)
 */
exports.createAdminEnrollment = asyncHandler(async (req, res) => {
  const studentId = req.body.userId || req.body.studentId;
  const { courseId } = req.body;

  // 1. Validate Student ID presence and format
  if (!studentId) {
    return res.status(400).json({
      success: false,
      message: 'Student ID is required.',
    });
  }

  if (!mongoose.Types.ObjectId.isValid(studentId)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid student ID format.',
    });
  }

  // 2. Validate Course ID presence and format
  if (!courseId) {
    return res.status(400).json({
      success: false,
      message: 'Course ID is required.',
    });
  }

  if (!mongoose.Types.ObjectId.isValid(courseId)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid course ID format.',
    });
  }

  // 3. Find and validate student user
  const student = await User.findById(studentId);
  if (!student) {
    return res.status(400).json({
      success: false,
      message: 'Student account not found.',
    });
  }

  if (student.role !== 'student') {
    return res.status(400).json({
      success: false,
      message: `Assigned user has role '${student.role}'. Only student accounts can be enrolled in courses.`,
    });
  }

  if (student.status !== 'active') {
    return res.status(400).json({
      success: false,
      message: 'Student account is disabled and cannot be enrolled.',
    });
  }

  // 4. Find and validate target course
  const course = await Course.findById(courseId);
  if (!course) {
    return res.status(400).json({
      success: false,
      message: 'Course not found.',
    });
  }

  // 5. Duplicate enrollment protection check
  const existingEnrollment = await Enrollment.findOne({
    userId: student._id,
    courseId: course._id,
  });

  if (existingEnrollment) {
    if (['active', 'completed'].includes(existingEnrollment.status)) {
      return res.status(400).json({
        success: false,
        message: `Student '${student.fullName}' is already enrolled in '${course.title}' (Status: ${existingEnrollment.status}).`,
      });
    }

    // Reactivate previous revoked/paused enrollment
    existingEnrollment.status = 'active';
    existingEnrollment.enrollmentType = 'manual';
    existingEnrollment.pricePaid = 0;
    existingEnrollment.currency = 'INR';
    await existingEnrollment.save();

    const populatedEnrollment = await Enrollment.findById(existingEnrollment._id)
      .populate('userId', 'fullName email phone avatar status')
      .populate('courseId', 'title slug category price level');

    return res.status(201).json({
      success: true,
      message: `Successfully reactivated enrollment for '${student.fullName}' in '${course.title}'.`,
      data: populatedEnrollment,
    });
  }

  // 6. Create new manual enrollment (strictly enforcing server values, never trusting client overrides)
  const newEnrollment = await Enrollment.create({
    userId: student._id,
    courseId: course._id,
    enrollmentType: 'manual',
    pricePaid: 0,
    currency: 'INR',
    status: 'active',
    progressPercentage: 0,
    completedLessons: [],
  });

  const populatedEnrollment = await Enrollment.findById(newEnrollment._id)
    .populate('userId', 'fullName email phone avatar status')
    .populate('courseId', 'title slug category price level');

  res.status(201).json({
    success: true,
    message: `Student '${student.fullName}' enrolled successfully in '${course.title}'.`,
    data: populatedEnrollment,
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
 * @desc    Get all Payment ledger records with pagination, filtering, and search
 * @route   GET /api/v1/admin/payments
 * @access  Private (Admin / Super Admin)
 */
exports.getAdminPayments = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;
  const skip = (page - 1) * limit;

  const query = {};

  // Status filtering (only allow valid statuses from Payment schema)
  const validStatuses = ['created', 'pending', 'paid', 'failed', 'refunded'];
  if (req.query.status && req.query.status !== 'all') {
    if (validStatuses.includes(req.query.status)) {
      query.status = req.query.status;
    } else {
      // Handle invalid status safely without throwing or 500 error
      query.status = '__invalid_status__';
    }
  }

  // Safe search support (student name/email, order ID, payment ID, or Mongo ID)
  if (req.query.search && typeof req.query.search === 'string') {
    const rawSearch = req.query.search.trim();
    const safeSearch = escapeRegex(rawSearch);
    if (safeSearch.length > 0) {
      const searchRegex = new RegExp(safeSearch, 'i');

      // Find matching student user IDs
      const matchedUsers = await User.find({
        role: 'student',
        $or: [{ fullName: searchRegex }, { email: searchRegex }],
      }).select('_id');
      const userIds = matchedUsers.map((u) => u._id);

      const orConditions = [
        { razorpayOrderId: searchRegex },
        { razorpayPaymentId: searchRegex },
      ];

      if (userIds.length > 0) {
        orConditions.push({ userId: { $in: userIds } });
      }

      if (mongoose.Types.ObjectId.isValid(rawSearch)) {
        orConditions.push({ _id: rawSearch });
      }

      query.$or = orConditions;
    }
  }

  const [payments, total] = await Promise.all([
    Payment.find(query)
      .populate('userId', '_id fullName email phone status')
      .populate('courseId', '_id title slug category price level')
      .select('-razorpaySignature')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Payment.countDocuments(query),
  ]);

  res.status(200).json({
    success: true,
    count: payments.length,
    total,
    page,
    pages: Math.ceil(total / limit) || 1,
    data: payments,
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

/**
 * @desc    Get all assignments for a course with submission counts
 * @route   GET /api/v1/admin/courses/:courseId/assignments
 * @access  Private (Admin / Super Admin)
 */
exports.getAdminAssignments = asyncHandler(async (req, res) => {
  const { courseId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(courseId)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid course ID format.',
    });
  }

  const course = await Course.findById(courseId);
  if (!course) {
    return res.status(404).json({
      success: false,
      message: 'Course not found.',
    });
  }

  const assignments = await Assignment.find({ courseId }).sort({ createdAt: -1 });

  // Compute submission counts for each assignment
  const assignmentsWithCounts = await Promise.all(
    assignments.map(async (assign) => {
      const submissionCount = await Submission.countDocuments({ assignmentId: assign._id });
      return {
        id: assign._id.toString(),
        title: assign.title,
        description: assign.description || '',
        instructions: assign.instructions || '',
        dueDate: assign.dueDate,
        maxScore: assign.maxScore,
        status: assign.status,
        submissionCount,
        createdAt: assign.createdAt,
      };
    })
  );

  res.status(200).json({
    success: true,
    data: {
      course: {
        id: course._id.toString(),
        title: course.title,
        slug: course.slug,
        category: course.category,
      },
      assignments: assignmentsWithCounts,
    },
  });
});

/**
 * @desc    Create a new assignment for a course
 * @route   POST /api/v1/admin/courses/:courseId/assignments
 * @access  Private (Admin / Super Admin)
 */
exports.createAdminAssignment = asyncHandler(async (req, res) => {
  const { courseId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(courseId)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid course ID format.',
    });
  }

  const course = await Course.findById(courseId);
  if (!course) {
    return res.status(404).json({
      success: false,
      message: 'Course not found.',
    });
  }

  const { title, description, instructions, dueDate, maxScore, status } = req.body;

  if (!title || typeof title !== 'string' || title.trim().length < 3 || title.trim().length > 200) {
    return res.status(400).json({
      success: false,
      message: 'Assignment title is required and must be between 3 and 200 characters.',
    });
  }

  if (description !== undefined && description !== null && typeof description === 'string' && description.trim().length > 2000) {
    return res.status(400).json({
      success: false,
      message: 'Assignment description cannot exceed 2000 characters.',
    });
  }

  if (instructions !== undefined && instructions !== null && typeof instructions === 'string' && instructions.trim().length > 5000) {
    return res.status(400).json({
      success: false,
      message: 'Assignment instructions cannot exceed 5000 characters.',
    });
  }

  let parsedMaxScore = 100;
  if (maxScore !== undefined && maxScore !== null) {
    const num = Number(maxScore);
    if (isNaN(num) || !isFinite(num) || num < 1) {
      return res.status(400).json({
        success: false,
        message: 'Max score must be a number greater than or equal to 1.',
      });
    }
    parsedMaxScore = num;
  }

  let parsedDueDate = null;
  if (dueDate) {
    const parsed = new Date(dueDate);
    if (isNaN(parsed.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid due date format.',
      });
    }
    parsedDueDate = parsed;
  }

  const allowedStatuses = ['draft', 'published', 'archived'];
  if (status && !allowedStatuses.includes(status)) {
    return res.status(400).json({
      success: false,
      message: `Invalid status. Allowed: ${allowedStatuses.join(', ')}.`,
    });
  }

  const assignment = await Assignment.create({
    courseId: course._id,
    title: title.trim(),
    description: description ? description.trim() : '',
    instructions: instructions ? instructions.trim() : '',
    dueDate: parsedDueDate,
    maxScore: parsedMaxScore,
    status: status || 'published',
  });

  res.status(201).json({
    success: true,
    message: 'Assignment created successfully.',
    data: {
      id: assignment._id.toString(),
      title: assignment.title,
      description: assignment.description,
      instructions: assignment.instructions,
      dueDate: assignment.dueDate,
      maxScore: assignment.maxScore,
      status: assignment.status,
      submissionCount: 0,
    },
  });
});

/**
 * @desc    Update an existing assignment
 * @route   PUT /api/v1/admin/assignments/:assignmentId
 * @access  Private (Admin / Super Admin)
 */
exports.updateAdminAssignment = asyncHandler(async (req, res) => {
  const { assignmentId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(assignmentId)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid assignment ID format.',
    });
  }

  const assignment = await Assignment.findById(assignmentId);
  if (!assignment) {
    return res.status(404).json({
      success: false,
      message: 'Assignment not found.',
    });
  }

  const { title, description, instructions, dueDate, maxScore, status } = req.body;

  if (title !== undefined) {
    if (typeof title !== 'string' || title.trim().length < 3 || title.trim().length > 200) {
      return res.status(400).json({
        success: false,
        message: 'Assignment title must be between 3 and 200 characters.',
      });
    }
    assignment.title = title.trim();
  }

  if (description !== undefined) {
    if (typeof description === 'string' && description.trim().length > 2000) {
      return res.status(400).json({
        success: false,
        message: 'Assignment description cannot exceed 2000 characters.',
      });
    }
    assignment.description = typeof description === 'string' ? description.trim() : '';
  }

  if (instructions !== undefined) {
    if (typeof instructions === 'string' && instructions.trim().length > 5000) {
      return res.status(400).json({
        success: false,
        message: 'Assignment instructions cannot exceed 5000 characters.',
      });
    }
    assignment.instructions = typeof instructions === 'string' ? instructions.trim() : '';
  }

  if (dueDate !== undefined) {
    if (dueDate === null || dueDate === '') {
      assignment.dueDate = null;
    } else {
      const parsed = new Date(dueDate);
      if (isNaN(parsed.getTime())) {
        return res.status(400).json({
          success: false,
          message: 'Invalid due date format.',
        });
      }
      assignment.dueDate = parsed;
    }
  }

  if (status !== undefined) {
    const allowedStatuses = ['draft', 'published', 'archived'];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Allowed: ${allowedStatuses.join(', ')}.`,
      });
    }
    assignment.status = status;
  }

  if (maxScore !== undefined) {
    const num = Number(maxScore);
    if (isNaN(num) || !isFinite(num) || num < 1) {
      return res.status(400).json({
        success: false,
        message: 'Max score must be a number greater than or equal to 1.',
      });
    }

    // IMPORTANT MAX SCORE RULE: If proposed maxScore is below highest existing graded score -> REJECT with 400
    const highestGraded = await Submission.findOne({
      assignmentId: assignment._id,
      status: 'graded',
      score: { $ne: null },
    }).sort({ score: -1 });

    if (highestGraded && highestGraded.score !== null && num < highestGraded.score) {
      return res.status(400).json({
        success: false,
        message: `Cannot reduce max score to ${num}. An existing graded submission has a higher score of ${highestGraded.score}.`,
      });
    }

    assignment.maxScore = num;
  }

  await assignment.save();

  const submissionCount = await Submission.countDocuments({ assignmentId: assignment._id });

  res.status(200).json({
    success: true,
    message: 'Assignment updated successfully.',
    data: {
      id: assignment._id.toString(),
      title: assignment.title,
      description: assignment.description,
      instructions: assignment.instructions,
      dueDate: assignment.dueDate,
      maxScore: assignment.maxScore,
      status: assignment.status,
      submissionCount,
    },
  });
});

/**
 * @desc    Delete an assignment (only if 0 submissions exist)
 * @route   DELETE /api/v1/admin/assignments/:assignmentId
 * @access  Private (Admin / Super Admin)
 */
exports.deleteAdminAssignment = asyncHandler(async (req, res) => {
  const { assignmentId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(assignmentId)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid assignment ID format.',
    });
  }

  const assignment = await Assignment.findById(assignmentId);
  if (!assignment) {
    return res.status(404).json({
      success: false,
      message: 'Assignment not found.',
    });
  }

  const submissionCount = await Submission.countDocuments({ assignmentId: assignment._id });
  if (submissionCount > 0) {
    return res.status(400).json({
      success: false,
      message: `Cannot delete assignment with ${submissionCount} existing student submission(s). Please archive the assignment instead to preserve academic records.`,
    });
  }

  await Assignment.findByIdAndDelete(assignment._id);

  res.status(200).json({
    success: true,
    message: 'Assignment deleted successfully.',
  });
});

/**
 * @desc    Get all submissions for an assignment
 * @route   GET /api/v1/admin/assignments/:assignmentId/submissions
 * @access  Private (Admin / Super Admin)
 */
exports.getAdminSubmissions = asyncHandler(async (req, res) => {
  const { assignmentId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(assignmentId)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid assignment ID format.',
    });
  }

  const assignment = await Assignment.findById(assignmentId).populate('courseId', 'title slug');
  if (!assignment) {
    return res.status(404).json({
      success: false,
      message: 'Assignment not found.',
    });
  }

  const submissions = await Submission.find({ assignmentId: assignment._id })
    .populate('userId', 'fullName email avatar')
    .sort({ submittedAt: -1 });

  const formattedSubmissions = submissions.map((sub) => {
    const student = sub.userId;
    return {
      id: sub._id.toString(),
      repoUrl: sub.repoUrl || '',
      submissionText: sub.submissionText || '',
      status: sub.status,
      score: sub.score,
      feedback: sub.feedback || '',
      submittedAt: sub.submittedAt,
      gradedAt: sub.gradedAt,
      student: student
        ? {
            id: student._id.toString(),
            fullName: student.fullName,
            email: student.email,
            avatar: student.avatar || '',
          }
        : {
            id: null,
            fullName: 'Unknown Student',
            email: 'N/A',
            avatar: '',
          },
    };
  });

  res.status(200).json({
    success: true,
    data: {
      assignment: {
        id: assignment._id.toString(),
        title: assignment.title,
        maxScore: assignment.maxScore,
        courseId: assignment.courseId ? assignment.courseId._id.toString() : null,
        courseTitle: assignment.courseId ? assignment.courseId.title : 'Course',
      },
      submissions: formattedSubmissions,
    },
  });
});

/**
 * @desc    Grade a student submission or request resubmission
 * @route   PATCH /api/v1/admin/submissions/:submissionId/grade
 * @access  Private (Admin / Super Admin)
 */
exports.gradeSubmission = asyncHandler(async (req, res) => {
  const { submissionId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(submissionId)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid submission ID format.',
    });
  }

  const submission = await Submission.findById(submissionId);
  if (!submission) {
    return res.status(404).json({
      success: false,
      message: 'Submission record not found.',
    });
  }

  const assignment = await Assignment.findById(submission.assignmentId);
  if (!assignment) {
    return res.status(404).json({
      success: false,
      message: 'Associated assignment not found.',
    });
  }

  const { score, feedback, status } = req.body;

  const allowedStatuses = ['graded', 'resubmission_requested'];
  if (!status || !allowedStatuses.includes(status)) {
    return res.status(400).json({
      success: false,
      message: `Invalid grading status. Allowed values: ${allowedStatuses.join(', ')}.`,
    });
  }

  if (status === 'graded') {
    if (score === undefined || score === null || typeof score !== 'number' || isNaN(score) || !isFinite(score)) {
      return res.status(400).json({
        success: false,
        message: 'Score must be a valid number.',
      });
    }

    if (score < 0 || score > assignment.maxScore) {
      return res.status(400).json({
        success: false,
        message: `Score must be between 0 and assignment max score (${assignment.maxScore}).`,
      });
    }

    submission.score = score;
    submission.feedback = typeof feedback === 'string' ? feedback.trim().slice(0, 5000) : (submission.feedback || '');
    submission.status = 'graded';
    submission.gradedAt = new Date();
  } else if (status === 'resubmission_requested') {
    if (!feedback || typeof feedback !== 'string' || feedback.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Feedback is required when requesting a resubmission so the student knows what to improve.',
      });
    }

    submission.status = 'resubmission_requested';
    submission.feedback = feedback.trim().slice(0, 5000);
    submission.score = null; // Reset score for new resubmission cycle
    submission.gradedAt = new Date();
  }

  await submission.save();

  res.status(200).json({
    success: true,
    message: status === 'graded' ? 'Submission graded successfully.' : 'Resubmission requested successfully.',
    data: {
      id: submission._id.toString(),
      assignmentId: submission.assignmentId.toString(),
      userId: submission.userId.toString(),
      repoUrl: submission.repoUrl,
      submissionText: submission.submissionText,
      status: submission.status,
      score: submission.score,
      feedback: submission.feedback,
      submittedAt: submission.submittedAt,
      gradedAt: submission.gradedAt,
    },
  });
});
