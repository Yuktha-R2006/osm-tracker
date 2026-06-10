require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Subscription = require('./models/Subscription');
const OTTPlatform = require('./models/OTTPlatform');

async function checkDb() {
  try {
    const connStr = process.env.MONGO_URI || process.env.MONGODB_URI;
    await mongoose.connect(connStr);
    console.log('Connected to DB');

    const totalUsers = await User.countDocuments({ role: 'user' });
    console.log('Total users in DB:', totalUsers);

    const allSubs = await Subscription.find({}).populate('ottPlatformId');
    console.log('Total subscriptions in DB:', allSubs.length);
    console.log('Active subscriptions count:', allSubs.filter(s => s.status === 'active').length);
    console.log('Cancelled subscriptions count:', allSubs.filter(s => s.status === 'cancelled').length);
    console.log('Expired subscriptions count:', allSubs.filter(s => s.status === 'expired').length);

    if (allSubs.length > 0) {
      console.log('Sample Active Subscription:');
      const sample = allSubs.find(s => s.status === 'active');
      if (sample) {
        console.log('- platform:', sample.ottPlatformId ? sample.ottPlatformId.name : 'null');
        console.log('- userId:', sample.userId);
        console.log('- startDate:', sample.startDate);
        const days = Math.max(0, Math.ceil((Date.now() - new Date(sample.startDate).getTime()) / (1000 * 60 * 60 * 24)));
        console.log('- active days calculated:', days);
      } else {
        console.log('No active subscriptions found in DB!');
      }
    }

    // Let's print out the exact users and their active days and renewals
    const rawUsers = await User.find({ role: 'user' });
    console.log('Sample 3 Users details:');
    for (let i = 0; i < Math.min(3, rawUsers.length); i++) {
      const u = rawUsers[i];
      const subs = await Subscription.find({ userId: u._id }).populate('ottPlatformId');
      console.log(`User ${u.name}:`);
      console.log(`- subscriptions count: ${subs.length}`);
      subs.forEach(s => {
        console.log(`  * platform: ${s.ottPlatformId?.name}, status: ${s.status}, startDate: ${s.startDate}, renewalCount: ${s.renewalCount}`);
      });
    }

    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

checkDb();
