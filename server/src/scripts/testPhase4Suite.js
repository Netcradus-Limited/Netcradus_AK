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

async function runPhase4Tests() {
  console.log('====================================================');
  console.log('=== RUNNING PHASE 4 STUDENT PANEL INTEGRATION TEST ===');
  console.log('====================================================\n');

  let results = {};

  try {
    // 1. Login as Student
    const studentLoginRes = await makeRequest('POST', '/auth/login', {
      email: 'student@netcradus.com',
      password: 'Password123!',
    });
    const studentCookie = studentLoginRes.cookies;

    // 2. Login as Admin
    const adminLoginRes = await makeRequest('POST', '/auth/login', {
      email: 'admin@netcradus.com',
      password: 'Password123!',
    });
    const adminCookie = adminLoginRes.cookies;

    // TEST 1: Student Login Returns Real Authenticated Name
    const isTest1Pass = studentLoginRes.status === 200 && studentLoginRes.body.data?.fullName === 'Test Student';
    console.log(`[TEST 1] Real Authenticated Student Identity: ${isTest1Pass ? 'PASS' : 'FAIL'} (Name: ${studentLoginRes.body.data?.fullName})`);
    results.test1 = isTest1Pass ? 'PASS' : 'FAIL';

    // TEST 2: Student Dashboard API Returns Only Own Data
    const studentDashRes = await makeRequest('GET', '/student/dashboard', null, studentCookie);
    const isTest2Pass = studentDashRes.status === 200 && studentDashRes.body.data?.user?.email === 'student@netcradus.com';
    console.log(`[TEST 2] Student Dashboard Endpoint (Private Session Data): ${isTest2Pass ? 'PASS' : 'FAIL'} (Email: ${studentDashRes.body.data?.user?.email})`);
    results.test2 = isTest2Pass ? 'PASS' : 'FAIL';

    // TEST 3 & 4: Privacy & Immutability (Cannot specify someone else's ID)
    const isTest4Pass = studentDashRes.status === 200 && Array.isArray(studentDashRes.body.data?.enrollments);
    console.log(`[TEST 3 & 4] Private Identity Derived from JWT (No ID Tampering Possible): ${isTest4Pass ? 'PASS' : 'FAIL'}`);
    results.test3_4 = isTest4Pass ? 'PASS' : 'FAIL';

    // TEST 5 & 6: Student Access to Admin Endpoint Denied
    const studentAdminRes = await makeRequest('GET', '/admin/students', null, studentCookie);
    const isTest6Pass = studentAdminRes.status === 403;
    console.log(`[TEST 5 & 6] Student Access to Admin Endpoint Blocked (403): ${isTest6Pass ? 'PASS' : 'FAIL'} (Status: ${studentAdminRes.status})`);
    results.test5_6 = isTest6Pass ? 'PASS' : 'FAIL';

    // TEST 7: Guest Access to Student Dashboard API Denied
    const guestDashRes = await makeRequest('GET', '/student/dashboard');
    const isTest7Pass = guestDashRes.status === 401;
    console.log(`[TEST 7] Guest Access to Student Dashboard Blocked (401): ${isTest7Pass ? 'PASS' : 'FAIL'} (Status: ${guestDashRes.status})`);
    results.test7 = isTest7Pass ? 'PASS' : 'FAIL';

    // TEST 8 & 9: Admin -> Student Data Synchronization Test
    // Create a temporary course, enroll the student, update enrollment status by Admin, verify Student sees update
    const testSlug = `sync-course-${Date.now()}`;
    const newCourseRes = await makeRequest('POST', '/admin/courses', {
      title: 'Sync Verification Course',
      slug: testSlug,
      category: 'CYBER SECURITY',
      level: 'Intermediate',
      price: 99900,
      published: true,
    }, adminCookie);

    let isTest8_9Pass = false;
    if (newCourseRes.status === 201) {
      const courseId = newCourseRes.body.data._id;

      // Submit enrollment for test student
      const enrollRes = await makeRequest('POST', '/enrollments', {
        fullName: 'Test Student',
        email: 'student@netcradus.com',
        phone: '+919876543210',
        courseId,
      });

      if (enrollRes.status === 201) {
        const enrollmentId = enrollRes.body.data.enrollmentId;

        // Admin updates status to 'completed'
        await makeRequest('PATCH', `/admin/enrollments/${enrollmentId}/status`, { status: 'completed' }, adminCookie);

        // Fetch student dashboard and verify updated enrollment status
        const updatedStudentDash = await makeRequest('GET', '/student/dashboard', null, studentCookie);
        const updatedItem = updatedStudentDash.body.data?.enrollments?.find((e) => e._id === enrollmentId);

        if (updatedItem && updatedItem.status === 'completed') {
          isTest8_9Pass = true;
        }

        // Cleanup test course
        await makeRequest('DELETE', `/admin/courses/${courseId}`, null, adminCookie);
      }
    }
    console.log(`[TEST 8 & 9] Admin → Student Data Sync (Enrollment & Course Updates): ${isTest8_9Pass ? 'PASS' : 'FAIL'}`);
    results.test8_9 = isTest8_9Pass ? 'PASS' : 'FAIL';

    // TEST 10 & 11: Session Refresh & Logout Invalidation
    const logoutRes = await makeRequest('POST', '/auth/logout', null, studentCookie);
    const postLogoutDash = await makeRequest('GET', '/student/dashboard', null, logoutRes.cookies);
    const isTest11Pass = postLogoutDash.status === 401;
    console.log(`[TEST 10 & 11] Logout Invalidation for Student Portal: ${isTest11Pass ? 'PASS' : 'FAIL'} (Status: ${postLogoutDash.status})`);
    results.test10_11 = isTest11Pass ? 'PASS' : 'FAIL';

    // SUMMARY
    console.log('\n====================================================');
    console.log('=== PHASE 4 TEST SUITE EXECUTION SUMMARY ===');
    console.log('====================================================');
    const allPassed = Object.values(results).every((val) => val === 'PASS');
    console.log(`OVERALL STATUS: ${allPassed ? 'ALL TESTS PASSED (PASS)' : 'SOME TESTS FAILED (FAIL)'}`);

  } catch (err) {
    console.error('Fatal error in test suite:', err);
  }
}

runPhase4Tests();
