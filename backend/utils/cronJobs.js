const cron = require('node-cron');
const Subscription = require('../models/Subscription');
const Notification = require('../models/Notification');

const checkExpiries = async () => {
  try {
    const today = new Date();
    const soon = new Date(today);
    soon.setDate(today.getDate() + 3); // 3 days warning

    // Find active subscriptions expiring in next 3 days
    const expiringSoon = await Subscription.find({
      status: 'active',
      expiryDate: { $lte: soon, $gt: today }
    }).populate('ottPlatformId');

    for (let sub of expiringSoon) {
      const platformName = sub.ottPlatformId ? sub.ottPlatformId.name : 'Platform';
      // Create notification
      await Notification.create({
        userId: sub.userId,
        message: `Your ${platformName} subscription (${sub.planName}) is expiring soon on ${sub.expiryDate.toDateString()}`,
        type: 'expiry'
      });
    }

    // Find and update expired subscriptions
    const expired = await Subscription.find({
      status: 'active',
      expiryDate: { $lte: today }
    }).populate('ottPlatformId');

    for (let sub of expired) {
      sub.status = 'expired';
      await sub.save();
      
      const platformName = sub.ottPlatformId ? sub.ottPlatformId.name : 'Platform';
      await Notification.create({
        userId: sub.userId,
        message: `Your ${platformName} subscription has expired.`,
        type: 'expired'
      });
    }

    console.log(`CronJob: Checked expiries. Found ${expiringSoon.length} expiring soon, ${expired.length} expired.`);
  } catch (error) {
    console.error('Error running cron job', error);
  }
};

const startCronJobs = () => {
  // Run every day at midnight
  cron.schedule('0 0 * * *', checkExpiries);
  console.log('Cron jobs started');
};

module.exports = startCronJobs;
