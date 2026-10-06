const mongoose = require('mongoose');
const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course');
const Module = require('../models/Module');
const Lesson = require('../models/Lesson');
const User = require('../models/User');
const Certificate = require('../models/Certificate');
const LiveSession = require('../models/LiveSession');
const Assignment = require('../models/Assignment');
const Submission = require('../models/Submission');
const QuizAttempt = require('../models/QuizAttempt');
const asyncHandler = require('../utils/asyncHandler');
const { issueCertificateForEnrollment } = require('../services/certificateService');

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

  // Auto-issue or fetch certificate if course is completed
  if (enrollment.status === 'completed' && enrollment.progressPercentage === 100) {
    try {
      await issueCertificateForEnrollment(enrollment);
    } catch (certErr) {
      console.warn('[studentController] Auto-issuance of certificate deferred:', certErr.message);
    }
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

/**
 * @desc    Get study materials (PDFs and external resources) for authenticated student's enrolled courses
 * @route   GET /api/v1/student/materials
 * @access  Private (Authenticated Student)
 */
exports.getStudentMaterials = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  // 1. Fetch student's active or completed enrollments to isolate courses
  const enrollments = await Enrollment.find({
    userId,
    status: { $in: ['active', 'completed'] },
  }).select('courseId');

  const courseIds = enrollments
    .map((e) => e.courseId)
    .filter((id) => mongoose.Types.ObjectId.isValid(id));

  if (courseIds.length === 0) {
    return res.status(200).json({
      success: true,
      count: 0,
      data: [],
    });
  }

  // 2. Query published lessons belonging ONLY to those courses having pdf or resources
  const lessons = await Lesson.find({
    courseId: { $in: courseIds },
    published: true,
    $or: [
      { pdf: { $exists: true, $ne: '' } },
      { resources: { $exists: true, $not: { $size: 0 } } },
    ],
  })
    .populate('courseId', 'title slug')
    .sort({ courseId: 1, order: 1 });

  // 3. Format into a sanitized, useful flat list of materials
  const materials = [];

  lessons.forEach((lesson) => {
    const courseTitle = lesson.courseId ? lesson.courseId.title : 'Enrolled Course';
    const courseId = lesson.courseId ? lesson.courseId._id : null;

    // Attach PDF if defined and non-empty
    if (lesson.pdf && typeof lesson.pdf === 'string' && lesson.pdf.trim() !== '') {
      materials.push({
        id: `${lesson._id.toString()}-pdf`,
        title: `${lesson.title} - Official Lecture Notes`,
        type: 'pdf',
        url: lesson.pdf.trim(),
        courseTitle,
        courseId,
        lessonTitle: lesson.title,
        lessonId: lesson._id,
      });
    }

    // Attach resources if array has items
    if (Array.isArray(lesson.resources) && lesson.resources.length > 0) {
      lesson.resources.forEach((resItem, idx) => {
        if (resItem && resItem.url && typeof resItem.url === 'string' && resItem.url.trim() !== '') {
          const isPdfUrl = /\.pdf(\?|$)/i.test(resItem.url.trim());
          materials.push({
            id: `${lesson._id.toString()}-res-${idx}`,
            title: resItem.title ? resItem.title.trim() : `${lesson.title} Resource #${idx + 1}`,
            type: isPdfUrl ? 'pdf' : 'resource',
            url: resItem.url.trim(),
            courseTitle,
            courseId,
            lessonTitle: lesson.title,
            lessonId: lesson._id,
          });
        }
      });
    }
  });

  res.status(200).json({
    success: true,
    count: materials.length,
    data: materials,
  });
});

/**
 * @desc    Get live interactive mentoring sessions for authenticated student's enrolled courses
 * @route   GET /api/v1/student/live-sessions
 * @access  Private (Authenticated Student)
 */
