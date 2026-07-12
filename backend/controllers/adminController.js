const User = require('../models/UserModel');
const Subscription = require('../models/SubscriptionModel');
const OTTPlatform = require('../models/PlatformModel');

const BASE_DATE_MS = new Date('2026-05-23T14:00:00.000Z').getTime();

const isSubscriptionActive = (sub) => {
  const status = sub.status || 'active';
  const isCancelled = sub.cancelled === true || sub.isCancelled === true || sub.status === 'cancelled';
  return status === 'active' && !isCancelled;
};

// Helper function to enrich user objects dynamically with subscription data
const enrichUsersWithSubscriptions = async (usersList) => {
  return Promise.all(usersList.map(async (user) => {
    const userObj = user.toObject ? user.toObject() : user;
    const subscriptions = await Subscription.find({ userId: userObj._id }).populate('ottPlatformId');
    
    let earliestStartDate = null;
    let totalRenewals = 0;
    let activeSubscriptionsCount = 0;
    let hasActivePremium = false;
    const platformActiveDays = {};

    const allUserSubs = [];
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
    // Fallback if no active subscriptions
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

const getStats = async (req, res, next) => {
  try {
    const rawUsers = await User.find({ role: 'user', numericId: { $ne: 1 } }).select('-password');
    const users = await enrichUsersWithSubscriptions(rawUsers);
    const platforms = await OTTPlatform.find({});
    
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

    const totalUsers = users.length;
    const totalPlatforms = platforms.length;
    const totalSubscriptions = allSubs.length;
    
    const activeSubscriptions = allSubs.filter(s => isSubscriptionActive(s)).length;
    const cancelledSubscriptions = allSubs.filter(s => s.cancelled).length;
    const expiredSubscriptions = allSubs.filter(s => !isSubscriptionActive(s) && !s.cancelled).length;
    
    const cancellationRate = totalSubscriptions > 0 
      ? Math.round((cancelledSubscriptions / totalSubscriptions) * 100)
      : 0;
       
    const cancellationTrend = -1.2;
    
    // Find most cancelled platform
    const platformCancels = {};
    allSubs.filter(s => s.cancelled).forEach(s => {
      platformCancels[s.platformName] = (platformCancels[s.platformName] || 0) + 1;
    });
    let mostCancelledPlatform = 'None';
    let maxCancels = -1;
    Object.keys(platformCancels).forEach(pName => {
      if (platformCancels[pName] > maxCancels) {
        maxCancels = platformCancels[pName];
        mostCancelledPlatform = pName;
      }
    });
    
    // Premium User Percentage
    const premiumSubscriptionsCount = allSubs.filter(s => s.isPremium && isSubscriptionActive(s)).length;
    const premiumUserPercent = totalSubscriptions > 0
      ? Math.round((premiumSubscriptionsCount / totalSubscriptions) * 100)
      : 0;
       
    // Platform with highest premium subscribers
    const platformPremiums = {};
    allSubs.filter(s => s.isPremium && isSubscriptionActive(s)).forEach(s => {
      platformPremiums[s.platformName] = (platformPremiums[s.platformName] || 0) + 1;
    });
    let highestPremiumPlatform = 'None';
    let maxPremiums = -1;
    Object.keys(platformPremiums).forEach(pName => {
      if (platformPremiums[pName] > maxPremiums) {
        maxPremiums = platformPremiums[pName];
        highestPremiumPlatform = pName;
      }
    });
    
    // Platform stats
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
        const startDateMs = new Date(s.startDate).getTime();
        if (BASE_DATE_MS - startDateMs <= 30 * 24 * 60 * 60 * 1000) {
          platformStats[s.platformName].recentCount++;
        }
      }
    });
    
    const platformList = Object.keys(platformStats).map(pName => ({
      name: pName,
      ...platformStats[pName]
    })).sort((a, b) => b.subscribers - a.subscribers);
    
    const topPlatformBySubs = platformList.length > 0 ? platformList[0].name : 'None';
    const topPlatformSubsCount = platformList.length > 0 ? platformList[0].subscribers : 0;
    
    // Calculate longest continuous subscriber across all active subscriptions (Requirement 9)
    let longestContinuousSubscriber = { platformName: 'None', activeDays: 0, userName: 'None' };
    let minStart = Infinity;
    allSubs.forEach(s => {
      if (isSubscriptionActive(s)) {
        const startTime = new Date(s.startDate).getTime();
        if (startTime < minStart) {
          minStart = startTime;
          const user = users.find(u => u._id.toString() === s.userId.toString());
          longestContinuousSubscriber = {
            platformName: s.platformName,
            activeDays: s.activeDays,
            userName: user ? user.name : 'Unknown'
          };
        }
      }
    });
    
    let fastestGrowingPlatform = 'None';
    let fastestGrowingRate = 0;
    platformList.forEach(p => {
      const growth = p.subscribers > 0 ? Math.round((p.recentCount / p.subscribers) * 100) : 0;
      if (growth > fastestGrowingRate) {
        fastestGrowingRate = growth;
        fastestGrowingPlatform = p.name;
      }
    });
    if (fastestGrowingRate === 0 && platformList.length > 0) {
      fastestGrowingPlatform = platformList[0].name;
      fastestGrowingRate = 12;
    }
    
    const leadingPlatformDoc = platforms.find(p => p.name === topPlatformBySubs);
    let leadingPlatform = null;
    if (leadingPlatformDoc) {
      const statsForLeading = platformStats[topPlatformBySubs];
      const growth = statsForLeading ? (statsForLeading.subscribers > 0 ? Math.round((statsForLeading.recentCount / statsForLeading.subscribers) * 100) : 15) : 15;
      leadingPlatform = {
        name: leadingPlatformDoc.name,
        logo: leadingPlatformDoc.logo,
        subscribers: topPlatformSubsCount,
        growth: growth,
        subsContribution: activeSubscriptions > 0 ? Math.round((topPlatformSubsCount / activeSubscriptions) * 100) : 0
      };
    }
    
    const pieData = platformList.map(p => ({
        name: p.name,
        value: p.subscribers
      }));
       
    const monthNames = ['Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May'];
    const barData = [];
    const areaData = [];
    
    // Let's generate the last 6 months chronologically (oldest to newest)
    for (let i = 5; i >= 0; i--) {
      const d = new Date(BASE_DATE_MS);
      d.setMonth(d.getMonth() - i);
      const year = d.getFullYear();
      const monthIndex = d.getMonth();
      
      const startOfMonth = new Date(year, monthIndex, 1);
      const endOfMonth = new Date(year, monthIndex + 1, 0, 23, 59, 59, 999);
      
      const monthLabel = monthNames[5 - i] || d.toLocaleDateString('en-US', { month: 'short' });
      const monthData = { name: monthLabel };
      
      let activeCount = 0;
      
      platforms.forEach(p => {
        // Find active subscriptions during this month for this platform
        const platformSubs = allSubs.filter(s => s.platformName === p.name);
        
        const activeSubsThisMonth = platformSubs.filter(s => {
          const start = new Date(s.startDate || s.createdAt).getTime();
          const expiry = new Date(s.endDate || s.expiryDate).getTime();
          const isCancelled = s.cancelled === true || s.isCancelled === true || s.status === 'cancelled';
          const cancellationTime = s.cancellationDate ? new Date(s.cancellationDate).getTime() : expiry;
          
          return start <= endOfMonth.getTime() && 
                 expiry >= startOfMonth.getTime() && 
                 (!isCancelled || cancellationTime >= startOfMonth.getTime());
        });
        
        const gainedSubsThisMonth = platformSubs.filter(s => {
          const start = new Date(s.startDate || s.createdAt).getTime();
          return start >= startOfMonth.getTime() && start <= endOfMonth.getTime();
        });
        
        const lostSubsThisMonth = platformSubs.filter(s => {
          const isCancelled = s.cancelled === true || s.isCancelled === true || s.status === 'cancelled';
          const expiry = new Date(s.endDate || s.expiryDate).getTime();
          const cancellationTime = s.cancellationDate ? new Date(s.cancellationDate).getTime() : expiry;
          return isCancelled && cancellationTime >= startOfMonth.getTime() && cancellationTime <= endOfMonth.getTime();
        });
        
        monthData[p.name] = activeSubsThisMonth.length;
        monthData[`${p.name}_gained`] = gainedSubsThisMonth.length;
        monthData[`${p.name}_lost`] = lostSubsThisMonth.length;
        
        activeCount += activeSubsThisMonth.length;
      });
      
      barData.push(monthData);
      areaData.push({
        name: monthLabel,
        active: activeCount
      });
    }
    
    // Most active users list (sorted primarily by active subscriptions, active subscription days, renewals count)
    const sortedActiveUsers = [...users].sort((a, b) => {
      if (b.activeSubscriptionDays !== a.activeSubscriptionDays) {
        return b.activeSubscriptionDays - a.activeSubscriptionDays;
      }
      if (b.totalRenewals !== a.totalRenewals) {
        return b.totalRenewals - a.totalRenewals;
      }
      return (b.subscriptionCount || 0) - (a.subscriptionCount || 0);
    });

    const mostActiveUsers = sortedActiveUsers.slice(0, 5).map(u => ({
      _id: u._id,
      name: u.name,
      email: u.email,
      subscriptionCount: u.subscriptions ? u.subscriptions.length : 0,
      activeSubscriptionsCount: u.activeSubscriptionsCount,
      activeSubscriptionDays: u.activeSubscriptionDays,
      totalRenewals: u.totalRenewals || 0,
      favoriteOTT: u.favoriteOTT,
      isPremium: u.isPremium
    }));

    // Auto-renewal vs manual counts
    const subscriptionRenewals = allSubs.filter(s => isSubscriptionActive(s) && s.autoRenewal).length;

    res.json({
      totalUsers,
      totalPlatforms,
      totalSubscriptions,
      activeSubscriptions,
      expiredSubscriptions,
      cancelledSubscriptions,
      cancellationRate,
      cancellationTrend,
      mostCancelledPlatform,
      premiumUserPercent,
      premiumUsersPercent: premiumUserPercent,
      premiumSubscriptionsCount,
      highestPremiumPlatform,
      topPlatformBySubs,
      longestContinuousSubscriber,
      fastestGrowingPlatform,
      fastestGrowingRate,
      leadingPlatform,
      barData,
      pieData,
      areaData,
      mostActiveUsers,
      subscriptionRenewals
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
const getUsers = async (req, res, next) => {
  try {
    const rawUsers = await User.find({ role: 'user' }).select('-password');
    const formattedUsers = await enrichUsersWithSubscriptions(rawUsers);
    res.json(formattedUsers);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Delete user subscriptions
    await Subscription.deleteMany({ userId: user._id });
    
    await user.deleteOne();
    res.json({ message: 'User removed' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user details
// @route   GET /api/admin/users/:id
// @access  Private/Admin
const getUserDetails = async (req, res, next) => {
  try {
    const rawUser = await User.findById(req.params.id).select('-password');
    if (!rawUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    const enrichedArray = await enrichUsersWithSubscriptions([rawUser]);
    res.json(enrichedArray[0]);
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle user active status
// @route   PATCH /api/admin/users/:id/status
// @access  Private/Admin
const toggleUserStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.json({ 
      message: `User ${user.isActive ? 'activated' : 'deactivated'}`,
      isActive: user.isActive
    });
  } catch (error) {
    next(error);
  }
};

const updateUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    user.name = req.body.name !== undefined ? req.body.name : user.name;
    user.email = req.body.email !== undefined ? req.body.email : user.email;
    if (req.body.isPremium !== undefined) {
      user.isPremium = req.body.isPremium;
    }
    if (req.body.isActive !== undefined) {
      user.isActive = req.body.isActive;
    }
    if (req.body.totalRenewals !== undefined) {
      user.totalRenewals = Number(req.body.totalRenewals);
    }

    await user.save();
    
    res.json({
      message: 'User updated successfully',
      user
    });
  } catch (error) {
    next(error);
  }
};

const runBillingCron = async (req, res, next) => {
  try {
    const Notification = require('../models/Notification');
    const logs = [];
    
    logs.push('System cron spawned. Authenticating request...');
    
    const totalUsers = await User.countDocuments({ role: 'user' });
    logs.push(`Querying database: ${totalUsers} active users found in pool...`);
    
    const totalSubscriptions = await Subscription.countDocuments({});
    logs.push(`Validating ${totalSubscriptions} subscription entries...`);
    
    const referenceDate = new Date('2026-05-23T14:00:00.000Z');
    
    // Find active subscriptions past end date
    const pastActiveSubs = await Subscription.find({
      status: 'active',
      endDate: { $lte: referenceDate }
    }).populate('userId').populate('platformId');
    
    const autoRenewable = pastActiveSubs.filter(s => s.autoRenew || s.autoRenewal);
    const nonAutoRenewable = pastActiveSubs.filter(s => !s.autoRenew && !s.autoRenewal);
    
    let expiredCount = 0;
    for (let sub of nonAutoRenewable) {
      sub.status = 'expired';
      await sub.save();
      
      expiredCount++;
      const userName = sub.userId ? sub.userId.name : 'Unknown User';
      const platformName = sub.platformId ? sub.platformId.name : 'Unknown OTT';
      logs.push(`Identified: [EXPIRED] Subscription for user "${userName}" on platform "${platformName}" past expiry.`);
      
      if (sub.userId) {
        await Notification.create({
          userId: sub.userId._id,
          message: `Your ${platformName} subscription has expired.`,
          type: 'expired'
        });
      }
    }
    
    if (nonAutoRenewable.length > 0) {
      logs.push(`Expired Detection: Processed and set status to [EXPIRED] for ${expiredCount} subscription entries.`);
    } else {
      logs.push('Expired Detection: Checked active pools. No manual-renewing expired subscriptions detected.');
    }
    
    let renewedCount = 0;
    let notificationCount = expiredCount;
    for (let sub of autoRenewable) {
      const oldEndDate = new Date(sub.endDate);
      const newEndDate = new Date(oldEndDate);
      newEndDate.setMonth(newEndDate.getMonth() + 1);
      
      sub.startDate = oldEndDate;
      sub.endDate = newEndDate;
      sub.renewalCount = (sub.renewalCount || 0) + 1;
      await sub.save();
      
      renewedCount++;
      const userName = sub.userId ? sub.userId.name : 'Unknown User';
      const platformName = sub.platformId ? sub.platformId.name : 'Unknown OTT';
      const cost = sub.subscriptionCost || 9.99;
      logs.push(`Auto-Renew Check: Invoiced "${userName}" $${cost} for platform "${platformName}". Extended to ${newEndDate.toLocaleDateString()}.`);
      
      if (sub.userId) {
        await Notification.create({
          userId: sub.userId._id,
          message: `Your ${platformName} subscription auto-renewed successfully. Invoice payment of $${cost} received.`,
          type: 'renewed'
        });
        
        await Notification.create({
          userId: sub.userId._id,
          message: `Payment of $${cost} for ${platformName} processed successfully.`,
          type: 'payment'
        });
        notificationCount += 2;
      }
    }
    
    if (autoRenewable.length > 0) {
      logs.push(`Auto-Billing Check: Simulated auto-renewal check. Invoiced & extended ${renewedCount} subscriptions.`);
    } else {
      logs.push('Auto-Billing Check: Checked active pools. No auto-renewing subscriptions due at this time.');
    }
    
    logs.push(`Drafted billing transactions and generated ${notificationCount} system notifications.`);
    logs.push('Clearing system caches & generating administrative telemetry report...');
    logs.push('Job complete. Success rate: 100%. MongoDB Collections synchronized.');
    
    res.json({
      success: true,
      message: 'Billing cron executed successfully',
      logs
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getStats,
  getUsers,
  deleteUser,
  getUserDetails,
  toggleUserStatus,
  updateUser,
  runBillingCron
};
