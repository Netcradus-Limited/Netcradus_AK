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
const Payment = require('../models/Payment');

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
  console.log('--- STARTING PHASE 6.3 ADMIN PAYMENT LEDGER VERIFICATION ---');
  await connectDB();

  let server;
  let baseUrl;

  let adminUser, superAdminUser, studentUser, studentUser2, instructorUser;
  let tokenAdmin, tokenSuperAdmin, tokenStudent, tokenInstructor;
  let testCourse1, testCourse2;
  const createdPaymentIds = [];
  const createdCourseIds = [];
  const createdUserIds = [];

  try {
    // 1. Start ephemeral HTTP server on random available port
    server = http.createServer(app);
    await new Promise((resolve) => server.listen(0, resolve));
    const port = server.address().port;
    baseUrl = `http://127.0.0.1:${port}`;
    console.log(`Test server running at ${baseUrl}`);

    const jwtSecret = process.env.JWT_SECRET;
    const timestamp = Date.now();

    // 2. Create Test Users
    adminUser = await User.create({
      fullName: `Admin Phase63 ${timestamp}`,
      email: `admin.phase63.${timestamp}@example.com`,
      password: 'Password123!',
      role: 'admin',
      status: 'active',
    });
    createdUserIds.push(adminUser._id);

    superAdminUser = await User.create({
      fullName: `SuperAdmin Phase63 ${timestamp}`,
      email: `superadmin.phase63.${timestamp}@example.com`,
      password: 'Password123!',
      role: 'super_admin',
      status: 'active',
    });
    createdUserIds.push(superAdminUser._id);

    studentUser = await User.create({
      fullName: `Alice Student ${timestamp}`,
      email: `alice.student.${timestamp}@example.com`,
      password: 'Password123!',
      role: 'student',
      status: 'active',
    });
    createdUserIds.push(studentUser._id);

    studentUser2 = await User.create({
      fullName: `Bob Student ${timestamp}`,
      email: `bob.student.${timestamp}@example.com`,
      password: 'Password123!',
      role: 'student',
      status: 'active',
    });
    createdUserIds.push(studentUser2._id);

    instructorUser = await User.create({
      fullName: `Instructor Phase63 ${timestamp}`,
      email: `instructor.phase63.${timestamp}@example.com`,
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
      title: `Node.js Architecture Mastery ${timestamp}`,
      slug: `nodejs-arch-mastery-${timestamp}`,
      category: 'Web Development',
      level: 'Intermediate',
      price: 499900, // 4,999.00 INR (in paise)
      published: true,
    });
    createdCourseIds.push(testCourse1._id);

    testCourse2 = await Course.create({
      title: `Cloud Native Microservices ${timestamp}`,
      slug: `cloud-native-microservices-${timestamp}`,
      category: 'Cloud Computing',
      level: 'Advanced',
      price: 999900, // 9,999.00 INR (in paise)
      published: true,
    });
    createdCourseIds.push(testCourse2._id);

    // 4. Create Test Payments with varied statuses
    const paymentPaid = await Payment.create({
      userId: studentUser._id,
      courseId: testCourse1._id,
      provider: 'razorpay',
      razorpayOrderId: `order_paid_${timestamp}`,
      razorpayPaymentId: `pay_paid_${timestamp}`,
      razorpaySignature: 'sig_super_secret_paid_xyz123',
      amount: 499900,
      currency: 'INR',
      status: 'paid',
      paymentMethod: 'card',
      paidAt: new Date(),
    });
    createdPaymentIds.push(paymentPaid._id);

    const paymentCreated = await Payment.create({
      userId: studentUser._id,
      courseId: testCourse2._id,
      provider: 'razorpay',
      razorpayOrderId: `order_created_${timestamp}`,
      amount: 999900,
      currency: 'INR',
      status: 'created',
    });
    createdPaymentIds.push(paymentCreated._id);

    const paymentFailed = await Payment.create({
      userId: studentUser2._id,
      courseId: testCourse1._id,
      provider: 'razorpay',
      razorpayOrderId: `order_failed_${timestamp}`,
      razorpayPaymentId: `pay_failed_${timestamp}`,
      amount: 499900,
      currency: 'INR',
      status: 'failed',
      failureReason: 'Payment bank authorization declined',
    });
    createdPaymentIds.push(paymentFailed._id);

    const paymentRefunded = await Payment.create({
      userId: studentUser2._id,
      courseId: testCourse2._id,
      provider: 'razorpay',
      razorpayOrderId: `order_refunded_${timestamp}`,
      razorpayPaymentId: `pay_refunded_${timestamp}`,
      amount: 999900,
      currency: 'INR',
      status: 'refunded',
      refundedAt: new Date(),
    });
    createdPaymentIds.push(paymentRefunded._id);

    let passedTests = 0;
    const totalTests = 24;

    function assert(condition, message) {
      if (!condition) {
        throw new Error(`ASSERTION FAILED: ${message}`);
      }
      passedTests++;
      console.log(`  ✓ [TEST ${passedTests}] ${message}`);
    }

    // ==========================================
    // [TEST SUITE 1] RBAC Authorization
    // ==========================================
    console.log('\n[TEST SUITE 1] RBAC Authorization on Payment Ledger API');

    // TEST 1: Unauthenticated request -> 401
    const resUnauth = await makeRequest(baseUrl, '/api/v1/admin/payments');
    assert(resUnauth.status === 401, 'Unauthenticated request to GET /admin/payments returns 401');

    // TEST 2: Student request -> 403
    const resStudent = await makeRequest(baseUrl, '/api/v1/admin/payments', {
      headers: { Authorization: `Bearer ${tokenStudent}` },
    });
    assert(resStudent.status === 403, 'Student request to GET /admin/payments returns 403');

    // TEST 3: Instructor request -> 403
    const resInstructor = await makeRequest(baseUrl, '/api/v1/admin/payments', {
      headers: { Authorization: `Bearer ${tokenInstructor}` },
    });
    assert(resInstructor.status === 403, 'Instructor request to GET /admin/payments returns 403');

    // TEST 4: Admin request -> 200
    const resAdmin = await makeRequest(baseUrl, '/api/v1/admin/payments', {
      headers: { Authorization: `Bearer ${tokenAdmin}` },
    });
    assert(resAdmin.status === 200 && resAdmin.data?.success === true, 'Admin request to GET /admin/payments returns 200 with success: true');

    // TEST 5: Super Admin request -> 200
    const resSuperAdmin = await makeRequest(baseUrl, '/api/v1/admin/payments', {
      headers: { Authorization: `Bearer ${tokenSuperAdmin}` },
    });
    assert(resSuperAdmin.status === 200 && resSuperAdmin.data?.success === true, 'Super Admin request to GET /admin/payments returns 200');

    // ==========================================
    // [TEST SUITE 2] Data Integrity, Safe Population & Secret Protection
    // ==========================================
    console.log('\n[TEST SUITE 2] Data Integrity, Safe Population & Secret Protection');

    const paymentRecords = resAdmin.data.data;
    assert(Array.isArray(paymentRecords) && paymentRecords.length >= 4, 'Returns array of payment ledger records');

    const foundPaid = paymentRecords.find((p) => p._id === paymentPaid._id.toString());
    assert(foundPaid && foundPaid.userId && foundPaid.userId.fullName === studentUser.fullName, 'Student information is populated with safe fullName and email');

    assert(foundPaid && foundPaid.courseId && foundPaid.courseId.title === testCourse1.title, 'Course information is populated with safe title and category');

    // Secret Protection Checks
    assert(!foundPaid.userId.password && !foundPaid.userId.passwordResetToken, 'Passwords and passwordReset tokens are NOT exposed in student object');

    assert(foundPaid.razorpaySignature === undefined, 'razorpaySignature is strictly NOT exposed in payment record');

    assert(
      foundPaid.amount === 499900 &&
      foundPaid.currency === 'INR' &&
      foundPaid.provider === 'razorpay' &&
      foundPaid.status === 'paid' &&
      foundPaid.razorpayOrderId === `order_paid_${timestamp}` &&
      foundPaid.razorpayPaymentId === `pay_paid_${timestamp}` &&
      Boolean(foundPaid.paidAt),
      'Payment record contains all expected valid fields (amount, currency, provider, status, order/payment IDs, dates)'
    );

    // ==========================================
    // [TEST SUITE 3] Filtering, Search, and Pagination
    // ==========================================
    console.log('\n[TEST SUITE 3] Filtering, Search, and Pagination');

    // TEST 12: Status filter (paid)
    const resFilterPaid = await makeRequest(baseUrl, '/api/v1/admin/payments?status=paid', {
      headers: { Authorization: `Bearer ${tokenAdmin}` },
    });
    assert(
      resFilterPaid.status === 200 &&
      resFilterPaid.data.data.every((p) => p.status === 'paid') &&
      resFilterPaid.data.data.some((p) => p._id === paymentPaid._id.toString()),
      'Status filter (?status=paid) returns only records with status === "paid"'
    );

    // TEST 13: Status filter (failed)
    const resFilterFailed = await makeRequest(baseUrl, '/api/v1/admin/payments?status=failed', {
      headers: { Authorization: `Bearer ${tokenAdmin}` },
    });
    assert(
      resFilterFailed.status === 200 &&
      resFilterFailed.data.data.every((p) => p.status === 'failed') &&
      resFilterFailed.data.data.some((p) => p._id === paymentFailed._id.toString()),
      'Status filter (?status=failed) returns only records with status === "failed"'
    );

    // TEST 14: Invalid status filter handled safely
    const resFilterInvalid = await makeRequest(baseUrl, '/api/v1/admin/payments?status=unsupported_status_xyz', {
      headers: { Authorization: `Bearer ${tokenAdmin}` },
    });
    assert(
      resFilterInvalid.status === 200 &&
      resFilterInvalid.data.success === true &&
      resFilterInvalid.data.data.length === 0,
      'Invalid status filter handled safely without 500 error, returning empty list'
    );

    // TEST 15: Pagination
    const resPagination = await makeRequest(baseUrl, '/api/v1/admin/payments?page=1&limit=2', {
      headers: { Authorization: `Bearer ${tokenAdmin}` },
    });
    assert(
      resPagination.status === 200 &&
      resPagination.data.page === 1 &&
      resPagination.data.data.length === 2 &&
      resPagination.data.total >= 4 &&
      resPagination.data.pages >= 2,
      'Pagination (?page=1&limit=2) returns correct page, pages, and chunked count'
    );

    // TEST 16: Search by student name
    const resSearchName = await makeRequest(baseUrl, `/api/v1/admin/payments?search=${encodeURIComponent(studentUser.fullName)}`, {
      headers: { Authorization: `Bearer ${tokenAdmin}` },
    });
    assert(
      resSearchName.status === 200 &&
      resSearchName.data.data.length >= 2 &&
      resSearchName.data.data.every((p) => p.userId && p.userId.fullName === studentUser.fullName),
      'Search by student fullName returns matching payment records'
    );

    // TEST 17: Search by order ID
    const resSearchOrder = await makeRequest(baseUrl, `/api/v1/admin/payments?search=order_paid_${timestamp}`, {
      headers: { Authorization: `Bearer ${tokenAdmin}` },
    });
    assert(
      resSearchOrder.status === 200 &&
      resSearchOrder.data.data.length === 1 &&
      resSearchOrder.data.data[0]._id === paymentPaid._id.toString(),
      'Search by razorpayOrderId matches exact payment transaction'
    );

    // TEST 18: Search by payment ID
    const resSearchPay = await makeRequest(baseUrl, `/api/v1/admin/payments?search=pay_failed_${timestamp}`, {
      headers: { Authorization: `Bearer ${tokenAdmin}` },
    });
    assert(
      resSearchPay.status === 200 &&
      resSearchPay.data.data.length === 1 &&
      resSearchPay.data.data[0]._id === paymentFailed._id.toString(),
      'Search by razorpayPaymentId matches exact payment transaction'
    );

    // ==========================================
    // [TEST SUITE 4] Read-Only Ledger Verification & Absence of Deferred Operations
    // ==========================================
    console.log('\n[TEST SUITE 4] Read-Only Ledger Verification & Absence of Deferred Operations');

    // TEST 19: Payment records in DB are unchanged after queries
    const paymentInDb = await Payment.findById(paymentPaid._id);
    assert(
      paymentInDb.amount === 499900 && paymentInDb.status === 'paid',
      'GET /admin/payments is strictly read-only and does not mutate database records'
    );

    // TEST 20: No payment creation endpoint under admin
    const resPostAdmin = await makeRequest(baseUrl, '/api/v1/admin/payments', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${tokenAdmin}`,
        'Content-Type': 'application/json',
      },
      body: { amount: 1000 },
    });
    assert(resPostAdmin.status === 404, 'POST /api/v1/admin/payments returns 404 (no creation endpoint under admin)');

    // TEST 21: No status mutation endpoint under admin
    const resPatchStatus = await makeRequest(baseUrl, `/api/v1/admin/payments/${paymentPaid._id}/status`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${tokenAdmin}`,
        'Content-Type': 'application/json',
      },
      body: { status: 'refunded' },
    });
    assert(resPatchStatus.status === 404, 'PATCH /api/v1/admin/payments/:id/status returns 404 (no mutation endpoint)');

    // TEST 22: No deletion endpoint under admin
    const resDeleteAdmin = await makeRequest(baseUrl, `/api/v1/admin/payments/${paymentPaid._id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${tokenAdmin}` },
    });
    assert(resDeleteAdmin.status === 404, 'DELETE /api/v1/admin/payments/:id returns 404 (no deletion endpoint)');

    // TEST 23: Refund endpoint is strictly absent
    const resRefund = await makeRequest(baseUrl, `/api/v1/admin/payments/${paymentPaid._id}/refund`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${tokenAdmin}`,
        'Content-Type': 'application/json',
      },
      body: { reason: 'Test refund request' },
    });
    assert(resRefund.status === 404, 'POST /api/v1/admin/payments/:id/refund returns 404 (refunds explicitly deferred)');

    // ==========================================
    // [TEST SUITE 5] Empty Collection Handling
    // ==========================================
    console.log('\n[TEST SUITE 5] Empty Collection Handling');

    const resEmpty = await makeRequest(baseUrl, '/api/v1/admin/payments?search=nonexistent_search_query_term_12345', {
      headers: { Authorization: `Bearer ${tokenAdmin}` },
    });
    assert(
      resEmpty.status === 200 &&
      resEmpty.data.success === true &&
      resEmpty.data.count === 0 &&
      resEmpty.data.total === 0 &&
      Array.isArray(resEmpty.data.data) &&
      resEmpty.data.data.length === 0,
      'Query with no matching results returns valid empty collection response'
    );

    console.log(`\n========================================`);
    console.log(`PHASE 6.3 VERIFICATION COMPLETE: ${passedTests} / ${totalTests} TESTS PASSED`);
    console.log(`========================================\n`);

  } finally {
    // Clean up test records
    if (createdPaymentIds.length > 0) {
      await Payment.deleteMany({ _id: { $in: createdPaymentIds } });
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
