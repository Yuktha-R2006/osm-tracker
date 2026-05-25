const User = require('../models/UserModel');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Generate tokens
const generateTokens = (id, role) => {
  const accessToken = jwt.sign({ id, role }, process.env.JWT_ACCESS_SECRET, {
    expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m'
  });
  const refreshToken = jwt.sign({ id, role }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d'
  });
  return { accessToken, refreshToken };
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      password: hashedPassword
    });

    if (user) {
      const { accessToken } = generateTokens(user._id, user.role);
      res.status(201).json({
        token: accessToken,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Auth user & get tokens
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res, next) => {
  console.log("LOGIN ROUTE HIT");
  console.log(req.body);
  try {
    const { email, password, role } = req.body;

    // Admin login with hard-coded credentials
    if (role === 'admin') {
      if (email !== 'admin@osm.com' || password !== 'admin123') {
        return res.status(401).json({ message: 'Invalid admin credentials' });
      }
      
      // Find or create admin user
      let adminUser = await User.findOne({ email: 'admin@osm.com' });
      if (!adminUser) {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('admin123', salt);
        adminUser = await User.create({
          name: 'System Admin',
          email: 'admin@osm.com',
          password: hashedPassword,
          role: 'admin'
        });
      }
      
      const { accessToken } = generateTokens(adminUser._id, adminUser.role);
      res.json({
        token: accessToken,
        user: {
          _id: adminUser._id,
          name: adminUser.name,
          email: adminUser.email,
          role: adminUser.role
        }
      });
      return;
    }

    // User login - only allow users with role='user'
    const user = await User.findOne({ email });

    if (user && (await bcrypt.compare(password, user.password))) {
      // Validate that user has 'user' role
      if (user.role !== 'user') {
        return res.status(403).json({ message: 'Invalid user credentials' });
      }
      
      const { accessToken } = generateTokens(user._id, user.role);
      
      res.json({
        token: accessToken,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      });
    } else {
      res.status(401).json({ message: 'Invalid user credentials' });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Refresh token
// @route   POST /api/auth/refresh
// @access  Public
const refreshToken = async (req, res, next) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(401).json({ message: 'No refresh token provided' });

    jwt.verify(token, process.env.JWT_REFRESH_SECRET, (err, decoded) => {
      if (err) return res.status(403).json({ message: 'Invalid refresh token' });

      const newTokens = generateTokens(decoded.id, decoded.role);
      res.json({ accessToken: newTokens.accessToken, refreshToken: newTokens.refreshToken });
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
const getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    if (req.body.profileImage !== undefined) {
      user.profileImage = req.body.profileImage;
    }
    if (req.body.favoriteOTT !== undefined) {
      user.favoriteOTT = req.body.favoriteOTT;
    }
    
    if (req.body.password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(req.body.password, salt);
    }

    const updatedUser = await user.save();
    
    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      profileImage: updatedUser.profileImage,
      favoriteOTT: updatedUser.favoriteOTT,
      isPremium: updatedUser.isPremium,
      totalWatchTime: updatedUser.totalWatchTime,
      watchHistory: updatedUser.watchHistory,
      darkMode: updatedUser.darkMode,
      emailNotifications: updatedUser.emailNotifications,
      autoRenewalAlerts: updatedUser.autoRenewalAlerts,
      joinedDate: updatedUser.joinedDate
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user settings
// @route   PUT /api/auth/settings
// @access  Private
const updateUserSettings = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (req.body.darkMode !== undefined) user.darkMode = req.body.darkMode;
    if (req.body.emailNotifications !== undefined) user.emailNotifications = req.body.emailNotifications;
    if (req.body.autoRenewalAlerts !== undefined) user.autoRenewalAlerts = req.body.autoRenewalAlerts;
    if (req.body.isPremium !== undefined) user.isPremium = req.body.isPremium;

    const updatedUser = await user.save();
    
    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      profileImage: updatedUser.profileImage,
      favoriteOTT: updatedUser.favoriteOTT,
      isPremium: updatedUser.isPremium,
      totalWatchTime: updatedUser.totalWatchTime,
      watchHistory: updatedUser.watchHistory,
      darkMode: updatedUser.darkMode,
      emailNotifications: updatedUser.emailNotifications,
      autoRenewalAlerts: updatedUser.autoRenewalAlerts,
      joinedDate: updatedUser.joinedDate
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user account
// @route   DELETE /api/auth/profile
// @access  Private
const deleteUserAccount = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const Subscription = require('../models/Subscription');
    await Subscription.deleteMany({ userId: user._id });

    const Notification = require('../models/Notification');
    await Notification.deleteMany({ userId: user._id });

    await user.deleteOne();
    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerUser,
  loginUser,
  refreshToken,
  getUserProfile,
  updateUserProfile,
  updateUserSettings,
  deleteUserAccount
};
