const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: [
      'NEW_REPORT',
      'REPORT_UPDATE',
      'REPORT_RESOLVED',
      'BIN_ALERT',
      'FIRE_ALERT',
      'COLLECTION_REMINDER',
      'ACHIEVEMENT_UNLOCKED',
      'REWARD_CLAIMED',
      'SYSTEM_UPDATE',
      'WELCOME',
      'COMMENT',
      'MENTION'
    ],
    required: true
  },
  priority: {
    type: String,
    enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
    default: 'MEDIUM'
  },
  data: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  image: String,
  actions: [{
    label: String,
    url: String,
    type: String
  }],
  read: {
    type: Boolean,
    default: false
  },
  readAt: Date,
  delivered: {
    type: Boolean,
    default: false
  },
  deliveredAt: Date,
  expiresAt: Date,
  scheduledFor: Date
}, {
  timestamps: true
});

// Index for faster queries
notificationSchema.index({ user: 1, createdAt: -1, read: 1 });
notificationSchema.index({ type: 1, priority: 1 });
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Mark as read
notificationSchema.methods.markAsRead = function() {
  this.read = true;
  this.readAt = new Date();
  return this.save();
};

// Mark as delivered
notificationSchema.methods.markAsDelivered = function() {
  this.delivered = true;
  this.deliveredAt = new Date();
  return this.save();
};

module.exports = mongoose.model('Notification', notificationSchema);