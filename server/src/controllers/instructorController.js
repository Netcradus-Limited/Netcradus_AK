const mongoose = require('mongoose');
const slugify = require('slugify');
const Course = require('../models/Course');
const Module = require('../models/Module');
const Lesson = require('../models/Lesson');
const Assignment = require('../models/Assignment');
const Submission = require('../models/Submission');
const Enrollment = require('../models/Enrollment');
const asyncHandler = require('../utils/asyncHandler');
const escapeRegex = require('../utils/escapeRegex');
const {
  verifyCourseOwnership,
  verifyModuleOwnership,
  verifyLessonOwnership,
  verifyAssignmentOwnership,
  verifySubmissionOwnership,
} = require('../utils/courseOwnership');

/**
 * Validate a quiz questions array for instructor lecture creation/update
 * @param {Array} quiz
 * @returns {string|null} Error message if invalid, null if valid
 */
function validateQuizQuestions(quiz) {
  if (!Array.isArray(quiz)) {
    return 'Quiz must be an array of question objects.';
  }

  for (let i = 0; i < quiz.length; i += 1) {
    const q = quiz[i];
    if (!q || typeof q !== 'object') {
      return `Question #${i + 1} is invalid.`;
    }
    if (!q.question || typeof q.question !== 'string' || !q.question.trim()) {
      return `Question #${i + 1} must have a non-empty question title.`;
    }
    if (!Array.isArray(q.options) || q.options.length < 2) {
      return `Question #${i + 1} must have at least 2 options.`;
    }
    for (let j = 0; j < q.options.length; j += 1) {
      if (typeof q.options[j] !== 'string' || !q.options[j].trim()) {
        return `Question #${i + 1}, Option #${j + 1} cannot be blank.`;
      }
    }
    if (
      q.correctOptionIndex === undefined ||
      q.correctOptionIndex === null ||
      typeof q.correctOptionIndex !== 'number' ||
      !Number.isInteger(q.correctOptionIndex) ||
      q.correctOptionIndex < 0 ||
      q.correctOptionIndex >= q.options.length
    ) {
      return `Question #${i + 1} must have a valid correctOptionIndex between 0 and ${q.options.length - 1}.`;
    }
  }

  return null;
}

// =========================================================================
// SECTION 4: INSTRUCTOR DASHBOARD STATS
// =========================================================================

/**
 * @desc    Get dashboard statistics for the authenticated instructor
 * @route   GET /api/v1/instructor/dashboard
 * @access  Private (Instructor)
 */
exports.getInstructorDashboard = asyncHandler(async (req, res) => {
  const instructorId = req.user._id;

  // 1. Fetch all courses assigned to this instructor
  const instructorCourses = await Course.find({ instructor: instructorId });
  const courseIds = instructorCourses.map((c) => c._id);

  const totalCourses = instructorCourses.length;
  const publishedCourses = instructorCourses.filter((c) => c.published).length;
  const draftCourses = totalCourses - publishedCourses;

  if (totalCourses === 0) {
    return res.status(200).json({
      success: true,
      data: {
        stats: {
          totalCourses: 0,
          publishedCourses: 0,
          draftCourses: 0,
          totalEnrollments: 0,
          uniqueStudents: 0,
          totalAssignments: 0,
          pendingSubmissions: 0,
          gradedSubmissions: 0,
        },
        recentSubmissions: [],
        assignedCourses: [],
      },
    });
  }

  // 2. Fetch enrollment & assignment statistics scoped strictly to instructor's courses
  const [
    totalEnrollments,
    uniqueStudentIds,
    totalAssignments,
    pendingSubmissions,
    gradedSubmissions,
    recentSubmissions,
  ] = await Promise.all([
    Enrollment.countDocuments({ courseId: { $in: courseIds } }),
    Enrollment.distinct('userId', { courseId: { $in: courseIds } }),
    Assignment.countDocuments({ courseId: { $in: courseIds } }),
    Submission.countDocuments({ courseId: { $in: courseIds }, status: 'submitted' }),
    Submission.countDocuments({ courseId: { $in: courseIds }, status: 'graded' }),
    Submission.find({ courseId: { $in: courseIds } })
      .populate('userId', 'fullName email avatar')
      .populate('assignmentId', 'title maxScore')
      .populate('courseId', 'title slug')
      .sort({ submittedAt: -1 })
      .limit(6),
  ]);

  res.status(200).json({
    success: true,
    data: {
      stats: {
        totalCourses,
        publishedCourses,
        draftCourses,
        totalEnrollments,
        uniqueStudents: uniqueStudentIds.length,
        totalAssignments,
        pendingSubmissions,
        gradedSubmissions,
      },
      recentSubmissions: recentSubmissions.map((sub) => ({
        id: sub._id.toString(),
        assignmentTitle: sub.assignmentId ? sub.assignmentId.title : 'Assignment',
        courseTitle: sub.courseId ? sub.courseId.title : 'Course',
        studentName: sub.userId ? sub.userId.fullName : 'Student',
        studentEmail: sub.userId ? sub.userId.email : '',
        status: sub.status,
        score: sub.score,
        maxScore: sub.assignmentId ? sub.assignmentId.maxScore : 100,
        submittedAt: sub.submittedAt,
      })),
      assignedCourses: instructorCourses.map((c) => ({
        id: c._id.toString(),
        title: c.title,
        slug: c.slug,
        category: c.category,
        published: c.published,
      })),
    },
  });
});

