require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Subscription = require('./models/Subscription');
const OTTPlatform = require('./models/OTTPlatform');

async function testApi() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB');

    const rawUsers = await User.find({ role: 'user' }).limit(1);
    const userObj = rawUsers[0].toObject();
    const subscriptions = await Subscription.find({ userId: userObj._id }).populate('ottPlatformId');
    
    console.log('Subscriptions count:', subscriptions.length);
    if (subscriptions.length > 0) {
      console.log('First subscription:');
      const s = subscriptions[0].toObject();
      console.log('- _id:', s._id);
      console.log('- status:', s.status);
      console.log('- ottPlatformId:', s.ottPlatformId);
      console.log('- typeof ottPlatformId:', typeof s.ottPlatformId);
      if (s.ottPlatformId) {
        console.log('- name of platform:', s.ottPlatformId.name);
      }
    }

    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

testApi();
