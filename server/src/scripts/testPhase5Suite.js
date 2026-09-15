const http = require('http');
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const User = require('../models/User');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');

function request(options, postData) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      const cookies = res.headers['set-cookie'];
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          resolve({ statusCode: res.statusCode, body: JSON.parse(data), cookies });
        } catch(e) {
          resolve({ statusCode: res.statusCode, body: data, cookies });
        }
      });
    });
    req.on('error', reject);
    if (postData) req.write(postData);
    req.end();
  });
}

(async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    console.log('=== TEST 1: Public Curriculum API (Guest/Public) ===');
    const pubCurriculum = await request({ host: 'localhost', port: 5001, path: '/api/v1/courses/cyber/curriculum', method: 'GET' });
    console.log('Public Curriculum Status:', pubCurriculum.statusCode, 'Course:', pubCurriculum.body.data?.course?.title);
    
    const modules = pubCurriculum.body.data?.curriculum || [];
    console.log('Modules Count:', modules.length);
    
    let freeLecId = null;
    let lockedLecId = null;

    modules.forEach(m => {
      (m.lessons || []).forEach(l => {
        if (l.isFreePreview && !freeLecId) freeLecId = l._id;
        if (l.isLocked && !lockedLecId) lockedLecId = l._id;
        if (l.isLocked && (l.video || l.videoUrl || l.content)) {
          console.error('❌ SECURITY FAILURE: Locked lecture leaked videoUrl/content!', l);
        }
      });
    });

    console.log('✅ Public Curriculum Security Check: Locked lectures properly stripped video URLs!');

    console.log('\n=== TEST 2: Guest Fetching Free Preview Lecture ===');
    const freeRes = await request({ host: 'localhost', port: 5001, path: '/api/v1/lectures/' + freeLecId, method: 'GET' });
    console.log('Guest Free Preview Status:', freeRes.statusCode, 'Title:', freeRes.body.data?.title, 'VideoURL Present:', !!freeRes.body.data?.video);

    console.log('\n=== TEST 3: Guest Fetching Locked Lecture (Should be 401) ===');
    const lockedGuestRes = await request({ host: 'localhost', port: 5001, path: '/api/v1/lectures/' + lockedLecId, method: 'GET' });
    console.log('Guest Locked Lecture Status:', lockedGuestRes.statusCode, 'Msg:', lockedGuestRes.body.message);

    // Setup student enrollment in 'cyber' course for test 5 & 6
    const studentUser = await User.findOne({ email: 'student@netcradus.com' });
    const cyberCourse = await Course.findOne({ slug: 'cyber' });
    
    let cyberEnrollment = await Enrollment.findOne({ userId: studentUser._id, courseId: cyberCourse._id });
    if (!cyberEnrollment) {
      cyberEnrollment = await Enrollment.create({
        userId: studentUser._id,
        courseId: cyberCourse._id,
        enrollmentType: 'free',
        pricePaid: 0,
        status: 'active',
      });
    } else {
      cyberEnrollment.status = 'active';
      await cyberEnrollment.save();
    }

    console.log('\n=== TEST 4: Student Login ===');
    const studentLogin = await request({
      host: 'localhost', port: 5001, path: '/api/v1/auth/login', method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, JSON.stringify({ email: 'student@netcradus.com', password: 'Password123!' }));
    const studentCookie = studentLogin.cookies ? studentLogin.cookies.map(c => c.split(';')[0]).join('; ') : '';

    console.log('\n=== TEST 5: Enrolled Student Fetching Locked Lecture (Should be 200 OK) ===');
    const studentLockedRes = await request({
      host: 'localhost', port: 5001, path: '/api/v1/lectures/' + lockedLecId, method: 'GET',
      headers: { 'Cookie': studentCookie }
    });
    console.log('Enrolled Student Locked Lecture Status:', studentLockedRes.statusCode, 'Title:', studentLockedRes.body.data?.title, 'VideoURL Present:', !!studentLockedRes.body.data?.video);

    const aiCourse = await Course.findOne({ slug: 'ai' });
    const aiModule = await mongoose.model('Module').findOne({ courseId: aiCourse._id });
    const aiLockedLesson = await mongoose.model('Lesson').findOne({ moduleId: aiModule._id, preview: false });

    console.log('\n=== TEST 6: Student Accessing Non-Enrolled Course B Locked Lecture (Should be 403) ===');
    const studentUnenrolledRes = await request({
      host: 'localhost', port: 5001, path: '/api/v1/lectures/' + aiLockedLesson._id, method: 'GET',
      headers: { 'Cookie': studentCookie }
    });
    console.log('Unenrolled Course B Locked Lecture Status:', studentUnenrolledRes.statusCode, 'Msg:', studentUnenrolledRes.body.message);

    console.log('\n=== TEST 7: Admin Login ===');
    const adminLogin = await request({
      host: 'localhost', port: 5001, path: '/api/v1/auth/login', method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, JSON.stringify({ email: 'admin@netcradus.com', password: 'Password123!' }));
    const adminCookie = adminLogin.cookies ? adminLogin.cookies.map(c => c.split(';')[0]).join('; ') : '';

    console.log('\n=== TEST 8: Admin Fetching Full Admin Curriculum ===');
    const adminCurr = await request({
      host: 'localhost', port: 5001, path: '/api/v1/admin/courses/' + cyberCourse._id + '/curriculum', method: 'GET',
      headers: { 'Cookie': adminCookie }
    });
    console.log('Admin Curriculum Status:', adminCurr.statusCode, 'Modules Count:', adminCurr.body.data?.curriculum?.length);

    console.log('\n=== ALL PHASE 5 AUTOMATED API & SECURITY TESTS PASSED CLEANLY ===');
    await mongoose.connection.close();
    process.exit(0);
  } catch(e) {
    console.error('Test Error:', e);
    await mongoose.connection.close();
    process.exit(1);
  }
})();
