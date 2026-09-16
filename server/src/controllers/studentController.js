const mongoose = require('mongoose');
const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course');
const Module = require('../models/Module');
const Lesson = require('../models/Lesson');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');

/**
 * Helper to calculate progress metrics & continue learning target for an enrollment
 */
async function calculateEnrollmentProgress(enrollment) {
  const courseId = enrollment.courseId._id || enrollment.courseId;

  // 1. Fetch all published modules for this course
  const publishedModules = await Module.find({ courseId, published: true }).sort({ order: 1 });
  const moduleIds = publishedModules.map((m) => m._id);

  // 2. Fetch all published lessons for these modules
  const publishedLessons = await Lesson.find({ moduleId: { $in: moduleIds }, published: true }).sort({ order: 1 });
  const totalLessons = publishedLessons.length;

  // 3. Filter completed lessons to only include valid, currently published lessons
  const validLessonIdStrings = publishedLessons.map((l) => l._id.toString());
  const rawCompletedStrings = (enrollment.completedLessons || []).map((id) => id.toString());

  const validCompletedSet = new Set(
    rawCompletedStrings.filter((idStr) => validLessonIdStrings.includes(idStr))
  );

  const completedLessonsCount = validCompletedSet.size;

  // 4. Calculate progress percentage
  const progressPercentage = totalLessons > 0 ? Math.round((completedLessonsCount / totalLessons) * 100) : 0;

  // 5. Update enrollment document progress percentage & status if changed
  let needsSave = false;
  if (enrollment.progressPercentage !== progressPercentage) {
    enrollment.progressPercentage = progressPercentage;
    needsSave = true;
  }

  if (progressPercentage === 100 && enrollment.status === 'active') {
    enrollment.status = 'completed';
    enrollment.completedAt = enrollment.completedAt || new Date();
    needsSave = true;
  }

  if (needsSave) {
    await enrollment.save();
  }

  // 6. Determine Continue Learning target lesson ID
  let continueLessonId = null;

  // Check if lastAccessedLesson is valid and still incomplete
  if (enrollment.lastAccessedLesson) {
    const lastAccessedStr = enrollment.lastAccessedLesson.toString();
    if (validLessonIdStrings.includes(lastAccessedStr) && !validCompletedSet.has(lastAccessedStr)) {
      continueLessonId = lastAccessedStr;
    }
  }

  // If no incomplete lastAccessedLesson, pick the first incomplete published lesson
  if (!continueLessonId) {
    const firstIncomplete = publishedLessons.find((l) => !validCompletedSet.has(l._id.toString()));
    if (firstIncomplete) {
      continueLessonId = firstIncomplete._id.toString();
    } else if (publishedLessons.length > 0) {
      // If all completed, point to the last accessed or last published lesson
      continueLessonId = enrollment.lastAccessedLesson
        ? enrollment.lastAccessedLesson.toString()
        : publishedLessons[publishedLessons.length - 1]._id.toString();
    }
  }

  return {
    totalLessons,
    completedLessonsCount,
    progressPercentage,
    completedLessons: Array.from(validCompletedSet),
    lastAccessedLesson: enrollment.lastAccessedLesson ? enrollment.lastAccessedLesson.toString() : null,
    continueLessonId,
    publishedModules,
    publishedLessons,
  };
}

/**
 * @desc    Get authenticated student dashboard data (profile, enrollments with real progress, stats)
 * @route   GET /api/v1/student/dashboard
 * @access  Private (Authenticated User / Student)
 */
