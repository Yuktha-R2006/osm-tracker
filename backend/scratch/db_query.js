require('dotenv').config();
const mongoose = require('mongoose');
const Notification = require('../models/Notification');
const Subscription = require('../models/SubscriptionModel');

async function testQuery() {
  try {
    const connStr = process.env.MONGO_URI || process.env.MONGODB_URI;
    console.log('Connecting to:', connStr);
    await mongoose.connect(connStr);
    console.log('Connected!');

    const notificationsCount = await Notification.countDocuments({});
    console.log('Total notifications:', notificationsCount);

    const latestNotifications = await Notification.find({}).sort({ createdAt: -1 }).limit(10);
    console.log('Latest 10 notifications:');
    latestNotifications.forEach(n => {
      console.log(`- ID: ${n._id}, userId: ${n.userId}, type: ${n.type}, message: "${n.message}", createdAt: ${n.createdAt}`);
    });

    const subCount = await Subscription.countDocuments({});
    console.log('Total subscriptions:', subCount);

    // Try creating a test notification
    const testUser = latestNotifications[0]?.userId || new mongoose.Types.ObjectId();
    console.log('Attempting to create a test notification for user:', testUser);
    const newNotif = await Notification.create({
      userId: testUser,
      message: 'Test Notification from scratch script',
      type: 'system'
    });
    console.log('Created test notification successfully:', newNotif);

    // Retrieve it to verify
    const foundNotif = await Notification.findById(newNotif._id);
    console.log('Found created notification:', foundNotif);

    // Clean it up
    await Notification.deleteOne({ _id: newNotif._id });
    console.log('Cleaned up test notification.');

    await mongoose.disconnect();
  } catch (error) {
    console.error('Error during test query:', error);
  }
}

testQuery();
