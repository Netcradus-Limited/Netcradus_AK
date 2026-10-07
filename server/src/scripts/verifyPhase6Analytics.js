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
const Payment = require('../models/Payment');
const Assignment = require('../models/Assignment');
const Submission = require('../models/Submission');

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
  console.log('--- STARTING PHASE 6.5 ADMIN FINANCIAL & COURSE ANALYTICS VERIFICATION ---');
  await connectDB();

  let server;
  let baseUrl;

  let adminUser, superAdminUser, studentUser, studentUser2, instructorUser;
  let tokenAdmin, tokenSuperAdmin, tokenStudent, tokenInstructor;
  let testCourse1, testCourse2, testCourseDraft;
  const createdUserIds = [];
  const createdCourseIds = [];
  const createdEnrollmentIds = [];
  const createdPaymentIds = [];
  const createdAssignmentIds = [];
  const createdSubmissionIds = [];

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
      fullName: `Admin Analytics ${timestamp}`,
      email: `admin.analytics.${timestamp}@example.com`,
      password: 'Password123!',
      role: 'admin',
      status: 'active',
    });
    createdUserIds.push(adminUser._id);

    superAdminUser = await User.create({
      fullName: `SuperAdmin Analytics ${timestamp}`,
      email: `superadmin.analytics.${timestamp}@example.com`,
      password: 'Password123!',
      role: 'super_admin',
      status: 'active',
    });
    createdUserIds.push(superAdminUser._id);

    instructorUser = await User.create({
      fullName: `Dr. Elena Vance ${timestamp}`,
      email: `elena.vance.${timestamp}@example.com`,
      password: 'Password123!',
      role: 'instructor',
      status: 'active',
    });
    createdUserIds.push(instructorUser._id);

    studentUser = await User.create({
      fullName: `Alice Analyst ${timestamp}`,
      email: `alice.analyst.${timestamp}@example.com`,
      password: 'Password123!',
      role: 'student',
      status: 'active',
    });
    createdUserIds.push(studentUser._id);

    studentUser2 = await User.create({
      fullName: `Bob Analyst ${timestamp}`,
      email: `bob.analyst.${timestamp}@example.com`,
      password: 'Password123!',
      role: 'student',
      status: 'active',
    });
    createdUserIds.push(studentUser2._id);

    // Generate JWT tokens
    tokenAdmin = jwt.sign({ id: adminUser._id, role: adminUser.role }, jwtSecret, { expiresIn: '1h' });
    tokenSuperAdmin = jwt.sign({ id: superAdminUser._id, role: superAdminUser.role }, jwtSecret, { expiresIn: '1h' });
    tokenStudent = jwt.sign({ id: studentUser._id, role: studentUser.role }, jwtSecret, { expiresIn: '1h' });
    tokenInstructor = jwt.sign({ id: instructorUser._id, role: instructorUser.role }, jwtSecret, { expiresIn: '1h' });

    // 3. Create Test Courses (Assigned to Instructor)
    testCourse1 = await Course.create({
      title: `Quantum Cryptanalysis ${timestamp}`,
      slug: `quantum-cryptanalysis-${timestamp}`,
      category: 'Cybersecurity',
      level: 'Advanced',
      price: 500000, // ₹5,000.00
      instructor: instructorUser._id,
      published: true,
    });
    createdCourseIds.push(testCourse1._id);

    testCourse2 = await Course.create({
      title: `Distributed Ledger Engineering ${timestamp}`,
      slug: `distributed-ledger-eng-${timestamp}`,
      category: 'Blockchain',
      level: 'Intermediate',
      price: 300000, // ₹3,000.00
      instructor: instructorUser._id,
      published: true,
    });
    createdCourseIds.push(testCourse2._id);

    testCourseDraft = await Course.create({
      title: `Zero Knowledge Proof Systems (Draft) ${timestamp}`,
      slug: `zk-proof-systems-draft-${timestamp}`,
      category: 'Cryptography',
      level: 'Advanced',
      price: 800000,
      instructor: instructorUser._id,
      published: false, // draft course
    });
    createdCourseIds.push(testCourseDraft._id);

    // 4. Create Controlled Test Payments
    // Payment 1: Paid ₹5,000 (500,000 paise)
    const paymentPaid1 = await Payment.create({
      userId: studentUser._id,
      courseId: testCourse1._id,
      amount: 500000,
      currency: 'INR',
      status: 'paid',
      razorpayOrderId: `order_p1_${timestamp}`,
      razorpayPaymentId: `pay_p1_${timestamp}`,
      paidAt: new Date(),
    });
    createdPaymentIds.push(paymentPaid1._id);

    // Payment 2: Paid ₹3,000 (300,000 paise)
    const paymentPaid2 = await Payment.create({
      userId: studentUser2._id,
      courseId: testCourse2._id,
      amount: 300000,
      currency: 'INR',
      status: 'paid',
      razorpayOrderId: `order_p2_${timestamp}`,
      razorpayPaymentId: `pay_p2_${timestamp}`,
      paidAt: new Date(),
    });
    createdPaymentIds.push(paymentPaid2._id);

    // Payment 3: Failed ₹5,000 - must NOT count towards revenue
    const paymentFailed = await Payment.create({
      userId: studentUser2._id,
      courseId: testCourse1._id,
      amount: 500000,
      currency: 'INR',
      status: 'failed',
      razorpayOrderId: `order_fail_${timestamp}`,
      failureReason: 'Payment declined by issuing bank',
    });
    createdPaymentIds.push(paymentFailed._id);

    // Payment 4: Pending ₹3,000 - must NOT count towards revenue
    const paymentPending = await Payment.create({
      userId: studentUser._id,
      courseId: testCourse2._id,
      amount: 300000,
      currency: 'INR',
      status: 'pending',
      razorpayOrderId: `order_pend_${timestamp}`,
    });
    createdPaymentIds.push(paymentPending._id);

    // Payment 5: Refunded ₹2,000 - must NOT count towards revenue
    const paymentRefunded = await Payment.create({
      userId: studentUser._id,
      courseId: testCourse1._id,
      amount: 200000,
      currency: 'INR',
      status: 'refunded',
      razorpayOrderId: `order_ref_${timestamp}`,
      razorpayPaymentId: `pay_ref_${timestamp}`,
      refundedAt: new Date(),
    });
    createdPaymentIds.push(paymentRefunded._id);

    // 5. Create Controlled Enrollments
    // Course 1: Alice completed
    const enroll1 = await Enrollment.create({
      userId: studentUser._id,
      courseId: testCourse1._id,
      paymentId: paymentPaid1._id,
      enrollmentType: 'paid',
      pricePaid: 500000,
      status: 'completed',
      progressPercentage: 100,
      completedAt: new Date(),
    });
    createdEnrollmentIds.push(enroll1._id);

    // Course 1: Bob active
    const enroll2 = await Enrollment.create({
      userId: studentUser2._id,
      courseId: testCourse1._id,
      enrollmentType: 'manual',
      pricePaid: 0,
      status: 'active',
      progressPercentage: 50,
    });
    createdEnrollmentIds.push(enroll2._id);

    // Course 2: Bob completed
    const enroll3 = await Enrollment.create({
      userId: studentUser2._id,
      courseId: testCourse2._id,
      paymentId: paymentPaid2._id,
      enrollmentType: 'paid',
      pricePaid: 300000,
      status: 'completed',
      progressPercentage: 100,
      completedAt: new Date(),
    });
    createdEnrollmentIds.push(enroll3._id);

    // 6. Create Assignment & Submission
    const testAssignment = await Assignment.create({
      courseId: testCourse1._id,
      title: `Assignment 1 ${timestamp}`,
      description: 'Implement zero-knowledge prover',
      totalPoints: 100,
      passingPoints: 60,
    });
    createdAssignmentIds.push(testAssignment._id);

    const testSubmission = await Submission.create({
      assignmentId: testAssignment._id,
      userId: studentUser._id,
      courseId: testCourse1._id,
      status: 'submitted',
      submissionText: 'https://github.com/alice/zk-prover',
      submittedAt: new Date(),
    });
    createdSubmissionIds.push(testSubmission._id);

    // ==========================================
    // [TEST SUITE 1] RBAC Authorization on Analytics API
    // ==========================================
    console.log('\n[TEST SUITE 1] RBAC Authorization on Analytics API');

    // Test 1: Unauthenticated request to /admin/analytics -> 401
    const resUnauth = await makeRequest(baseUrl, '/api/v1/admin/analytics');
    assert(resUnauth.status === 401, 'Unauthenticated request to GET /admin/analytics returns 401');

    // Test 2: Student request to /admin/analytics -> 403
    const resStudent = await makeRequest(baseUrl, '/api/v1/admin/analytics', {
      headers: { Authorization: `Bearer ${tokenStudent}` },
    });
    assert(resStudent.status === 403, 'Student request to GET /admin/analytics returns 403');

    // Test 3: Instructor request to /admin/analytics -> 403
    const resInstructor = await makeRequest(baseUrl, '/api/v1/admin/analytics', {
      headers: { Authorization: `Bearer ${tokenInstructor}` },
    });
    assert(resInstructor.status === 403, 'Instructor request to GET /admin/analytics returns 403');

    // Test 4: Admin request to /admin/analytics -> 200
    const resAdmin = await makeRequest(baseUrl, '/api/v1/admin/analytics', {
      headers: { Authorization: `Bearer ${tokenAdmin}` },
    });
    assert(
      resAdmin.status === 200 && resAdmin.data.success === true,
      'Admin request to GET /admin/analytics returns 200 with success: true'
    );

    // Test 5: Super Admin request to /admin/analytics -> 200
    const resSuperAdmin = await makeRequest(baseUrl, '/api/v1/admin/analytics', {
      headers: { Authorization: `Bearer ${tokenSuperAdmin}` },
    });
    assert(
      resSuperAdmin.status === 200 && resSuperAdmin.data.success === true,
      'Super Admin request to GET /admin/analytics returns 200'
    );

    // Test 6: Verify /admin/dashboard/stats also returns the complete analytics dataset
    const resDashboardStats = await makeRequest(baseUrl, '/api/v1/admin/dashboard/stats', {
      headers: { Authorization: `Bearer ${tokenAdmin}` },
    });
    assert(
      resDashboardStats.status === 200 &&
      !!resDashboardStats.data.data.stats &&
      !!resDashboardStats.data.data.financial,
      'GET /admin/dashboard/stats also returns enhanced analytics payload'
    );

    const analyticsData = resAdmin.data.data;

    // ==========================================
    // [TEST SUITE 2] User, Course, Enrollment & Assignment Metric Accuracies
    // ==========================================
    console.log('\n[TEST SUITE 2] User, Course, Enrollment & Assignment Metric Accuracies');

    const stats = analyticsData.stats;
    assert(stats.totalStudents >= 2, 'stats.totalStudents reflects actual students');
    assert(stats.activeStudents >= 2, 'stats.activeStudents reflects active student count');
    assert(stats.totalInstructors >= 1, 'stats.totalInstructors reflects actual instructors');
    assert(stats.activeInstructors >= 1, 'stats.activeInstructors reflects active instructors');

    assert(stats.totalCourses >= 3, 'stats.totalCourses reflects course count');
    assert(stats.publishedCourses >= 2, 'stats.publishedCourses reflects published course count');
    assert(stats.draftCourses >= 1, 'stats.draftCourses reflects draft course count');

    assert(stats.totalEnrollments >= 3, 'stats.totalEnrollments reflects enrollment count');
    assert(stats.completedEnrollments >= 2, 'stats.completedEnrollments reflects completed count');
    assert(stats.manualEnrollments >= 1, 'stats.manualEnrollments reflects manual enrollment count');
    assert(stats.paidEnrollments >= 2, 'stats.paidEnrollments reflects paid enrollment count');

    assert(stats.pendingSubmissions >= 1, 'stats.pendingSubmissions reflects pending submissions');

    // ==========================================
    // [TEST SUITE 3] Financial Metric Calculations & Lifecycle Filtering
    // ==========================================
    console.log('\n[TEST SUITE 3] Financial Metric Calculations & Lifecycle Filtering');

    const financial = analyticsData.financial;

    // Gross Revenue should ONLY sum paid payments (5000 + 3000 = 8000 rupees)
    // Note: If previous test runs left payments or our 2 paid payments exist
    assert(
      financial.grossRevenueRupees >= 8000,
      `financial.grossRevenueRupees is at least ₹8,000 (Current: ₹${financial.grossRevenueRupees})`
    );
    assert(
      financial.grossRevenuePaise === financial.grossRevenueRupees * 100,
      'financial.grossRevenuePaise matches Rupees × 100 exactly'
    );

    // Number of successful payments
    assert(
      financial.successfulPaymentsCount >= 2,
      `financial.successfulPaymentsCount reflects paid records (Current: ${financial.successfulPaymentsCount})`
    );

    // Refunded payments (our 1 refunded payment of 200,000 paise = ₹2,000)
    assert(
      financial.refundedAmountRupees >= 2000,
      `financial.refundedAmountRupees tracks refunded payments (Current: ₹${financial.refundedAmountRupees})`
    );
    assert(
      financial.refundedPaymentsCount >= 1,
      `financial.refundedPaymentsCount tracks refunded count (Current: ${financial.refundedPaymentsCount})`
    );

    // Failed payments (must be tracked separately and NOT added to gross revenue)
    assert(
      financial.failedPaymentsCount >= 1,
      `financial.failedPaymentsCount tracks failed transactions (Current: ${financial.failedPaymentsCount})`
    );

    // Average transaction value
    assert(
      financial.averageTransactionValueRupees > 0 &&
      !isNaN(financial.averageTransactionValueRupees),
      `financial.averageTransactionValueRupees is a valid number: ₹${financial.averageTransactionValueRupees}`
    );

    // Currency verification
    assert(financial.currency === 'INR', 'financial.currency is "INR"');

    // Period metrics
    assert(
      financial.periodMetrics &&
      financial.periodMetrics.last30DaysRupees >= 8000,
      'financial.periodMetrics.last30DaysRupees includes recent payments'
    );
    assert(
      financial.periodMetrics.comparisonText === 'No comparison available',
      'Does not fabricate baseline comparison percentages'
    );

    // ==========================================
    // [TEST SUITE 4] Course Performance & Zero-Denominator Safety
    // ==========================================
    console.log('\n[TEST SUITE 4] Course Performance & Zero-Denominator Safety');

    const coursePerf = analyticsData.coursePerformance;
    assert(Array.isArray(coursePerf) && coursePerf.length >= 3, 'coursePerformance returns array of all courses');

    const c1Perf = coursePerf.find((c) => c.courseId.toString() === testCourse1._id.toString());
    assert(!!c1Perf, 'Test Course 1 is present in coursePerformance');
    assert(c1Perf.totalEnrollments === 2, `Course 1 totalEnrollments is 2 (Current: ${c1Perf.totalEnrollments})`);
    assert(c1Perf.completedEnrollments === 1, `Course 1 completedEnrollments is 1 (Current: ${c1Perf.completedEnrollments})`);
    assert(c1Perf.completionRate === 50, `Course 1 completionRate is exactly 50% (Current: ${c1Perf.completionRate}%)`);
    assert(c1Perf.revenueRupees === 5000, `Course 1 attributable revenue is ₹5,000 (Current: ₹${c1Perf.revenueRupees})`);
    assert(c1Perf.instructor && c1Perf.instructor.fullName === instructorUser.fullName, 'Course 1 instructor is attributed accurately');

    // Zero-denominator check on draft course (0 enrollments)
    const draftPerf = coursePerf.find((c) => c.courseId.toString() === testCourseDraft._id.toString());
    assert(!!draftPerf, 'Draft course is present in coursePerformance');
    assert(draftPerf.totalEnrollments === 0, 'Draft course has 0 enrollments');
    assert(
      draftPerf.completionRate === 0 &&
      !isNaN(draftPerf.completionRate) &&
      isFinite(draftPerf.completionRate),
      'Zero-denominator course safely reports completionRate: 0 (never NaN or Infinity)'
    );

    // Top courses check
    const topCourses = analyticsData.topCourses;
    assert(Array.isArray(topCourses) && topCourses.length <= 5, 'topCourses returns top courses list');
    assert(
      topCourses[0].totalEnrollments >= (topCourses[1]?.totalEnrollments || 0),
      'topCourses is ordered by totalEnrollments descending'
    );

    // ==========================================
    // [TEST SUITE 5] Instructor Performance Analytics
    // ==========================================
    console.log('\n[TEST SUITE 5] Instructor Performance Analytics');

    const instAnalytics = analyticsData.instructorAnalytics;
    assert(Array.isArray(instAnalytics), 'instructorAnalytics is an array');

    const vanceAnalytics = instAnalytics.find(
      (inst) => inst.instructorId.toString() === instructorUser._id.toString()
    );
    assert(!!vanceAnalytics, 'Target instructor is present in instructorAnalytics');
    assert(vanceAnalytics.assignedCoursesCount === 3, `Assigned courses count is 3 (Current: ${vanceAnalytics.assignedCoursesCount})`);
    assert(vanceAnalytics.publishedCoursesCount === 2, `Published courses count is 2 (Current: ${vanceAnalytics.publishedCoursesCount})`);
    assert(vanceAnalytics.totalStudentsCount === 3, `Total enrolled students is 3 (Current: ${vanceAnalytics.totalStudentsCount})`);
    assert(vanceAnalytics.completedStudentsCount === 2, `Completed students count is 2 (Current: ${vanceAnalytics.completedStudentsCount})`);
    assert(vanceAnalytics.pendingSubmissionsCount === 1, `Pending submissions count is 1 (Current: ${vanceAnalytics.pendingSubmissionsCount})`);
    assert(vanceAnalytics.attributableRevenueRupees === 8000, `Attributable revenue is ₹8,000 (Current: ₹${vanceAnalytics.attributableRevenueRupees})`);

    // ==========================================
    // [TEST SUITE 6] Operational Workload Overview
    // ==========================================
    console.log('\n[TEST SUITE 6] Operational Workload Overview');

    const ops = analyticsData.operationalOverview;
    assert(ops.pendingSubmissions >= 1, 'ops.pendingSubmissions reflects workload');
    assert(ops.activeInstructors >= 1, 'ops.activeInstructors reflects teaching faculty');
    assert(ops.activeEnrollments >= 1, 'ops.activeEnrollments reflects active study count');
    assert(ops.draftCourses >= 1, 'ops.draftCourses reflects unpublished courses');

    // ==========================================
    // [TEST SUITE 7] Data Safety, Secret Protection & Tamper Resistance
    // ==========================================
    console.log('\n[TEST SUITE 7] Data Safety, Secret Protection & Tamper Resistance');

    const rawJson = JSON.stringify(analyticsData);
    assert(!rawJson.includes('razorpaySignature'), 'razorpaySignature is strictly NOT exposed in analytics');
    assert(!rawJson.includes('passwordResetToken'), 'passwordResetToken is strictly NOT exposed in analytics');

    // Attempt client-side override injection
    const resTamper = await makeRequest(baseUrl, '/api/v1/admin/analytics?revenue=99999999&totalStudents=500000', {
      method: 'GET',
      headers: { Authorization: `Bearer ${tokenAdmin}` },
    });
    assert(
      resTamper.status === 200 &&
      resTamper.data.data.stats.totalStudents === analyticsData.stats.totalStudents &&
      resTamper.data.data.financial.grossRevenueRupees === analyticsData.financial.grossRevenueRupees,
      'Query parameter tampering attempts are strictly ignored; all metrics are server-derived'
    );

    console.log(`\n========================================`);
    console.log(`PHASE 6.5 VERIFICATION COMPLETE: ${passedTests} / ${totalTests} TESTS PASSED`);
    console.log(`========================================\n`);

  } finally {
    // Clean up created test documents
    if (createdSubmissionIds.length > 0) {
      await Submission.deleteMany({ _id: { $in: createdSubmissionIds } });
    }
    if (createdAssignmentIds.length > 0) {
      await Assignment.deleteMany({ _id: { $in: createdAssignmentIds } });
    }
    if (createdPaymentIds.length > 0) {
      await Payment.deleteMany({ _id: { $in: createdPaymentIds } });
    }
    if (createdEnrollmentIds.length > 0) {
      await Enrollment.deleteMany({ _id: { $in: createdEnrollmentIds } });
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
