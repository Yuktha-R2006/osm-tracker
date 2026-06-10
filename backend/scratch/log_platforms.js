require('dotenv').config();
const mongoose = require('mongoose');
const OTTPlatform = require('../models/PlatformModel');

async function logPlatforms() {
  try {
    const connStr = process.env.MONGO_URI || process.env.MONGODB_URI;
    await mongoose.connect(connStr);
    console.log('Connected to DB');

    const platforms = await OTTPlatform.find({});
    console.log('Total Platforms:', platforms.length);
    platforms.forEach(p => {
      console.log(`Platform ID: ${p._id}`);
      console.log(`- Name: ${p.name}`);
      console.log(`- Logo: ${p.logo}`);
      console.log(`- Status: ${p.status}`);
      console.log(`- ThemeColor: ${p.themeColor}`);
      console.log(`- AccentColor: ${p.accentColor}`);
      console.log('-------------------------');
    });

    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

logPlatforms();
