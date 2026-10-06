const dotenv = require('dotenv');
dotenv.config();

const http = require('http');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const app = require('../app');
const User = require('../models/User');
const Course = require('../models/Course');
const Module = require('../models/Module');
const Lesson = require('../models/Lesson');
const Assignment = require('../models/Assignment');
const Submission = require('../models/Submission');
const Enrollment = require('../models/Enrollment');
const { sanitizeLessonForStudent } = require('../utils/sanitizeLesson');

// Helper to make HTTP requests against the test server
function makeRequest(baseUrl, path, options = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, baseUrl);
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

async function runVerification() {
  console.log('--- STARTING PHASE 4 INSTRUCTOR BACKEND & AUTHORIZATION VERIFICATION ---');
  await connectDB();

  let server;
  let baseUrl;

  let instructorA, instructorB, studentUser, adminUser;
  let tokenA, tokenB, tokenStudent, tokenAdmin;

  let courseA, moduleA, lectureA, assignmentA, submissionA;
  let courseB, moduleB, lectureB, assignmentB, submissionB;

  try {
    // 0. Start Express server on ephemeral port
    server = app.listen(0);
    const address = server.address();
    baseUrl = `http://localhost:${address.port}`;
    console.log(`✓ Test server running at ${baseUrl}`);

    // 1. Setup temporary test users
    const timestamp = Date.now();
    instructorA = await User.create({
      fullName: `Instructor Alpha ${timestamp}`,
      email: `inst_alpha_${timestamp}@example.com`,
      password: 'Password123!',
      role: 'instructor',
    });

    instructorB = await User.create({
      fullName: `Instructor Beta ${timestamp}`,
      email: `inst_beta_${timestamp}@example.com`,
      password: 'Password123!',
      role: 'instructor',
    });

    studentUser = await User.create({
      fullName: `Student User ${timestamp}`,
      email: `stud_${timestamp}@example.com`,
      password: 'Password123!',
      role: 'student',
    });

    adminUser = await User.create({
      fullName: `Admin User ${timestamp}`,
      email: `admin_${timestamp}@example.com`,
      password: 'Password123!',
      role: 'admin',
    });

    tokenA = jwt.sign({ id: instructorA._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    tokenB = jwt.sign({ id: instructorB._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    tokenStudent = jwt.sign({ id: studentUser._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    tokenAdmin = jwt.sign({ id: adminUser._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    // 2. Setup Course A (owned by Instructor A)
    courseA = await Course.create({
      title: `Course Alpha ${timestamp}`,
      slug: `course-alpha-${timestamp}`,
      category: 'Cyber Security',
      level: 'Intermediate',
      price: 25000,
      instructor: instructorA._id,
      published: true,
    });

    moduleA = await Module.create({
      courseId: courseA._id,
      title: 'Alpha Module 1',
      order: 1,
      published: true,
    });

    lectureA = await Lesson.create({
      courseId: courseA._id,
      moduleId: moduleA._id,
      title: 'Alpha Lesson 1 - Quiz',
      slug: `alpha-lesson-${timestamp}`,
      type: 'quiz',
      order: 1,
      published: true,
      quiz: [
        {
          question: 'What is port 443 typically used for?',
          options: ['HTTP', 'HTTPS', 'SSH', 'DNS'],
          correctOptionIndex: 1,
        },
      ],
    });

    assignmentA = await Assignment.create({
      courseId: courseA._id,
      title: 'Alpha Lab Assignment',
      maxScore: 100,
      status: 'published',
    });

    submissionA = await Submission.create({
      assignmentId: assignmentA._id,
      courseId: courseA._id,
      userId: studentUser._id,
      repoUrl: 'https://github.com/student/alpha-repo',
      submissionText: 'Alpha lab submission report',
      status: 'submitted',
    });

    // 3. Setup Course B (owned by Instructor B)
    courseB = await Course.create({
      title: `Course Beta ${timestamp}`,
      slug: `course-beta-${timestamp}`,
      category: 'Cloud',
      level: 'Advanced',
      price: 35000,
      instructor: instructorB._id,
      published: true,
    });

    moduleB = await Module.create({
      courseId: courseB._id,
      title: 'Beta Module 1',
      order: 1,
      published: true,
    });

    lectureB = await Lesson.create({
      courseId: courseB._id,
      moduleId: moduleB._id,
      title: 'Beta Lesson 1',
      slug: `beta-lesson-${timestamp}`,
      type: 'quiz',
      order: 1,
      published: true,
      quiz: [
        {
          question: 'What is AWS S3 used for?',
          options: ['Block storage', 'Object storage', 'Queue', 'Relational database'],
          correctOptionIndex: 1,
        },
      ],
    });

    assignmentB = await Assignment.create({
      courseId: courseB._id,
      title: 'Beta Cloud Deployment Assignment',
      maxScore: 50,
      status: 'published',
    });

    submissionB = await Submission.create({
      assignmentId: assignmentB._id,
      courseId: courseB._id,
      userId: studentUser._id,
      repoUrl: 'https://github.com/student/beta-repo',
      submissionText: 'Beta cloud submission report',
      status: 'submitted',
    });

    console.log('✓ Multi-instructor test fixture established');

    // TEST 1: Unauthenticated user -> rejected with 401
    console.log('\n[TEST 1] Verifying unauthenticated request is rejected...');
    const res1 = await makeRequest(baseUrl, '/api/v1/instructor/dashboard');
    if (res1.status !== 401) {
      throw new Error(`FAIL: Expected 401 for unauthenticated request, got ${res1.status}`);
    }
    console.log('✓ PASS: Unauthenticated user rejected with 401.');

    // TEST 2: Student -> rejected with 403
    console.log('\n[TEST 2] Verifying student access is forbidden...');
    const res2 = await makeRequest(baseUrl, '/api/v1/instructor/dashboard', {
      headers: { Authorization: `Bearer ${tokenStudent}` },
    });
    if (res2.status !== 403) {
      throw new Error(`FAIL: Expected 403 for student accessing instructor route, got ${res2.status}`);
    }
    console.log('✓ PASS: Student rejected with 403.');

    // TEST 3: Instructor A -> can access Instructor A course
    console.log('\n[TEST 3] Verifying Instructor A can access their own course...');
    const res3 = await makeRequest(baseUrl, `/api/v1/instructor/courses/${courseA._id}`, {
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    if (res3.status !== 200 || !res3.data.success || res3.data.data._id !== courseA._id.toString()) {
      throw new Error(`FAIL: Instructor A could not access Course A: ${JSON.stringify(res3.data)}`);
    }
    console.log('✓ PASS: Instructor A can access Course A (200 OK).');

    // TEST 4: Instructor A -> cannot access Instructor B course
    console.log('\n[TEST 4] Verifying Instructor A CANNOT access Course B (cross-tenant read)...');
    const res4 = await makeRequest(baseUrl, `/api/v1/instructor/courses/${courseB._id}`, {
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    if (res4.status !== 403) {
      throw new Error(`FAIL: Expected 403 for cross-instructor course access, got ${res4.status}`);
    }
    console.log('✓ PASS: Instructor A blocked from accessing Course B with 403 Forbidden.');

    // TEST 5: Instructor A -> cannot modify Instructor B course
    console.log('\n[TEST 5] Verifying Instructor A CANNOT modify Course B (cross-tenant write)...');
    const res5 = await makeRequest(baseUrl, `/api/v1/instructor/courses/${courseB._id}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${tokenA}`,
        'Content-Type': 'application/json',
      },
      body: { title: 'Hacked by Instructor A' },
    });
    if (res5.status !== 403) {
      throw new Error(`FAIL: Expected 403 for cross-instructor course update, got ${res5.status}`);
    }
    // Verify in DB that Course B title was NOT altered
    const freshB = await Course.findById(courseB._id);
    if (freshB.title === 'Hacked by Instructor A') {
      throw new Error('FAIL: Course B was modified despite authorization failure!');
    }
    console.log('✓ PASS: Instructor A blocked from modifying Course B with 403 Forbidden.');

    // TEST 6: Instructor A -> cannot modify Instructor B curriculum
    console.log('\n[TEST 6] Verifying Instructor A CANNOT modify Course B curriculum...');
    const res6 = await makeRequest(baseUrl, `/api/v1/instructor/modules/${moduleB._id}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${tokenA}`,
        'Content-Type': 'application/json',
      },
      body: { title: 'Tampered Module' },
    });
    if (res6.status !== 403) {
      throw new Error(`FAIL: Expected 403 for cross-instructor module update, got ${res6.status}`);
    }

    const res6Lecture = await makeRequest(baseUrl, `/api/v1/instructor/lectures/${lectureB._id}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${tokenA}`,
        'Content-Type': 'application/json',
      },
      body: { title: 'Tampered Lecture' },
    });
    if (res6Lecture.status !== 403) {
      throw new Error(`FAIL: Expected 403 for cross-instructor lecture update, got ${res6Lecture.status}`);
    }
    console.log('✓ PASS: Instructor A blocked from modifying Course B modules and lectures (403).');

    // TEST 7: Instructor A -> cannot grade Instructor B submissions
    console.log('\n[TEST 7] Verifying Instructor A CANNOT grade Course B submission...');
    const res7 = await makeRequest(baseUrl, `/api/v1/instructor/submissions/${submissionB._id}/grade`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${tokenA}`,
        'Content-Type': 'application/json',
      },
      body: { score: 10, status: 'graded', feedback: 'Illegitimate grading' },
    });
    if (res7.status !== 403) {
      throw new Error(`FAIL: Expected 403 for cross-instructor grading, got ${res7.status}`);
    }

    // But Instructor B CAN grade their own submission
    const res7Valid = await makeRequest(baseUrl, `/api/v1/instructor/submissions/${submissionB._id}/grade`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${tokenB}`,
        'Content-Type': 'application/json',
      },
      body: { score: 45, status: 'graded', feedback: 'Great job!' },
    });
    if (res7Valid.status !== 200 || !res7Valid.data.success) {
      throw new Error(`FAIL: Instructor B failed to grade own submission: ${JSON.stringify(res7Valid.data)}`);
    }
    console.log('✓ PASS: Cross-instructor grading blocked (403), and legitimate instructor grading succeeded (200).');

    // TEST 8: Instructor dashboard only reports Instructor A resources
    console.log('\n[TEST 8] Verifying Instructor A dashboard scoping...');
    const res8 = await makeRequest(baseUrl, '/api/v1/instructor/dashboard', {
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    if (res8.status !== 200 || !res8.data.success) {
      throw new Error(`FAIL: Could not load Instructor A dashboard: ${JSON.stringify(res8.data)}`);
    }
    const statsA = res8.data.data.stats;
    if (statsA.totalCourses !== 1) {
      throw new Error(`FAIL: Expected totalCourses = 1 for Instructor A, got ${statsA.totalCourses}`);
    }
    if (statsA.totalAssignments !== 1) {
      throw new Error(`FAIL: Expected totalAssignments = 1 for Instructor A, got ${statsA.totalAssignments}`);
    }
    if (statsA.pendingSubmissions !== 1) {
      throw new Error(`FAIL: Expected pendingSubmissions = 1 for Instructor A, got ${statsA.pendingSubmissions}`);
    }
    console.log(`✓ PASS: Instructor A dashboard cleanly reports only their 1 course, 1 assignment, 1 pending submission.`);

    // TEST 9: Admin functionality still works
    console.log('\n[TEST 9] Verifying Admin panel endpoints remain fully functional...');
    const res9 = await makeRequest(baseUrl, '/api/v1/admin/dashboard/stats', {
      headers: { Authorization: `Bearer ${tokenAdmin}` },
    });
    if (res9.status !== 200 || !res9.data.success) {
      throw new Error(`FAIL: Admin dashboard failed: ${JSON.stringify(res9.data)}`);
    }
    console.log('✓ PASS: Admin dashboard stats returned 200 OK.');

    // TEST 10: Quiz management allows correctOptionIndex for instructor, but sanitizes for student
    console.log('\n[TEST 10] Verifying instructor quiz view includes answers while student view sanitizes them...');
    // Instructor fetch:
    const res10Inst = await makeRequest(baseUrl, `/api/v1/instructor/lectures/${lectureA._id}`, {
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    if (res10Inst.status !== 200 || !res10Inst.data.success) {
      throw new Error(`FAIL: Instructor could not fetch lecture: ${JSON.stringify(res10Inst.data)}`);
    }
    const instQuiz = res10Inst.data.data.quiz;
    if (!instQuiz || instQuiz[0].correctOptionIndex === undefined) {
      throw new Error('FAIL: Instructor lecture response did not include correctOptionIndex for quiz editing');
    }

    // Student fetch (simulate student fetching sanitized lecture):
    const studentSanitized = sanitizeLessonForStudent(res10Inst.data.data);
    if (studentSanitized.quiz[0].correctOptionIndex !== undefined) {
      throw new Error('FAIL: Student sanitization leaked correctOptionIndex');
    }
    console.log('✓ PASS: Instructor receives correctOptionIndex (for editing), while student sanitization completely strips it.');

    // TEST 11: Existing student routes still work
    console.log('\n[TEST 11] Verifying public & student endpoints remain intact...');
    const res11Public = await makeRequest(baseUrl, `/api/v1/courses/${courseA.slug}`);
    if (res11Public.status !== 200 || !res11Public.data.success) {
      throw new Error(`FAIL: Public course fetch failed: ${JSON.stringify(res11Public.data)}`);
    }
    console.log('✓ PASS: Public course catalog returned 200 OK.');

    console.log('\n============================================================');
    console.log('ALL 11 TARGETED INSTRUCTOR AUTHORIZATION VERIFICATIONS PASSED');
    console.log('============================================================');
  } finally {
    // Cleanup server
    if (server) {
      await new Promise((res) => server.close(res));
    }

    // Cleanup DB artifacts
    if (submissionA) await Submission.findByIdAndDelete(submissionA._id);
    if (submissionB) await Submission.findByIdAndDelete(submissionB._id);
    if (assignmentA) await Assignment.findByIdAndDelete(assignmentA._id);
    if (assignmentB) await Assignment.findByIdAndDelete(assignmentB._id);
    if (lectureA) await Lesson.findByIdAndDelete(lectureA._id);
    if (lectureB) await Lesson.findByIdAndDelete(lectureB._id);
    if (moduleA) await Module.findByIdAndDelete(moduleA._id);
    if (moduleB) await Module.findByIdAndDelete(moduleB._id);
    if (courseA) await Course.findByIdAndDelete(courseA._id);
    if (courseB) await Course.findByIdAndDelete(courseB._id);
    if (instructorA) await User.findByIdAndDelete(instructorA._id);
    if (instructorB) await User.findByIdAndDelete(instructorB._id);
    if (studentUser) await User.findByIdAndDelete(studentUser._id);
    if (adminUser) await User.findByIdAndDelete(adminUser._id);

    await mongoose.connection.close();
    console.log('✓ All test data cleaned up successfully.');
  }
}

runVerification().catch((err) => {
  console.error('VERIFICATION FAILED:', err);
  process.exit(1);
});
