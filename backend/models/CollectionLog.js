const mongoose = require('mongoose');

const collectionLogSchema = new mongoose.Schema({
  bin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Bin',
    required: true
  },
  driver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  truckId: String,
  collectionTime: {
    type: Date,
    default: Date.now
  },
  fillLevelBefore: Number,
  fillLevelAfter: Number,
  wasteType: {
    type: String,
    enum: ['General', 'Recyclable', 'Organic', 'Hazardous', 'Mixed'],
    required: true
  },
  quantity: {
    type: Number, // in kg
    required: true
  },
  photos: [{
    before: String,
    after: String,
    timestamp: Date
  }],
  notes: String,
  issues: [String],
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: [Number]
  },
  route: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Route'
  },
  verificationStatus: {
    type: String,
    enum: ['Pending', 'Verified', 'Disputed'],
    default: 'Pending'
  }
}, {
  timestamps: true
});

// Index for faster queries
collectionLogSchema.index({ bin: 1, collectionTime: -1 });
collectionLogSchema.index({ driver: 1, collectionTime: -1 });

module.exports = mongoose.model('CollectionLog', collectionLogSchema);