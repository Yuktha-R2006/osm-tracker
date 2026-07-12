require('dotenv').config();
const mongoose = require('mongoose');
const { createSubscription } = require('../controllers/subscriptionController');
const Subscription = require('../models/SubscriptionModel');
const OTTPlatform = require('../models/PlatformModel');
const Notification = require('../models/Notification');
const User = require('../models/UserModel');

async function testSubscriptionNotifications() {
  try {
    const connStr = process.env.MONGO_URI || process.env.MONGODB_URI;
    await mongoose.connect(connStr);
    console.log('Connected to MongoDB');

    // Find a test user (role: user)
    const testUser = await User.findOne({ role: 'user' });
    if (!testUser) {
      console.error('No test user found in DB!');
      process.exit(1);
    }
    console.log(`Using test user: ${testUser.name} (${testUser._id})`);

    // Find Netflix platform
    const platform = await OTTPlatform.findOne({ name: 'Netflix' });
    if (!platform) {
      console.error('Netflix platform not found in DB!');
      process.exit(1);
    }

    // Clean up any existing subscriptions for this user and platform to simulate a clean "Add"
    await Subscription.deleteMany({
      userId: testUser._id,
      platformId: platform._id
    });
    console.log('Cleaned up existing subscriptions for Netflix and test user.');

    // Count notifications before
    const countBefore = await Notification.countDocuments({ userId: testUser._id });
    console.log(`Notifications count before: ${countBefore}`);

    // Mock request, response, and next
    const req = {
      user: { _id: testUser._id },
      body: {
        ottPlatformId: platform._id.toString(),
        planName: 'Premium',
        startDate: new Date().toISOString(),
        expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        subscriptionCost: 19.99,
        autoRenewal: true
      }
    };

    let responseData = null;
    let responseStatus = null;
    let nextError = null;

    const res = {
      status: function(code) {
        responseStatus = code;
        return this;
      },
      json: function(data) {
        responseData = data;
        return this;
      }
    };

    const next = function(err) {
      if (err) {
        console.error('Express next() received error:', err);
        nextError = err;
      }
    };

    console.log('Triggering createSubscription controller...');
    await createSubscription(req, res, next);

    console.log('Response Status:', responseStatus || 201);
    if (nextError) {
      console.error('Controller failed with error:', nextError.message);
    } else {
      console.log('Controller completed successfully.');
    }

    // Check if subscription was created
    const createdSub = await Subscription.findOne({ userId: testUser._id, platformId: platform._id });
    console.log('Created subscription in DB:', createdSub ? 'YES' : 'NO');

    // Count notifications after
    const countAfter = await Notification.countDocuments({ userId: testUser._id });
    console.log(`Notifications count after: ${countAfter}`);

    // Find the latest notification
    const latestNotif = await Notification.findOne({ userId: testUser._id }).sort({ createdAt: -1 });
    if (latestNotif) {
      console.log('Latest notification in DB:', latestNotif);
    } else {
      console.log('No notifications found in DB.');
    }

    // Cleanup
    if (createdSub) {
      await Subscription.deleteOne({ _id: createdSub._id });
      console.log('Cleaned up created subscription.');
    }
    if (countAfter > countBefore && latestNotif) {
      await Notification.deleteOne({ _id: latestNotif._id });
      console.log('Cleaned up created notification.');
    }

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Fatal test error:', error);
    process.exit(1);
  }
}

testSubscriptionNotifications();
