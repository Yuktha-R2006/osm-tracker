require('dotenv').config();
const mongoose = require('mongoose');
const { createSubscription, updateSubscription, deleteSubscription } = require('../controllers/subscriptionController');
const Subscription = require('../models/SubscriptionModel');
const OTTPlatform = require('../models/PlatformModel');
const Notification = require('../models/Notification');
const User = require('../models/UserModel');

async function testAllControllers() {
  try {
    const connStr = process.env.MONGO_URI || process.env.MONGODB_URI;
    await mongoose.connect(connStr);
    console.log('Connected to MongoDB');

    const testUser = await User.findOne({ role: 'user' });
    if (!testUser) {
      console.error('No test user found!');
      process.exit(1);
    }
    console.log(`Using test user: ${testUser.name} (${testUser._id})`);

    const platform = await OTTPlatform.findOne({ name: 'Netflix' });
    if (!platform) {
      console.error('Netflix platform not found!');
      process.exit(1);
    }

    // Clean up
    await Subscription.deleteMany({ userId: testUser._id, platformId: platform._id });
    await Notification.deleteMany({ userId: testUser._id });
    console.log('Cleaned up subscriptions and notifications for test user.');

    // 1. Create Subscription
    console.log('\n--- TESTING CREATE SUBSCRIPTION ---');
    const reqCreate = {
      user: { _id: testUser._id },
      body: {
        ottPlatformId: platform._id.toString(),
        planName: 'Premium',
        startDate: new Date().toISOString(),
        expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        subscriptionCost: 10.00,
        autoRenewal: true
      }
    };
    
    let resData = null;
    let nextErr = null;
    const res = {
      status: function() { return this; },
      json: function(data) { resData = data; return this; }
    };
    const next = function(err) { if (err) nextErr = err; };

    await createSubscription(reqCreate, res, next);
    if (nextErr) {
      console.error('Create Subscription failed:', nextErr);
      throw nextErr;
    }
    console.log('Created subscription:', resData ? resData._id : 'null');
    
    let notifs = await Notification.find({ userId: testUser._id });
    console.log(`Notifications after create: ${notifs.length}`);
    notifs.forEach(n => console.log(`- [${n.type}] ${n.message}`));

    const subId = resData._id;

    // 2. Update Subscription (simulate upgrade/price increase)
    console.log('\n--- TESTING UPDATE SUBSCRIPTION (PRICE UPGRADE) ---');
    const reqUpdate = {
      user: { _id: testUser._id },
      params: { id: subId.toString() },
      body: {
        planName: 'Mega Premium',
        subscriptionCost: 15.00
      }
    };
    resData = null;
    nextErr = null;
    await updateSubscription(reqUpdate, res, next);
    if (nextErr) {
      console.error('Update Subscription failed:', nextErr);
      throw nextErr;
    }
    console.log('Updated subscription.');
    notifs = await Notification.find({ userId: testUser._id });
    console.log(`Notifications after update: ${notifs.length}`);
    notifs.forEach(n => console.log(`- [${n.type}] ${n.message}`));

    // 3. Update Subscription (simulate renewal)
    console.log('\n--- TESTING UPDATE SUBSCRIPTION (RENEWAL) ---');
    // Fetch subscription before to check status
    const beforeSub = await Subscription.findById(subId);
    console.log(`Subscription status before renewal: ${beforeSub.status}`);
    
    const reqRenew = {
      user: { _id: testUser._id },
      params: { id: subId.toString() },
      body: {
        status: 'active',
        expiryDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString()
      }
    };
    resData = null;
    nextErr = null;
    await updateSubscription(reqRenew, res, next);
    if (nextErr) {
      console.error('Renewal failed:', nextErr);
      throw nextErr;
    }
    console.log('Renewed subscription.');
    notifs = await Notification.find({ userId: testUser._id });
    console.log(`Notifications after renewal: ${notifs.length}`);
    notifs.forEach(n => console.log(`- [${n.type}] ${n.message}`));

    // 4. Delete/Cancel Subscription
    console.log('\n--- TESTING DELETE SUBSCRIPTION ---');
    const reqDelete = {
      user: { _id: testUser._id },
      params: { id: subId.toString() }
    };
    resData = null;
    nextErr = null;
    await deleteSubscription(reqDelete, res, next);
    if (nextErr) {
      console.error('Delete Subscription failed:', nextErr);
      throw nextErr;
    }
    console.log('Cancelled subscription.');
    notifs = await Notification.find({ userId: testUser._id });
    console.log(`Notifications after delete: ${notifs.length}`);
    notifs.forEach(n => console.log(`- [${n.type}] ${n.message}`));

    // Clean up
    await Subscription.deleteMany({ userId: testUser._id, platformId: platform._id });
    await Notification.deleteMany({ userId: testUser._id });
    console.log('\nCleaned up all test data.');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  }
}

testAllControllers();
