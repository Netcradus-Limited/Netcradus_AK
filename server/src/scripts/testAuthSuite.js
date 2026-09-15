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

async function runTests() {
  console.log('=== RUNNING AUTHENTICATION & AUTHORIZATION BACKEND AUDIT SUITE ===\n');

  let results = {};

  // Test 1: Student Login
  try {
    const studentRes = await makeRequest('POST', '/auth/login', {
      email: 'student@netcradus.com',
      password: 'Password123!',
    });
    const studentCookie = studentRes.cookies;
    const isStudentOk = studentRes.status === 200 && studentRes.body.data.role === 'student' && !!studentCookie;
    console.log(`[TEST 1] Student Login: ${isStudentOk ? 'PASS' : 'FAIL'} (Status: ${studentRes.status}, Role: ${studentRes.body.data?.role})`);
    results.studentLogin = isStudentOk ? 'PASS' : 'FAIL';

    // Test 2: Admin Login
    const adminRes = await makeRequest('POST', '/auth/login', {
      email: 'admin@netcradus.com',
      password: 'Password123!',
    });
    const adminCookie = adminRes.cookies;
    const isAdminOk = adminRes.status === 200 && adminRes.body.data.role === 'admin' && !!adminCookie;
    console.log(`[TEST 2] Admin Login: ${isAdminOk ? 'PASS' : 'FAIL'} (Status: ${adminRes.status}, Role: ${adminRes.body.data?.role})`);
    results.adminLogin = isAdminOk ? 'PASS' : 'FAIL';

    // Test 3: Super Admin Login
    const superAdminRes = await makeRequest('POST', '/auth/login', {
      email: 'superadmin@netcradus.com',
      password: 'Password123!',
    });
    const superAdminCookie = superAdminRes.cookies;
    const isSuperAdminOk = superAdminRes.status === 200 && superAdminRes.body.data.role === 'super_admin' && !!superAdminCookie;
    console.log(`[TEST 3] Super Admin Login: ${isSuperAdminOk ? 'PASS' : 'FAIL'} (Status: ${superAdminRes.status}, Role: ${superAdminRes.body.data?.role})`);
    results.superAdminLogin = isSuperAdminOk ? 'PASS' : 'FAIL';

    // Test 4: Guest Access to Protected Backend Route
    const guestRes = await makeRequest('GET', '/auth/me');
    const isGuestBlocked = guestRes.status === 401;
    console.log(`[TEST 4] Guest Access Blocked: ${isGuestBlocked ? 'PASS' : 'FAIL'} (Status: ${guestRes.status})`);
    results.guestBlocked = isGuestBlocked ? 'PASS' : 'FAIL';

    // Test 5: Student Access to Admin Endpoint
    const studentAdminRes = await makeRequest('GET', '/admin/dashboard-stats', null, studentCookie);
    const isStudentBlockedFromAdmin = studentAdminRes.status === 403;
    console.log(`[TEST 5] Student Access to Admin Endpoint Blocked: ${isStudentBlockedFromAdmin ? 'PASS' : 'FAIL'} (Status: ${studentAdminRes.status})`);
    results.studentAdminBlocked = isStudentBlockedFromAdmin ? 'PASS' : 'FAIL';

    // Test 6: Admin Access to Admin Endpoint
    const adminEndpointRes = await makeRequest('GET', '/admin/dashboard-stats', null, adminCookie);
    const isAdminAllowed = adminEndpointRes.status === 200 && adminEndpointRes.body.success === true;
    console.log(`[TEST 6] Admin Access to Admin Endpoint Allowed: ${isAdminAllowed ? 'PASS' : 'FAIL'} (Status: ${adminEndpointRes.status})`);
    results.adminAllowed = isAdminAllowed ? 'PASS' : 'FAIL';

    // Test 7: Public Signup attempt with role override ('admin')
    const testSignupEmail = `signup_${Date.now()}@netcradus.com`;
    const signupRes = await makeRequest('POST', '/auth/signup', {
      fullName: 'Malicious Signup Attempt',
      email: testSignupEmail,
      phone: '+919999988888',
      password: 'Password123!',
      confirmPassword: 'Password123!',
      role: 'admin', // Attempting privilege escalation
    });
    const isSignupStudentOnly = signupRes.status === 201 && signupRes.body.data?.role === 'student';
    console.log(`[TEST 7] Signup Prevents Admin Selection (Role = student): ${isSignupStudentOnly ? 'PASS' : 'FAIL'} (Status: ${signupRes.status}, Role returned: ${signupRes.body.data?.role})`);
    results.signupStudentOnly = isSignupStudentOnly ? 'PASS' : 'FAIL';

    // Test 8: Logout Invalidation
    const logoutRes = await makeRequest('POST', '/auth/logout', null, studentCookie);
    const mePostLogout = await makeRequest('GET', '/auth/me', null, logoutRes.cookies);
    const isLoggedOut = logoutRes.status === 200 && mePostLogout.status === 401;
    console.log(`[TEST 8] Logout Invalidation: ${isLoggedOut ? 'PASS' : 'FAIL'} (Me status post-logout: ${mePostLogout.status})`);
    results.logoutInvalidation = isLoggedOut ? 'PASS' : 'FAIL';

  } catch (err) {
    console.error('Error executing test suite:', err);
  }
}

runTests();
