const mongoose = require('mongoose');

const platformSchema = mongoose.Schema({
  name: { type: String, required: [true, 'Please add a platform name'], unique: true, trim: true },
  logo: { type: String, required: [true, 'Please add a logo URL'] },
  accentColor: { type: String, default: '#ff0055' },
  description: { type: String, default: '' },
  monthlyPrice: { type: Number, default: 0 },
  activeSubscribers: { type: Number, default: 0, min: 0 },
  cancellationRate: { type: Number, default: 0 },
  premiumUsers: { type: Number, default: 0 },
  
  // Extra compatibility fields for frontend structure
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  plans: [{
    name: { type: String, required: true },
    pricingMonthly: { type: Number, required: true },
    pricingYearly: { type: Number, required: true }
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual compatibility properties
platformSchema.virtual('themeColor')
  .get(function() { return this.accentColor; })
  .set(function(val) { this.accentColor = val; });

platformSchema.virtual('subscribers')
  .get(function() { return this.activeSubscribers; })
  .set(function(val) { this.activeSubscribers = val; });

const Platform = mongoose.model('Platform', platformSchema);

try {
  mongoose.model('OTTPlatform', platformSchema);
} catch (e) {}

module.exports = Platform;
