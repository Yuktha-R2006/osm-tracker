require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const OTTPlatform = require('../models/PlatformModel');

async function test() {
  try {
    const connStr = process.env.MONGO_URI || process.env.MONGODB_URI;
    console.log('Connecting to', connStr);
    await mongoose.connect(connStr);
    console.log('Connected');

    const platforms = await OTTPlatform.find({});
    console.log('Platforms count:', platforms.length);
    platforms.forEach(p => {
      console.log(`- ID: ${p._id}, Name: ${p.name}, Logo: ${p.logo}, Status: ${p.status}`);
    });

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

test();
