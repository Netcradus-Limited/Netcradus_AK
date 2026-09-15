const http = require('http');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const API_BASE = 'http://localhost:5001/api/v1';

function makeRequest(method, endpoint, body = null, cookie = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(API_BASE + endpoint);
    const headers = {
      'Content-Type': 'application/json',
    };
    if (cookie) {
      headers['Cookie'] = cookie;
    }

    const req = http.request(
      url,
      {
        method,
        headers,
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          let json = {};
          try {
            json = JSON.parse(data);
          } catch (e) {
            json = { raw: data };
          }
          const setCookieHeader = res.headers['set-cookie'];
          resolve({
            status: res.statusCode,
            headers: res.headers,
            cookies: setCookieHeader ? setCookieHeader.map((c) => c.split(';')[0]).join('; ') : null,
            body: json,
          });
        });
      }
    );

    req.on('error', (err) => reject(err));

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function runPhase3Tests() {
  console.log('====================================================');
  console.log('=== RUNNING PHASE 3 ADMIN PANEL INTEGRATION TEST ===');
  console.log('====================================================\n');

  let results = {};

  try {
    // Authenticate Admin
    const adminLoginRes = await makeRequest('POST', '/auth/login', {
      email: 'admin@netcradus.com',
      password: 'Password123!',
    });
    const adminCookie = adminLoginRes.cookies;

    // Authenticate Student
    const studentLoginRes = await makeRequest('POST', '/auth/login', {
      email: 'student@netcradus.com',
      password: 'Password123!',
    });
    const studentCookie = studentLoginRes.cookies;

    // TEST 1: Admin Stats Endpoint
    const statsRes = await makeRequest('GET', '/admin/dashboard/stats', null, adminCookie);
    const isTest1Pass = statsRes.status === 200 && statsRes.body.success && statsRes.body.data?.stats?.totalStudents !== undefined;
    console.log(`[TEST 1] Admin Dashboard Stats: ${isTest1Pass ? 'PASS' : 'FAIL'} (Students: ${statsRes.body.data?.stats?.totalStudents}, Courses: ${statsRes.body.data?.stats?.totalCourses})`);
    results.test1 = isTest1Pass ? 'PASS' : 'FAIL';

    // TEST 2: Student Login Session Role
    const isTest2Pass = studentLoginRes.status === 200 && studentLoginRes.body.data?.role === 'student';
    console.log(`[TEST 2] Student Login Session Role: ${isTest2Pass ? 'PASS' : 'FAIL'}`);
    results.test2 = isTest2Pass ? 'PASS' : 'FAIL';

    // TEST 3 & 4: Student accessing Admin Endpoint
    const studentAdminRes = await makeRequest('GET', '/admin/dashboard/stats', null, studentCookie);
    const isTest4Pass = studentAdminRes.status === 403;
    console.log(`[TEST 3 & 4] Student Blocked from Admin API (HTTP 403): ${isTest4Pass ? 'PASS' : 'FAIL'} (Status: ${studentAdminRes.status})`);
    results.test3_4 = isTest4Pass ? 'PASS' : 'FAIL';

    // TEST 5: Guest accessing Admin Endpoint
    const guestAdminRes = await makeRequest('GET', '/admin/dashboard/stats');
    const isTest5Pass = guestAdminRes.status === 401;
    console.log(`[TEST 5] Guest Blocked from Admin API (HTTP 401): ${isTest5Pass ? 'PASS' : 'FAIL'} (Status: ${guestAdminRes.status})`);
    results.test5 = isTest5Pass ? 'PASS' : 'FAIL';

    // TEST 6: Admin Loads Student List
    const studentsRes = await makeRequest('GET', '/admin/students', null, adminCookie);
    const isTest6Pass = studentsRes.status === 200 && Array.isArray(studentsRes.body.data);
    console.log(`[TEST 6] Admin Loads Students List: ${isTest6Pass ? 'PASS' : 'FAIL'} (Count: ${studentsRes.body.count})`);
    results.test6 = isTest6Pass ? 'PASS' : 'FAIL';

    // TEST 7: Admin Creates Course
    const testSlug = `test-course-${Date.now()}`;
    const createCourseRes = await makeRequest('POST', '/admin/courses', {
      title: 'Automated Test Course',
      slug: testSlug,
      category: 'CYBER SECURITY',
      level: 'Advanced',
      price: 149900,
      duration: '4 Weeks',
      published: false,
    }, adminCookie);
    const createdCourseId = createCourseRes.body.data?._id;
    const isTest7Pass = createCourseRes.status === 201 && !!createdCourseId;
    console.log(`[TEST 7] Admin Creates Course in MongoDB: ${isTest7Pass ? 'PASS' : 'FAIL'} (Course ID: ${createdCourseId})`);
    results.test7 = isTest7Pass ? 'PASS' : 'FAIL';

    // TEST 8: Admin Edits Course
    let isTest8Pass = false;
    if (createdCourseId) {
      const updateCourseRes = await makeRequest('PUT', `/admin/courses/${createdCourseId}`, {
        title: 'Updated Automated Test Course Title',
      }, adminCookie);
      isTest8Pass = updateCourseRes.status === 200 && updateCourseRes.body.data?.title === 'Updated Automated Test Course Title';
    }
    console.log(`[TEST 8] Admin Edits Course Persisted: ${isTest8Pass ? 'PASS' : 'FAIL'}`);
    results.test8 = isTest8Pass ? 'PASS' : 'FAIL';

    // TEST 9: Course Deletion & Protection Cleanup
    let isTest9Pass = false;
    if (createdCourseId) {
      const deleteCourseRes = await makeRequest('DELETE', `/admin/courses/${createdCourseId}`, null, adminCookie);
      isTest9Pass = deleteCourseRes.status === 200;
    }
    console.log(`[TEST 9] Safe Course Deletion: ${isTest9Pass ? 'PASS' : 'FAIL'}`);
    results.test9 = isTest9Pass ? 'PASS' : 'FAIL';

    // TEST 10: Admin Views Enrollments List
    const enrollmentsRes = await makeRequest('GET', '/admin/enrollments', null, adminCookie);
    const isTest10Pass = enrollmentsRes.status === 200 && Array.isArray(enrollmentsRes.body.data);
    console.log(`[TEST 10] Admin Views Real Enrollments: ${isTest10Pass ? 'PASS' : 'FAIL'} (Total: ${enrollmentsRes.body.total})`);
    results.test10 = isTest10Pass ? 'PASS' : 'FAIL';

    // TEST 11: Admin Views Inquiries List
    const inquiriesRes = await makeRequest('GET', '/admin/inquiries', null, adminCookie);
    const isTest11Pass = inquiriesRes.status === 200 && Array.isArray(inquiriesRes.body.data);
    console.log(`[TEST 11] Admin Views Real Inquiries: ${isTest11Pass ? 'PASS' : 'FAIL'} (Total: ${inquiriesRes.body.total})`);
    results.test11 = isTest11Pass ? 'PASS' : 'FAIL';

    // TEST 12: Logout Invalidation
    const logoutRes = await makeRequest('POST', '/auth/logout', null, adminCookie);
    const postLogoutStats = await makeRequest('GET', '/admin/dashboard/stats', null, logoutRes.cookies);
    const isTest12Pass = postLogoutStats.status === 401;
    console.log(`[TEST 12] Logout Invalidation: ${isTest12Pass ? 'PASS' : 'FAIL'}`);
    results.test12 = isTest12Pass ? 'PASS' : 'FAIL';

    // SUMMARY
    console.log('\n====================================================');
    console.log('=== PHASE 3 TEST SUITE EXECUTION SUMMARY ===');
    console.log('====================================================');
    const allPassed = Object.values(results).every((val) => val === 'PASS');
    console.log(`OVERALL STATUS: ${allPassed ? 'ALL TESTS PASSED (PASS)' : 'SOME TESTS FAILED (FAIL)'}`);

  } catch (err) {
    console.error('Fatal error in test suite:', err);
  }
}

runPhase3Tests();