// =========================================================================
// SECTION 5: INSTRUCTOR COURSE APIS
// =========================================================================

/**
 * @desc    Get all courses assigned to the authenticated instructor
 * @route   GET /api/v1/instructor/courses
 * @access  Private (Instructor)
 */
exports.getMyCourses = asyncHandler(async (req, res) => {
  const instructorId = req.user._id;

  const query = { instructor: instructorId };

  if (req.query.published !== undefined && req.query.published !== 'all') {
    query.published = req.query.published === 'true';
  }

  if (req.query.search) {
    const safeSearch = escapeRegex(req.query.search.trim());
    if (safeSearch.length > 0) {
      const searchRegex = new RegExp(safeSearch, 'i');
      query.$or = [{ title: searchRegex }, { slug: searchRegex }, { category: searchRegex }];
    }
  }

  const courses = await Course.find(query).sort({ createdAt: -1 });

  // Enrich with enrolled student count and module count
  const enrichedCourses = await Promise.all(
    courses.map(async (course) => {
      const [enrollmentCount, moduleCount, assignmentCount] = await Promise.all([
        Enrollment.countDocuments({ courseId: course._id }),
        Module.countDocuments({ courseId: course._id }),
        Assignment.countDocuments({ courseId: course._id }),
      ]);

      return {
        ...course.toObject(),
        enrollmentCount,
        moduleCount,
        assignmentCount,
      };
    })
  );

  res.status(200).json({
    success: true,
    count: enrichedCourses.length,
    data: enrichedCourses,
  });
});

/**
 * @desc    Get single assigned course by ID
 * @route   GET /api/v1/instructor/courses/:id
 * @access  Private (Instructor)
 */
exports.getMyCourse = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { course, error } = await verifyCourseOwnership(id, req.user._id);

  if (error) {
    return res.status(error.status).json({ success: false, message: error.message });
  }

  const [enrollmentCount, moduleCount, assignmentCount] = await Promise.all([
    Enrollment.countDocuments({ courseId: course._id }),
    Module.countDocuments({ courseId: course._id }),
    Assignment.countDocuments({ courseId: course._id }),
  ]);

  res.status(200).json({
    success: true,
    data: {
      ...course.toObject(),
      enrollmentCount,
      moduleCount,
      assignmentCount,
    },
  });
});

/**
 * @desc    Create a new course assigned to the authenticated instructor
 * @route   POST /api/v1/instructor/courses
 * @access  Private (Instructor)
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
    thumbnail,
    bannerClass,
    bannerIcon,
    requirements,
    learningOutcomes,
    skills,
    tags,
    tools,
    cert,
    prereq,
    published,
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
    instructor: req.user._id, // Enforce authenticated instructor ownership
    price: Number(price),
    discountPrice: discountPrice !== undefined && discountPrice !== '' ? Number(discountPrice) : undefined,
    duration: duration ? duration.trim() : '8 Weeks',
    thumbnail: thumbnail ? thumbnail.trim() : '',
    bannerClass: bannerClass || 'cyber-bg',
    bannerIcon: bannerIcon || 'fa-solid fa-graduation-cap',
    requirements: Array.isArray(requirements) ? requirements : [],
    learningOutcomes: Array.isArray(learningOutcomes) ? learningOutcomes : [],
    skills: Array.isArray(skills) ? skills : [],
    tags: Array.isArray(tags) ? tags : [],
    tools: Array.isArray(tools) ? tools : [],
    cert: cert || '',
    prereq: prereq || '',
    published: published !== undefined ? Boolean(published) : false, // Default to draft for instructor
  });

  res.status(201).json({
    success: true,
    message: `Course '${newCourse.title}' created successfully.`,
    data: newCourse,
  });
});

/**
 * @desc    Update course assigned to authenticated instructor
 * @route   PUT /api/v1/instructor/courses/:id
 * @access  Private (Instructor)
 */
