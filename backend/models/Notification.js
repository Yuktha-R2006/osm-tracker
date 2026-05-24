const mongoose = require('mongoose');

const notificationSchema = mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  message: { type: String, required: [true, 'Please add a message'] },
  type: { 
    type: String, 
    enum: ['added', 'renewed', 'payment', 'upgraded', 'downgraded', 'expiry', 'expired', 'system'], 
    default: 'system' 
  },
  isRead: { type: Boolean, default: false },
}, {
  timestamps: true
});

module.exports = mongoose.model('Notification', notificationSchema);