exports.getStudentDashboard = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  // Fetch student's enrollment documents populated with course info
  const rawEnrollments = await Enrollment.find({ userId })
    .populate('courseId', 'title slug category level price duration thumbnail bannerClass bannerIcon published shortDescription')
    .sort({ createdAt: -1 });

  // Enrich each enrollment with real progress & continue learning data
  const enrichedEnrollments = await Promise.all(
    rawEnrollments.map(async (item) => {
      const itemObj = item.toObject();
      if (item.courseId) {
        const metrics = await calculateEnrollmentProgress(item);
        itemObj.totalLessons = metrics.totalLessons;
        itemObj.completedLessonsCount = metrics.completedLessonsCount;
        itemObj.progressPercentage = metrics.progressPercentage;
        itemObj.continueLessonId = metrics.continueLessonId;
      } else {
        itemObj.totalLessons = 0;
        itemObj.completedLessonsCount = 0;
        itemObj.progressPercentage = 0;
        itemObj.continueLessonId = null;
      }
      return itemObj;
    })
  );

  const totalEnrollments = enrichedEnrollments.length;
  const activeEnrollments = enrichedEnrollments.filter((e) => e.status === 'active').length;
  const completedEnrollments = enrichedEnrollments.filter((e) => e.status === 'completed').length;

  const userProfile = {
    _id: req.user._id,
    fullName: req.user.fullName,
    email: req.user.email,
    phone: req.user.phone || '',
    avatar: req.user.avatar || '',
    status: req.user.status,
    role: req.user.role,
    createdAt: req.user.createdAt,
  };

  res.status(200).json({
    success: true,
    data: {
      user: userProfile,
      summary: {
        totalEnrollments,
        activeEnrollments,
        completedEnrollments,
      },
      enrollments: enrichedEnrollments,
    },
  });
});

/**
 * @desc    Get authenticated student's enrolled courses list with real progress
 * @route   GET /api/v1/student/enrollments
 * @access  Private (Authenticated Student)
 */
exports.getStudentEnrollments = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const rawEnrollments = await Enrollment.find({ userId })
    .populate('courseId', 'title slug category level price duration thumbnail bannerClass bannerIcon published shortDescription description requirements learningOutcomes skills tools')
    .sort({ createdAt: -1 });

  const enrichedEnrollments = await Promise.all(
    rawEnrollments.map(async (item) => {
      const itemObj = item.toObject();
      if (item.courseId) {
        const metrics = await calculateEnrollmentProgress(item);
        itemObj.totalLessons = metrics.totalLessons;
        itemObj.completedLessonsCount = metrics.completedLessonsCount;
        itemObj.progressPercentage = metrics.progressPercentage;
        itemObj.continueLessonId = metrics.continueLessonId;
      } else {
        itemObj.totalLessons = 0;
        itemObj.completedLessonsCount = 0;
        itemObj.progressPercentage = 0;
        itemObj.continueLessonId = null;
      }
      return itemObj;
    })
  );

  res.status(200).json({
    success: true,
    data: enrichedEnrollments,
  });
});

/**
 * @desc    Mark a lesson as complete for authenticated student
 * @route   POST /api/v1/student/lessons/:lessonId/complete
 * @access  Private (Authenticated Student)
 */
exports.markLessonComplete = asyncHandler(async (req, res) => {
  const { lessonId } = req.params;
  const userId = req.user._id;

  if (!mongoose.Types.ObjectId.isValid(lessonId)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid lesson identifier provided.',
    });
  }

  // 1. Fetch lesson and check existence & publication status
  const lesson = await Lesson.findById(lessonId);
  if (!lesson || !lesson.published) {
    return res.status(404).json({
      success: false,
      message: 'The requested lesson was not found or is currently inactive.',
    });
  }

  const courseId = lesson.courseId;

  // 2. Verify student enrollment in MongoDB
  const enrollment = await Enrollment.findOne({
    userId,
    courseId,
    status: { $in: ['active', 'completed'] },
  });

  if (!enrollment) {
    return res.status(403).json({
      success: false,
      message: 'Access denied. You must be enrolled in this course to complete its lessons.',
    });
  }

  // 3. Add lessonId to completedLessons without duplicates
  const lessonIdStr = lesson._id.toString();
  const existingCompletedStrings = (enrollment.completedLessons || []).map((id) => id.toString());

  if (!existingCompletedStrings.includes(lessonIdStr)) {
    enrollment.completedLessons.push(lesson._id);
  }

  // 4. Update last accessed lesson
  enrollment.lastAccessedLesson = lesson._id;

  // 5. Calculate progress metrics
  const metrics = await calculateEnrollmentProgress(enrollment);

  res.status(200).json({
    success: true,
    message: 'Lesson marked as complete.',
    data: {
      enrollmentId: enrollment._id,
      courseId,
      lessonId: lesson._id,
      totalLessons: metrics.totalLessons,
      completedLessonsCount: metrics.completedLessonsCount,
      progressPercentage: metrics.progressPercentage,
      status: enrollment.status,
      completedAt: enrollment.completedAt,
      continueLessonId: metrics.continueLessonId,
      completedLessons: metrics.completedLessons,
    },
  });
});

