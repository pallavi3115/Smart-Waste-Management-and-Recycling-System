const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  user: {
    type: String,
    required: true,
    trim: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  action: {
    type: String,
    required: true,
    enum: ['CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'VIEW', 'EXPORT', 'ASSIGN', 'APPROVE', 'REJECT']
  },
  module: {
    type: String,
    required: true,
    enum: ['User Management', 'Bin Management', 'Recycling Center', 'Reports', 'Routes', 'Settings', 'Authentication', 'Collections']
  },
  description: {
    type: String,
    required: true
  },
  details: {
    type: Object,
    default: {}
  },
  ipAddress: {
    type: String,
    default: null
  },
  userAgent: {
    type: String,
    default: null
  },
  status: {
    type: String,
    enum: ['SUCCESS', 'FAILED'],
    default: 'SUCCESS'
  },
  changes: {
    before: { type: Object, default: null },
    after: { type: Object, default: null }
  }
}, {
  timestamps: true
});

// Index for faster queries
auditLogSchema.index({ createdAt: -1 });
auditLogSchema.index({ user: 1 });
auditLogSchema.index({ action: 1 });
auditLogSchema.index({ module: 1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);