exports.updateMyCourse = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { course, error } = await verifyCourseOwnership(id, req.user._id);

  if (error) {
    return res.status(error.status).json({ success: false, message: error.message });
  }

  // Prevent reassigning instructor from body
  delete req.body.instructor;

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
 * @desc    Toggle published status of instructor's course
 * @route   PATCH /api/v1/instructor/courses/:id/publish
 * @access  Private (Instructor)
 */
exports.togglePublishCourse = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { course, error } = await verifyCourseOwnership(id, req.user._id);

  if (error) {
    return res.status(error.status).json({ success: false, message: error.message });
  }

  const newStatus = req.body.published !== undefined ? Boolean(req.body.published) : !course.published;
  course.published = newStatus;
  await course.save();

  res.status(200).json({
    success: true,
    message: `Course status changed to ${course.published ? 'published' : 'draft'}.`,
    data: {
      id: course._id.toString(),
      title: course.title,
      published: course.published,
    },
  });
});

// =========================================================================
// SECTION 6 & 7: INSTRUCTOR CURRICULUM & QUIZ APIS
// =========================================================================

/**
 * @desc    Get full curriculum for instructor's course (with full quiz questions & answers for editing)
 * @route   GET /api/v1/instructor/courses/:courseId/curriculum
 * @access  Private (Instructor)
 */
exports.getCourseCurriculum = asyncHandler(async (req, res) => {
  const { courseId } = req.params;
  const { course, error } = await verifyCourseOwnership(courseId, req.user._id);

  if (error) {
    return res.status(error.status).json({ success: false, message: error.message });
  }

  const modules = await Module.find({ courseId: course._id }).sort({ order: 1 });
  const moduleIds = modules.map((m) => m._id);
  const lessons = await Lesson.find({ moduleId: { $in: moduleIds } }).sort({ order: 1 });

  // Curate modules with lessons preserving raw quiz data (including correctOptionIndex)
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
      course: {
        id: course._id.toString(),
        title: course.title,
        slug: course.slug,
      },
      curriculum,
    },
  });
});

/**
 * @desc    Create a module in instructor's course
 * @route   POST /api/v1/instructor/courses/:courseId/modules
 * @access  Private (Instructor)
 */
