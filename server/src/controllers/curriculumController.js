const mongoose = require('mongoose');
const Module = require('../models/Module');
const Lesson = require('../models/Lesson');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const asyncHandler = require('../utils/asyncHandler');
const slugify = require('slugify');

/**
 * @desc    Get public course curriculum metadata (locked lectures omit protected content)
 * @route   GET /api/v1/courses/:slug/curriculum
 * @access  Public (Guest & Student)
 */
exports.getPublicCurriculum = asyncHandler(async (req, res) => {
  const { slug } = req.params;

  const course = await Course.findOne({ slug: slug.toLowerCase().trim(), published: true });
  if (!course) {
    return res.status(404).json({
      success: false,
      message: `Course '${slug}' was not found or is currently inactive.`,
    });
  }

  // Fetch published modules sorted by order
  const modules = await Module.find({ courseId: course._id, published: true }).sort({ order: 1 });

  const moduleIds = modules.map((m) => m._id);

  // Fetch published lessons sorted by order
  const lessons = await Lesson.find({ moduleId: { $in: moduleIds }, published: true }).sort({ order: 1 });

  // Group lessons under their parent module & strip protected data for locked lessons
  const curriculum = modules.map((mod) => {
    const moduleLessons = lessons
      .filter((l) => l.moduleId.toString() === mod._id.toString())
      .map((les) => {
        const isFreePreview = les.preview === true;
        return {
          _id: les._id,
          moduleId: les.moduleId,
          courseId: les.courseId,
          title: les.title,
          slug: les.slug,
          description: les.description || '',
          type: les.type,
          durationSeconds: les.durationSeconds || 0,
          order: les.order,
          isFreePreview,
          isLocked: !isFreePreview,
          published: les.published,
          // Security: Only include video URL if free preview; otherwise omit completely
          videoUrl: isFreePreview ? les.video : undefined,
        };
      });

    return {
      _id: mod._id,
      title: mod.title,
      description: mod.description || '',
      order: mod.order,
      published: mod.published,
      lessons: moduleLessons,
    };
  });

  res.status(200).json({
    success: true,
    data: {
      course: {
        _id: course._id,
        title: course.title,
        slug: course.slug,
        category: course.category,
        level: course.level,
      },
      curriculum,
    },
  });
});

/**
 * @desc    Get secure lecture content (verifies Free Preview OR active enrollment)
 * @route   GET /api/v1/lectures/:lectureId
 * @access  Public for Free Preview / Private Enrolled for Locked
 */
exports.getLectureContent = asyncHandler(async (req, res) => {
  const { lectureId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(lectureId)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid lecture identifier provided.',
    });
  }

  const lesson = await Lesson.findById(lectureId).populate('courseId', 'title slug');
  if (!lesson || !lesson.published) {
    return res.status(404).json({
      success: false,
      message: 'The requested lecture was not found or is currently inactive.',
    });
  }

  const isFreePreview = lesson.preview === true;

  // 1. If Free Preview -> allow access to anyone
  if (isFreePreview) {
    return res.status(200).json({
      success: true,
      data: lesson,
    });
  }

  // 2. If Locked -> require authenticated user
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required to access this locked lecture. Please log in.',
    });
  }

  // 3. Admin / Super Admin always allowed
  if (req.user.role === 'admin' || req.user.role === 'super_admin') {
    return res.status(200).json({
      success: true,
      data: lesson,
    });
  }

  // 4. Verify student enrollment in MongoDB
  const enrollment = await Enrollment.findOne({
    userId: req.user._id,
    courseId: lesson.courseId._id,
    status: { $in: ['active', 'completed'] },
  });

  if (!enrollment) {
    return res.status(403).json({
      success: false,
      message: 'Access denied. You must have an active enrollment in this course to access this lecture.',
    });
  }

  res.status(200).json({
    success: true,
    data: lesson,
  });
});

/**
 * @desc    Get full course curriculum for Admin management (including draft/unpublished)
 * @route   GET /api/v1/admin/courses/:courseId/curriculum
 * @access  Private (Admin & Super Admin)
 */
exports.getAdminCurriculum = asyncHandler(async (req, res) => {
  const { courseId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(courseId)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid course ID.',
    });
  }

  const course = await Course.findById(courseId);
  if (!course) {
    return res.status(404).json({
      success: false,
      message: 'Course not found.',
    });
  }

  const modules = await Module.find({ courseId }).sort({ order: 1 });
  const moduleIds = modules.map((m) => m._id);
  const lessons = await Lesson.find({ moduleId: { $in: moduleIds } }).sort({ order: 1 });

  const curriculum = modules.map((mod) => {
    const moduleLessons = lessons.filter((l) => l.moduleId.toString() === mod._id.toString());
    return {
      ...mod.toObject(),
      lessons: moduleLessons,
    };
  });

  res.status(200).json({
    success: true,
    data: {
      course,
      curriculum,
    },
  });
});