exports.getStudentLiveSessions = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  // 1. Fetch student's active or completed enrollments to isolate courses
  const enrollments = await Enrollment.find({
    userId,
    status: { $in: ['active', 'completed'] },
  }).select('courseId');

  const courseIds = enrollments
    .map((e) => e.courseId)
    .filter((id) => mongoose.Types.ObjectId.isValid(id));

  if (courseIds.length === 0) {
    return res.status(200).json({
      success: true,
      count: 0,
      data: [],
    });
  }

  // 2. Fetch live sessions for enrolled courses, excluding cancelled ones
  const rawSessions = await LiveSession.find({
    courseId: { $in: courseIds },
    status: { $ne: 'cancelled' },
  })
    .populate('courseId', 'title slug')
    .populate('instructor', 'fullName avatar')
    .sort({ startTime: 1 });

  // 3. Compute dynamic display status based on current time
  const now = new Date();

  const sessions = rawSessions.map((session) => {
    const start = new Date(session.startTime);
    const end = new Date(session.endTime);

    let displayStatus;
    if (session.status === 'cancelled') {
      displayStatus = 'cancelled';
    } else if (now < start) {
      displayStatus = 'upcoming';
    } else if (now >= start && now <= end) {
      displayStatus = 'live';
    } else {
      displayStatus = 'completed';
    }

    const isJoinable = displayStatus === 'live' || displayStatus === 'upcoming';

    return {
      id: session._id.toString(),
      title: session.title,
      description: session.description || '',
      courseTitle: session.courseId ? session.courseId.title : 'Enrolled Program',
      courseId: session.courseId ? session.courseId._id : null,
      instructorName: session.instructor ? session.instructor.fullName : 'Senior Netcradus Engineer',
      instructorAvatar: session.instructor ? session.instructor.avatar : '',
      meetingUrl: session.meetingUrl,
      startTime: session.startTime,
      endTime: session.endTime,
      storedStatus: session.status,
      status: displayStatus,
      isJoinable,
    };
  });

  res.status(200).json({
    success: true,
    count: sessions.length,
    data: sessions,
  });
});

/**
 * @desc    Get assignments for authenticated student's enrolled courses with student's own submission
 * @route   GET /api/v1/student/assignments
 * @access  Private (Authenticated Student)
 */
exports.getStudentAssignments = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  // 1. Fetch student's active or completed enrollments
  const enrollments = await Enrollment.find({
    userId,
    status: { $in: ['active', 'completed'] },
  }).select('courseId');

  const courseIds = enrollments
    .map((e) => e.courseId)
    .filter((id) => mongoose.Types.ObjectId.isValid(id));

  if (courseIds.length === 0) {
    return res.status(200).json({
      success: true,
      count: 0,
      data: {
        assignments: [],
      },
    });
  }

  // 2. Fetch published assignments for those courses, sorted chronologically
  const rawAssignments = await Assignment.find({
    courseId: { $in: courseIds },
    status: 'published',
  })
    .populate('courseId', 'title slug')
    .sort({ dueDate: 1, createdAt: -1 });

  const assignmentIds = rawAssignments.map((a) => a._id);

  // 3. Fetch ONLY the authenticated student's submissions for these assignments
  const submissions = await Submission.find({
    userId,
    assignmentId: { $in: assignmentIds },
  });

  const submissionMap = new Map();
  submissions.forEach((sub) => {
    submissionMap.set(sub.assignmentId.toString(), sub);
  });

  // 4. Construct sanitized assignment objects with own submission attached
  const assignments = rawAssignments.map((assignment) => {
    const userSub = submissionMap.get(assignment._id.toString());

    return {
      id: assignment._id.toString(),
      title: assignment.title,
      description: assignment.description || '',
      instructions: assignment.instructions || '',
      dueDate: assignment.dueDate,
      maxScore: assignment.maxScore,
      status: assignment.status,
      courseId: assignment.courseId ? assignment.courseId._id : null,
      courseTitle: assignment.courseId ? assignment.courseId.title : 'Enrolled Course',
      submission: userSub
        ? {
            id: userSub._id.toString(),
            repoUrl: userSub.repoUrl || '',
            submissionText: userSub.submissionText || '',
            status: userSub.status,
            score: userSub.score,
            feedback: userSub.feedback || '',
            submittedAt: userSub.submittedAt,
            gradedAt: userSub.gradedAt,
          }
        : null,
    };
  });

  res.status(200).json({
    success: true,
    count: assignments.length,
    data: {
      assignments,
    },
  });
});

/**
 * @desc    Submit or update student practical assignment
 * @route   POST /api/v1/student/assignments/:assignmentId/submit
 * @access  Private (Authenticated Student)
 */
