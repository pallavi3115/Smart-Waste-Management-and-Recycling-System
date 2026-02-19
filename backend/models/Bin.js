const mongoose = require('mongoose');

const binSchema = new mongoose.Schema({
  binId: {
    type: String,
    required: true,
    unique: true
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      required: true,
      index: '2dsphere'
    },
    address: String,
    ward: String,
    zone: String
  },
  type: {
    type: String,
    enum: ['General', 'Recyclable', 'Organic', 'Hazardous', 'E-Waste'],
    default: 'General'
  },
  capacity: {
    type: Number,
    required: true, // in liters
    default: 1000
  },
  currentFillLevel: {
    type: Number,
    default: 0, // percentage
    min: 0,
    max: 100
  },
  status: {
    type: String,
    enum: ['Empty', 'Partial', 'Full', 'Overflowing', 'Maintenance', 'Offline'],
    default: 'Empty'
  },
  sensors: {
    ultrasonic: { type: Boolean, default: true },
    weight: { type: Boolean, default: false },
    temperature: { type: Boolean, default: false },
    fire: { type: Boolean, default: false },
    gas: { type: Boolean, default: false }
  },
  sensorData: {
    temperature: Number,
    humidity: Number,
    gasLevel: Number,
    weight: Number,
    lastCalibrated: Date
  },
  alerts: {
    fire: { type: Boolean, default: false },
    overheating: { type: Boolean, default: false },
    gasLeak: { type: Boolean, default: false },
    tamper: { type: Boolean, default: false }
  },
  maintenance: {
    lastServiced: Date,
    nextServiceDue: Date,
    serviceCount: { type: Number, default: 0 },
    issues: [{
      type: String,
      reportedAt: Date,
      resolvedAt: Date,
      notes: String
    }]
  },
  batteryLevel: {
    type: Number,
    min: 0,
    max: 100,
    default: 100
  },
  signalStrength: {
    type: Number,
    min: 0,
    max: 100,
    default: 100
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  collectionSchedule: [{
    day: String,
    time: String
  }],
  assignedTruck: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  qrCode: String,
  notes: String,
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes for faster queries
binSchema.index({ 'location.coordinates': '2dsphere' });
binSchema.index({ status: 1 });
binSchema.index({ 'alerts.fire': 1 });
binSchema.index({ currentFillLevel: 1 });

// Virtual for collection logs
binSchema.virtual('collectionLogs', {
  ref: 'CollectionLog',
  localField: '_id',
  foreignField: 'bin'
});

// Check if bin needs collection
binSchema.methods.needsCollection = function() {
  return this.currentFillLevel >= 80 || this.alerts.fire || this.alerts.gasLeak;
};

// Generate QR code
binSchema.methods.generateQRCode = async function() {
  const QRCode = require('qrcode');
  const qrData = JSON.stringify({
    binId: this.binId,
    location: this.location.coordinates,
    type: this.type
  });
  
  try {
    this.qrCode = await QRCode.toDataURL(qrData);
    return this.qrCode;
  } catch (error) {
    console.error('QR generation error:', error);
    return null;
  }
};

// Update status based on fill level
binSchema.pre('save', function(next) {
  if (this.currentFillLevel < 25) {
    this.status = 'Empty';
  } else if (this.currentFillLevel < 75) {
    this.status = 'Partial';
  } else if (this.currentFillLevel < 95) {
    this.status = 'Full';
  } else {
    this.status = 'Overflowing';
  }
  
  this.lastUpdated = Date.now();
  next();
});

module.exports = mongoose.model('Bin', binSchema);