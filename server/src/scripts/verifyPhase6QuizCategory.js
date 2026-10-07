const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const http = require('http');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const app = require('../app');
const User = require('../models/User');
const Course = require('../models/Course');
const Module = require('../models/Module');
const Lesson = require('../models/Lesson');
const Enrollment = require('../models/Enrollment');
const QuizAttempt = require('../models/QuizAttempt');
const Category = require('../models/Category');

function makeRequest(baseUrl, reqPath, options = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(reqPath, baseUrl);
    const reqOptions = {
      method: options.method || 'GET',
      headers: options.headers || {},
    };

    const req = http.request(url, reqOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        let json;
        try {
          json = JSON.parse(data);
        } catch (e) {
          json = data;
        }
        resolve({ status: res.statusCode, data: json });
      });
    });

    req.on('error', reject);

    if (options.body) {
      req.write(typeof options.body === 'string' ? options.body : JSON.stringify(options.body));
    }
    req.end();
  });
}

function generateToken(user) {
  return jwt.sign(
    { id: user._id, role: user.role, email: user.email },
    process.env.JWT_SECRET || 'secret',
    { expiresIn: '1h' }
  );
}

let testCount = 0;
let passCount = 0;

function assert(condition, message) {
  testCount++;
  if (!condition) {
    console.error(`  ❌ [TEST ${testCount} FAILED] ${message}`);
    throw new Error(`Test assertion failed: ${message}`);
  }
  passCount++;
  console.log(`  ✓ [TEST ${testCount}] ${message}`);
}

