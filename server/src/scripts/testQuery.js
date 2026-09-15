const mongoose = require('mongoose');
require('dotenv').config();
const User = require('../models/User');
const Enrollment = require('../models/Enrollment');
const Lesson = require('../models/Lesson');

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const user = await User.findOne({ email: 'student@netcradus.com' });
  const lesson = await Lesson.findOne({ title: '1.3 Active Reconnaissance & Nmap Port Scanning' }).populate('courseId');
  console.log('User ID:', user._id);
  console.log('Lesson CourseID:', lesson ? lesson.courseId._id : null);
  
  if (user && lesson) {
    const enrollment = await Enrollment.findOne({
      userId: user._id,
      courseId: lesson.courseId._id,
      status: { $in: ['active', 'completed'] },
    });
    console.log('Found Enrollment:', enrollment);
  }
  mongoose.disconnect();
  process.exit(0);
});