/**
 * @desc    Get course progress breakdown for authenticated student
 * @route   GET /api/v1/student/courses/:courseId/progress
 * @access  Private (Authenticated Student)
 */
exports.getCourseProgress = asyncHandler(async (req, res) => {
  const { courseId } = req.params;
  const userId = req.user._id;

  // Support courseId as ObjectId or slug
  let targetCourseId = courseId;
  if (!mongoose.Types.ObjectId.isValid(courseId)) {
    const course = await Course.findOne({ slug: courseId.toLowerCase().trim() });
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found.',
      });
    }
    targetCourseId = course._id;
  }

  const enrollment = await Enrollment.findOne({
    userId,
    courseId: targetCourseId,
    status: { $in: ['active', 'completed'] },
  });

  if (!enrollment) {
    return res.status(403).json({
      success: false,
      message: 'Access denied. You are not enrolled in this course.',
    });
  }

  const metrics = await calculateEnrollmentProgress(enrollment);

  // Calculate module-by-module progress breakdown
  const moduleBreakdown = metrics.publishedModules.map((mod) => {
    const modLessons = metrics.publishedLessons.filter((l) => l.moduleId.toString() === mod._id.toString());
    const totalModLessons = modLessons.length;
    const completedModLessons = modLessons.filter((l) => metrics.completedLessons.includes(l._id.toString())).length;
    const isCompleted = totalModLessons > 0 && completedModLessons === totalModLessons;

    return {
      moduleId: mod._id,
      title: mod.title,
      order: mod.order,
      totalLessons: totalModLessons,
      completedLessons: completedModLessons,
      isCompleted,
    };
  });

  res.status(200).json({
    success: true,
    data: {
      courseId: targetCourseId,
      enrollmentId: enrollment._id,
      status: enrollment.status,
      totalLessons: metrics.totalLessons,
      completedLessonsCount: metrics.completedLessonsCount,
      progressPercentage: metrics.progressPercentage,
      completedLessons: metrics.completedLessons,
      lastAccessedLesson: metrics.lastAccessedLesson,
      continueLessonId: metrics.continueLessonId,
      modules: moduleBreakdown,
    },
  });
});

/**
 * @desc    Update last accessed lesson for authenticated student
 * @route   POST /api/v1/student/courses/:courseId/last-accessed
 * @access  Private (Authenticated Student)
 */
exports.updateLastAccessed = asyncHandler(async (req, res) => {
  const { courseId } = req.params;
  const { lessonId } = req.body;
  const userId = req.user._id;

  if (!lessonId || !mongoose.Types.ObjectId.isValid(lessonId)) {
    return res.status(400).json({
      success: false,
      message: 'Valid lesson ID is required.',
    });
  }

  // Resolve target course ID
  let targetCourseId = courseId;
  if (!mongoose.Types.ObjectId.isValid(courseId)) {
    const course = await Course.findOne({ slug: courseId.toLowerCase().trim() });
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found.',
      });
    }
    targetCourseId = course._id;
  }

  // Verify enrollment
  const enrollment = await Enrollment.findOne({
    userId,
    courseId: targetCourseId,
    status: { $in: ['active', 'completed'] },
  });

  if (!enrollment) {
    return res.status(403).json({
      success: false,
      message: 'Access denied. You are not enrolled in this course.',
    });
  }

  // Verify lesson belongs to target course and is published
  const lesson = await Lesson.findById(lessonId);
  if (!lesson || !lesson.published || lesson.courseId.toString() !== targetCourseId.toString()) {
    return res.status(400).json({
      success: false,
      message: 'Invalid lesson for this course.',
    });
  }

  enrollment.lastAccessedLesson = lesson._id;
  await enrollment.save();

  res.status(200).json({
    success: true,
    message: 'Last accessed lesson updated.',
    data: {
      courseId: targetCourseId,
      lastAccessedLesson: lesson._id,
    },
  });
});