exports.submitAssignment = asyncHandler(async (req, res) => {
  const { assignmentId } = req.params;
  const userId = req.user._id;

  if (!mongoose.Types.ObjectId.isValid(assignmentId)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid assignment identifier provided.',
    });
  }

  // 1. Fetch assignment and verify existence and published status
  const assignment = await Assignment.findById(assignmentId);
  if (!assignment || assignment.status !== 'published') {
    return res.status(404).json({
      success: false,
      message: 'Assignment not found or is currently not open for submissions.',
    });
  }

  // 2. Verify student has active/completed enrollment for this course
  const enrollment = await Enrollment.findOne({
    userId,
    courseId: assignment.courseId,
    status: { $in: ['active', 'completed'] },
  });

  if (!enrollment) {
    return res.status(403).json({
      success: false,
      message: 'Access denied. You must be actively enrolled in this course to submit assignments.',
    });
  }

  // 3. Extract and sanitize client inputs (strictly ignore score, feedback, status, gradedAt)
  const { repoUrl, submissionText } = req.body;

  let sanitizedRepoUrl = '';
  if (repoUrl !== undefined && repoUrl !== null) {
    if (typeof repoUrl !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Repository URL must be a valid text string.',
      });
    }
    const trimmed = repoUrl.trim();
    if (trimmed !== '') {
      const lower = trimmed.toLowerCase();
      if (!lower.startsWith('https://') && !lower.startsWith('http://')) {
        return res.status(400).json({
          success: false,
          message: 'Repository URL must be a valid HTTP or HTTPS web link (e.g. GitHub, GitLab).',
        });
      }
      sanitizedRepoUrl = trimmed;
    }
  }

  let sanitizedSubmissionText = '';
  if (submissionText !== undefined && submissionText !== null) {
    if (typeof submissionText !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Submission notes must be text.',
      });
    }
    sanitizedSubmissionText = submissionText.trim().slice(0, 10000); // bounded text
  }

  // Require at least repoUrl or submissionText
  if (!sanitizedRepoUrl && !sanitizedSubmissionText) {
    return res.status(400).json({
      success: false,
      message: 'Please provide a repository URL or submission report notes.',
    });
  }

  // 4. Create or update submission record idempotently
  let submission = await Submission.findOne({
    assignmentId: assignment._id,
    userId,
  });

  if (submission) {
    // Update existing submission
    if (sanitizedRepoUrl) submission.repoUrl = sanitizedRepoUrl;
    if (sanitizedSubmissionText) submission.submissionText = sanitizedSubmissionText;
    submission.status = 'submitted';
    submission.submittedAt = new Date();
    await submission.save();
  } else {
    // Create new submission with MongoDB 11000 race guard
    try {
      submission = await Submission.create({
        assignmentId: assignment._id,
        userId,
        courseId: assignment.courseId,
        repoUrl: sanitizedRepoUrl,
        submissionText: sanitizedSubmissionText,
        status: 'submitted',
        submittedAt: new Date(),
      });
    } catch (createErr) {
      if (createErr.code === 11000) {
        submission = await Submission.findOne({
          assignmentId: assignment._id,
          userId,
        });
        if (sanitizedRepoUrl) submission.repoUrl = sanitizedRepoUrl;
        if (sanitizedSubmissionText) submission.submissionText = sanitizedSubmissionText;
        submission.status = 'submitted';
        submission.submittedAt = new Date();
        await submission.save();
      } else {
        throw createErr;
      }
    }
  }

  res.status(200).json({
    success: true,
    message: 'Assignment submitted successfully.',
    data: {
      submission: {
        id: submission._id.toString(),
        assignmentId: submission.assignmentId.toString(),
        repoUrl: submission.repoUrl,
        submissionText: submission.submissionText,
        status: submission.status,
        score: submission.score,
        feedback: submission.feedback,
        submittedAt: submission.submittedAt,
        gradedAt: submission.gradedAt,
      },
    },
  });
});

/**
 * @desc    Submit quiz answers, compute score server-side, and save QuizAttempt
 * @route   POST /api/v1/student/lessons/:id/quiz-submit
 * @access  Private (Authenticated Student)
 */
