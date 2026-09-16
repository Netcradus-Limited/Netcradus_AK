const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../../.env') });

async function cleanTestCourses() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const Course = require('../models/Course');
    const result = await Course.deleteMany({
      $or: [
        { title: { $regex: 'Sync Verification Course', $options: 'i' } },
        { title: { $regex: 'Automated Test Course', $options: 'i' } },
        { slug: { $regex: 'sync-course', $options: 'i' } },
        { slug: { $regex: 'test-course', $options: 'i' } },
      ],
    });
    console.log(`Successfully cleaned up ${result.deletedCount} temporary test courses from MongoDB.`);
    await mongoose.disconnect();
  } catch (err) {
    console.error('Error cleaning test courses:', err);
    process.exit(1);
  }
}

cleanTestCourses();