/**
 * @desc    Create a new module in a course
 * @route   POST /api/v1/admin/courses/:courseId/modules
 * @access  Private (Admin & Super Admin)
 */
exports.createModule = asyncHandler(async (req, res) => {
  const { courseId } = req.params;
  const { title, description, order, published } = req.body;

  if (!title || !title.trim()) {
    return res.status(400).json({ success: false, message: 'Module title is required.' });
  }

  const course = await Course.findById(courseId);
  if (!course) {
    return res.status(404).json({ success: false, message: 'Course not found.' });
  }

  // Calculate order if not provided
  let moduleOrder = order;
  if (moduleOrder === undefined || moduleOrder === null) {
    const lastModule = await Module.findOne({ courseId }).sort({ order: -1 });
    moduleOrder = lastModule ? lastModule.order + 1 : 1;
  }

  const moduleDoc = await Module.create({
    courseId,
    title: title.trim(),
    description: description ? description.trim() : '',
    order: moduleOrder,
    published: published !== undefined ? published : true,
  });

  res.status(201).json({
    success: true,
    message: 'Module created successfully.',
    data: moduleDoc,
  });
});

/**
 * @desc    Update an existing module
 * @route   PUT /api/v1/admin/modules/:moduleId
 * @access  Private (Admin & Super Admin)
 */
exports.updateModule = asyncHandler(async (req, res) => {
  const { moduleId } = req.params;
  const { title, description, order, published } = req.body;

  const moduleDoc = await Module.findById(moduleId);
  if (!moduleDoc) {
    return res.status(404).json({ success: false, message: 'Module not found.' });
  }

  if (title !== undefined) moduleDoc.title = title.trim();
  if (description !== undefined) moduleDoc.description = description.trim();
  if (order !== undefined) moduleDoc.order = order;
  if (published !== undefined) moduleDoc.published = published;

  await moduleDoc.save();

  res.status(200).json({
    success: true,
    message: 'Module updated successfully.',
    data: moduleDoc,
  });
});

/**
 * @desc    Safely delete a module and its child lectures
 * @route   DELETE /api/v1/admin/modules/:moduleId
 * @access  Private (Admin & Super Admin)
 */
exports.deleteModule = asyncHandler(async (req, res) => {
  const { moduleId } = req.params;

  const moduleDoc = await Module.findById(moduleId);
  if (!moduleDoc) {
    return res.status(404).json({ success: false, message: 'Module not found.' });
  }

  // Delete all child lessons first
  await Lesson.deleteMany({ moduleId });
  await moduleDoc.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Module and associated lectures deleted successfully.',
  });
});

/**
 * @desc    Reorder a module (Move Up or Move Down)
 * @route   PATCH /api/v1/admin/modules/:moduleId/reorder
 * @access  Private (Admin & Super Admin)
 */
exports.reorderModule = asyncHandler(async (req, res) => {
  const { moduleId } = req.params;
  const { direction } = req.body; // 'up' or 'down'

  const moduleDoc = await Module.findById(moduleId);
  if (!moduleDoc) {
    return res.status(404).json({ success: false, message: 'Module not found.' });
  }

  const siblings = await Module.find({ courseId: moduleDoc.courseId }).sort({ order: 1 });
  const currentIndex = siblings.findIndex((m) => m._id.toString() === moduleId);

  if (currentIndex === -1) {
    return res.status(400).json({ success: false, message: 'Module order index error.' });
  }

  const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
  if (targetIndex < 0 || targetIndex >= siblings.length) {
    return res.status(400).json({ success: false, message: `Cannot move module further ${direction}.` });
  }

  const targetModule = siblings[targetIndex];

  // Swap order values
  const tempOrder = moduleDoc.order;
  moduleDoc.order = targetModule.order;
  targetModule.order = tempOrder;

  await moduleDoc.save();
  await targetModule.save();

  res.status(200).json({
    success: true,
    message: `Module moved ${direction} successfully.`,
  });
});

/**
 * @desc    Create a new lecture in a module
 * @route   POST /api/v1/admin/modules/:moduleId/lectures
 * @access  Private (Admin & Super Admin)
 */
