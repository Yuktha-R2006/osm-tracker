const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

dotenv.config();

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected for Seeding Admin...');

    // Check if admin already exists
    const adminExists = await User.findOne({ email: 'admin@osm.com' });
    
    if (adminExists) {
      console.log('Admin user already exists!');
      process.exit(0);
    }

    // Create admin user
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);

    await User.create({
      name: 'System Admin',
      email: 'admin@osm.com',
      password: hashedPassword,
      role: 'admin'
    });

    console.log('Admin seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

seedAdmin();
