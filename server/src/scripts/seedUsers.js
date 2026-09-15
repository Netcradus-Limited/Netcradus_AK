const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const User = require('../models/User');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const seedUsers = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      console.error('MONGODB_URI missing from .env');
      process.exit(1);
    }

    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB for user seeding...');

    const usersToSeed = [
      {
        fullName: 'Test Student',
        email: 'student@netcradus.com',
        phone: '+919876543210',
        password: 'Password123!',
        role: 'student',
      },
      {
        fullName: 'Test Admin',
        email: 'admin@netcradus.com',
        phone: '+919876543211',
        password: 'Password123!',
        role: 'admin',
      },
      {
        fullName: 'Test Super Admin',
        email: 'superadmin@netcradus.com',
        phone: '+919876543212',
        password: 'Password123!',
        role: 'super_admin',
      },
    ];

    for (const userData of usersToSeed) {
      let user = await User.findOne({ email: userData.email });
      if (!user) {
        user = await User.create(userData);
        console.log(`Created user: ${userData.email} (${userData.role})`);
      } else {
        user.role = userData.role;
        user.password = userData.password;
        await user.save();
        console.log(`Updated user: ${userData.email} (${userData.role})`);
      }
    }

    console.log('Seeding completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Error seeding users:', err);
    process.exit(1);
  }
};

seedUsers();
