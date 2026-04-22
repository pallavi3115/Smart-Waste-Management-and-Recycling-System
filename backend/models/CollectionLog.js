const mongoose = require('mongoose');

const collectionLogSchema = new mongoose.Schema({
  logId: {
    type: String,
    required: true,
    unique: true
  },
  route: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Route',
    required: true
  },
  driver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Driver',
    required: true
  },
  bin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Bin',
    required: true
  },
  stopId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Route.stops'
  },
  collectionTime: {
    type: Date,
    default: Date.now
  },
  wasteType: {
    type: String,
    enum: ['General', 'Recyclable', 'Organic', 'Hazardous', 'E-Waste'],
    required: true
  },
  quantity: {
    type: Number,
    required: true // in kg
  },
  fillLevelBefore: {
    type: Number,
    default: 0
  },
  fillLevelAfter: {
    type: Number,
    default: 0
  },
  photos: {
    before: String,
    after: String
  },
  location: {
    lat: Number,
    lng: Number
  },
  notes: String,
  issues: [String],
  verified: {
    type: Boolean,
    default: false
  },
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  verifiedAt: Date
}, {
  timestamps: true
});

// Generate log ID before saving
collectionLogSchema.pre('save', async function(next) {
  if (!this.logId) {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const count = await mongoose.model('CollectionLog').countDocuments() + 1;
    this.logId = `CL-${year}${month}${day}-${String(count).padStart(4, '0')}`;
  }
  next();
});

module.exports = mongoose.model('CollectionLog', collectionLogSchema);