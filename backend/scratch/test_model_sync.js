const mongoose = require('mongoose');
require('dotenv').config();
const User = require('../models/UserModel');
const Platform = require('../models/PlatformModel');
const Subscription = require('../models/SubscriptionModel');

async function testSync() {
  try {
    await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI);
    console.log('Connected to DB for sync tests.');

    // 1. Create a dummy test user and test platform
    const user = await User.create({
      numericId: 99999,
      name: 'Sync Tester',
      email: 'synctest@osm.com',
      password: 'password123',
      role: 'user',
      membershipType: 'standard'
    });
    console.log('Created test user:', user.name, `(${user._id})`);

    const platform = await Platform.create({
      name: 'Sync Platform',
      logo: '/assets/logos/sync.png',
      status: 'active',
      accentColor: '#FFFFFF',
      description: 'Test platform for model hooks.',
      monthlyPrice: 9.99
    });
    console.log('Created test platform:', platform.name, `(${platform._id})`);

    // Helper to refresh and print states
    const checkState = async (label) => {
      const refreshedUser = await User.findById(user._id);
      const refreshedPlatform = await Platform.findById(platform._id);
      console.log(`\n--- STATE CHECK: ${label} ---`);
      console.log(`User membershipType: ${refreshedUser.membershipType} (Expected: ${refreshedUser.membershipType === 'premium' ? 'premium' : 'standard'})`);
      console.log(`Platform activeSubscribers: ${refreshedPlatform.activeSubscribers} (Expected count of active subs)`);
      console.log(`Platform premiumUsers: ${refreshedPlatform.premiumUsers} (Expected count of active premium subs)`);
      return { refreshedUser, refreshedPlatform };
    };

    // Initial check
    await checkState('Initial (No subscriptions)');

    // 2. Add an ACTIVE PREMIUM subscription
    console.log('\nCreating active premium subscription...');
    const sub = await Subscription.create({
      userId: user._id,
      platformId: platform._id,
      ottPlatformId: platform._id,
      subscriptionType: 'Premium',
      planName: 'Premium',
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      subscriptionCost: 9.99,
      status: 'active',
      isPremium: true
    });

    let state = await checkState('Active Premium Subscription Added');
    if (state.refreshedUser.membershipType !== 'premium') {
      throw new Error('User membershipType failed to sync to premium!');
    }
    if (state.refreshedPlatform.activeSubscribers !== 1 || state.refreshedPlatform.premiumUsers !== 1) {
      throw new Error('Platform statistics failed to sync to 1!');
    }

    // 3. Mark the subscription as EXPIRED
    console.log('\nExpiring the subscription...');
    sub.status = 'expired';
    await sub.save();

    state = await checkState('Subscription Expired');
    if (state.refreshedUser.membershipType !== 'standard') {
      throw new Error('User membershipType failed to revert to standard after expiry!');
    }
    if (state.refreshedPlatform.activeSubscribers !== 0 || state.refreshedPlatform.premiumUsers !== 0) {
      throw new Error('Platform statistics failed to revert to 0 after expiry!');
    }

    // 4. Mark subscription as ACTIVE but NON-PREMIUM
    console.log('\nSetting subscription to active but standard (non-premium)...');
    sub.status = 'active';
    sub.isPremium = false;
    await sub.save();

    state = await checkState('Active Non-Premium Subscription');
    if (state.refreshedUser.membershipType !== 'standard') {
      throw new Error('User membershipType should remain standard for non-premium active subscription!');
    }
    if (state.refreshedPlatform.activeSubscribers !== 1 || state.refreshedPlatform.premiumUsers !== 0) {
      throw new Error('Platform statistics mismatch for active non-premium!');
    }

    // 5. Clean up
    console.log('\nCleaning up test data...');
    await Subscription.deleteOne({ _id: sub._id });
    // Run sync hooks once more after deleting subscription to reset counters
    await Platform.updateSubscribersCount(platform._id);
    await Subscription.updateUserPremiumStatus(user._id);

    state = await checkState('After Delete Cleanup');

    await User.deleteOne({ _id: user._id });
    await Platform.deleteOne({ _id: platform._id });

    await mongoose.disconnect();
    console.log('\n✓ ALL SYNC TESTS PASSED SUCCESSFULLY!');
  } catch (err) {
    console.error('\n✗ Test failed with error:', err.message);
    // Cleanup on error
    try {
      await User.deleteOne({ email: 'synctest@osm.com' });
      await Platform.deleteOne({ name: 'Sync Platform' });
    } catch (_) {}
    await mongoose.disconnect();
    process.exit(1);
  }
}

testSync();
