const Subscription = require('../models/SubscriptionModel');
const OTTPlatform = require('../models/PlatformModel');
const Notification = require('../models/Notification');
const User = require('../models/UserModel');

const isPlanPremium = (platformName, planName) => {
  if (!planName) return false;
  const pName = planName.toLowerCase();
  if (pName.includes('premium') || pName.includes('plus') || pName.includes('mega') || pName.includes('super')) {
    return true;
  }
  if (platformName === 'Amazon Prime Video' || platformName === 'Sony LIV' || platformName === 'Zee5') {
    return true;
  }
  return false;
};

const updateUserPremiumStatus = async (userId) => {
  const activePremiumSubs = await Subscription.countDocuments({
    userId,
    status: 'active',
    isPremium: true
  });
  const user = await User.findById(userId);
  if (user) {
    user.membershipType = activePremiumSubs > 0 ? 'premium' : 'standard';
    await user.save();
  }
};

// @desc    Get user subscriptions
// @route   GET /api/subscriptions
// @access  Private
const getSubscriptions = async (req, res, next) => {
  try {
    const subscriptions = await Subscription.find({ userId: req.user._id }).populate('ottPlatformId');
    res.json(subscriptions);
  } catch (error) {
    next(error);
  }
};

// @desc    Create new subscription
// @route   POST /api/subscriptions
// @access  Private
const createSubscription = async (req, res, next) => {
  try {
    const { ottPlatformId, planName, startDate, expiryDate, subscriptionCost, autoRenewal } = req.body;
    
    // Check if platform exists
    const platform = await OTTPlatform.findById(ottPlatformId);
    if (!platform) {
      return res.status(404).json({ message: 'Platform not found' });
    }

    const isPremium = isPlanPremium(platform.name, planName);

    // Check if subscription already exists for this platform and user
    let subscription = await Subscription.findOne({
      userId: req.user._id,
      $or: [
        { platformId: ottPlatformId },
        { ottPlatformId: ottPlatformId }
      ]
    });

    let isUpdate = false;
    let wasActive = false;

    if (subscription) {
      isUpdate = true;
      wasActive = subscription.status === 'active';

      // Update details
      subscription.planName = planName;
      subscription.subscriptionType = planName;
      subscription.startDate = startDate;
      subscription.expiryDate = expiryDate;
      subscription.endDate = expiryDate;
      subscription.subscriptionCost = subscriptionCost;
      subscription.autoRenewal = autoRenewal;
      subscription.autoRenew = autoRenewal;
      subscription.isPremium = isPremium;
      subscription.status = 'active';
      subscription.cancelled = false;
      subscription.isCancelled = false;

      await subscription.save();

      // Update subscribers count if it was not active
      if (!wasActive) {
        platform.subscribers += 1;
        await platform.save();
      }
    } else {
      subscription = await Subscription.create({
        userId: req.user._id,
        ottPlatformId,
        platformId: ottPlatformId,
        planName,
        subscriptionType: planName,
        startDate,
        expiryDate,
        endDate: expiryDate,
        subscriptionCost,
        autoRenewal,
        autoRenew: autoRenewal,
        isPremium
      });

      // Update subscribers count
      platform.subscribers += 1;
      await platform.save();
    }

    // Update user premium status
    await updateUserPremiumStatus(req.user._id);

    // Auto-generate notification
    await Notification.create({
      userId: req.user._id,
      message: isUpdate 
        ? `Subscription Updated: You have successfully updated your subscription for ${platform.name}.`
        : `Subscription Added: You have successfully added a new subscription for ${platform.name}.`,
      type: 'added'
    });

    const populatedSubscription = await Subscription.findById(subscription._id).populate('ottPlatformId');
    res.status(201).json(populatedSubscription);
  } catch (error) {
    next(error);
  }
};


