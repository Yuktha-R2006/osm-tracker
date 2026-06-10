const OTTPlatform = require('../models/PlatformModel');
const Subscription = require('../models/SubscriptionModel');
const fs = require('fs');
const path = require('path');

// Helper to save base64 string as a local file in public/uploads and return its static path
const saveBase64Image = (base64String, platformName) => {
  if (!base64String || !base64String.startsWith('data:')) {
    return base64String;
  }
  
  const matches = base64String.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
  if (!matches || matches.length !== 3) {
    return base64String;
  }
  
  let ext = matches[1].split('/')[1] || 'png';
  ext = ext.split('+')[0]; // convert e.g. svg+xml to svg
  const dataBuffer = Buffer.from(matches[2], 'base64');
  
  const filename = `logo-${platformName.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now()}.${ext}`;
  const uploadDir = path.join(__dirname, '../public/uploads');
  
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
  
  const filepath = path.join(uploadDir, filename);
  fs.writeFileSync(filepath, dataBuffer);
  
  return `/uploads/${filename}`;
};

// @desc    Get all active OTT platforms
// @route   GET /api/platforms
// @access  Public/Private
const getPlatforms = async (req, res, next) => {
  try {
    const platforms = await OTTPlatform.find({ status: 'active' });
    res.json(platforms);
  } catch (error) {
    next(error);
  }
};

// @desc    Get all OTT platforms (including inactive)
// @route   GET /api/platforms/all
// @access  Private/Admin
const getAllPlatforms = async (req, res, next) => {
  try {
    const platforms = await OTTPlatform.find({});
    const enrichedPlatforms = await Promise.all(platforms.map(async (platform) => {
      const allSubs = await Subscription.find({ ottPlatformId: platform._id });
      const activeSubs = allSubs.filter(s => s.status === 'active');
      const cancelledSubs = allSubs.filter(s => s.status === 'cancelled');
      const premiumSubs = allSubs.filter(s => s.isPremium);

      const activeCount = activeSubs.length;
      const totalCount = allSubs.length;
      
      const cancellationPercentage = totalCount > 0 
        ? Math.round((cancelledSubs.length / totalCount) * 100)
        : 0;

      const isTrending = ['Netflix', 'Amazon Prime Video', 'Amazon Prime', 'Disney+ Hotstar'].includes(platform.name) && activeCount > 8;

      return {
        ...platform.toObject(),
        subscribers: activeCount,
        activeUsers: activeCount,
        cancellationPercentage,
        premiumSubscribers: premiumSubs.length,
        isTrending
      };
    }));
    res.json(enrichedPlatforms);
  } catch (error) {
    next(error);
  }
};

// @desc    Create new OTT platform
// @route   POST /api/platforms
// @access  Private/Admin
const createPlatform = async (req, res, next) => {
  try {
    const { name, logo, status, themeColor, description, plans } = req.body;
    const platformExists = await OTTPlatform.findOne({ name });
    if (platformExists) {
      return res.status(400).json({ message: 'Platform already exists' });
    }
    
    const logoPath = saveBase64Image(logo, name);
    
    const platform = await OTTPlatform.create({ 
      name, 
      logo: logoPath, 
      status,
      accentColor: themeColor || '#ff0055',
      themeColor: themeColor || '#ff0055',
      description: description || '',
      plans: plans || []
    });
    res.status(201).json(platform);
  } catch (error) {
    next(error);
  }
};

// @desc    Update OTT platform
// @route   PUT /api/platforms/:id
// @access  Private/Admin
const updatePlatform = async (req, res, next) => {
  try {
    const platformId = req.params.id;
    const updateData = {};
    
    let platformName = req.body.name;
    if (!platformName) {
      const platformDoc = await OTTPlatform.findById(platformId);
      platformName = platformDoc ? platformDoc.name : 'platform';
    }
    
    if (req.body.name !== undefined) updateData.name = req.body.name;
    if (req.body.logo !== undefined) {
      updateData.logo = saveBase64Image(req.body.logo, platformName);
    }
    if (req.body.status !== undefined) updateData.status = req.body.status;
    if (req.body.themeColor !== undefined) {
      updateData.accentColor = req.body.themeColor;
      updateData.themeColor = req.body.themeColor;
    }
    if (req.body.description !== undefined) updateData.description = req.body.description;
    if (req.body.plans !== undefined) updateData.plans = req.body.plans;
    
    const updatedPlatform = await OTTPlatform.findByIdAndUpdate(
      platformId,
      { $set: updateData },
      { new: true, runValidators: true }
    );
    
    if (!updatedPlatform) {
      return res.status(404).json({ message: 'Platform not found' });
    }
    
    res.json(updatedPlatform);
  } catch (error) {
    next(error);
  }
};

const uploadLogo = async (req, res, next) => {
  try {
    const platformId = req.params.id || req.body.platformId;
    const { logo } = req.body;
    
    if (!platformId) {
      return res.status(400).json({ message: 'Platform ID is required' });
    }
    if (!logo) {
      return res.status(400).json({ message: 'Logo data is required' });
    }
    
    const platformDoc = await OTTPlatform.findById(platformId);
    if (!platformDoc) {
      return res.status(404).json({ message: 'Platform not found' });
    }
    
    const logoPath = saveBase64Image(logo, platformDoc.name);
    
    const updatedPlatform = await OTTPlatform.findByIdAndUpdate(
      platformId,
      { $set: { logo: logoPath } },
      { new: true, runValidators: true }
    );
    
    res.json(updatedPlatform);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete OTT platform
// @route   DELETE /api/platforms/:id
// @access  Private/Admin
const deletePlatform = async (req, res, next) => {
  try {
    const platform = await OTTPlatform.findById(req.params.id);
    if (!platform) {
      return res.status(404).json({ message: 'Platform not found' });
    }
    
    await platform.deleteOne();
    res.json({ message: 'Platform removed' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getPlatforms, getAllPlatforms, createPlatform, updatePlatform, deletePlatform, uploadLogo };
