const mongoose = require('mongoose');
require('dotenv').config();
const User = require('../models/UserModel');
const Platform = require('../models/PlatformModel');
const Subscription = require('../models/SubscriptionModel');

const BASE_DATE_MS = Date.now();

const isSubscriptionActive = (sub) => {
  const status = sub.status || 'active';
  const isCancelled = sub.cancelled === true || sub.isCancelled === true || sub.status === 'cancelled';
  return status === 'active' && !isCancelled;
};

// Mirroring the enrichUsersWithSubscriptions helper in adminController.js
const enrichUsersWithSubscriptions = async (usersList) => {
  return Promise.all(usersList.map(async (user) => {
    const userObj = user.toObject ? user.toObject() : user;
    const subscriptions = await Subscription.find({ userId: userObj._id }).populate('ottPlatformId');
    
    let earliestStartDate = null;
    let totalRenewals = 0;
    let activeSubscriptionsCount = 0;
    let hasActivePremium = false;
    const platformActiveDays = {};

    subscriptions.forEach(sub => {
      totalRenewals += sub.renewalCount || 0;

      if (!earliestStartDate || new Date(sub.startDate) < new Date(earliestStartDate)) {
        earliestStartDate = sub.startDate;
      }

      if (isSubscriptionActive(sub)) {
        activeSubscriptionsCount++;
        if (sub.isPremium) {
          hasActivePremium = true;
        }
        
        const days = Math.max(0, Math.ceil((BASE_DATE_MS - new Date(sub.startDate).getTime()) / (1000 * 60 * 60 * 24)));
        const platformName = sub.ottPlatformId ? sub.ottPlatformId.name : 'Netflix';
        platformActiveDays[platformName] = (platformActiveDays[platformName] || 0) + days;
      }
    });

    let favoriteOTT = 'None';
    let maxDays = -1;
    Object.keys(platformActiveDays).forEach(pName => {
      if (platformActiveDays[pName] > maxDays) {
        maxDays = platformActiveDays[pName];
        favoriteOTT = pName;
      }
    });
    if (favoriteOTT === 'None' && subscriptions.length > 0) {
      const firstSub = subscriptions.find(s => s.ottPlatformId);
      if (firstSub && firstSub.ottPlatformId) {
        favoriteOTT = firstSub.ottPlatformId.name;
      }
    }
    
    const activeSubscriptionDays = earliestStartDate 
      ? Math.max(0, Math.ceil((BASE_DATE_MS - new Date(earliestStartDate).getTime()) / (1000 * 60 * 60 * 24)))
      : 0;

    return {
      ...userObj,
      favoriteOTT,
      isPremium: hasActivePremium || userObj.isPremium,
      subscriptionCount: subscriptions.length,
      activeSubscriptionsCount,
      activeSubscriptionDays,
      totalRenewals,
      subscriptions
    };
  }));
};

async function checkStats() {
  try {
    await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI);
    console.log('Connected to Database.');

    const rawUsers = await User.find({ role: 'user', numericId: { $ne: 1 } }).select('-password');
    const users = await enrichUsersWithSubscriptions(rawUsers);
    const platforms = await Platform.find({});
    
    const allSubs = [];
    users.forEach(u => {
      if (u.subscriptions) {
        u.subscriptions.forEach((s) => {
          let platformName = 'Unknown';
          if (s.platformName) {
            platformName = s.platformName;
          } else if (s.ottPlatformId) {
            if (typeof s.ottPlatformId === 'object') {
              platformName = s.ottPlatformId.name || 'Unknown';
            } else {
              const platformDoc = platforms.find(p => p._id.toString() === s.ottPlatformId.toString());
              if (platformDoc) platformName = platformDoc.name;
            }
          }
          const pName = platformName === 'Unknown' ? 'Netflix' : platformName;
          
          const subActiveDays = Math.max(0, Math.ceil((BASE_DATE_MS - new Date(s.startDate).getTime()) / (1000 * 60 * 60 * 24)));
          const cancelled = s.isCancelled === true || s.status === 'cancelled';
          
          allSubs.push({
            ...s.toObject ? s.toObject() : s,
            platformName: pName,
            status: s.status || 'active',
            startDate: s.startDate,
            renewalCount: s.renewalCount || 0,
            activeDays: subActiveDays,
            premiumTier: s.planName || 'Standard',
            cancelled: cancelled,
            userId: u._id
          });
        });
      }
    });

    const activeSubscriptions = allSubs.filter(s => isSubscriptionActive(s)).length;
    const cancelledSubscriptions = allSubs.filter(s => s.cancelled).length;
    const expiredSubscriptions = allSubs.filter(s => !isSubscriptionActive(s) && !s.cancelled).length;

    console.log('\n--- ADMIN METRICS RETRIEVAL CHECK ---');
    console.log('Total Users:', users.length);
    console.log('Total Subscriptions:', allSubs.length);
    console.log('Active Subscriptions (Active Licenses):', activeSubscriptions);
    console.log('Cancelled Subscriptions:', cancelledSubscriptions);
    console.log('Expired Subscriptions:', expiredSubscriptions);

    // Platform stats list
    const platformStats = {};
    platforms.forEach(p => {
      platformStats[p.name] = { subscribers: 0, recentCount: 0 };
    });
    
    allSubs.forEach(s => {
      if (isSubscriptionActive(s)) {
        if (!platformStats[s.platformName]) {
          platformStats[s.platformName] = { subscribers: 0, recentCount: 0 };
        }
        platformStats[s.platformName].subscribers++;
      }
    });

    console.log('\nPlatform Distribution (Active Subscribers per Platform):');
    Object.keys(platformStats).forEach(pName => {
      console.log(`- ${pName}: ${platformStats[pName].subscribers}`);
    });

    await mongoose.disconnect();
    console.log('\nDisconnected.');
    
    if (activeSubscriptions === 0) {
      console.error('✗ Failure: Active subscriptions count is ZERO!');
      process.exit(1);
    } else {
      console.log('✓ Success: Active metrics successfully resolved to non-zero values!');
      process.exit(0);
    }
  } catch (error) {
    console.error('Check failed:', error.message);
    await mongoose.disconnect();
    process.exit(1);
  }
}

checkStats();