exports.submitQuiz = asyncHandler(async (req, res) => {
  const lessonId = req.params.id || req.params.lessonId;
  const userId = req.user._id;

  // 1. Validate lesson ID format
  if (!mongoose.Types.ObjectId.isValid(lessonId)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid lesson identifier provided.',
    });
  }

  // 2. Fetch lesson and verify it is a published quiz
  const lesson = await Lesson.findById(lessonId);
  if (!lesson || !lesson.published) {
    return res.status(404).json({
      success: false,
      message: 'The requested quiz lesson was not found or is currently inactive.',
    });
  }

  if (lesson.type !== 'quiz' || !Array.isArray(lesson.quiz) || lesson.quiz.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'The requested lesson is not a quiz or contains no questions.',
    });
  }

  const courseId = lesson.courseId;

  // 3. Verify student enrollment in MongoDB
  const enrollment = await Enrollment.findOne({
    userId,
    courseId,
    status: { $in: ['active', 'completed'] },
  });

  if (!enrollment) {
    return res.status(403).json({
      success: false,
      message: 'Access denied. You must have an active enrollment in this course to take and submit this quiz.',
    });
  }

  // 4. Abuse protection & question validation
  const { answers, startedAt } = req.body;
  const questionMap = new Map();
  for (const q of lesson.quiz) {
    questionMap.set(q._id.toString(), q);
  }

  if (answers.length !== lesson.quiz.length) {
    return res.status(400).json({
      success: false,
      message: `Invalid submission: You submitted ${answers.length} answers, but this quiz requires all ${lesson.quiz.length} questions to be answered.`,
    });
  }

  const seenQuestionIds = new Set();
  for (const ans of answers) {
    const qIdStr = ans.questionId.toString();

    if (seenQuestionIds.has(qIdStr)) {
      return res.status(400).json({
        success: false,
        message: `Duplicate answer submitted for question ID '${ans.questionId}'.`,
      });
    }
    seenQuestionIds.add(qIdStr);

    const questionDoc = questionMap.get(qIdStr);
    if (!questionDoc) {
      return res.status(400).json({
        success: false,
        message: `Question ID '${ans.questionId}' does not belong to this quiz.`,
      });
    }

    if (ans.selectedOptionIndex >= questionDoc.options.length) {
      return res.status(400).json({
        success: false,
        message: `Selected option index ${ans.selectedOptionIndex} is out of bounds for question '${questionDoc.question}'. Valid options range from 0 to ${questionDoc.options.length - 1}.`,
      });
    }
  }

  // 5. Server-side score & percentage calculation
  let score = 0;
  const processedAnswers = [];

  for (const ans of answers) {
    const questionDoc = questionMap.get(ans.questionId.toString());
    const isCorrect = Number(ans.selectedOptionIndex) === Number(questionDoc.correctOptionIndex);
    if (isCorrect) {
      score += 1;
    }

    processedAnswers.push({
      questionId: questionDoc._id,
      selectedOptionIndex: ans.selectedOptionIndex,
      isCorrect,
    });
  }

  const totalQuestions = lesson.quiz.length;
  const percentage = Math.round((score / totalQuestions) * 100);
  const PASSING_THRESHOLD = 70;
  const passed = percentage >= PASSING_THRESHOLD;

  // 6. Record QuizAttempt with attempt count increment
  const previousAttemptsCount = await QuizAttempt.countDocuments({
    userId,
    lessonId: lesson._id,
  });
  const attemptNumber = previousAttemptsCount + 1;

  const quizAttempt = await QuizAttempt.create({
    userId,
    lessonId: lesson._id,
    courseId,
    answers: processedAnswers,
    score,
    totalQuestions,
    percentage,
    passed,
    attemptNumber,
    startedAt: startedAt ? new Date(startedAt) : new Date(),
    submittedAt: new Date(),
  });

  // 7. Update course enrollment progress if quiz is passed
  let progressMetrics = null;
  if (passed) {
    const lessonIdStr = lesson._id.toString();
    const existingCompletedStrings = (enrollment.completedLessons || []).map((id) => id.toString());
    if (!existingCompletedStrings.includes(lessonIdStr)) {
      enrollment.completedLessons.push(lesson._id);
    }
    enrollment.lastAccessedLesson = lesson._id;
    progressMetrics = await calculateEnrollmentProgress(enrollment);
  }

  // 8. Return safe results (NEVER expose correctOptionIndex)
  res.status(200).json({
    success: true,
    message: passed
      ? `Congratulations! You passed the quiz with ${percentage}%.`
      : `Quiz submitted. You scored ${percentage}%. You need ${PASSING_THRESHOLD}% to pass.`,
    data: {
      attemptId: quizAttempt._id,
      lessonId: lesson._id,
      courseId,
      attemptNumber,
      score,
      totalQuestions,
      percentage,
      passingThreshold: PASSING_THRESHOLD,
      passed,
      submittedAt: quizAttempt.submittedAt,
      results: processedAnswers.map((a) => ({
        questionId: a.questionId,
        selectedOptionIndex: a.selectedOptionIndex,
        isCorrect: a.isCorrect,
      })),
      courseProgress: progressMetrics ? {
        progressPercentage: progressMetrics.progressPercentage,
        completedLessonsCount: progressMetrics.completedLessonsCount,
        totalLessons: progressMetrics.totalLessons,
        status: progressMetrics.status,
      } : undefined,
    },
  });
});


