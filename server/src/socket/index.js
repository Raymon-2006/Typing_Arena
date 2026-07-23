// server/src/seeders/index.js
const mongoose = require('mongoose');
const connectDB = require('../config/database');
const WordPool = require('../models/WordPool');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

const seedDatabase = async () => {
  try {
    await connectDB();
    console.log('Starting database seeding...');

    // Clear existing data (optional)
    // await WordPool.deleteMany({});
    // await User.deleteMany({});

    // Initialize word pools with hybrid generator
    await WordPool.initializePools();
    console.log('Word pools initialized');

    // Create admin user if doesn't exist
    const adminExists = await User.findOne({ role: 'admin' });
    if (!adminExists) {
      const admin = new User({
        username: 'admin',
        email: process.env.ADMIN_EMAIL || 'admin@typefight.com',
        password: process.env.ADMIN_PASSWORD || 'admin123',
        department: 'common',
        role: 'admin',
        elo: 1500
      });
      await admin.save();
      console.log('Admin user created');
    }

    // Create sample users for testing (optional)
    const sampleUsers = [
      { username: 'CS_Rahul', email: 'rahul@test.com', department: 'computer' },
      { username: 'Civil_Anjali', email: 'anjali@test.com', department: 'civil' },
      { username: 'Arch_Priya', email: 'priya@test.com', department: 'architecture' },
      { username: 'Common_Dev', email: 'dev@test.com', department: 'common' }
    ];

    for (const userData of sampleUsers) {
      const exists = await User.findOne({ username: userData.username });
      if (!exists) {
        const user = new User({
          ...userData,
          password: 'password123',
          elo: 1200 + Math.floor(Math.random() * 200)
        });
        await user.save();
        console.log(`Sample user created: ${userData.username}`);
      }
    }

    console.log('Database seeding completed!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedDatabase();