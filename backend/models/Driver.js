const mongoose = require('mongoose');

const driverSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  employeeId: {
    type: String,
    required: true,
    unique: true
  },
  licenseNumber: {
    type: String,
    required: true
  },
  vehicleType: {
    type: String,
    enum: ['Truck', 'Compactor', 'Dumper', 'Loader'],
    default: 'Truck'
  },
  vehicleNumber: {
    type: String,
    required: true
  },
  assignedZone: {
    type: String,
    required: true
  },
  shift: {
    type: String,
    enum: ['Morning', 'Evening', 'Night'],
    default: 'Morning'
  },
  shiftTimings: {
    start: { type: String, default: '09:00' },
    end: { type: String, default: '17:00' }
  },
  joiningDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['Active', 'On Leave', 'Off Duty', 'Suspended'],
    default: 'Active'
  },
  performance: {
    rating: { type: Number, default: 0, min: 0, max: 5 },
    totalCollections: { type: Number, default: 0 },
    onTimeDeliveries: { type: Number, default: 0 },
    fuelEfficiency: { type: Number, default: 0 },
    customerRating: { type: Number, default: 0 }
  },
  earnings: {
    baseSalary: { type: Number, default: 0 },
    bonus: { type: Number, default: 0 },
    totalEarned: { type: Number, default: 0 },
    lastPayout: Date
  },
  currentLocation: {
    lat: Number,
    lng: Number,
    lastUpdated: Date
  },
  documents: {
    license: { type: String },
    idProof: { type: String },
    addressProof: { type: String }
  },
  isOnline: {
    type: Boolean,
    default: false
  },
  notifications: [{
    title: String,
    message: String,
    type: String,
    read: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
  }]
}, {
  timestamps: true
});

// Index for faster queries
driverSchema.index({ assignedZone: 1, status: 1 });
driverSchema.index({ 'currentLocation.coordinates': '2dsphere' });

module.exports = mongoose.model('Driver', driverSchema);