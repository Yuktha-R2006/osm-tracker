const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
  numericId: { type: Number, unique: true },
  name: { type: String, required: [true, 'Please add a name'], trim: true },
  email: { 
    type: String, 
    required: [true, 'Please add an email'], 
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please add a valid email']
  },
  password: { type: String, required: [true, 'Please add a password'], minlength: 6 },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  avatar: { type: String, default: '' },
  membershipType: { type: String, enum: ['standard', 'premium'], default: 'standard' },
  activeDays: { type: Number, default: 0 },
  renewalCount: { type: Number, default: 0 },
  preferredPlatform: { type: String, default: '' },
  currencyPreference: { type: String, default: 'USD' },
  darkMode: { type: Boolean, default: true },
  
  // Extra fields for frontend system features
  joinedDate: { type: Date, default: Date.now },
  lastActive: { type: Date, default: Date.now },
  isActive: { type: Boolean, default: true },
  emailNotifications: { type: Boolean, default: true },
  autoRenewalAlerts: { type: Boolean, default: true }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual mappings for 100% frontend and controller compatibility
userSchema.virtual('profileImage')
  .get(function() { return this.avatar; })
  .set(function(val) { this.avatar = val; });

userSchema.virtual('favoriteOTT')
  .get(function() { return this.preferredPlatform; })
  .set(function(val) { this.preferredPlatform = val; });

userSchema.virtual('totalRenewals')
  .get(function() { return this.renewalCount; })
  .set(function(val) { this.renewalCount = val; });

userSchema.virtual('activeSubscriptionDays')
  .get(function() { return this.activeDays; })
  .set(function(val) { this.activeDays = val; });

userSchema.virtual('isPremium')
  .get(function() { return this.membershipType === 'premium'; })
  .set(function(val) { this.membershipType = val ? 'premium' : 'standard'; });

const User = mongoose.model('User', userSchema);

try {
  mongoose.model('UserModel', userSchema);
} catch (e) {}

module.exports = User;
