const Subscription = require('../models/SubscriptionModel');
const OTTPlatform = require('../models/PlatformModel');
const Notification = require('../models/Notification');

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

    const subscription = await Subscription.create({
      userId: req.user._id,
      ottPlatformId,
      planName,
      startDate,
      expiryDate,
      subscriptionCost,
      autoRenewal
    });

    // Update subscribers count
    platform.subscribers += 1;
    await platform.save();

    // Auto-generate notification
    await Notification.create({
      userId: req.user._id,
      message: `You have successfully added a new subscription for ${platform.name}.`,
      type: 'added'
    });

    res.status(201).json(subscription);
  } catch (error) {
    next(error);
  }
};

// @desc    Update subscription
// @route   PUT /api/subscriptions/:id
// @access  Private
const updateSubscription = async (req, res, next) => {
  try {
    const subscription = await Subscription.findById(req.params.id).populate('ottPlatformId');
    
    if (!subscription) {
      return res.status(404).json({ message: 'Subscription not found' });
    }
    
    if (subscription.userId.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'User not authorized' });
    }

    const oldCost = subscription.subscriptionCost;
    const oldStatus = subscription.status;

    const updatedSubscription = await Subscription.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }).populate('ottPlatformId');
    
    // Generate appropriate notifications based on what changed
    const platformName = updatedSubscription.ottPlatformId.name;
    
    if (oldStatus !== 'active' && updatedSubscription.status === 'active') {
      await Notification.create({
        userId: req.user._id,
        message: `Your subscription to ${platformName} has been renewed.`,
        type: 'renewed'
      });
    }

    if (oldCost < updatedSubscription.subscriptionCost) {
      await Notification.create({
        userId: req.user._id,
        message: `Your ${platformName} plan has been upgraded. New cost: $${updatedSubscription.subscriptionCost}/mo.`,
        type: 'upgraded'
      });
    } else if (oldCost > updatedSubscription.subscriptionCost) {
      await Notification.create({
        userId: req.user._id,
        message: `Your ${platformName} plan has been downgraded. New cost: $${updatedSubscription.subscriptionCost}/mo.`,
        type: 'downgraded'
      });
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

    const platformName = subscription.ottPlatformId.name;

    subscription.status = 'cancelled';
    await subscription.save();

    // Decrement subscribers count
    const platform = await OTTPlatform.findById(subscription.ottPlatformId);
    if (platform && platform.subscribers > 0) {
      platform.subscribers -= 1;
      await platform.save();
    }

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
