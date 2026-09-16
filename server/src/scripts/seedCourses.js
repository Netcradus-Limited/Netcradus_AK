const dotenv = require('dotenv');
const path = require('path');
const mongoose = require('mongoose');

// Load environment variables from the server root directory
dotenv.config({ path: path.join(__dirname, '../../.env') });

const connectDB = require('../config/db');
const Course = require('../models/Course');
const coursesSeedData = require('../seed/courses.seed');

const seedCourses = async () => {
  try {
    // 1. Connect MongoDB
    console.log('[Seed] Initializing database connection...');
    await connectDB();

    console.log('[Seed] Starting course upsert seeding operation...');

    let insertedCount = 0;
    let updatedCount = 0;

    const legacySlugMap = {
      'vapt-analyst': 'cyber',
      'ai-ml': 'ai',
      'cloud-engineer': 'cloud',
      'soc-analyst': 'soc',
    };

    for (const course of coursesSeedData) {
      const legacySlug = legacySlugMap[course.slug];
      
      // Look for course by current new slug or legacy slug
      let existingCourse = await Course.findOne({
        $or: [
          { slug: course.slug },
          ...(legacySlug ? [{ slug: legacySlug }] : [])
        ]
      });

      if (existingCourse) {
        // Update existing course document in-place preserving _id
        await Course.updateOne(
          { _id: existingCourse._id },
          { $set: course }
        );
        updatedCount++;
      } else {
        // Insert new course
        await Course.create(course);
        insertedCount++;
      }
    }

    // safe summary display
    console.log('[Seed Success] Seeding operation completed successfully!');
    console.log(`[Seed Summary] Total processed: ${coursesSeedData.length} | Newly Created: ${insertedCount} | Updated: ${updatedCount}`);

  } catch (error) {
    console.error(`[Seed Error] Seeding operation failed: ${error.message}`);
  } finally {
    // Close Mongoose connection cleanly
    await mongoose.connection.close();
    console.log('[Seed] Database connection closed cleanly.');
    process.exit(0);
  }
};

seedCourses();
