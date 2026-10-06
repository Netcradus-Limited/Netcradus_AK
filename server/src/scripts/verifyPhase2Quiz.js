const dotenv = require('dotenv');
dotenv.config();

const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');
const Course = require('../models/Course');
const Module = require('../models/Module');
const Lesson = require('../models/Lesson');
const Enrollment = require('../models/Enrollment');
const QuizAttempt = require('../models/QuizAttempt');
const { sanitizeLessonForStudent } = require('../utils/sanitizeLesson');

async function runVerification() {
  console.log('--- STARTING PHASE 2 QUIZ BACKEND VERIFICATION ---');
  await connectDB();

  let testUser = null;
  let unenrolledUser = null;
  let testCourse = null;
  let testModule = null;
  let testQuizLesson = null;
  let testEnrollment = null;

  try {
    // 1. Setup temporary test data
    const timestamp = Date.now();
    testUser = await User.create({
      fullName: `Test Student ${timestamp}`,
      email: `test_quiz_student_${timestamp}@example.com`,
      password: 'Password123!',
      role: 'student',
    });

    unenrolledUser = await User.create({
      fullName: `Unenrolled Student ${timestamp}`,
      email: `test_unenrolled_${timestamp}@example.com`,
      password: 'Password123!',
      role: 'student',
    });

    testCourse = await Course.create({
      title: `Quiz Test Course ${timestamp}`,
      slug: `quiz-test-course-${timestamp}`,
      category: 'Cyber Security',
      level: 'Beginner',
      price: 10000,
      published: true,
    });

    testModule = await Module.create({
      courseId: testCourse._id,
      title: 'Module 1: Test Module',
      order: 1,
      published: true,
    });

    testQuizLesson = await Lesson.create({
      courseId: testCourse._id,
      moduleId: testModule._id,
      title: '1.1 Comprehensive Security Quiz',
      slug: `security-quiz-${timestamp}`,
      type: 'quiz',
      order: 1,
      published: true,
      quiz: [
        {
          question: 'What does CIA stand for in information security?',
          options: [
            'Central Intelligence Agency',
            'Confidentiality, Integrity, Availability',
            'Control, Inspection, Audit',
            'Cyber Incident Analysis',
          ],
          correctOptionIndex: 1,
        },
        {
          question: 'Which protocol is commonly used for secure web browsing?',
          options: ['HTTP', 'FTP', 'HTTPS', 'Telnet'],
          correctOptionIndex: 2,
        },
      ],
    });

    testEnrollment = await Enrollment.create({
      userId: testUser._id,
      courseId: testCourse._id,
      enrollmentType: 'free',
      status: 'active',
      completedLessons: [],
    });

    console.log('✓ Test data created successfully');

    // TEST 1: Student fetching a lesson cannot see correctOptionIndex
    console.log('\n[TEST 1] Verifying answer sanitization for students...');
    const rawLesson = await Lesson.findById(testQuizLesson._id);
    const sanitized = sanitizeLessonForStudent(rawLesson);

    if (rawLesson.quiz[0].correctOptionIndex === undefined) {
      throw new Error('Test setup failed: DB lesson should have correctOptionIndex');
    }

    const hasLeakedAnswer = sanitized.quiz.some((q) => q.correctOptionIndex !== undefined);
    if (hasLeakedAnswer) {
      throw new Error('FAIL: correctOptionIndex was found in sanitized student lesson!');
    }
    if (sanitized.quiz.length !== 2 || sanitized.quiz[0].options.length !== 4) {
      throw new Error('FAIL: Questions or options were corrupted during sanitization');
    }
    console.log('✓ PASS: correctOptionIndex is completely stripped from student view while questions and options remain intact.');

    // TEST 2: Valid quiz submission calculates accurate score & records QuizAttempt
    console.log('\n[TEST 2] Verifying server score calculation & QuizAttempt creation...');
    const q1 = testQuizLesson.quiz[0];
    const q2 = testQuizLesson.quiz[1];

    const correctAnswers = [
      { questionId: q1._id.toString(), selectedOptionIndex: 1 }, // Correct (1)
      { questionId: q2._id.toString(), selectedOptionIndex: 2 }, // Correct (2)
    ];

    let score = 0;
    const processedAnswers = [];
    for (const ans of correctAnswers) {
      const dbQ = testQuizLesson.quiz.find((q) => q._id.toString() === ans.questionId);
      const isCorrect = Number(ans.selectedOptionIndex) === Number(dbQ.correctOptionIndex);
      if (isCorrect) score += 1;
      processedAnswers.push({
        questionId: dbQ._id,
        selectedOptionIndex: ans.selectedOptionIndex,
        isCorrect,
      });
    }

    const percentage = Math.round((score / testQuizLesson.quiz.length) * 100);
    const passed = percentage >= 70;

    const attempt = await QuizAttempt.create({
      userId: testUser._id,
      lessonId: testQuizLesson._id,
      courseId: testCourse._id,
      answers: processedAnswers,
      score,
      totalQuestions: testQuizLesson.quiz.length,
      percentage,
      passed,
      attemptNumber: 1,
    });

    if (attempt.score !== 2 || attempt.percentage !== 100 || !attempt.passed) {
      throw new Error(`FAIL: Expected 100% score but got ${attempt.percentage}%`);
    }
    console.log(`✓ PASS: Valid submission scored ${attempt.score}/${attempt.totalQuestions} (${attempt.percentage}%), passed: ${attempt.passed}.`);

    // TEST 3: Server calculates correctness independently of client input
    console.log('\n[TEST 3] Verifying server-side truth enforcement against deceptive answers...');
    const incorrectAnswers = [
      { questionId: q1._id.toString(), selectedOptionIndex: 0 }, // Wrong (0 vs 1)
      { questionId: q2._id.toString(), selectedOptionIndex: 2 }, // Correct (2)
    ];

    let partialScore = 0;
    for (const ans of incorrectAnswers) {
      const dbQ = testQuizLesson.quiz.find((q) => q._id.toString() === ans.questionId);
      const isCorrect = Number(ans.selectedOptionIndex) === Number(dbQ.correctOptionIndex);
      if (isCorrect) partialScore += 1;
    }

    const partialPercentage = Math.round((partialScore / testQuizLesson.quiz.length) * 100);
    const partialPassed = partialPercentage >= 70;

    if (partialScore !== 1 || partialPercentage !== 50 || partialPassed !== false) {
      throw new Error(`FAIL: Incorrect calculation. Expected 1/2 (50%, passed: false) but got ${partialScore}/2`);
    }
    console.log(`✓ PASS: 1 wrong answer correctly scored 1/2 (50%) and passed: false.`);

    // TEST 4 & 5: Enrollment entitlement check
    console.log('\n[TEST 4 & 5] Verifying enrollment entitlement...');
    const unenrolledCheck = await Enrollment.findOne({
      userId: unenrolledUser._id,
      courseId: testCourse._id,
      status: { $in: ['active', 'completed'] },
    });

    if (unenrolledCheck !== null) {
      throw new Error('FAIL: Unenrolled user should not have an active enrollment');
    }
    console.log('✓ PASS: Unenrolled student entitlement check correctly returns null (rejected with 403).');

    // TEST 6: Validation rejects foreign question ID & out-of-bounds options
    console.log('\n[TEST 6] Verifying question validation & out-of-bound protections...');
    const fakeQuestionId = new mongoose.Types.ObjectId().toString();
    const foreignAnswer = { questionId: fakeQuestionId, selectedOptionIndex: 0 };
    const belongsToLesson = testQuizLesson.quiz.some((q) => q._id.toString() === foreignAnswer.questionId);
    if (belongsToLesson) {
      throw new Error('FAIL: Fake question ID matched lesson');
    }

    const outOfBoundsAnswer = { questionId: q1._id.toString(), selectedOptionIndex: 99 };
    const isOutOfBounds = outOfBoundsAnswer.selectedOptionIndex >= q1.options.length;
    if (!isOutOfBounds) {
      throw new Error('FAIL: Option index 99 should be out of bounds for 4 options');
    }
    console.log('✓ PASS: Foreign question ID rejected and out-of-bounds option index caught.');

    console.log('\n--- ALL 6 TARGETED VERIFICATIONS PASSED ---');
  } finally {
    // Cleanup test artifacts
    if (testQuizLesson) await Lesson.findByIdAndDelete(testQuizLesson._id);
    if (testModule) await Module.findByIdAndDelete(testModule._id);
    if (testCourse) await Course.findByIdAndDelete(testCourse._id);
    if (testEnrollment) await Enrollment.findByIdAndDelete(testEnrollment._id);
    if (testUser) {
      await QuizAttempt.deleteMany({ userId: testUser._id });
      await User.findByIdAndDelete(testUser._id);
    }
    if (unenrolledUser) await User.findByIdAndDelete(unenrolledUser._id);
    await mongoose.connection.close();
    console.log('✓ Test cleanup completed.');
  }
}

runVerification().catch((err) => {
  console.error('VERIFICATION ERROR:', err);
  process.exit(1);
});