// @desc    Update subscription
// @route   PUT /api/subscriptions/:id
// @access  Private
const updateSubscription = async (req, res, next) => {
  try {
    const subscription = await Subscription.findById(req.params.id);
    
    if (!subscription) {
      return res.status(404).json({ message: 'Subscription not found' });
    }
    
    if (subscription.userId.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'User not authorized' });
    }

    const oldCost = subscription.subscriptionCost;
    const oldStatus = subscription.status;
    const oldPlanName = subscription.planName;
    const oldSubscriptionType = subscription.subscriptionType;
    const oldExpiryDate = subscription.expiryDate;
    const oldEndDate = subscription.endDate;
    const oldAutoRenewal = subscription.autoRenewal;
    const oldAutoRenew = subscription.autoRenew;

    // Apply the updates to the document fields
    Object.assign(subscription, req.body);

    // Re-calculate isPremium if planName or subscriptionType was modified
    if (req.body.planName || req.body.subscriptionType) {
      const planName = req.body.planName || req.body.subscriptionType;
      const platform = await OTTPlatform.findById(subscription.ottPlatformId || subscription.platformId);
      if (platform) {
        subscription.isPremium = isPlanPremium(platform.name, planName);
      }
    }

    // Save the document to trigger pre-save hooks
    await subscription.save();

    // If status changed from active to cancelled/expired, or vice-versa, update the platform's subscribers count
    if (oldStatus === 'active' && subscription.status !== 'active') {
      const platform = await OTTPlatform.findById(subscription.ottPlatformId || subscription.platformId);
      if (platform && platform.subscribers > 0) {
        platform.subscribers -= 1;
        await platform.save();
      }
    } else if (oldStatus !== 'active' && subscription.status === 'active') {
      const platform = await OTTPlatform.findById(subscription.ottPlatformId || subscription.platformId);
      if (platform) {
        platform.subscribers += 1;
        await platform.save();
      }
    }

    // Update user premium status
    await updateUserPremiumStatus(req.user._id);

    // Populate after save
    const updatedSubscription = await Subscription.findById(subscription._id).populate('ottPlatformId');
    
    // Generate appropriate notifications based on what changed
    const platformName = updatedSubscription.ottPlatformId ? updatedSubscription.ottPlatformId.name : 'Platform';
    
    // Check if subscription was renewed (either status changed to active, or expiry date was extended)
    const hasOldExpiry = oldExpiryDate ? new Date(oldExpiryDate).getTime() : 0;
    const hasOldEnd = oldEndDate ? new Date(oldEndDate).getTime() : 0;
    const newExpiry = updatedSubscription.expiryDate ? new Date(updatedSubscription.expiryDate).getTime() : 0;
    const newEnd = updatedSubscription.endDate ? new Date(updatedSubscription.endDate).getTime() : 0;

    const expiryExtended = (newExpiry > 0 && newExpiry > hasOldExpiry) ||
                           (newEnd > 0 && newEnd > hasOldEnd);

    const isRenewed = (oldStatus !== 'active' && updatedSubscription.status === 'active') || expiryExtended;

    let notificationCreated = false;

    if (isRenewed) {
      await Notification.create({
        userId: req.user._id,
        message: `Your subscription to ${platformName} has been renewed.`,
        type: 'renewed'
      });
      notificationCreated = true;
    }

    if (oldCost < updatedSubscription.subscriptionCost) {
      await Notification.create({
        userId: req.user._id,
        message: `Your ${platformName} plan has been upgraded. New cost: $${updatedSubscription.subscriptionCost}/mo.`,
        type: 'upgraded'
      });
      notificationCreated = true;
    } else if (oldCost > updatedSubscription.subscriptionCost) {
      await Notification.create({
        userId: req.user._id,
        message: `Your ${platformName} plan has been downgraded. New cost: $${updatedSubscription.subscriptionCost}/mo.`,
        type: 'downgraded'
      });
      notificationCreated = true;
    }

    // Fallback notification for general updates (e.g. changing plan name or auto-renew toggle without cost/expiry change)
    if (!notificationCreated) {
      const planChanged = (req.body.planName && req.body.planName !== oldPlanName) ||
                          (req.body.subscriptionType && req.body.subscriptionType !== oldSubscriptionType);
      const autoRenewalChanged = (req.body.autoRenewal !== undefined && req.body.autoRenewal !== oldAutoRenewal) ||
                                 (req.body.autoRenew !== undefined && req.body.autoRenew !== oldAutoRenew);
      
      if (planChanged || autoRenewalChanged) {
        await Notification.create({
          userId: req.user._id,
          message: `Subscription Updated: Your subscription details for ${platformName} have been updated.`,
          type: 'added'
        });
      }
    }

    res.json(updatedSubscription);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete/Cancel subscription
// @route   DELETE /api/subscriptions/:id
// @access  Private
const deleteSubscription = async (req, res, next) => {
  try {
    const subscription = await Subscription.findById(req.params.id).populate('ottPlatformId');
    
    if (!subscription) {
      return res.status(404).json({ message: 'Subscription not found' });
    }

    if (subscription.userId.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'User not authorized' });
    }

    const platformName = subscription.ottPlatformId ? subscription.ottPlatformId.name : 'Platform';

    subscription.status = 'cancelled';
    await subscription.save();

    // Decrement subscribers count safely using raw platformId or fallback
    const platformId = subscription.platformId || (subscription.ottPlatformId ? subscription.ottPlatformId._id : null);
    if (platformId) {
      const platform = await OTTPlatform.findById(platformId);
      if (platform && platform.subscribers > 0) {
        platform.subscribers -= 1;
        await platform.save();
      }
    }

    // Update user premium status
    await updateUserPremiumStatus(req.user._id);

    await Notification.create({
      userId: req.user._id,
      message: `Your subscription to ${platformName} was cancelled.`,
      type: 'expired' // mapping cancelled to expired for icon
    });

    res.json({ id: req.params.id, message: 'Subscription cancelled successfully', subscription });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSubscriptions,
  createSubscription,
  updateSubscription,
  deleteSubscription
};