exports.createLecture = asyncHandler(async (req, res) => {
  const { moduleId } = req.params;
  const { title, description, type, durationSeconds, order, preview, published, video, content, pdf, resources } = req.body;

  if (!title || !title.trim()) {
    return res.status(400).json({ success: false, message: 'Lecture title is required.' });
  }

  const moduleDoc = await Module.findById(moduleId);
  if (!moduleDoc) {
    return res.status(404).json({ success: false, message: 'Parent module not found.' });
  }

  let lectureOrder = order;
  if (lectureOrder === undefined || lectureOrder === null) {
    const lastLesson = await Lesson.findOne({ moduleId }).sort({ order: -1 });
    lectureOrder = lastLesson ? lastLesson.order + 1 : 1;
  }

  const generatedSlug = slugify(title.trim(), { lower: true, strict: true }) || `lecture-${Date.now()}`;

  const lesson = await Lesson.create({
    courseId: moduleDoc.courseId,
    moduleId,
    title: title.trim(),
    slug: generatedSlug,
    description: description ? description.trim() : '',
    type: type || 'video',
    durationSeconds: durationSeconds || 0,
    order: lectureOrder,
    preview: preview === true,
    published: published !== false,
    video: video ? video.trim() : '',
    content: content || '',
    pdf: pdf ? pdf.trim() : '',
    resources: Array.isArray(resources) ? resources : [],
  });

  res.status(201).json({
    success: true,
    message: 'Lecture created successfully.',
    data: lesson,
  });
});

/**
 * @desc    Update an existing lecture
 * @route   PUT /api/v1/admin/lectures/:lectureId
 * @access  Private (Admin & Super Admin)
 */
exports.updateLecture = asyncHandler(async (req, res) => {
  const { lectureId } = req.params;
  const { title, description, type, durationSeconds, order, preview, published, video, content, pdf, resources } = req.body;

  const lesson = await Lesson.findById(lectureId);
  if (!lesson) {
    return res.status(404).json({ success: false, message: 'Lecture not found.' });
  }

  if (title !== undefined) {
    lesson.title = title.trim();
    lesson.slug = slugify(title.trim(), { lower: true, strict: true }) || lesson.slug;
  }
  if (description !== undefined) lesson.description = description.trim();
  if (type !== undefined) lesson.type = type;
  if (durationSeconds !== undefined) lesson.durationSeconds = durationSeconds;
  if (order !== undefined) lesson.order = order;
  if (preview !== undefined) lesson.preview = preview;
  if (published !== undefined) lesson.published = published;
  if (video !== undefined) lesson.video = video.trim();
  if (content !== undefined) lesson.content = content;
  if (pdf !== undefined) lesson.pdf = pdf.trim();
  if (resources !== undefined) lesson.resources = Array.isArray(resources) ? resources : [];

  await lesson.save();

  res.status(200).json({
    success: true,
    message: 'Lecture updated successfully.',
    data: lesson,
  });
});

/**
 * @desc    Delete a lecture
 * @route   DELETE /api/v1/admin/lectures/:lectureId
 * @access  Private (Admin & Super Admin)
 */
exports.deleteLecture = asyncHandler(async (req, res) => {
  const { lectureId } = req.params;

  const lesson = await Lesson.findById(lectureId);
  if (!lesson) {
    return res.status(404).json({ success: false, message: 'Lecture not found.' });
  }

  await lesson.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Lecture deleted successfully.',
  });
});

/**
 * @desc    Reorder a lecture (Move Up or Move Down)
 * @route   PATCH /api/v1/admin/lectures/:lectureId/reorder
 * @access  Private (Admin & Super Admin)
 */
exports.reorderLecture = asyncHandler(async (req, res) => {
  const { lectureId } = req.params;
  const { direction } = req.body; // 'up' or 'down'

  const lesson = await Lesson.findById(lectureId);
  if (!lesson) {
    return res.status(404).json({ success: false, message: 'Lecture not found.' });
  }

  const siblings = await Lesson.find({ moduleId: lesson.moduleId }).sort({ order: 1 });
  const currentIndex = siblings.findIndex((l) => l._id.toString() === lectureId);

  if (currentIndex === -1) {
    return res.status(400).json({ success: false, message: 'Lecture order index error.' });
  }

  const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
  if (targetIndex < 0 || targetIndex >= siblings.length) {
    return res.status(400).json({ success: false, message: `Cannot move lecture further ${direction}.` });
  }

  const targetLesson = siblings[targetIndex];

  // Swap order values
  const tempOrder = lesson.order;
  lesson.order = targetLesson.order;
  targetLesson.order = tempOrder;

  await lesson.save();
  await targetLesson.save();

  res.status(200).json({
    success: true,
    message: `Lecture moved ${direction} successfully.`,
  });
});
