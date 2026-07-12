require('dotenv').config();
const mongoose = require('mongoose');
const { createPlatform } = require('../controllers/platformController');
const Platform = require('../models/PlatformModel');

async function run() {
  try {
    await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Delete existing Hulu platform if any, so we can test clean creation
    await Platform.deleteOne({ name: 'Hulu Test' });

    // Mock express request & response
    const req = {
      body: {
        name: 'Hulu Test',
        logo: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
        status: 'active',
        themeColor: '#00e575',
        description: 'Test platform description',
        plans: [
          {
            name: 'Premium',
            pricingMonthly: 7.99,
            pricingYearly: 79.99
          }
        ]
      }
    };

    let responseData = null;
    let responseStatus = null;

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
        console.error('Express next() error:', err);
      }
    };

    console.log('Triggering createPlatform controller...');
    await createPlatform(req, res, next);

    console.log('Response Status:', responseStatus || 201);
    console.log('Response Data:');
    if (responseData) {
      console.log(JSON.stringify(responseData, null, 2));
    } else {
      console.log('No response data returned!');
    }

    // Clean up
    await Platform.deleteOne({ name: 'Hulu Test' });

    process.exit(0);
  } catch (err) {
    console.error('Fatal test error:', err);
    process.exit(1);
  }
}

run();
