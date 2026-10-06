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
const Enrollment = require('../models/Enrollment');

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

async function runVerification() {
  console.log('--- STARTING PHASE 6.2 ADMIN MANUAL STUDENT ENROLLMENT VERIFICATION ---');
  await connectDB();

  let server;
  let baseUrl;

  let adminUser, superAdminUser, studentUser, studentUser2, instructorUser;
  let tokenAdmin, tokenSuperAdmin, tokenStudent, tokenInstructor;
  let testCourse1, testCourse2;
  const createdEnrollmentIds = [];
  const createdCourseIds = [];
  const createdUserIds = [];

  try {
    server = http.createServer(app);
    await new Promise((resolve) => server.listen(0, resolve));
    const port = server.address().port;
    baseUrl = `http://127.0.0.1:${port}`;
    console.log(`Test server running at ${baseUrl}`);

    const jwtSecret = process.env.JWT_SECRET || 'test_jwt_secret_netcradus_academia_super_secure';

    // 1. Create or fetch test users
    adminUser = await User.findOneAndUpdate(
      { email: 'admin_manual_enroll_test@netcradus.com' },
      {
        fullName: 'Admin Enroll Tester',
        email: 'admin_manual_enroll_test@netcradus.com',
        password: 'Password123!',
        role: 'admin',
        status: 'active',
      },
      { upsert: true, new: true }
    );
    createdUserIds.push(adminUser._id);

    superAdminUser = await User.findOneAndUpdate(
      { email: 'superadmin_manual_enroll_test@netcradus.com' },
      {
        fullName: 'SuperAdmin Enroll Tester',
        email: 'superadmin_manual_enroll_test@netcradus.com',
        password: 'Password123!',
        role: 'super_admin',
        status: 'active',
      },
      { upsert: true, new: true }
    );
    createdUserIds.push(superAdminUser._id);

    studentUser = await User.findOneAndUpdate(
      { email: 'student_manual_enroll_1@netcradus.com' },
      {
        fullName: 'Student Enroll Tester 1',
        email: 'student_manual_enroll_1@netcradus.com',
        password: 'Password123!',
        role: 'student',
        status: 'active',
      },
      { upsert: true, new: true }
    );
    createdUserIds.push(studentUser._id);

    studentUser2 = await User.findOneAndUpdate(
      { email: 'student_manual_enroll_2@netcradus.com' },
      {
        fullName: 'Student Enroll Tester 2',
        email: 'student_manual_enroll_2@netcradus.com',
        password: 'Password123!',
        role: 'student',
        status: 'active',
      },
      { upsert: true, new: true }
    );
    createdUserIds.push(studentUser2._id);

    instructorUser = await User.findOneAndUpdate(
      { email: 'instructor_manual_enroll_test@netcradus.com' },
      {
        fullName: 'Instructor Enroll Tester',
        email: 'instructor_manual_enroll_test@netcradus.com',
        password: 'Password123!',
        role: 'instructor',
        status: 'active',
      },
      { upsert: true, new: true }
    );
    createdUserIds.push(instructorUser._id);

    // 2. Create test courses
    testCourse1 = await Course.findOneAndUpdate(
      { slug: 'course-manual-enroll-test-1' },
      {
        title: 'Manual Enrollment Target Course 1',
        slug: 'course-manual-enroll-test-1',
        category: 'CYBER SECURITY',
        level: 'Intermediate',
        price: 99900,
        published: true,
      },
      { upsert: true, new: true }
    );
    createdCourseIds.push(testCourse1._id);

    testCourse2 = await Course.findOneAndUpdate(
      { slug: 'course-manual-enroll-test-2' },
      {
        title: 'Manual Enrollment Target Course 2',
        slug: 'course-manual-enroll-test-2',
        category: 'CLOUD',
        level: 'Beginner',
        price: 149900,
        published: true,
      },
      { upsert: true, new: true }
    );
    createdCourseIds.push(testCourse2._id);

    // Clean any prior enrollment test fixtures
    await Enrollment.deleteMany({
      userId: { $in: [studentUser._id, studentUser2._id, adminUser._id, instructorUser._id, superAdminUser._id] },
      courseId: { $in: [testCourse1._id, testCourse2._id] },
    });

    tokenAdmin = jwt.sign({ id: adminUser._id }, jwtSecret, { expiresIn: '1h' });
    tokenSuperAdmin = jwt.sign({ id: superAdminUser._id }, jwtSecret, { expiresIn: '1h' });
    tokenStudent = jwt.sign({ id: studentUser._id }, jwtSecret, { expiresIn: '1h' });
    tokenInstructor = jwt.sign({ id: instructorUser._id }, jwtSecret, { expiresIn: '1h' });

    let testsPassed = 0;
    let totalTests = 0;

    function assertTest(title, condition, extraInfo = '') {
      totalTests++;
      if (condition) {
        testsPassed++;
        console.log(`  ✓ [TEST ${totalTests}] ${title}`);
      } else {
        console.error(`  ✗ [TEST ${totalTests}] FAILED: ${title} ${extraInfo}`);
      }
    }

    // --- TEST SUITE 1: RBAC on POST /api/v1/admin/enrollments ---
    console.log('\n[TEST SUITE 1] RBAC Authorization on Manual Enrollment API');

    const resUnauth = await makeRequest(baseUrl, '/api/v1/admin/enrollments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: { userId: studentUser._id.toString(), courseId: testCourse1._id.toString() },
    });
    assertTest('Unauthenticated request to POST /admin/enrollments returns 401', resUnauth.status === 401);

    const resStudent = await makeRequest(baseUrl, '/api/v1/admin/enrollments', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${tokenStudent}`,
        'Content-Type': 'application/json',
      },
      body: { userId: studentUser._id.toString(), courseId: testCourse1._id.toString() },
    });
    assertTest('Student request to POST /admin/enrollments returns 403', resStudent.status === 403);

    const resInstructor = await makeRequest(baseUrl, '/api/v1/admin/enrollments', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${tokenInstructor}`,
        'Content-Type': 'application/json',
      },
      body: { userId: studentUser._id.toString(), courseId: testCourse1._id.toString() },
    });
    assertTest('Instructor request to POST /admin/enrollments returns 403', resInstructor.status === 403);

    // --- TEST SUITE 2: Validation of Student and Course ---
    console.log('\n[TEST SUITE 2] Validation & Role Enforcement');

    // Reject instructor as student
    const resInstAsStudent = await makeRequest(baseUrl, '/api/v1/admin/enrollments', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${tokenAdmin}`,
        'Content-Type': 'application/json',
      },
      body: { userId: instructorUser._id.toString(), courseId: testCourse1._id.toString() },
    });
    assertTest('Attempting to enroll an instructor account is rejected with 400', resInstAsStudent.status === 400);

    // Reject admin as student
    const resAdminAsStudent = await makeRequest(baseUrl, '/api/v1/admin/enrollments', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${tokenAdmin}`,
        'Content-Type': 'application/json',
      },
      body: { userId: adminUser._id.toString(), courseId: testCourse1._id.toString() },
    });
    assertTest('Attempting to enroll an admin account is rejected with 400', resAdminAsStudent.status === 400);

    // Reject super_admin as student
    const resSuperAdminAsStudent = await makeRequest(baseUrl, '/api/v1/admin/enrollments', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${tokenAdmin}`,
        'Content-Type': 'application/json',
      },
      body: { userId: superAdminUser._id.toString(), courseId: testCourse1._id.toString() },
    });
    assertTest('Attempting to enroll a super_admin account is rejected with 400', resSuperAdminAsStudent.status === 400);

    // Reject nonexistent student
    const fakeUserId = new mongoose.Types.ObjectId().toString();
    const resNonexistentUser = await makeRequest(baseUrl, '/api/v1/admin/enrollments', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${tokenAdmin}`,
        'Content-Type': 'application/json',
      },
      body: { userId: fakeUserId, courseId: testCourse1._id.toString() },
    });
    assertTest('Nonexistent student user is rejected with 400', resNonexistentUser.status === 400);

    // Reject nonexistent course
    const fakeCourseId = new mongoose.Types.ObjectId().toString();
    const resNonexistentCourse = await makeRequest(baseUrl, '/api/v1/admin/enrollments', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${tokenAdmin}`,
        'Content-Type': 'application/json',
      },
      body: { userId: studentUser._id.toString(), courseId: fakeCourseId },
    });
    assertTest('Nonexistent course is rejected with 400', resNonexistentCourse.status === 400);

    // Reject malformed student ID
    const resMalformedStudent = await makeRequest(baseUrl, '/api/v1/admin/enrollments', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${tokenAdmin}`,
        'Content-Type': 'application/json',
      },
      body: { userId: 'not-a-valid-id', courseId: testCourse1._id.toString() },
    });
    assertTest('Malformed student ID format is rejected with 400', resMalformedStudent.status === 400);

    // Reject malformed course ID
    const resMalformedCourse = await makeRequest(baseUrl, '/api/v1/admin/enrollments', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${tokenAdmin}`,
        'Content-Type': 'application/json',
      },
      body: { userId: studentUser._id.toString(), courseId: 'not-a-valid-course' },
    });
    assertTest('Malformed course ID format is rejected with 400', resMalformedCourse.status === 400);

    // --- TEST SUITE 3: Successful Creation & Data Integrity ---
    console.log('\n[TEST SUITE 3] Successful Enrollment Creation & Data Integrity');

    const resEnrollSuccess = await makeRequest(baseUrl, '/api/v1/admin/enrollments', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${tokenAdmin}`,
        'Content-Type': 'application/json',
      },
      body: {
        userId: studentUser._id.toString(),
        courseId: testCourse1._id.toString(),
        // ATTEMPT CLIENT OVERRIDES (SHOULD BE STRIPPED / IGNORED)
        enrollmentType: 'paid',
        pricePaid: 99900,
        status: 'completed',
      },
    });

    assertTest('Admin can manually enroll student with 201 Created', resEnrollSuccess.status === 201 && resEnrollSuccess.data.success === true);
    const createdEnrollment = resEnrollSuccess.data.data;
    if (createdEnrollment) {
      createdEnrollmentIds.push(createdEnrollment._id);
    }

    assertTest('Server enforces enrollmentType === "manual" (client override ignored)', createdEnrollment && createdEnrollment.enrollmentType === 'manual');
    assertTest('Server enforces pricePaid === 0 (client override ignored)', createdEnrollment && createdEnrollment.pricePaid === 0);
    assertTest('Server enforces status === "active" (client override ignored)', createdEnrollment && createdEnrollment.status === 'active');
    assertTest('Populated user details returned', createdEnrollment && createdEnrollment.userId && createdEnrollment.userId.email === studentUser.email);
    assertTest('Populated course details returned', createdEnrollment && createdEnrollment.courseId && createdEnrollment.courseId.slug === testCourse1.slug);

    // Super Admin can also create manual enrollment (e.g. for studentUser2 on course 2)
    const resSuperAdminEnroll = await makeRequest(baseUrl, '/api/v1/admin/enrollments', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${tokenSuperAdmin}`,
        'Content-Type': 'application/json',
      },
      body: {
        userId: studentUser2._id.toString(),
        courseId: testCourse2._id.toString(),
      },
    });
    assertTest('Super Admin can manually enroll student with 201 Created', resSuperAdminEnroll.status === 201);
    if (resSuperAdminEnroll.data?.data?._id) {
      createdEnrollmentIds.push(resSuperAdminEnroll.data.data._id);
    }

    // --- TEST SUITE 4: Duplicate Enrollment Protection ---
    console.log('\n[TEST SUITE 4] Duplicate Enrollment Protection');

    // Attempt to enroll studentUser in testCourse1 AGAIN (currently active)
    const resDuplicateActive = await makeRequest(baseUrl, '/api/v1/admin/enrollments', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${tokenAdmin}`,
        'Content-Type': 'application/json',
      },
      body: {
        userId: studentUser._id.toString(),
        courseId: testCourse1._id.toString(),
      },
    });
    assertTest('Duplicate enrollment for active course is rejected with 400', resDuplicateActive.status === 400);

    // Mark enrollment as completed, then verify duplicate rejection
    await Enrollment.findByIdAndUpdate(createdEnrollment._id, { status: 'completed' });
    const resDuplicateCompleted = await makeRequest(baseUrl, '/api/v1/admin/enrollments', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${tokenAdmin}`,
        'Content-Type': 'application/json',
      },
      body: {
        userId: studentUser._id.toString(),
        courseId: testCourse1._id.toString(),
      },
    });
    assertTest('Duplicate enrollment for completed course is rejected with 400', resDuplicateCompleted.status === 400);

    // Verify document count did NOT increase
    const totalEnrollmentsForStudent = await Enrollment.countDocuments({
      userId: studentUser._id,
      courseId: testCourse1._id,
    });
    assertTest('Exactly 1 enrollment document exists in database (no duplicates created)', totalEnrollmentsForStudent === 1);

    console.log(`\n========================================`);
    console.log(`PHASE 6.2 VERIFICATION COMPLETE: ${testsPassed} / ${totalTests} TESTS PASSED`);
    console.log(`========================================\n`);

    if (testsPassed !== totalTests) {
      process.exitCode = 1;
    }
  } catch (err) {
    console.error('Phase 6.2 verification encountered error:', err);
    process.exitCode = 1;
  } finally {
    // Clean up test fixtures
    try {
      if (createdEnrollmentIds.length > 0) {
        await Enrollment.deleteMany({ _id: { $in: createdEnrollmentIds } });
      }
      if (createdCourseIds.length > 0) {
        await Course.deleteMany({ _id: { $in: createdCourseIds } });
      }
      if (createdUserIds.length > 0) {
        await User.deleteMany({ _id: { $in: createdUserIds } });
      }
    } catch (cleanupErr) {
      console.warn('Test cleanup warning:', cleanupErr.message);
    }

    if (server) {
      server.close();
    }
    await mongoose.disconnect();
  }
}

runVerification();