async function runVerification() {
  console.log('--- STARTING PHASE 6.6 ADMIN QUIZ PARITY + CATEGORY CRUD VERIFICATION ---');
  await connectDB();

  let server;
  let baseUrl;

  let adminUser, superAdminUser, instructorUser, studentUser;
  let tokenAdmin, tokenSuperAdmin, tokenInstructor, tokenStudent;
  let testCourse, testModule, testQuizLesson;
  let testCategoryUnused, testCategoryUsed;

  const createdUserIds = [];
  const createdCourseIds = [];
  const createdModuleIds = [];
  const createdLessonIds = [];
  const createdEnrollmentIds = [];
  const createdQuizAttemptIds = [];
  const createdCategoryIds = [];

  try {
    // Start temporary test HTTP server
    await new Promise((resolve) => {
      server = http.createServer(app);
      server.listen(0, '127.0.0.1', () => {
        const port = server.address().port;
        baseUrl = `http://127.0.0.1:${port}`;
        console.log(`[Test Server] Live on ${baseUrl}`);
        resolve();
      });
    });

    // Create fixture users
    const timestamp = Date.now();
    adminUser = await User.create({
      fullName: 'Phase6 Admin',
      email: `admin_p66_${timestamp}@netcradus.com`,
      password: 'Password123!',
      role: 'admin',
      status: 'active',
    });
    createdUserIds.push(adminUser._id);
    tokenAdmin = generateToken(adminUser);

    superAdminUser = await User.create({
      fullName: 'Phase6 SuperAdmin',
      email: `superadmin_p66_${timestamp}@netcradus.com`,
      password: 'Password123!',
      role: 'super_admin',
      status: 'active',
    });
    createdUserIds.push(superAdminUser._id);
    tokenSuperAdmin = generateToken(superAdminUser);

    instructorUser = await User.create({
      fullName: 'Phase6 Instructor',
      email: `instructor_p66_${timestamp}@netcradus.com`,
      password: 'Password123!',
      role: 'instructor',
      status: 'active',
    });
    createdUserIds.push(instructorUser._id);
    tokenInstructor = generateToken(instructorUser);

    studentUser = await User.create({
      fullName: 'Phase6 Student',
      email: `student_p66_${timestamp}@netcradus.com`,
      password: 'Password123!',
      role: 'student',
      status: 'active',
    });
    createdUserIds.push(studentUser._id);
    tokenStudent = generateToken(studentUser);

    // Create fixture Course & Module
    testCourse = await Course.create({
      title: `Test Course 6.6 ${timestamp}`,
      slug: `test-course-66-${timestamp}`,
      description: 'Test course for Phase 6.6 verification',
      category: `Category Used ${timestamp}`,
      level: 'Beginner',
      instructor: instructorUser._id,
      price: 49900,
      published: true,
    });
    createdCourseIds.push(testCourse._id);

    testModule = await Module.create({
      courseId: testCourse._id,
      title: 'Module 1: Assessments',
      order: 1,
      published: true,
    });
    createdModuleIds.push(testModule._id);

    // Student enrollment for quiz test
    const enrollment = await Enrollment.create({
      userId: studentUser._id,
      courseId: testCourse._id,
      status: 'active',
      source: 'manual',
      enrollmentType: 'manual',
    });
    createdEnrollmentIds.push(enrollment._id);

    // =========================================================================
    // SECTION 1: QUIZ RBAC AUTHORIZATION
    // =========================================================================
    console.log('\n[SUITE 1] RBAC Authorization on Admin Quiz Endpoints');

    // 1. Unauthenticated request to create lecture in module
    const res1 = await makeRequest(baseUrl, `/api/v1/admin/modules/${testModule._id}/lectures`, {
      method: 'POST',
      body: { title: 'Unauthorized Quiz', type: 'quiz' },
    });
    assert(res1.status === 401, 'Unauthenticated request to POST /admin/modules/:id/lectures returns 401');

    // 2. Student request to create quiz lecture
    const res2 = await makeRequest(baseUrl, `/api/v1/admin/modules/${testModule._id}/lectures`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenStudent}`, 'Content-Type': 'application/json' },
      body: { title: 'Student Quiz Attempt', type: 'quiz' },
    });
    assert(res2.status === 403, 'Student request to POST /admin/modules/:id/lectures returns 403');

    // 3. Instructor request to Admin lecture endpoint
    const res3 = await makeRequest(baseUrl, `/api/v1/admin/modules/${testModule._id}/lectures`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenInstructor}`, 'Content-Type': 'application/json' },
      body: { title: 'Instructor on Admin Route', type: 'quiz' },
    });
    assert(res3.status === 403, 'Instructor request to Admin lecture route returns 403');

    // =========================================================================
    // SECTION 2: ADMIN QUIZ CREATION & FIELD VALIDATION
    // =========================================================================
    console.log('\n[SUITE 2] Admin Quiz Creation & Validation');

    // 4. Malformed quiz: non-array quiz
    const res4 = await makeRequest(baseUrl, `/api/v1/admin/modules/${testModule._id}/lectures`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenAdmin}`, 'Content-Type': 'application/json' },
      body: { title: 'Invalid Quiz 1', type: 'quiz', quiz: 'not an array' },
    });
    assert(res4.status === 400, 'Non-array quiz payload is rejected with 400');

    // 5. Malformed quiz: question without title
    const res5 = await makeRequest(baseUrl, `/api/v1/admin/modules/${testModule._id}/lectures`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenAdmin}`, 'Content-Type': 'application/json' },
      body: {
        title: 'Invalid Quiz 2',
        type: 'quiz',
        quiz: [{ question: '', options: ['A', 'B'], correctOptionIndex: 0 }],
      },
    });
    assert(res5.status === 400, 'Quiz question with empty question title is rejected with 400');

    // 6. Malformed quiz: fewer than 2 options
    const res6 = await makeRequest(baseUrl, `/api/v1/admin/modules/${testModule._id}/lectures`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenAdmin}`, 'Content-Type': 'application/json' },
      body: {
        title: 'Invalid Quiz 3',
        type: 'quiz',
        quiz: [{ question: 'What is 2+2?', options: ['4'], correctOptionIndex: 0 }],
      },
    });
    assert(res6.status === 400, 'Quiz question with fewer than 2 options is rejected with 400');

    // 7. Malformed quiz: blank option string
    const res7 = await makeRequest(baseUrl, `/api/v1/admin/modules/${testModule._id}/lectures`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenAdmin}`, 'Content-Type': 'application/json' },
      body: {
        title: 'Invalid Quiz 4',
        type: 'quiz',
        quiz: [{ question: 'What is 2+2?', options: ['4', '   '], correctOptionIndex: 0 }],
      },
    });
    assert(res7.status === 400, 'Quiz question with blank option is rejected with 400');

    // 8. Malformed quiz: out-of-bounds correctOptionIndex
    const res8 = await makeRequest(baseUrl, `/api/v1/admin/modules/${testModule._id}/lectures`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenAdmin}`, 'Content-Type': 'application/json' },
      body: {
        title: 'Invalid Quiz 5',
        type: 'quiz',
        quiz: [{ question: 'What is 2+2?', options: ['3', '4'], correctOptionIndex: 5 }],
      },
    });
    assert(res8.status === 400, 'Quiz question with out-of-bounds correctOptionIndex is rejected with 400');

    // 9. Valid Admin quiz creation
    const validQuizQuestions = [
      {
        question: 'What port does HTTPS use by default?',
        options: ['80', '443', '8080', '22'],
        correctOptionIndex: 1,
      },
      {
        question: 'Which tool is used for network port scanning?',
        options: ['Wireshark', 'Nmap', 'Metasploit', 'John the Ripper'],
        correctOptionIndex: 1,
      },
    ];

    const res9 = await makeRequest(baseUrl, `/api/v1/admin/modules/${testModule._id}/lectures`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenAdmin}`, 'Content-Type': 'application/json' },
      body: {
        title: 'Module 1 Final Quiz Assessment',
        type: 'quiz',
        description: 'Test your understanding of networking fundamentals',
        preview: false,
        published: true,
        quiz: validQuizQuestions,
      },
    });
    assert(res9.status === 201, 'Admin can create quiz lesson with 201 Created');
    assert(res9.data.data && res9.data.data.type === 'quiz', 'Created lesson has type="quiz"');
    assert(res9.data.data.quiz && res9.data.data.quiz.length === 2, 'Created quiz has 2 questions');
    assert(res9.data.data.quiz[0].correctOptionIndex === 1, 'Question 1 correctOptionIndex is saved correctly');
    assert(res9.data.data.quiz[1].correctOptionIndex === 1, 'Question 2 correctOptionIndex is saved correctly');

    testQuizLesson = res9.data.data;
    createdLessonIds.push(testQuizLesson._id);

    // =========================================================================
    // SECTION 3: ADMIN QUIZ UPDATE & QUESTION EDITING
    // =========================================================================
    console.log('\n[SUITE 3] Admin Quiz Update, Question Addition & Removal');

    // 10. Admin updates quiz questions (add 3rd question and change question 1 answer)
    const updatedQuizQuestions = [
      {
        question: 'What port does HTTPS use by default? (Updated)',
        options: ['80', '443', '8443'],
        correctOptionIndex: 1,
      },
      {
        question: 'Which tool is used for network port scanning?',
        options: ['Wireshark', 'Nmap', 'Metasploit', 'Burp Suite'],
        correctOptionIndex: 1,
      },
      {
        question: 'What protocol does DNS primarily use on port 53?',
        options: ['UDP', 'ICMP', 'IGMP', 'BGP'],
        correctOptionIndex: 0,
      },
    ];

    const res10 = await makeRequest(baseUrl, `/api/v1/admin/lectures/${testQuizLesson._id}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${tokenAdmin}`, 'Content-Type': 'application/json' },
      body: {
        title: 'Module 1 Comprehensive Quiz',
        quiz: updatedQuizQuestions,
      },
    });
    assert(res10.status === 200, 'Admin can update quiz lesson via PUT /admin/lectures/:id');
    assert(res10.data.data.quiz.length === 3, 'Updated quiz contains 3 questions');
    assert(res10.data.data.quiz[2].question.includes('DNS'), 'Added Question 3 persisted successfully');
    assert(res10.data.data.quiz[2].correctOptionIndex === 0, 'Question 3 correctOptionIndex is 0');

    // 11. Admin fetch single lecture with answers (Admin GET /admin/lectures/:id)
    const res11 = await makeRequest(baseUrl, `/api/v1/admin/lectures/${testQuizLesson._id}`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${tokenAdmin}` },
    });
    assert(res11.status === 200, 'Admin GET /admin/lectures/:id returns 200');
    assert(
      res11.data.data.quiz[0].correctOptionIndex !== undefined,
      'Admin view includes correctOptionIndex for quiz management'
    );

    // 12. Super Admin can also update quiz
    const res12 = await makeRequest(baseUrl, `/api/v1/admin/lectures/${testQuizLesson._id}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${tokenSuperAdmin}`, 'Content-Type': 'application/json' },
      body: {
        description: 'Super Admin updated description',
      },
    });
    assert(res12.status === 200, 'Super Admin can update quiz lesson');

    // =========================================================================
    // SECTION 4: STUDENT SECURITY & SANITIZATION (ZERO LEAKAGE)
    // =========================================================================
    console.log('\n[SUITE 4] Student Quiz Security & Sanitization');

    // 13. Student accesses quiz lecture -> MUST NOT CONTAIN correctOptionIndex
    const res13 = await makeRequest(baseUrl, `/api/v1/lectures/${testQuizLesson._id}`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${tokenStudent}` },
    });
    assert(res13.status === 200, 'Enrolled student can view quiz lecture with 200 OK');
    const studentQuiz = res13.data.data.quiz;
    assert(Array.isArray(studentQuiz) && studentQuiz.length === 3, 'Student receives quiz questions array');

    let leakageFound = false;
    for (const q of studentQuiz) {
      if (q.correctOptionIndex !== undefined || 'correctOptionIndex' in q) {
        leakageFound = true;
      }
    }
    assert(!leakageFound, 'CRITICAL: correctOptionIndex is completely omitted from student response');

    // 14. Student takes quiz and scores correctly server-side
    const correctAnswers = [
      { questionId: studentQuiz[0]._id, selectedOptionIndex: 1 },
      { questionId: studentQuiz[1]._id, selectedOptionIndex: 1 },
      { questionId: studentQuiz[2]._id, selectedOptionIndex: 0 },
    ];

    const res14 = await makeRequest(baseUrl, `/api/v1/student/lessons/${testQuizLesson._id}/quiz-submit`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenStudent}`, 'Content-Type': 'application/json' },
      body: { answers: correctAnswers },
    });
    assert(res14.status === 200, 'Student quiz submit returns 200');
    assert(res14.data.data && res14.data.data.score === 3, 'Quiz scored 3/3 correctly');
    assert(res14.data.data.percentage === 100, 'Quiz percentage scored 100%');
    assert(res14.data.data.passed === true, 'Quiz passed flag is true');
    if (res14.data.data.attemptId) {
      createdQuizAttemptIds.push(res14.data.data.attemptId);
    }

    // =========================================================================
    // SECTION 5: CATEGORY RBAC AUTHORIZATION
    // =========================================================================
    console.log('\n[SUITE 5] Category RBAC Authorization');

    // 15. Unauthenticated request to GET /admin/categories
    const res15 = await makeRequest(baseUrl, '/api/v1/admin/categories');
    assert(res15.status === 401, 'Unauthenticated request to GET /admin/categories returns 401');

    // 16. Student request to GET /admin/categories
    const res16 = await makeRequest(baseUrl, '/api/v1/admin/categories', {
      headers: { Authorization: `Bearer ${tokenStudent}` },
    });
    assert(res16.status === 403, 'Student request to GET /admin/categories returns 403');

    // 17. Instructor request to GET /admin/categories
    const res17 = await makeRequest(baseUrl, '/api/v1/admin/categories', {
      headers: { Authorization: `Bearer ${tokenInstructor}` },
    });
    assert(res17.status === 403, 'Instructor request to GET /admin/categories returns 403');

    // 18. Admin request to GET /admin/categories
    const res18 = await makeRequest(baseUrl, '/api/v1/admin/categories', {
      headers: { Authorization: `Bearer ${tokenAdmin}` },
    });
    assert(res18.status === 200, 'Admin request to GET /admin/categories returns 200');

    // 19. Super Admin request to GET /admin/categories
    const res19 = await makeRequest(baseUrl, '/api/v1/admin/categories', {
      headers: { Authorization: `Bearer ${tokenSuperAdmin}` },
    });
    assert(res19.status === 200, 'Super Admin request to GET /admin/categories returns 200');

    // =========================================================================
    // SECTION 6: CATEGORY CRUD & VALIDATION
    // =========================================================================
    console.log('\n[SUITE 6] Category CRUD Operations & Validation');

    // 20. Empty name validation
    const res20 = await makeRequest(baseUrl, '/api/v1/admin/categories', {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenAdmin}`, 'Content-Type': 'application/json' },
      body: { name: '   ', description: 'Invalid' },
    });
    assert(res20.status === 400, 'Empty category name rejected with 400');

    // 21. Create unused category
    const unusedCatName = `DevSecOps Testing ${timestamp}`;
    const res21 = await makeRequest(baseUrl, '/api/v1/admin/categories', {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenAdmin}`, 'Content-Type': 'application/json' },
      body: {
        name: unusedCatName,
        description: 'Automated CI/CD security pipeline engineering',
        isActive: true,
      },
    });
    assert(res21.status === 201, 'Admin can create category with 201 Created');
    assert(res21.data.data.name === unusedCatName, 'Created category has exact name');
    assert(res21.data.data.slug.includes('devsecops'), 'Auto-generated slug contains slugified name');
    assert(res21.data.data.courseCount === 0, 'Unused category has courseCount = 0');
    testCategoryUnused = res21.data.data;
    createdCategoryIds.push(testCategoryUnused._id);

    // 22. Duplicate category name rejection
    const res22 = await makeRequest(baseUrl, '/api/v1/admin/categories', {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenAdmin}`, 'Content-Type': 'application/json' },
      body: { name: unusedCatName.toLowerCase() },
    });
    assert(res22.status === 400, 'Duplicate category name rejected with 400');

    // 23. Create category that matches existing testCourse category
    const usedCatName = `Category Used ${timestamp}`;
    const res23 = await makeRequest(baseUrl, '/api/v1/admin/categories', {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenAdmin}`, 'Content-Type': 'application/json' },
      body: {
        name: usedCatName,
        description: 'Category actively assigned to a test course',
        isActive: true,
      },
    });
    assert(res23.status === 201, 'Admin creates course-referenced category');
    assert(res23.data.data.courseCount >= 1, 'Assigned category dynamically reflects courseCount >= 1');
    testCategoryUsed = res23.data.data;
    createdCategoryIds.push(testCategoryUsed._id);

    // 24. List categories with search
    const res24 = await makeRequest(baseUrl, `/api/v1/admin/categories?search=${encodeURIComponent(unusedCatName)}`, {
      headers: { Authorization: `Bearer ${tokenAdmin}` },
    });
    assert(res24.status === 200, 'GET /admin/categories?search=... returns 200');
    assert(
      res24.data.data.some((c) => c._id === testCategoryUnused._id),
      'Search finds newly created category'
    );

    // 25. Update category
    const updatedDesc = 'Updated description for DevSecOps';
    const res25 = await makeRequest(baseUrl, `/api/v1/admin/categories/${testCategoryUnused._id}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${tokenAdmin}`, 'Content-Type': 'application/json' },
      body: {
        description: updatedDesc,
        isActive: false,
      },
    });
    assert(res25.status === 200, 'PUT /admin/categories/:id returns 200');
    assert(res25.data.data.description === updatedDesc, 'Category description updated');
    assert(res25.data.data.isActive === false, 'Category isActive updated to false');

    // 26. Malformed category ID rejection
    const res26 = await makeRequest(baseUrl, '/api/v1/admin/categories/invalid-id-format', {
      method: 'GET',
      headers: { Authorization: `Bearer ${tokenAdmin}` },
    });
    assert(res26.status === 400, 'Malformed category ID returns 400');

    // =========================================================================
    // SECTION 7: CATEGORY DELETION SAFETY (CRITICAL)
    // =========================================================================
    console.log('\n[SUITE 7] Category Deletion Safety Verification');

    // 27. Attempt to delete category that IS REFERENCED BY COURSES
    const res27 = await makeRequest(baseUrl, `/api/v1/admin/categories/${testCategoryUsed._id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${tokenAdmin}` },
    });
    assert(res27.status === 400, 'CRITICAL: Deleting course-referenced category is BLOCKED with 400');
    assert(
      res27.data.message && res27.data.message.includes('Category cannot be deleted while courses are using it'),
      'Returns exact error message: "Category cannot be deleted while courses are using it."'
    );

    // Verify category was NOT deleted from MongoDB
    const checkCat = await Category.findById(testCategoryUsed._id);
    assert(checkCat !== null, 'Course-referenced category remains safe in database');

    // 28. Delete unused category (0 courses assigned)
    const res28 = await makeRequest(baseUrl, `/api/v1/admin/categories/${testCategoryUnused._id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${tokenAdmin}` },
    });
    assert(res28.status === 200, 'Deleting unused category succeeds with 200');

    const checkDeleted = await Category.findById(testCategoryUnused._id);
    assert(checkDeleted === null, 'Unused category is properly removed from database');

    // =========================================================================
    // SECTION 8: PUBLIC CATEGORIES ENDPOINT
    // =========================================================================
    console.log('\n[SUITE 8] Public Categories Endpoint');

    // 29. Public GET /api/v1/categories without auth
    const res29 = await makeRequest(baseUrl, '/api/v1/categories');
    assert(res29.status === 200, 'Public GET /api/v1/categories returns 200 without authentication');
    assert(Array.isArray(res29.data.data), 'Public endpoint returns categories array');

    console.log(`\n========================================`);
    console.log(`PHASE 6.6 VERIFICATION COMPLETE: ${passCount} / ${testCount} TESTS PASSED`);
    console.log(`========================================`);

  } finally {
    // Teardown fixture data
    console.log('\n[Cleanup] Cleaning up test fixtures...');
    if (createdQuizAttemptIds.length > 0) {
      await QuizAttempt.deleteMany({ _id: { $in: createdQuizAttemptIds } });
    }
    if (createdEnrollmentIds.length > 0) {
      await Enrollment.deleteMany({ _id: { $in: createdEnrollmentIds } });
    }
    if (createdLessonIds.length > 0) {
      await Lesson.deleteMany({ _id: { $in: createdLessonIds } });
    }
    if (createdModuleIds.length > 0) {
      await Module.deleteMany({ _id: { $in: createdModuleIds } });
    }
    if (createdCourseIds.length > 0) {
      await Course.deleteMany({ _id: { $in: createdCourseIds } });
    }
    if (createdCategoryIds.length > 0) {
      await Category.deleteMany({ _id: { $in: createdCategoryIds } });
    }
    if (createdUserIds.length > 0) {
      await User.deleteMany({ _id: { $in: createdUserIds } });
    }
    if (server) {
      server.close();
    }
    console.log('[Cleanup] Completed.');
  }
}

runVerification()
  .then(() => {
    process.exit(0);
  })
  .catch((err) => {
    console.error('Phase 6.6 verification script encountered an error:', err);
    process.exit(1);
  });
