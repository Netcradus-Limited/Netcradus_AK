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
  console.log('--- STARTING PHASE 6.1 ADMIN INSTRUCTOR MANAGEMENT & COURSE ASSIGNMENT TESTS ---');
  await connectDB();

  let server;
  let baseUrl;

  let adminUser, superAdminUser, instructorActive, instructorDisabled, studentUser;
  let tokenAdmin, tokenSuperAdmin, tokenInstructor, tokenStudent;
  let createdCourseId;

  try {
    server = http.createServer(app);
    await new Promise((resolve) => server.listen(0, resolve));
    const port = server.address().port;
    baseUrl = `http://127.0.0.1:${port}`;
    console.log(`Test server running at ${baseUrl}`);

    const jwtSecret = process.env.JWT_SECRET || 'test_jwt_secret_netcradus_academia_super_secure';

    // 1. Prepare test users
    adminUser = await User.findOneAndUpdate(
      { email: 'test_admin_phase6@netcradus.com' },
      {
        fullName: 'Admin Phase6',
        email: 'test_admin_phase6@netcradus.com',
        password: 'Password123!',
        role: 'admin',
        status: 'active',
      },
      { upsert: true, new: true }
    );

    superAdminUser = await User.findOneAndUpdate(
      { email: 'test_superadmin_phase6@netcradus.com' },
      {
        fullName: 'SuperAdmin Phase6',
        email: 'test_superadmin_phase6@netcradus.com',
        password: 'Password123!',
        role: 'super_admin',
        status: 'active',
      },
      { upsert: true, new: true }
    );

    instructorActive = await User.findOneAndUpdate(
      { email: 'test_inst_active_phase6@netcradus.com' },
      {
        fullName: 'Dr. Active Instructor',
        email: 'test_inst_active_phase6@netcradus.com',
        password: 'Password123!',
        role: 'instructor',
        status: 'active',
      },
      { upsert: true, new: true }
    );

    instructorDisabled = await User.findOneAndUpdate(
      { email: 'test_inst_disabled_phase6@netcradus.com' },
      {
        fullName: 'Disabled Instructor',
        email: 'test_inst_disabled_phase6@netcradus.com',
        password: 'Password123!',
        role: 'instructor',
        status: 'disabled',
      },
      { upsert: true, new: true }
    );

    studentUser = await User.findOneAndUpdate(
      { email: 'test_student_phase6@netcradus.com' },
      {
        fullName: 'Student Phase6',
        email: 'test_student_phase6@netcradus.com',
        password: 'Password123!',
        role: 'student',
        status: 'active',
      },
      { upsert: true, new: true }
    );

    tokenAdmin = jwt.sign({ id: adminUser._id }, jwtSecret, { expiresIn: '1h' });
    tokenSuperAdmin = jwt.sign({ id: superAdminUser._id }, jwtSecret, { expiresIn: '1h' });
    tokenInstructor = jwt.sign({ id: instructorActive._id }, jwtSecret, { expiresIn: '1h' });
    tokenStudent = jwt.sign({ id: studentUser._id }, jwtSecret, { expiresIn: '1h' });

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

    // --- TEST SUITE 1: RBAC on /api/v1/admin/instructors ---
    console.log('\n[TEST SUITE 1] RBAC Authorization on Instructor Management API');

    const resUnauth = await makeRequest(baseUrl, '/api/v1/admin/instructors');
    assertTest('Unauthenticated request to GET /admin/instructors returns 401', resUnauth.status === 401);

    const resStudent = await makeRequest(baseUrl, '/api/v1/admin/instructors', {
      headers: { Authorization: `Bearer ${tokenStudent}` },
    });
    assertTest('Student request to GET /admin/instructors returns 403', resStudent.status === 403);

    const resInst = await makeRequest(baseUrl, '/api/v1/admin/instructors', {
      headers: { Authorization: `Bearer ${tokenInstructor}` },
    });
    assertTest('Instructor request to GET /admin/instructors returns 403', resInst.status === 403);

    const resAdmin = await makeRequest(baseUrl, '/api/v1/admin/instructors', {
      headers: { Authorization: `Bearer ${tokenAdmin}` },
    });
    assertTest('Admin request to GET /admin/instructors returns 200 with list', resAdmin.status === 200 && Array.isArray(resAdmin.data.data));

    const resSuperAdmin = await makeRequest(baseUrl, '/api/v1/admin/instructors', {
      headers: { Authorization: `Bearer ${tokenSuperAdmin}` },
    });
    assertTest('Super Admin request to GET /admin/instructors returns 200', resSuperAdmin.status === 200);

    // --- TEST SUITE 2: Instructor Creation & Privilege Escalation Prevention ---
    console.log('\n[TEST SUITE 2] Instructor Account Creation & Security');

    const testInstEmail = `new_instructor_${Date.now()}@netcradus.com`;
    const resCreate = await makeRequest(baseUrl, '/api/v1/admin/instructors', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${tokenAdmin}`,
        'Content-Type': 'application/json',
      },
      body: {
        fullName: 'Prof. Test Instructor',
        email: testInstEmail,
        password: 'TemporaryPassword123!',
        phone: '+91 9876543210',
        role: 'super_admin', // ATTEMPT PRIVILEGE ESCALATION
      },
    });

    assertTest(
      'Admin can create instructor and response is 201',
      resCreate.status === 201 && resCreate.data.success === true
    );
    assertTest(
      'Forced role="instructor", client privilege escalation attempt ignored',
      resCreate.data.data.role === 'instructor'
    );
    assertTest(
      'Password or password hash is not returned in API response',
      resCreate.data.data.password === undefined
    );

    // Verify duplicate email is rejected
    const resDuplicate = await makeRequest(baseUrl, '/api/v1/admin/instructors', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${tokenAdmin}`,
        'Content-Type': 'application/json',
      },
      body: {
        fullName: 'Duplicate Instructor',
        email: testInstEmail,
        password: 'TemporaryPassword123!',
      },
    });
    assertTest('Duplicate email registration is rejected with 400', resDuplicate.status === 400);

    // Verify short password rejection
    const resShortPass = await makeRequest(baseUrl, '/api/v1/admin/instructors', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${tokenAdmin}`,
        'Content-Type': 'application/json',
      },
      body: {
        fullName: 'Short Pass Instructor',
        email: `short_pass_${Date.now()}@netcradus.com`,
        password: 'short',
      },
    });
    assertTest('Short password (< 8 chars) is rejected with 400', resShortPass.status === 400);

    // --- TEST SUITE 3: Instructor Status Toggle & Isolation ---
    console.log('\n[TEST SUITE 3] Instructor Status Toggle & Cross-Role Isolation');

    const createdInstId = resCreate.data.data._id;
    const resDisable = await makeRequest(baseUrl, `/api/v1/admin/instructors/${createdInstId}/status`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${tokenAdmin}`,
        'Content-Type': 'application/json',
      },
      body: { status: 'disabled' },
    });
    assertTest(
      'Admin can disable instructor account (status -> disabled)',
      resDisable.status === 200 && resDisable.data.data.status === 'disabled'
    );

    const resReactivate = await makeRequest(baseUrl, `/api/v1/admin/instructors/${createdInstId}/status`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${tokenAdmin}`,
        'Content-Type': 'application/json',
      },
      body: { status: 'active' },
    });
    assertTest(
      'Admin can reactivate instructor account (status -> active)',
      resReactivate.status === 200 && resReactivate.data.data.status === 'active'
    );

    // Attempt to change status of a STUDENT through instructor endpoint
    const resTargetStudent = await makeRequest(baseUrl, `/api/v1/admin/instructors/${studentUser._id}/status`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${tokenAdmin}`,
        'Content-Type': 'application/json',
      },
      body: { status: 'disabled' },
    });
    assertTest(
      'Cannot modify student account through instructor status endpoint (returns 404)',
      resTargetStudent.status === 404
    );

    // Attempt to change status of an ADMIN through instructor endpoint
    const resTargetAdmin = await makeRequest(baseUrl, `/api/v1/admin/instructors/${adminUser._id}/status`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${tokenAdmin}`,
        'Content-Type': 'application/json',
      },
      body: { status: 'disabled' },
    });
    assertTest(
      'Cannot modify admin account through instructor status endpoint (returns 404)',
      resTargetAdmin.status === 404
    );

    // --- TEST SUITE 4: Course Creation with Instructor Assignment ---
    console.log('\n[TEST SUITE 4] Course Creation with Instructor Assignment');

    const courseSlugA = `course-phase6-assign-a-${Date.now()}`;
    const resCourseA = await makeRequest(baseUrl, '/api/v1/admin/courses', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${tokenAdmin}`,
        'Content-Type': 'application/json',
      },
      body: {
        title: 'Cloud Security Masterclass',
        slug: courseSlugA,
        category: 'CYBER SECURITY',
        level: 'Intermediate',
        price: 149900,
        instructor: instructorActive._id.toString(),
      },
    });

    assertTest(
      'Course created with valid active instructor returns 201',
      resCourseA.status === 201 && resCourseA.data.success === true
    );
    assertTest(
      'Course returns populated instructor information',
      resCourseA.data.data.instructor && resCourseA.data.data.instructor.email === instructorActive.email
    );
    createdCourseId = resCourseA.data.data._id;

    // Course creation with unassigned instructor (null)
    const courseSlugB = `course-phase6-unassigned-${Date.now()}`;
    const resCourseB = await makeRequest(baseUrl, '/api/v1/admin/courses', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${tokenAdmin}`,
        'Content-Type': 'application/json',
      },
      body: {
        title: 'Unassigned Network Basics',
        slug: courseSlugB,
        category: 'NETWORKING',
        level: 'Beginner',
        price: 99900,
        instructor: null,
      },
    });
    assertTest(
      'Course created without instructor (unassigned) returns 201 with instructor = null',
      resCourseB.status === 201 && resCourseB.data.data.instructor === null
    );

    // Course creation rejected with disabled instructor
    const resCourseDisabled = await makeRequest(baseUrl, '/api/v1/admin/courses', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${tokenAdmin}`,
        'Content-Type': 'application/json',
      },
      body: {
        title: 'Course with Disabled Instructor',
        slug: `course-disabled-inst-${Date.now()}`,
        category: 'CYBER SECURITY',
        level: 'Beginner',
        price: 99900,
        instructor: instructorDisabled._id.toString(),
      },
    });
    assertTest('Course creation with disabled instructor is rejected with 400', resCourseDisabled.status === 400);

    // Course creation rejected with student ID
    const resCourseStudent = await makeRequest(baseUrl, '/api/v1/admin/courses', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${tokenAdmin}`,
        'Content-Type': 'application/json',
      },
      body: {
        title: 'Course with Student Instructor',
        slug: `course-student-inst-${Date.now()}`,
        category: 'CYBER SECURITY',
        level: 'Beginner',
        price: 99900,
        instructor: studentUser._id.toString(),
      },
    });
    assertTest('Course creation with student user ID is rejected with 400', resCourseStudent.status === 400);

    // Course creation rejected with admin ID
    const resCourseAdmin = await makeRequest(baseUrl, '/api/v1/admin/courses', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${tokenAdmin}`,
        'Content-Type': 'application/json',
      },
      body: {
        title: 'Course with Admin Instructor',
        slug: `course-admin-inst-${Date.now()}`,
        category: 'CYBER SECURITY',
        level: 'Beginner',
        price: 99900,
        instructor: adminUser._id.toString(),
      },
    });
    assertTest('Course creation with admin user ID is rejected with 400', resCourseAdmin.status === 400);

    // Course creation rejected with malformed ID
    const resCourseMalformed = await makeRequest(baseUrl, '/api/v1/admin/courses', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${tokenAdmin}`,
        'Content-Type': 'application/json',
      },
      body: {
        title: 'Course with Malformed Instructor',
        slug: `course-malformed-inst-${Date.now()}`,
        category: 'CYBER SECURITY',
        level: 'Beginner',
        price: 99900,
        instructor: 'invalid-id-12345',
      },
    });
    assertTest('Course creation with malformed instructor ID is rejected with 400', resCourseMalformed.status === 400);

    // --- TEST SUITE 5: Course Update & Instructor Reassignment ---
    console.log('\n[TEST SUITE 5] Course Update & Security Protection');

    // Reassign course to the other created active instructor
    const resUpdateValid = await makeRequest(baseUrl, `/api/v1/admin/courses/${createdCourseId}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${tokenAdmin}`,
        'Content-Type': 'application/json',
      },
      body: {
        instructor: createdInstId,
      },
    });
    assertTest(
      'Reassigning course to newly created active instructor succeeds with 200',
      resUpdateValid.status === 200 && resUpdateValid.data.data.instructor._id.toString() === createdInstId
    );

    // Unassign course explicitly
    const resUnassign = await makeRequest(baseUrl, `/api/v1/admin/courses/${createdCourseId}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${tokenAdmin}`,
        'Content-Type': 'application/json',
      },
      body: {
        instructor: null,
      },
    });
    assertTest(
      'Explicitly unassigning instructor (instructor = null) succeeds with 200',
      resUnassign.status === 200 && resUnassign.data.data.instructor === null
    );

    // Update with disabled instructor rejected
    const resUpdateDisabled = await makeRequest(baseUrl, `/api/v1/admin/courses/${createdCourseId}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${tokenAdmin}`,
        'Content-Type': 'application/json',
      },
      body: {
        instructor: instructorDisabled._id.toString(),
      },
    });
    assertTest('Course update with disabled instructor is rejected with 400', resUpdateDisabled.status === 400);

    // Update with student ID rejected
    const resUpdateStudent = await makeRequest(baseUrl, `/api/v1/admin/courses/${createdCourseId}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${tokenAdmin}`,
        'Content-Type': 'application/json',
      },
      body: {
        instructor: studentUser._id.toString(),
      },
    });
    assertTest('Course update with student user ID is rejected with 400', resUpdateStudent.status === 400);

    // Update with arbitrary/unsupported property is stripped by allowlist
    const resUpdateInject = await makeRequest(baseUrl, `/api/v1/admin/courses/${createdCourseId}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${tokenAdmin}`,
        'Content-Type': 'application/json',
      },
      body: {
        maliciousInjectedField: 'hack',
        title: 'Cloud Security Masterclass (Updated)',
      },
    });
    const recheckCourse = await Course.findById(createdCourseId);
    assertTest(
      'Course update applies allowlist; injected arbitrary property is stripped',
      resUpdateInject.status === 200 && recheckCourse.toObject().maliciousInjectedField === undefined
    );

    // --- TEST SUITE 6: Get Admin Courses Populates Instructor ---
    console.log('\n[TEST SUITE 6] Get Admin Courses Population Verification');

    // Assign back to instructorActive
    await makeRequest(baseUrl, `/api/v1/admin/courses/${createdCourseId}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${tokenAdmin}`,
        'Content-Type': 'application/json',
      },
      body: {
        instructor: instructorActive._id.toString(),
      },
    });

    const resListCourses = await makeRequest(baseUrl, '/api/v1/admin/courses', {
      headers: { Authorization: `Bearer ${tokenAdmin}` },
    });
    const foundCourse = resListCourses.data.data.find((c) => c._id.toString() === createdCourseId.toString());
    assertTest(
      'GET /api/v1/admin/courses populates instructor fullName and email',
      foundCourse && foundCourse.instructor && foundCourse.instructor.fullName === instructorActive.fullName
    );

    console.log(`\n========================================`);
    console.log(`PHASE 6.1 VERIFICATION COMPLETE: ${testsPassed} / ${totalTests} TESTS PASSED`);
    console.log(`========================================\n`);

    if (testsPassed !== totalTests) {
      process.exitCode = 1;
    }
  } catch (err) {
    console.error('Phase 6.1 verification encountered error:', err);
    process.exitCode = 1;
  } finally {
    if (server) {
      server.close();
    }
    await mongoose.disconnect();
  }
}

runVerification();
