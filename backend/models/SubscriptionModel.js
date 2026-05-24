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
  if (this.platformId && !this.ottPlatformId) {
    this.ottPlatformId = this.platformId;
  } else if (this.ottPlatformId && !this.platformId) {
    this.platformId = this.ottPlatformId;
  }
  
  if (this.subscriptionType && !this.planName) {
    this.planName = this.subscriptionType;
  } else if (this.planName && !this.subscriptionType) {
    this.subscriptionType = this.planName;
  }
  
  if (this.endDate && !this.expiryDate) {
    this.expiryDate = this.endDate;
  } else if (this.expiryDate && !this.endDate) {
    this.endDate = this.expiryDate;
  }
  
  if (this.autoRenew !== undefined && this.autoRenewal === undefined) {
    this.autoRenewal = this.autoRenew;
  } else if (this.autoRenewal !== undefined && this.autoRenew === undefined) {
    this.autoRenew = this.autoRenewal;
  }
  
  if (this.cancelled !== undefined && this.isCancelled === undefined) {
    this.isCancelled = this.cancelled;
  } else if (this.isCancelled !== undefined && this.cancelled === undefined) {
    this.cancelled = this.isCancelled;
  }
});

const Subscription = mongoose.model('Subscription', subscriptionSchema);

// Fallback registration to prevent ref errors
try {
  mongoose.model('SubscriptionModel', subscriptionSchema);
} catch (e) {}

module.exports = Subscription;
