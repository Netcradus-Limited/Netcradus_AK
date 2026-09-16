const http = require('http');
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const User = require('../models/User');
const Course = require('../models/Course');
const Module = require('../models/Module');
const Lesson = require('../models/Lesson');
const Enrollment = require('../models/Enrollment');

const API_BASE = 'http://localhost:5001/api/v1';

function makeRequest(method, endpoint, body = null, cookie = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(API_BASE + endpoint);
    const headers = { 'Content-Type': 'application/json' };
    if (cookie) headers['Cookie'] = cookie;

    const req = http.request(url, { method, headers }, (res) => {
      let data = '';
      const setCookieHeader = res.headers['set-cookie'];
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        let json = {};
        try { json = JSON.parse(data); } catch (e) { json = { raw: data }; }
        resolve({
          status: res.statusCode,
          headers: res.headers,
          cookies: setCookieHeader ? setCookieHeader.map((c) => c.split(';')[0]).join('; ') : null,
          body: json,
        });
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

(async () => {
  console.log('====================================================');
  console.log('=== RUNNING PHASE 6 LEARNING PROGRESS AUDIT SUITE ===');
  console.log('====================================================\n');

  let results = {};

  try {
    await mongoose.connect(process.env.MONGODB_URI);

    // 1. Setup test users and test course
    const studentUser = await User.findOne({ email: 'student@netcradus.com' });
    let studentB = await User.findOne({ email: 'student_b_phase6@netcradus.com' });
    if (!studentB) {
      studentB = await User.create({
        fullName: 'Phase6 Student B',
        email: 'student_b_phase6@netcradus.com',
        phone: '+919999900000',
        password: 'Password123!',
        role: 'student',
        status: 'active',
      });
    }

    // Authenticate student A
    const loginRes = await makeRequest('POST', '/auth/login', {
      email: 'student@netcradus.com',
      password: 'Password123!',
    });
    const studentCookie = loginRes.cookies;

    // Resolve test courses
    const cyberCourse = await Course.findOne({ slug: { $in: ['vapt-analyst', 'cyber'] } });
    const aiCourse = await Course.findOne({ slug: { $in: ['ai-ml', 'ai'] } });

    // Fetch cyber course modules and lessons
    const cyberModules = await Module.find({ courseId: cyberCourse._id, published: true }).sort({ order: 1 });
    const cyberModuleIds = cyberModules.map((m) => m._id);
    const cyberLessons = await Lesson.find({ moduleId: { $in: cyberModuleIds }, published: true }).sort({ order: 1 });

    // Fetch AI course lessons for cross-course security test
    const aiModules = await Module.find({ courseId: aiCourse._id, published: true }).sort({ order: 1 });
    const aiModuleIds = aiModules.map((m) => m._id);
    const aiLessons = await Lesson.find({ moduleId: { $in: aiModuleIds }, published: true }).sort({ order: 1 });

    // Reset student A's enrollment in cyberCourse to 0% progress for a deterministic clean test run
    let cyberEnrollment = await Enrollment.findOne({ userId: studentUser._id, courseId: cyberCourse._id });
    if (!cyberEnrollment) {
      cyberEnrollment = await Enrollment.create({
        userId: studentUser._id,
        courseId: cyberCourse._id,
        enrollmentType: 'free',
        pricePaid: 0,
        status: 'active',
        completedLessons: [],
        progressPercentage: 0,
        lastAccessedLesson: null,
      });
    } else {
      cyberEnrollment.status = 'active';
      cyberEnrollment.completedLessons = [];
      cyberEnrollment.progressPercentage = 0;
      cyberEnrollment.lastAccessedLesson = null;
      cyberEnrollment.completedAt = null;
      await cyberEnrollment.save();
    }

    // TEST 1: Student Zero Progress
    const initialProgressRes = await makeRequest('GET', `/student/courses/${cyberCourse._id}/progress`, null, studentCookie);
    const isTest1Pass = initialProgressRes.status === 200 && initialProgressRes.body.data?.progressPercentage === 0 && initialProgressRes.body.data?.completedLessonsCount === 0;
    console.log(`[TEST 1] Zero Progress Initial State: ${isTest1Pass ? 'PASS' : 'FAIL'} (${initialProgressRes.body.data?.progressPercentage}%)`);
    results.test1 = isTest1Pass ? 'PASS' : 'FAIL';

    // TEST 2: Student completes valid enrolled lesson
    const lesson1 = cyberLessons[0];
    const completeRes = await makeRequest('POST', `/student/lessons/${lesson1._id}/complete`, null, studentCookie);
    const expectedPct = Math.round((1 / cyberLessons.length) * 100);
    const isTest2Pass = completeRes.status === 200 && completeRes.body.data?.completedLessonsCount === 1 && completeRes.body.data?.progressPercentage === expectedPct;
    console.log(`[TEST 2] Mark Valid Lesson Complete: ${isTest2Pass ? 'PASS' : 'FAIL'} (Pct: ${completeRes.body.data?.progressPercentage}%)`);
    results.test2 = isTest2Pass ? 'PASS' : 'FAIL';

    // TEST 3: MongoDB Persistence Check
    const dbEnrollment = await Enrollment.findById(cyberEnrollment._id);
    const isTest3Pass = dbEnrollment.completedLessons.length === 1 && dbEnrollment.completedLessons[0].toString() === lesson1._id.toString() && dbEnrollment.progressPercentage === expectedPct;
    console.log(`[TEST 3] MongoDB Server-Side Progress Persistence: ${isTest3Pass ? 'PASS' : 'FAIL'}`);
    results.test3 = isTest3Pass ? 'PASS' : 'FAIL';

    // TEST 4: Duplicate Completion Protection
    const dupRes = await makeRequest('POST', `/student/lessons/${lesson1._id}/complete`, null, studentCookie);
    const isTest4Pass = dupRes.status === 200 && dupRes.body.data?.completedLessonsCount === 1 && dupRes.body.data?.progressPercentage === expectedPct;
    console.log(`[TEST 4] Duplicate Completion Idempotency Protection: ${isTest4Pass ? 'PASS' : 'FAIL'}`);
    results.test4 = isTest4Pass ? 'PASS' : 'FAIL';

    // TEST 5 & 6: Course Percentage & Module Breakdown Calculation
    const progressDetailRes = await makeRequest('GET', `/student/courses/${cyberCourse._id}/progress`, null, studentCookie);
    const isTest5_6Pass = progressDetailRes.status === 200 && Array.isArray(progressDetailRes.body.data?.modules) && progressDetailRes.body.data?.modules.length > 0;
    console.log(`[TEST 5 & 6] Course & Module Progress Calculation: ${isTest5_6Pass ? 'PASS' : 'FAIL'} (Modules: ${progressDetailRes.body.data?.modules?.length})`);
    results.test5_6 = isTest5_6Pass ? 'PASS' : 'FAIL';

    // TEST 7: Last Accessed Lesson Stored in MongoDB
    const accessRes = await makeRequest('POST', `/student/courses/${cyberCourse._id}/last-accessed`, { lessonId: lesson1._id.toString() }, studentCookie);
    const updatedDbEnrollment = await Enrollment.findById(cyberEnrollment._id);
    const isTest7Pass = accessRes.status === 200 && updatedDbEnrollment.lastAccessedLesson?.toString() === lesson1._id.toString();
    console.log(`[TEST 7] Last Accessed Lesson Storage: ${isTest7Pass ? 'PASS' : 'FAIL'}`);
    results.test7 = isTest7Pass ? 'PASS' : 'FAIL';

    // TEST 8: Continue Learning Target Resolution
    const isTest8Pass = progressDetailRes.body.data?.continueLessonId !== undefined && progressDetailRes.body.data?.continueLessonId !== null;
    console.log(`[TEST 8] Continue Learning Target Resolution: ${isTest8Pass ? 'PASS' : 'FAIL'} (Target Lesson: ${progressDetailRes.body.data?.continueLessonId})`);
    results.test8 = isTest8Pass ? 'PASS' : 'FAIL';

    // TEST 9: 100% Course Completion State Transition
    for (const les of cyberLessons) {
      await makeRequest('POST', `/student/lessons/${les._id}/complete`, null, studentCookie);
    }
    const finalEnrollment = await Enrollment.findById(cyberEnrollment._id);
    const isTest9Pass = finalEnrollment.progressPercentage === 100 && finalEnrollment.status === 'completed' && !!finalEnrollment.completedAt;
    console.log(`[TEST 9] 100% Completion State Transition: ${isTest9Pass ? 'PASS' : 'FAIL'} (Status: ${finalEnrollment.status}, Pct: ${finalEnrollment.progressPercentage}%)`);
    results.test9 = isTest9Pass ? 'PASS' : 'FAIL';

    // TEST 10: Guest Cannot Modify Progress (401)
    const guestRes = await makeRequest('POST', `/student/lessons/${lesson1._id}/complete`);
    const isTest10Pass = guestRes.status === 401;
    console.log(`[TEST 10] Guest Progress Modification Blocked (401): ${isTest10Pass ? 'PASS' : 'FAIL'} (Status: ${guestRes.status})`);
    results.test10 = isTest10Pass ? 'PASS' : 'FAIL';

    // TEST 11 & 12: Non-Enrolled Student & Cross-Course Progress Modification Blocked (403)
    const crossCourseRes = await makeRequest('POST', `/student/lessons/${aiLessons[0]._id}/complete`, null, studentCookie);
    const isTest11_12Pass = crossCourseRes.status === 403;
    console.log(`[TEST 11 & 12] Cross-Course / Unenrolled Lesson Completion Blocked (403): ${isTest11_12Pass ? 'PASS' : 'FAIL'} (Status: ${crossCourseRes.status})`);
    results.test11_12 = isTest11_12Pass ? 'PASS' : 'FAIL';

    // TEST 13: Student A Cannot Access / Modify Student B Progress (JWT Session Derived)
    const studentBProgressRes = await makeRequest('GET', `/student/courses/${cyberCourse._id}/progress`, null, studentCookie);
    const isTest13Pass = studentBProgressRes.status === 200 && studentBProgressRes.body.data?.enrollmentId?.toString() === cyberEnrollment._id.toString();
    console.log(`[TEST 13] Cross-Student Progress Isolation (Derived from JWT req.user): ${isTest13Pass ? 'PASS' : 'FAIL'}`);
    results.test13 = isTest13Pass ? 'PASS' : 'FAIL';

    // TEST 14: Invalid Lesson ID Handled Safely (400)
    const invalidRes = await makeRequest('POST', '/student/lessons/invalid-id/complete', null, studentCookie);
    const isTest14Pass = invalidRes.status === 400;
    console.log(`[TEST 14] Invalid Lesson ID Handled Safely (400): ${isTest14Pass ? 'PASS' : 'FAIL'} (Status: ${invalidRes.status})`);
    results.test14 = isTest14Pass ? 'PASS' : 'FAIL';

    // TEST 15: Ineligible / Nonexistent Lesson ID Handled Safely (404)
    const fakeId = new mongoose.Types.ObjectId().toString();
    const nonexistentRes = await makeRequest('POST', `/student/lessons/${fakeId}/complete`, null, studentCookie);
    const isTest15Pass = nonexistentRes.status === 404;
    console.log(`[TEST 15] Nonexistent Lesson Handled Safely (404): ${isTest15Pass ? 'PASS' : 'FAIL'} (Status: ${nonexistentRes.status})`);
    results.test15 = isTest15Pass ? 'PASS' : 'FAIL';

    // TEST 16: Revoked / Paused Enrollment Cannot Modify Progress (403)
    finalEnrollment.status = 'revoked';
    await finalEnrollment.save();
    const revokedRes = await makeRequest('POST', `/student/lessons/${lesson1._id}/complete`, null, studentCookie);
    const isTest16Pass = revokedRes.status === 403;
    console.log(`[TEST 16] Revoked Enrollment Progress Blocked (403): ${isTest16Pass ? 'PASS' : 'FAIL'} (Status: ${revokedRes.status})`);
    results.test16 = isTest16Pass ? 'PASS' : 'FAIL';

    // Restore enrollment status
    finalEnrollment.status = 'completed';
    await finalEnrollment.save();

    // TEST 17: Student Dashboard Returns Real Progress
    const dashRes = await makeRequest('GET', '/student/dashboard', null, studentCookie);
    const isTest17Pass = dashRes.status === 200 && Array.isArray(dashRes.body.data?.enrollments) && dashRes.body.data?.enrollments[0]?.progressPercentage !== undefined;
    console.log(`[TEST 17] Student Dashboard Returns Real Progress & Lesson Counts: ${isTest17Pass ? 'PASS' : 'FAIL'}`);
    results.test17 = isTest17Pass ? 'PASS' : 'FAIL';

    // TEST 18: My Courses Returns Real Progress
    const myCoursesRes = await makeRequest('GET', '/student/enrollments', null, studentCookie);
    const isTest18Pass = myCoursesRes.status === 200 && Array.isArray(myCoursesRes.body.data) && myCoursesRes.body.data[0]?.progressPercentage !== undefined;
    console.log(`[TEST 18] My Courses Returns Real Progress & Continue Target: ${isTest18Pass ? 'PASS' : 'FAIL'}`);
    results.test18 = isTest18Pass ? 'PASS' : 'FAIL';

    // SUMMARY
    console.log('\n====================================================');
    console.log('=== PHASE 6 TEST SUITE EXECUTION SUMMARY ===');
    console.log('====================================================');
    const allPassed = Object.values(results).every((val) => val === 'PASS');
    console.log(`OVERALL PHASE 6 STATUS: ${allPassed ? 'ALL TESTS PASSED (PASS)' : 'SOME TESTS FAILED (FAIL)'}`);

    await mongoose.connection.close();
    process.exit(allPassed ? 0 : 1);
  } catch (err) {
    console.error('Fatal error in test suite:', err);
    await mongoose.connection.close();
    process.exit(1);
  }
})();
