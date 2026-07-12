const mongoose = require('mongoose');

const subscriptionSchema = mongoose.Schema({
  // Requested fields
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  platformId: { type: mongoose.Schema.Types.ObjectId, ref: 'Platform', required: true },
  subscriptionType: { type: String, required: [true, 'Please add a subscription type'], trim: true },
  isPremium: { type: Boolean, default: false },
  status: { type: String, enum: ['active', 'expired', 'cancelled'], default: 'active' },
  renewalCount: { type: Number, default: 0 },
  activeDays: { type: Number, default: 0 },
  startDate: { type: Date, required: [true, 'Please add a start date'] },
  endDate: { type: Date, required: [true, 'Please add an end date'] },
  cancelled: { type: Boolean, default: false },
  autoRenew: { type: Boolean, default: false },

  // Compatibility fields for the frontend and older API controller logic
  ottPlatformId: { type: mongoose.Schema.Types.ObjectId, ref: 'Platform' },
  planName: { type: String },
  expiryDate: { type: Date },
  autoRenewal: { type: Boolean },
  isCancelled: { type: Boolean },
  subscriptionCost: { type: Number, required: [true, 'Please add subscription cost'], min: 0 },
  renewalType: { type: String, enum: ['auto', 'manual'], default: 'manual' },
  cancellationDate: { type: Date },
  nextBillingDate: { type: Date }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Hook to keep requested and compatibility fields perfectly synchronized in database
subscriptionSchema.pre('save', function() {
  // Synchronize platform IDs
  if (this.isModified('platformId')) {
    this.ottPlatformId = this.platformId;
  } else if (this.isModified('ottPlatformId')) {
    this.platformId = this.ottPlatformId;
  } else if (!this.platformId && this.ottPlatformId) {
    this.platformId = this.ottPlatformId;
  } else if (!this.ottPlatformId && this.platformId) {
    this.ottPlatformId = this.platformId;
  }
  
  // Synchronize plan names
  if (this.isModified('subscriptionType')) {
    this.planName = this.subscriptionType;
  } else if (this.isModified('planName')) {
    this.subscriptionType = this.planName;
  } else if (!this.subscriptionType && this.planName) {
    this.subscriptionType = this.planName;
  } else if (!this.planName && this.subscriptionType) {
    this.planName = this.subscriptionType;
  }
  
  // Synchronize expiry/end dates
  if (this.isModified('endDate')) {
    this.expiryDate = this.endDate;
  } else if (this.isModified('expiryDate')) {
    this.endDate = this.expiryDate;
  } else if (!this.endDate && this.expiryDate) {
    this.endDate = this.expiryDate;
  } else if (!this.expiryDate && this.endDate) {
    this.expiryDate = this.endDate;
  }
  
  // Synchronize auto renewal toggles
  if (this.isModified('autoRenew')) {
    this.autoRenewal = this.autoRenew;
  } else if (this.isModified('autoRenewal')) {
    this.autoRenew = this.autoRenewal;
  } else if (this.autoRenew !== undefined && this.autoRenewal === undefined) {
    this.autoRenewal = this.autoRenew;
  } else if (this.autoRenewal !== undefined && this.autoRenew === undefined) {
    this.autoRenew = this.autoRenewal;
  }
  
  // Synchronize cancellation flags
  if (this.isModified('cancelled')) {
    this.isCancelled = this.cancelled;
  } else if (this.isModified('isCancelled')) {
    this.cancelled = this.isCancelled;
  } else if (this.cancelled !== undefined && this.isCancelled === undefined) {
    this.isCancelled = this.cancelled;
  } else if (this.isCancelled !== undefined && this.cancelled === undefined) {
    this.cancelled = this.isCancelled;
  }

  // Synchronize status based on cancellation state
  if (this.status === 'cancelled') {
    this.cancelled = true;
    this.isCancelled = true;
  } else if (this.status === 'active') {
    this.cancelled = false;
    this.isCancelled = false;
  } else if (this.cancelled || this.isCancelled) {
    this.status = 'cancelled';
  }
});

const Subscription = mongoose.model('Subscription', subscriptionSchema);

// Fallback registration to prevent ref errors
try {
  mongoose.model('SubscriptionModel', subscriptionSchema);
} catch (e) {}

module.exports = Subscription;
