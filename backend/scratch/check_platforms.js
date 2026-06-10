require('dotenv').config();
const mongoose = require('mongoose');
const Platform = require('../models/PlatformModel');

async function run() {
  try {
    await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    const platforms = await Platform.find({});
    console.log(`Total platforms found: ${platforms.length}`);
    platforms.forEach(p => {
      console.log(`- ID: ${p._id}`);
      console.log(`  Name: ${p.name}`);
      console.log(`  Logo: ${p.logo}`);
      console.log(`  Status: ${p.status}`);
      console.log(`  AccentColor: ${p.accentColor}`);
      console.log('------------------------------');
    });
    
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

run();
