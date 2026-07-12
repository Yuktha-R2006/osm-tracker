const mongoose = require('mongoose');
require('dotenv').config();
const Notification = require('../models/Notification');
const Subscription = require('../models/SubscriptionModel');
const Platform = require('../models/PlatformModel');

const API_URL = 'http://127.0.0.1:5000/api';

async function verifyNotifications() {
  try {
    // Connect to database to inspect notifications
    await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI);
    console.log('Connected to Database.');

    // 1. Log in
    console.log('\n1. Logging in as demo@osm.com...');
    const loginRes = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'demo@osm.com',
        password: 'password123'
      })
    });
    
    if (!loginRes.ok) {
      const errText = await loginRes.text();
      throw new Error(`Login failed with status ${loginRes.status}: ${errText}`);
    }
    
    const loginData = await loginRes.json();
    const token = loginData.accessToken;
    const userId = loginData._id;
    console.log('Login successful. User ID:', userId);

    // Set authorization header
    const headers = { 
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}` 
    };

    // Get Zee5 platform
    const platform = await Platform.findOne({ name: 'Zee5' });
    if (!platform) {
      throw new Error('Zee5 platform not found in DB!');
    }
    const platformId = platform._id.toString();

    // Clean up existing Zee5 subscriptions for this user to start clean
    await Subscription.deleteMany({ userId, platformId });
    await Notification.deleteMany({ userId, message: /Zee5/i });
    console.log('Cleaned up existing Zee5 subscriptions and notifications.');

    // 2. Add subscription
    console.log('\n2. Testing POST /api/subscriptions (Create)...');
    const startDate = new Date();
    const expiryDate = new Date();
    expiryDate.setDate(startDate.getDate() + 30);

    const createRes = await fetch(`${API_URL}/subscriptions`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        ottPlatformId: platformId,
        planName: 'Premium HD',
        startDate: startDate.toISOString(),
        expiryDate: expiryDate.toISOString(),
        subscriptionCost: 5.99,
        autoRenewal: false
      })
    });

    console.log('Response Status:', createRes.status);
    if (!createRes.ok) {
      const errText = await createRes.text();
      throw new Error(`Create subscription failed: ${errText}`);
    }
    
    const createData = await createRes.json();
    const subId = createData._id;
    console.log('Created subscription ID:', subId);

    // Verify Notification in DB
    let notifs = await Notification.find({ userId, type: 'added' }).sort({ createdAt: -1 });
    const addedNotif = notifs.find(n => n.message.includes('Zee5'));
    if (addedNotif) {
      console.log('✓ Success: "added" notification found in DB:', addedNotif.message);
    } else {
      console.error('✗ Failure: "added" notification NOT found in DB!');
    }

    // 3. Renew subscription (extend expiryDate on active subscription)
    console.log('\n3. Testing PUT /api/subscriptions/:id (Renew while active)...');
    const extendedExpiryDate = new Date(expiryDate);
    extendedExpiryDate.setDate(extendedExpiryDate.getDate() + 30);

    const renewRes = await fetch(`${API_URL}/subscriptions/${subId}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({
        status: 'active',
        expiryDate: extendedExpiryDate.toISOString()
      })
    });

    console.log('Response Status:', renewRes.status);
    if (!renewRes.ok) {
      const errText = await renewRes.text();
      throw new Error(`Renew subscription failed: ${errText}`);
    }

    // Verify Renewal Notification in DB
    notifs = await Notification.find({ userId, type: 'renewed' }).sort({ createdAt: -1 });
    const renewNotif = notifs.find(n => n.message.includes('Zee5'));
    if (renewNotif) {
      console.log('✓ Success: "renewed" notification found in DB:', renewNotif.message);
    } else {
      console.error('✗ Failure: "renewed" notification NOT found in DB!');
    }

    // 4. Cancel/Delete subscription
    console.log('\n4. Testing DELETE /api/subscriptions/:id (Cancel)...');
    const cancelRes = await fetch(`${API_URL}/subscriptions/${subId}`, {
      method: 'DELETE',
      headers
    });
    console.log('Response Status:', cancelRes.status);
    if (!cancelRes.ok) {
      const errText = await cancelRes.text();
      throw new Error(`Cancel subscription failed: ${errText}`);
    }

    // Verify Cancellation Notification in DB
    notifs = await Notification.find({ userId, type: 'expired' }).sort({ createdAt: -1 });
    const cancelNotif = notifs.find(n => n.message.includes('Zee5'));
    if (cancelNotif) {
      console.log('✓ Success: "expired" notification found in DB (mapping cancellation):', cancelNotif.message);
    } else {
      console.error('✗ Failure: "expired" notification NOT found in DB!');
    }

    // Final clean up of test subscription/notifications
    await Subscription.deleteOne({ _id: subId });
    await Notification.deleteMany({ userId, message: /Zee5/i });
    console.log('\nCleaned up test data.');

    await mongoose.disconnect();
    console.log('Disconnected. Verification complete!');
  } catch (error) {
    console.error('Verification failed with error:', error.message);
    await mongoose.disconnect();
  }
}

verifyNotifications();
