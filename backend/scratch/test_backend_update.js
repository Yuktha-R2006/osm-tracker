require('dotenv').config();
const mongoose = require('mongoose');
const { updatePlatform } = require('../controllers/platformController');
const Platform = require('../models/PlatformModel');

async function run() {
  try {
    await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    // Find the first platform (Netflix)
    const platform = await Platform.findOne({ name: 'Netflix' });
    if (!platform) {
      console.error('Netflix platform not found in DB!');
      process.exit(1);
    }
    
    console.log('Before update:');
    console.log(`- Logo: ${platform.logo}`);
    console.log(`- AccentColor: ${platform.accentColor}`);
    
    // Create a mock base64 image (small 1x1 transparent pixel)
    const mockBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';
    
    // Mock express request & response
    const req = {
      params: { id: platform._id.toString() },
      body: {
        name: 'Netflix',
        logo: mockBase64,
        themeColor: '#ff0055'
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
    
    console.log('Triggering updatePlatform controller...');
    await updatePlatform(req, res, next);
    
    console.log('Response Status:', responseStatus || 200);
    console.log('Response Data:');
    if (responseData) {
      console.log(`- ID: ${responseData._id}`);
      console.log(`- Name: ${responseData.name}`);
      console.log(`- Logo Path: ${responseData.logo}`);
      console.log(`- AccentColor: ${responseData.accentColor}`);
    } else {
      console.log('No response data returned!');
    }
    
    // Double check the DB to ensure it was saved
    const updatedPlatform = await Platform.findById(platform._id);
    console.log('After update query in DB:');
    console.log(`- Logo in DB: ${updatedPlatform.logo}`);
    console.log(`- AccentColor in DB: ${updatedPlatform.accentColor}`);
    
    process.exit(0);
  } catch (err) {
    console.error('Fatal test error:', err);
    process.exit(1);
  }
}

run();
