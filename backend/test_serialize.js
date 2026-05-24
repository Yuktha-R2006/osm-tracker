require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Subscription = require('./models/Subscription');
const OTTPlatform = require('./models/OTTPlatform');

async function testSerialize() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB');

    const rawUsers = await User.find({ role: 'user' }).limit(1);
    const userObj = rawUsers[0].toObject();
    const subscriptions = await Subscription.find({ userId: userObj._id }).populate('ottPlatformId');
    userObj.subscriptions = subscriptions;

    const serialized = JSON.parse(JSON.stringify(userObj));
    console.log('Serialized user subscriptions:');
    const s = serialized.subscriptions[0];
    console.log('Keys in subscription:', Object.keys(s));
    console.log('ottPlatformId:', s.ottPlatformId);
    console.log('typeof ottPlatformId in JSON:', typeof s.ottPlatformId);
    if (s.ottPlatformId) {
      console.log('name of platform in JSON:', s.ottPlatformId.name);
    }

    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

testSerialize();