exports.createModule = asyncHandler(async (req, res) => {
  const { courseId } = req.params;
  const { course, error } = await verifyCourseOwnership(courseId, req.user._id);

  if (error) {
    return res.status(error.status).json({ success: false, message: error.message });
  }

  const { title, description, order, published } = req.body;
  if (!title || !title.trim()) {
    return res.status(400).json({ success: false, message: 'Module title is required.' });
  }

  let moduleOrder = order;
  if (moduleOrder === undefined || moduleOrder === null) {
    const lastModule = await Module.findOne({ courseId: course._id }).sort({ order: -1 });
    moduleOrder = lastModule ? lastModule.order + 1 : 1;
  }

  const moduleDoc = await Module.create({
    courseId: course._id,
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
 * @desc    Update a module in instructor's course
 * @route   PUT /api/v1/instructor/modules/:moduleId
 * @access  Private (Instructor)
 */
exports.updateModule = asyncHandler(async (req, res) => {
  const { moduleId } = req.params;
  const { moduleDoc, error } = await verifyModuleOwnership(moduleId, req.user._id);

  if (error) {
    return res.status(error.status).json({ success: false, message: error.message });
  }

  const { title, description, order, published } = req.body;
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
 * @desc    Delete a module in instructor's course
 * @route   DELETE /api/v1/instructor/modules/:moduleId
 * @access  Private (Instructor)
 */
exports.deleteModule = asyncHandler(async (req, res) => {
  const { moduleId } = req.params;
  const { moduleDoc, course, error } = await verifyModuleOwnership(moduleId, req.user._id);

  if (error) {
    return res.status(error.status).json({ success: false, message: error.message });
  }

  const childLessons = await Lesson.find({ moduleId }).select('_id');
  const childLessonIds = childLessons.map((l) => l._id);

  if (childLessonIds.length > 0) {
    await Enrollment.updateMany(
      { courseId: course._id },
      {
        $pull: { completedLessons: { $in: childLessonIds } },
        $unset: { lastAccessedLesson: { $in: childLessonIds } },
      }
    );
  }

  await Lesson.deleteMany({ moduleId });
  await moduleDoc.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Module and associated lectures deleted successfully.',
  });
});

/**
 * @desc    Reorder a module in instructor's course
 * @route   PATCH /api/v1/instructor/modules/:moduleId/reorder
 * @access  Private (Instructor)
 */
exports.reorderModule = asyncHandler(async (req, res) => {
  const { moduleId } = req.params;
  const { moduleDoc, error } = await verifyModuleOwnership(moduleId, req.user._id);

  if (error) {
    return res.status(error.status).json({ success: false, message: error.message });
  }

  const { direction } = req.body; // 'up' or 'down'
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
 * @desc    Create a lecture in instructor's module (supports quiz creation with answers)
 * @route   POST /api/v1/instructor/modules/:moduleId/lectures
 * @access  Private (Instructor)
 */
exports.createLecture = asyncHandler(async (req, res) => {
  const { moduleId } = req.params;
  const { moduleDoc, error } = await verifyModuleOwnership(moduleId, req.user._id);

  if (error) {
    return res.status(error.status).json({ success: false, message: error.message });
  }

  const {
    title,
    description,
    type,
    durationSeconds,
    order,
    preview,
    published,
    video,
    content,
    pdf,
    resources,
    quiz,
  } = req.body;

  if (!title || !title.trim()) {
    return res.status(400).json({ success: false, message: 'Lecture title is required.' });
  }

  let lectureOrder = order;
  if (lectureOrder === undefined || lectureOrder === null) {
    const lastLesson = await Lesson.findOne({ moduleId }).sort({ order: -1 });
    lectureOrder = lastLesson ? lastLesson.order + 1 : 1;
  }

  // Quiz-specific validation if lesson is of type quiz
  if (type === 'quiz' && quiz !== undefined) {
    const quizError = validateQuizQuestions(quiz);
    if (quizError) {
      return res.status(400).json({ success: false, message: quizError });
    }
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
    quiz: type === 'quiz' && Array.isArray(quiz) ? quiz : [],
  });

  res.status(201).json({
    success: true,
    message: 'Lecture created successfully.',
    data: lesson,
  });
});

/**
 * @desc    Get lecture detail for instructor editing (includes quiz correct answers)
 * @route   GET /api/v1/instructor/lectures/:lectureId
 * @access  Private (Instructor)
 */
exports.getLecture = asyncHandler(async (req, res) => {
  const { lectureId } = req.params;
  const { lesson, error } = await verifyLessonOwnership(lectureId, req.user._id);

  if (error) {
    return res.status(error.status).json({ success: false, message: error.message });
  }

  // Do NOT sanitize for instructor; instructor needs correctOptionIndex to edit
  res.status(200).json({
    success: true,
    data: lesson,
  });
});

/**
 * @desc    Update a lecture in instructor's course (supports quiz editing)
 * @route   PUT /api/v1/instructor/lectures/:lectureId
 * @access  Private (Instructor)
 */
exports.updateLecture = asyncHandler(async (req, res) => {
  const { lectureId } = req.params;
  const { lesson, error } = await verifyLessonOwnership(lectureId, req.user._id);

  if (error) {
    return res.status(error.status).json({ success: false, message: error.message });
  }

  const {
    title,
    description,
    type,
    durationSeconds,
    order,
    preview,
    published,
    video,
    content,
    pdf,
    resources,
    quiz,
  } = req.body;

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

  if (quiz !== undefined) {
    const effectiveType = type || lesson.type;
    if (effectiveType === 'quiz') {
      const quizError = validateQuizQuestions(quiz);
      if (quizError) {
        return res.status(400).json({ success: false, message: quizError });
      }
      lesson.quiz = quiz;
    }
  }

  await lesson.save();

  res.status(200).json({
    success: true,
    message: 'Lecture updated successfully.',
    data: lesson,
  });
});

/**
 * @desc    Delete a lecture in instructor's course
 * @route   DELETE /api/v1/instructor/lectures/:lectureId
 * @access  Private (Instructor)
 */
exports.deleteLecture = asyncHandler(async (req, res) => {
  const { lectureId } = req.params;
  const { lesson, course, error } = await verifyLessonOwnership(lectureId, req.user._id);

  if (error) {
    return res.status(error.status).json({ success: false, message: error.message });
  }

  await Enrollment.updateMany(
    { courseId: course._id },
    {
      $pull: { completedLessons: lesson._id },
      $unset: { lastAccessedLesson: lesson._id },
    }
  );

  await lesson.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Lecture deleted successfully.',
  });
});

/**
 * @desc    Reorder a lecture in instructor's module
 * @route   PATCH /api/v1/instructor/lectures/:lectureId/reorder
 * @access  Private (Instructor)
 */
exports.reorderLecture = asyncHandler(async (req, res) => {
  const { lectureId } = req.params;
  const { lesson, error } = await verifyLessonOwnership(lectureId, req.user._id);

  if (error) {
    return res.status(error.status).json({ success: false, message: error.message });
  }

  const { direction } = req.body;
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

// =========================================================================
// SECTION 8: ASSIGNMENT & SUBMISSION MANAGEMENT
// =========================================================================

/**
 * @desc    Get assignments for an instructor's course with submission statistics
 * @route   GET /api/v1/instructor/courses/:courseId/assignments
 * @access  Private (Instructor)
 */
exports.getCourseAssignments = asyncHandler(async (req, res) => {
  const { courseId } = req.params;
  const { course, error } = await verifyCourseOwnership(courseId, req.user._id);

  if (error) {
    return res.status(error.status).json({ success: false, message: error.message });
  }

  const assignments = await Assignment.find({ courseId: course._id }).sort({ createdAt: -1 });

  const assignmentsWithCounts = await Promise.all(
    assignments.map(async (assign) => {
      const [submissionCount, pendingCount] = await Promise.all([
        Submission.countDocuments({ assignmentId: assign._id }),
        Submission.countDocuments({ assignmentId: assign._id, status: 'submitted' }),
      ]);

      return {
        id: assign._id.toString(),
        title: assign.title,
        description: assign.description || '',
        instructions: assign.instructions || '',
        dueDate: assign.dueDate,
        maxScore: assign.maxScore,
        status: assign.status,
        submissionCount,
        pendingCount,
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
      },
      assignments: assignmentsWithCounts,
    },
  });
});

/**
 * @desc    Create assignment for instructor's course
 * @route   POST /api/v1/instructor/courses/:courseId/assignments
 * @access  Private (Instructor)
 */
exports.createAssignment = asyncHandler(async (req, res) => {
  const { courseId } = req.params;
  const { course, error } = await verifyCourseOwnership(courseId, req.user._id);

  if (error) {
    return res.status(error.status).json({ success: false, message: error.message });
  }

  const { title, description, instructions, dueDate, maxScore, status } = req.body;

  if (!title || typeof title !== 'string' || title.trim().length < 3 || title.trim().length > 200) {
    return res.status(400).json({
      success: false,
      message: 'Assignment title is required and must be between 3 and 200 characters.',
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
      return res.status(400).json({ success: false, message: 'Invalid due date format.' });
    }
    parsedDueDate = parsed;
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
    data: assignment,
  });
});

/**
 * @desc    Update assignment for instructor's course
 * @route   PUT /api/v1/instructor/assignments/:assignmentId
 * @access  Private (Instructor)
 */
exports.updateAssignment = asyncHandler(async (req, res) => {
  const { assignmentId } = req.params;
  const { assignment, error } = await verifyAssignmentOwnership(assignmentId, req.user._id);

  if (error) {
    return res.status(error.status).json({ success: false, message: error.message });
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

  if (description !== undefined) assignment.description = typeof description === 'string' ? description.trim() : '';
  if (instructions !== undefined) assignment.instructions = typeof instructions === 'string' ? instructions.trim() : '';

  if (dueDate !== undefined) {
    if (dueDate === null || dueDate === '') {
      assignment.dueDate = null;
    } else {
      const parsed = new Date(dueDate);
      if (isNaN(parsed.getTime())) {
        return res.status(400).json({ success: false, message: 'Invalid due date format.' });
      }
      assignment.dueDate = parsed;
    }
  }

  if (status !== undefined) {
    const allowed = ['draft', 'published', 'archived'];
    if (!allowed.includes(status)) {
      return res.status(400).json({ success: false, message: `Invalid status. Allowed: ${allowed.join(', ')}` });
    }
    assignment.status = status;
  }

  if (maxScore !== undefined) {
    const num = Number(maxScore);
    if (isNaN(num) || !isFinite(num) || num < 1) {
      return res.status(400).json({ success: false, message: 'Max score must be at least 1.' });
    }

    // Safety rule: cannot reduce max score below highest existing graded submission
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

  res.status(200).json({
    success: true,
    message: 'Assignment updated successfully.',
    data: assignment,
  });
});

/**
 * @desc    Delete assignment in instructor's course (only if 0 submissions exist)
 * @route   DELETE /api/v1/instructor/assignments/:assignmentId
 * @access  Private (Instructor)
 */
exports.deleteAssignment = asyncHandler(async (req, res) => {
  const { assignmentId } = req.params;
  const { assignment, error } = await verifyAssignmentOwnership(assignmentId, req.user._id);

  if (error) {
    return res.status(error.status).json({ success: false, message: error.message });
  }

  const submissionCount = await Submission.countDocuments({ assignmentId: assignment._id });
  if (submissionCount > 0) {
    return res.status(400).json({
      success: false,
      message: `Cannot delete assignment with ${submissionCount} existing student submission(s). Archive the assignment instead.`,
    });
  }

  await Assignment.findByIdAndDelete(assignment._id);

  res.status(200).json({
    success: true,
    message: 'Assignment deleted successfully.',
  });
});

/**
 * @desc    Get all submissions for an instructor's assignment
 * @route   GET /api/v1/instructor/assignments/:assignmentId/submissions
 * @access  Private (Instructor)
 */
exports.getAssignmentSubmissions = asyncHandler(async (req, res) => {
  const { assignmentId } = req.params;
  const { assignment, course, error } = await verifyAssignmentOwnership(assignmentId, req.user._id);

  if (error) {
    return res.status(error.status).json({ success: false, message: error.message });
  }

  const submissions = await Submission.find({ assignmentId: assignment._id })
    .populate('userId', 'fullName email avatar')
    .sort({ submittedAt: -1 });

  const formatted = submissions.map((sub) => ({
    id: sub._id.toString(),
    repoUrl: sub.repoUrl || '',
    submissionText: sub.submissionText || '',
    status: sub.status,
    score: sub.score,
    feedback: sub.feedback || '',
    submittedAt: sub.submittedAt,
    gradedAt: sub.gradedAt,
    student: sub.userId
      ? {
          id: sub.userId._id.toString(),
          fullName: sub.userId.fullName,
          email: sub.userId.email,
          avatar: sub.userId.avatar || '',
        }
      : { id: null, fullName: 'Unknown Student', email: '', avatar: '' },
  }));

  res.status(200).json({
    success: true,
    data: {
      assignment: {
        id: assignment._id.toString(),
        title: assignment.title,
        maxScore: assignment.maxScore,
        courseId: course._id.toString(),
        courseTitle: course.title,
      },
      submissions: formatted,
    },
  });
});

/**
 * @desc    Get all pending submissions across all courses assigned to instructor
 * @route   GET /api/v1/instructor/submissions/pending
 * @access  Private (Instructor)
 */
exports.getPendingSubmissions = asyncHandler(async (req, res) => {
  const instructorId = req.user._id;

  const courses = await Course.find({ instructor: instructorId }).select('_id');
  const courseIds = courses.map((c) => c._id);

  const pendingSubmissions = await Submission.find({
    courseId: { $in: courseIds },
    status: { $in: ['submitted', 'resubmission_requested'] },
  })
    .populate('userId', 'fullName email avatar')
    .populate('assignmentId', 'title maxScore dueDate')
    .populate('courseId', 'title slug')
    .sort({ submittedAt: 1 }); // Oldest first for prompt grading

  const formatted = pendingSubmissions.map((sub) => ({
    id: sub._id.toString(),
    repoUrl: sub.repoUrl || '',
    submissionText: sub.submissionText || '',
    status: sub.status,
    score: sub.score,
    submittedAt: sub.submittedAt,
    assignment: sub.assignmentId
      ? {
          id: sub.assignmentId._id.toString(),
          title: sub.assignmentId.title,
          maxScore: sub.assignmentId.maxScore,
          dueDate: sub.assignmentId.dueDate,
        }
      : null,
    course: sub.courseId
      ? {
          id: sub.courseId._id.toString(),
          title: sub.courseId.title,
          slug: sub.courseId.slug,
        }
      : null,
    student: sub.userId
      ? {
          id: sub.userId._id.toString(),
          fullName: sub.userId.fullName,
          email: sub.userId.email,
          avatar: sub.userId.avatar || '',
        }
      : null,
  }));

  res.status(200).json({
    success: true,
    count: formatted.length,
    data: formatted,
  });
});

/**
 * @desc    Grade student submission in instructor's course
 * @route   PATCH /api/v1/instructor/submissions/:submissionId/grade
 * @access  Private (Instructor)
 */
exports.gradeSubmission = asyncHandler(async (req, res) => {
  const { submissionId } = req.params;
  const { submission, assignment, error } = await verifySubmissionOwnership(submissionId, req.user._id);

  if (error) {
    return res.status(error.status).json({ success: false, message: error.message });
  }

  const { score, feedback, status } = req.body;
  const allowed = ['graded', 'resubmission_requested'];

  if (!status || !allowed.includes(status)) {
    return res.status(400).json({
      success: false,
      message: `Invalid grading status. Allowed values: ${allowed.join(', ')}.`,
    });
  }

  if (status === 'graded') {
    if (score === undefined || score === null || typeof score !== 'number' || isNaN(score) || !isFinite(score)) {
      return res.status(400).json({ success: false, message: 'Score must be a valid number.' });
    }

    const max = assignment ? assignment.maxScore : 100;
    if (score < 0 || score > max) {
      return res.status(400).json({
        success: false,
        message: `Score must be between 0 and assignment max score (${max}).`,
      });
    }

    submission.score = score;
    submission.feedback = typeof feedback === 'string' ? feedback.trim().slice(0, 5000) : submission.feedback;
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
    submission.score = null;
    submission.gradedAt = new Date();
  }

  await submission.save();

  res.status(200).json({
    success: true,
    message: status === 'graded' ? 'Submission graded successfully.' : 'Resubmission requested successfully.',
    data: {
      id: submission._id.toString(),
      status: submission.status,
      score: submission.score,
      feedback: submission.feedback,
      gradedAt: submission.gradedAt,
    },
  });
});

// =========================================================================
// SECTION 9: STUDENT ROSTER FOR INSTRUCTOR'S COURSES
// =========================================================================

/**
 * @desc    Get enrolled students across instructor's courses
 * @route   GET /api/v1/instructor/students
 * @access  Private (Instructor)
 */
exports.getEnrolledStudents = asyncHandler(async (req, res) => {
  const instructorId = req.user._id;

  // 1. Get instructor's courses
  const instructorCourses = await Course.find({ instructor: instructorId }).select('_id title slug');
  const courseIds = instructorCourses.map((c) => c._id);

  if (courseIds.length === 0) {
    return res.status(200).json({
      success: true,
      count: 0,
      data: [],
    });
  }

  const query = { courseId: { $in: courseIds } };

  // Optional course filter
  if (req.query.courseId) {
    const { course, error } = await verifyCourseOwnership(req.query.courseId, instructorId);
    if (error) {
      return res.status(error.status).json({ success: false, message: error.message });
    }
    query.courseId = course._id;
  }

  if (req.query.status && req.query.status !== 'all') {
    query.status = req.query.status;
  }

  const enrollments = await Enrollment.find(query)
    .populate('userId', 'fullName email avatar phone')
    .populate('courseId', 'title slug category level')
    .sort({ createdAt: -1 });

  // Return strictly sanitized student profile for instructor view
  const roster = enrollments.map((item) => ({
    enrollmentId: item._id.toString(),
    student: item.userId
      ? {
          id: item.userId._id.toString(),
          fullName: item.userId.fullName,
          email: item.userId.email,
          phone: item.userId.phone || '',
          avatar: item.userId.avatar || '',
        }
      : null,
    course: item.courseId
      ? {
          id: item.courseId._id.toString(),
          title: item.courseId.title,
          slug: item.courseId.slug,
          category: item.courseId.category,
        }
      : null,
    status: item.status,
    progressPercentage: item.progressPercentage || 0,
    enrolledAt: item.createdAt,
    lastAccessedAt: item.updatedAt,
  }));

  res.status(200).json({
    success: true,
    count: roster.length,
    data: roster,
  });
});
