const mongoose = require('mongoose');
const Course = require('../models/Course');
const Module = require('../models/Module');
const Lesson = require('../models/Lesson');
const Assignment = require('../models/Assignment');
const Submission = require('../models/Submission');

/**
 * Verify whether a course exists and is assigned to the authenticated instructor.
 * @param {string|mongoose.Types.ObjectId} courseId
 * @param {string|mongoose.Types.ObjectId} instructorId
 * @returns {Promise<{ course?: object, error?: { status: number, message: string } }>}
 */
async function verifyCourseOwnership(courseId, instructorId) {
  if (!mongoose.Types.ObjectId.isValid(courseId)) {
    return { error: { status: 400, message: 'Invalid course identifier format.' } };
  }

  const course = await Course.findById(courseId);
  if (!course) {
    return { error: { status: 404, message: 'Course not found.' } };
  }

  if (!course.instructor || course.instructor.toString() !== instructorId.toString()) {
    return {
      error: {
        status: 403,
        message: 'Access denied. You are not the assigned instructor for this course.',
      },
    };
  }

  return { course };
}

/**
 * Verify whether a module belongs to a course assigned to the authenticated instructor.
 * @param {string|mongoose.Types.ObjectId} moduleId
 * @param {string|mongoose.Types.ObjectId} instructorId
 * @returns {Promise<{ moduleDoc?: object, course?: object, error?: { status: number, message: string } }>}
 */
async function verifyModuleOwnership(moduleId, instructorId) {
  if (!mongoose.Types.ObjectId.isValid(moduleId)) {
    return { error: { status: 400, message: 'Invalid module identifier format.' } };
  }

  const moduleDoc = await Module.findById(moduleId);
  if (!moduleDoc) {
    return { error: { status: 404, message: 'Curriculum module not found.' } };
  }

  const { course, error } = await verifyCourseOwnership(moduleDoc.courseId, instructorId);
  if (error) {
    return { error };
  }

  return { moduleDoc, course };
}

/**
 * Verify whether a lesson belongs to a course assigned to the authenticated instructor.
 * @param {string|mongoose.Types.ObjectId} lessonId
 * @param {string|mongoose.Types.ObjectId} instructorId
 * @returns {Promise<{ lesson?: object, course?: object, error?: { status: number, message: string } }>}
 */
async function verifyLessonOwnership(lessonId, instructorId) {
  if (!mongoose.Types.ObjectId.isValid(lessonId)) {
    return { error: { status: 400, message: 'Invalid lesson identifier format.' } };
  }

  const lesson = await Lesson.findById(lessonId);
  if (!lesson) {
    return { error: { status: 404, message: 'Lesson not found.' } };
  }

  const { course, error } = await verifyCourseOwnership(lesson.courseId, instructorId);
  if (error) {
    return { error };
  }

  return { lesson, course };
}

/**
 * Verify whether an assignment belongs to a course assigned to the authenticated instructor.
 * @param {string|mongoose.Types.ObjectId} assignmentId
 * @param {string|mongoose.Types.ObjectId} instructorId
 * @returns {Promise<{ assignment?: object, course?: object, error?: { status: number, message: string } }>}
 */
async function verifyAssignmentOwnership(assignmentId, instructorId) {
  if (!mongoose.Types.ObjectId.isValid(assignmentId)) {
    return { error: { status: 400, message: 'Invalid assignment identifier format.' } };
  }

  const assignment = await Assignment.findById(assignmentId);
  if (!assignment) {
    return { error: { status: 404, message: 'Assignment not found.' } };
  }

  const { course, error } = await verifyCourseOwnership(assignment.courseId, instructorId);
  if (error) {
    return { error };
  }

  return { assignment, course };
}

/**
 * Verify whether a submission belongs to an assignment/course assigned to the authenticated instructor.
 * @param {string|mongoose.Types.ObjectId} submissionId
 * @param {string|mongoose.Types.ObjectId} instructorId
 * @returns {Promise<{ submission?: object, assignment?: object, course?: object, error?: { status: number, message: string } }>}
 */
async function verifySubmissionOwnership(submissionId, instructorId) {
  if (!mongoose.Types.ObjectId.isValid(submissionId)) {
    return { error: { status: 400, message: 'Invalid submission identifier format.' } };
  }

  const submission = await Submission.findById(submissionId);
  if (!submission) {
    return { error: { status: 404, message: 'Submission record not found.' } };
  }

  const { course, error } = await verifyCourseOwnership(submission.courseId, instructorId);
  if (error) {
    return { error };
  }

  const assignment = await Assignment.findById(submission.assignmentId);

  return { submission, assignment, course };
}

module.exports = {
  verifyCourseOwnership,
  verifyModuleOwnership,
  verifyLessonOwnership,
  verifyAssignmentOwnership,
  verifySubmissionOwnership,
};
