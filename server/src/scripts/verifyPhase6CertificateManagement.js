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
const Certificate = require('../models/Certificate');

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
  console.log('--- STARTING PHASE 6.4 ADMIN CERTIFICATE MANAGEMENT VERIFICATION ---');
  await connectDB();

  let server;
  let baseUrl;

  let adminUser, superAdminUser, studentUser, studentUser2, instructorUser;
  let tokenAdmin, tokenSuperAdmin, tokenStudent, tokenInstructor;
  let testCourse1, testCourse2;
  const createdCertIds = [];
  const createdCourseIds = [];
  const createdUserIds = [];

  let passedTests = 0;
  let totalTests = 0;

  function assert(condition, message) {
    totalTests++;
    if (!condition) {
      console.error(`  ✗ [TEST ${totalTests}] FAILED: ${message}`);
      throw new Error(`Assertion failed: ${message}`);
    }
    passedTests++;
    console.log(`  ✓ [TEST ${totalTests}] ${message}`);
  }

  try {
    // 1. Start ephemeral HTTP server on random available port
    server = http.createServer(app);
    await new Promise((resolve) => server.listen(0, resolve));
    const port = server.address().port;
    baseUrl = `http://127.0.0.1:${port}`;
    console.log(`Test server running at ${baseUrl}`);

    const jwtSecret = process.env.JWT_SECRET || 'netcradus_test_jwt_secret_key_12345';
    const timestamp = Date.now();

    // 2. Create Test Users
    adminUser = await User.create({
      fullName: `Admin Cert ${timestamp}`,
      email: `admin.cert.${timestamp}@example.com`,
      password: 'Password123!',
      role: 'admin',
      status: 'active',
    });
    createdUserIds.push(adminUser._id);

    superAdminUser = await User.create({
      fullName: `SuperAdmin Cert ${timestamp}`,
      email: `superadmin.cert.${timestamp}@example.com`,
      password: 'Password123!',
      role: 'super_admin',
      status: 'active',
    });
    createdUserIds.push(superAdminUser._id);

    studentUser = await User.create({
      fullName: `Alice Student ${timestamp}`,
      email: `alice.cert.${timestamp}@example.com`,
      password: 'Password123!',
      role: 'student',
      status: 'active',
    });
    createdUserIds.push(studentUser._id);

    studentUser2 = await User.create({
      fullName: `Bob Student ${timestamp}`,
      email: `bob.cert.${timestamp}@example.com`,
      password: 'Password123!',
      role: 'student',
      status: 'active',
    });
    createdUserIds.push(studentUser2._id);

    instructorUser = await User.create({
      fullName: `Instructor Cert ${timestamp}`,
      email: `instructor.cert.${timestamp}@example.com`,
      password: 'Password123!',
      role: 'instructor',
      status: 'active',
    });
    createdUserIds.push(instructorUser._id);

    // Generate JWT tokens
    tokenAdmin = jwt.sign({ id: adminUser._id, role: adminUser.role }, jwtSecret, { expiresIn: '1h' });
    tokenSuperAdmin = jwt.sign({ id: superAdminUser._id, role: superAdminUser.role }, jwtSecret, { expiresIn: '1h' });
    tokenStudent = jwt.sign({ id: studentUser._id, role: studentUser.role }, jwtSecret, { expiresIn: '1h' });
    tokenInstructor = jwt.sign({ id: instructorUser._id, role: instructorUser.role }, jwtSecret, { expiresIn: '1h' });

    // 3. Create Test Courses
    testCourse1 = await Course.create({
      title: `Applied Cryptography & Zero Knowledge ${timestamp}`,
      slug: `applied-crypto-zk-${timestamp}`,
      category: 'Cybersecurity',
      level: 'Advanced',
      price: 599900,
      published: true,
    });
    createdCourseIds.push(testCourse1._id);

    testCourse2 = await Course.create({
      title: `Cloud Infrastructure Automation ${timestamp}`,
      slug: `cloud-infra-auto-${timestamp}`,
      category: 'Cloud Computing',
      level: 'Intermediate',
      price: 399900,
      published: true,
    });
    createdCourseIds.push(testCourse2._id);

    // 4. Create Test Certificates
    const certActive1 = await Certificate.create({
      certificateId: `NC-2026-ACT1${timestamp.toString().slice(-4)}`,
      userId: studentUser._id,
      courseId: testCourse1._id,
      studentName: studentUser.fullName,
      courseName: testCourse1.title,
      issueDate: new Date(Date.now() - 86400000), // 1 day ago
      status: 'active',
    });
    createdCertIds.push(certActive1._id);

    const certActive2 = await Certificate.create({
      certificateId: `NC-2026-ACT2${timestamp.toString().slice(-4)}`,
      userId: studentUser2._id,
      courseId: testCourse2._id,
      studentName: studentUser2.fullName,
      courseName: testCourse2.title,
      issueDate: new Date(Date.now() - 172800000), // 2 days ago
      status: 'active',
    });
    createdCertIds.push(certActive2._id);

    const certRevokedAlready = await Certificate.create({
      certificateId: `NC-2026-RVK1${timestamp.toString().slice(-4)}`,
      userId: studentUser._id,
      courseId: testCourse2._id,
      studentName: studentUser.fullName,
      courseName: testCourse2.title,
      issueDate: new Date(Date.now() - 259200000),
      status: 'revoked',
      revokedAt: new Date(Date.now() - 3600000),
      revocationReason: 'Academic dishonesty during final assessment',
    });
    createdCertIds.push(certRevokedAlready._id);

    // ==========================================
    // [TEST SUITE 1] RBAC Authorization on Certificate Admin APIs
    // ==========================================
    console.log('\n[TEST SUITE 1] RBAC Authorization on Certificate Admin APIs');

    // Test 1: Unauthenticated request to GET /admin/certificates -> 401
    const resUnauthList = await makeRequest(baseUrl, '/api/v1/admin/certificates');
    assert(resUnauthList.status === 401, 'Unauthenticated request to GET /admin/certificates returns 401');

    // Test 2: Student request to GET /admin/certificates -> 403
    const resStudentList = await makeRequest(baseUrl, '/api/v1/admin/certificates', {
      headers: { Authorization: `Bearer ${tokenStudent}` },
    });
    assert(resStudentList.status === 403, 'Student request to GET /admin/certificates returns 403');

    // Test 3: Instructor request to GET /admin/certificates -> 403
    const resInstructorList = await makeRequest(baseUrl, '/api/v1/admin/certificates', {
      headers: { Authorization: `Bearer ${tokenInstructor}` },
    });
    assert(resInstructorList.status === 403, 'Instructor request to GET /admin/certificates returns 403');

    // Test 4: Admin request to GET /admin/certificates -> 200
    const resAdminList = await makeRequest(baseUrl, '/api/v1/admin/certificates', {
      headers: { Authorization: `Bearer ${tokenAdmin}` },
    });
    assert(
      resAdminList.status === 200 && resAdminList.data.success === true,
      'Admin request to GET /admin/certificates returns 200 with success: true'
    );

    // Test 5: Super Admin request to GET /admin/certificates -> 200
    const resSuperAdminList = await makeRequest(baseUrl, '/api/v1/admin/certificates', {
      headers: { Authorization: `Bearer ${tokenSuperAdmin}` },
    });
    assert(
      resSuperAdminList.status === 200 && resSuperAdminList.data.success === true,
      'Super Admin request to GET /admin/certificates returns 200'
    );

    // Test 6: Student request to PATCH /admin/certificates/:id/revoke -> 403
    const resStudentRevoke = await makeRequest(baseUrl, `/api/v1/admin/certificates/${certActive1._id}/revoke`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${tokenStudent}`,
        'Content-Type': 'application/json',
      },
      body: { reason: 'Unauthorized revoke attempt' },
    });
    assert(resStudentRevoke.status === 403, 'Student attempt to revoke certificate returns 403');

    // Test 7: Instructor request to PATCH /admin/certificates/:id/revoke -> 403
    const resInstructorRevoke = await makeRequest(baseUrl, `/api/v1/admin/certificates/${certActive1._id}/revoke`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${tokenInstructor}`,
        'Content-Type': 'application/json',
      },
      body: { reason: 'Unauthorized revoke attempt' },
    });
    assert(resInstructorRevoke.status === 403, 'Instructor attempt to revoke certificate returns 403');

    // ==========================================
    // [TEST SUITE 2] Data Population, Privacy, and Safe Projection
    // ==========================================
    console.log('\n[TEST SUITE 2] Data Population, Privacy, and Safe Projection');

    const certList = resAdminList.data.data;
    assert(Array.isArray(certList) && certList.length >= 3, 'GET /admin/certificates returns array of certificate records');

    const sampleCert = certList.find((c) => c.certificateId === certActive1.certificateId);
    assert(!!sampleCert, 'Target test certificate is present in response list');

    // Test safe user population
    assert(
      sampleCert.userId && sampleCert.userId.fullName === studentUser.fullName && sampleCert.userId.email === studentUser.email,
      'Student information is populated safely with fullName and email'
    );

    // Verify sensitive fields are NOT exposed
    assert(
      !sampleCert.userId.password && !sampleCert.userId.passwordResetToken,
      'Sensitive user credentials (passwords, tokens) are strictly NOT exposed'
    );

    // Test course population
    assert(
      sampleCert.courseId && sampleCert.courseId.title === testCourse1.title,
      'Course information is populated safely with title and metadata'
    );

    // ==========================================
    // [TEST SUITE 3] Filtering, Search, and Pagination
    // ==========================================
    console.log('\n[TEST SUITE 3] Filtering, Search, and Pagination');

    // Test Status Filter: Active
    const resFilterActive = await makeRequest(baseUrl, '/api/v1/admin/certificates?status=active', {
      headers: { Authorization: `Bearer ${tokenAdmin}` },
    });
    assert(
      resFilterActive.status === 200 &&
      resFilterActive.data.data.every((c) => c.status === 'active'),
      'Status filter (?status=active) returns only records with status === "active"'
    );

    // Test Status Filter: Revoked
    const resFilterRevoked = await makeRequest(baseUrl, '/api/v1/admin/certificates?status=revoked', {
      headers: { Authorization: `Bearer ${tokenAdmin}` },
    });
    assert(
      resFilterRevoked.status === 200 &&
      resFilterRevoked.data.data.every((c) => c.status === 'revoked'),
      'Status filter (?status=revoked) returns only records with status === "revoked"'
    );

    // Test Invalid Status Filter Handling
    const resInvalidStatus = await makeRequest(baseUrl, '/api/v1/admin/certificates?status=invalid_status_xyz', {
      headers: { Authorization: `Bearer ${tokenAdmin}` },
    });
    assert(
      resInvalidStatus.status === 200 && resInvalidStatus.data.count === 0,
      'Invalid status filter handled safely without 500 error, returning empty dataset'
    );

    // Test Pagination
    const resPagination = await makeRequest(baseUrl, '/api/v1/admin/certificates?page=1&limit=2', {
      headers: { Authorization: `Bearer ${tokenAdmin}` },
    });
    assert(
      resPagination.status === 200 &&
      resPagination.data.page === 1 &&
      resPagination.data.data.length <= 2 &&
      resPagination.data.pages >= 2,
      'Pagination (?page=1&limit=2) returns correct page, pages, and chunked limit count'
    );

    // Test Search by Certificate ID
    const resSearchId = await makeRequest(baseUrl, `/api/v1/admin/certificates?search=${certActive1.certificateId}`, {
      headers: { Authorization: `Bearer ${tokenAdmin}` },
    });
    assert(
      resSearchId.status === 200 &&
      resSearchId.data.data.some((c) => c.certificateId === certActive1.certificateId),
      'Search by certificateId matches exact certificate record'
    );

    // Test Search by Student Name
    const resSearchName = await makeRequest(baseUrl, `/api/v1/admin/certificates?search=${encodeURIComponent(studentUser.fullName)}`, {
      headers: { Authorization: `Bearer ${tokenAdmin}` },
    });
    assert(
      resSearchName.status === 200 &&
      resSearchName.data.data.some((c) => c.studentName === studentUser.fullName),
      'Search by student fullName matches student certificates'
    );

    // Test Search by Student Email
    const resSearchEmail = await makeRequest(baseUrl, `/api/v1/admin/certificates?search=${encodeURIComponent(studentUser2.email)}`, {
      headers: { Authorization: `Bearer ${tokenAdmin}` },
    });
    assert(
      resSearchEmail.status === 200 &&
      resSearchEmail.data.data.some((c) => c.certificateId === certActive2.certificateId),
      'Search by student email matches student certificates'
    );

    // Test Search by Course Title
    const resSearchCourse = await makeRequest(baseUrl, `/api/v1/admin/certificates?search=${encodeURIComponent(testCourse1.title)}`, {
      headers: { Authorization: `Bearer ${tokenAdmin}` },
    });
    assert(
      resSearchCourse.status === 200 &&
      resSearchCourse.data.data.some((c) => c.courseName === testCourse1.title),
      'Search by course title matches enrolled certificates'
    );

    // Test Course Filter
    const resCourseFilter = await makeRequest(baseUrl, `/api/v1/admin/certificates?courseId=${testCourse1._id}`, {
      headers: { Authorization: `Bearer ${tokenAdmin}` },
    });
    assert(
      resCourseFilter.status === 200 &&
      resCourseFilter.data.data.every((c) => (c.courseId?._id || c.courseId).toString() === testCourse1._id.toString()),
      'Optional courseId filter restricts results to specified course'
    );

    // ==========================================
    // [TEST SUITE 4] Certificate Revocation Mechanics & Safety
    // ==========================================
    console.log('\n[TEST SUITE 4] Certificate Revocation Mechanics & Safety');

    // Test Missing Reason Rejected (400)
    const resMissingReason = await makeRequest(baseUrl, `/api/v1/admin/certificates/${certActive1._id}/revoke`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${tokenAdmin}`,
        'Content-Type': 'application/json',
      },
      body: { reason: '' },
    });
    assert(resMissingReason.status === 400, 'Revocation with empty reason is rejected with 400');

    // Test Short Reason Rejected (400)
    const resShortReason = await makeRequest(baseUrl, `/api/v1/admin/certificates/${certActive1._id}/revoke`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${tokenAdmin}`,
        'Content-Type': 'application/json',
      },
      body: { reason: 'no' },
    });
    assert(resShortReason.status === 400, 'Revocation with trivial reason (< 3 chars) is rejected with 400');

    // Test Nonexistent Certificate Rejected (404)
    const nonExistentId = new mongoose.Types.ObjectId();
    const resNonExistent = await makeRequest(baseUrl, `/api/v1/admin/certificates/${nonExistentId}/revoke`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${tokenAdmin}`,
        'Content-Type': 'application/json',
      },
      body: { reason: 'Valid revocation reason for ghost certificate' },
    });
    assert(resNonExistent.status === 404, 'Revocation of nonexistent certificate returns 404');

    // Test Invalid Certificate ID format Rejected (404)
    const resInvalidId = await makeRequest(baseUrl, '/api/v1/admin/certificates/invalid-malformed-cert-id-9999/revoke', {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${tokenAdmin}`,
        'Content-Type': 'application/json',
      },
      body: { reason: 'Valid reason' },
    });
    assert(resInvalidId.status === 404, 'Revocation with malformed certificate ID returns 404');

    // Test Successful Revocation with Allowlist Enforcement
    const revocationReasonText = 'Violation of academic integrity benchmarks and plagiarism';
    const resRevokeSuccess = await makeRequest(baseUrl, `/api/v1/admin/certificates/${certActive1._id}/revoke`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${tokenAdmin}`,
        'Content-Type': 'application/json',
      },
      body: {
        reason: revocationReasonText,
        // Attempt arbitrary field injection
        userId: new mongoose.Types.ObjectId(),
        courseId: new mongoose.Types.ObjectId(),
        certificateId: 'NC-HACKED-9999',
        issueDate: new Date(2000, 1, 1),
      },
    });
    assert(resRevokeSuccess.status === 200, 'Admin can revoke active certificate with 200 OK');
    assert(resRevokeSuccess.data.data.status === 'revoked', 'Certificate status is updated to "revoked"');
    assert(!!resRevokeSuccess.data.data.revokedAt, 'revokedAt timestamp is populated');
    assert(
      resRevokeSuccess.data.data.revocationReason === revocationReasonText,
      'revocationReason is stored verbatim'
    );
    assert(
      resRevokeSuccess.data.data.certificateId === certActive1.certificateId,
      'Arbitrary certificateId injection attempt is ignored'
    );
    assert(
      (resRevokeSuccess.data.data.userId?._id || resRevokeSuccess.data.data.userId).toString() === studentUser._id.toString(),
      'Arbitrary userId injection attempt is ignored'
    );

    // Test Database Verification of Revoked Record
    const dbRevokedCert = await Certificate.findById(certActive1._id);
    assert(
      dbRevokedCert.status === 'revoked' &&
      dbRevokedCert.revokedAt !== null &&
      dbRevokedCert.revocationReason === revocationReasonText,
      'Database persistently retains revocation status, timestamp, and reason'
    );

    // Test Duplicate Revocation Rejected (400)
    const resDuplicateRevoke = await makeRequest(baseUrl, `/api/v1/admin/certificates/${certActive1._id}/revoke`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${tokenAdmin}`,
        'Content-Type': 'application/json',
      },
      body: { reason: 'Attempting second revocation' },
    });
    assert(resDuplicateRevoke.status === 400, 'Attempting to revoke an already revoked certificate returns 400');

    // Test Revocation by Certificate ID (NC-...) instead of Mongo ObjectId
    const resRevokeByCertId = await makeRequest(baseUrl, `/api/v1/admin/certificates/${certActive2.certificateId}/revoke`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${tokenSuperAdmin}`,
        'Content-Type': 'application/json',
      },
      body: { reason: 'Administrative audit cancellation by Super Admin' },
    });
    assert(
      resRevokeByCertId.status === 200 && resRevokeByCertId.data.data.status === 'revoked',
      'Super Admin can revoke certificate using certificateId parameter'
    );

    // ==========================================
    // [TEST SUITE 5] Public Verification Regression Check
    // ==========================================
    console.log('\n[TEST SUITE 5] Public Verification Regression Check');

    // Test Public Verification of Revoked Certificate
    const resVerifyRevoked = await makeRequest(baseUrl, `/api/v1/certificates/verify/${certActive1.certificateId}`);
    assert(resVerifyRevoked.status === 200, 'Public verify endpoint returns 200 for revoked certificate');
    assert(
      resVerifyRevoked.data.data.status === 'revoked',
      'Revoked certificate is clearly reported as status: "revoked" (NEVER valid/active)'
    );
    assert(
      !!resVerifyRevoked.data.data.revokedAt,
      'Public verification payload includes revokedAt timestamp'
    );

    console.log(`\n========================================`);
    console.log(`PHASE 6.4 VERIFICATION COMPLETE: ${passedTests} / ${totalTests} TESTS PASSED`);
    console.log(`========================================\n`);

  } finally {
    // Clean up test records
    if (createdCertIds.length > 0) {
      await Certificate.deleteMany({ _id: { $in: createdCertIds } });
    }
    if (createdCourseIds.length > 0) {
      await Course.deleteMany({ _id: { $in: createdCourseIds } });
    }
    if (createdUserIds.length > 0) {
      await User.deleteMany({ _id: { $in: createdUserIds } });
    }

    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
    await mongoose.connection.close();
  }
}

runVerification().catch((err) => {
  console.error('\nVerification failed with exception:', err);
  process.exit(1);
});
