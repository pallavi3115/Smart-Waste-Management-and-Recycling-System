const mongoose = require('mongoose');

const routeSchema = new mongoose.Schema({
  driver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  truckId: String,
  date: {
    type: Date,
    required: true
  },
  startTime: Date,
  endTime: Date,
  status: {
    type: String,
    enum: ['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'],
    default: 'SCHEDULED'
  },
  stops: [{
    bin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Bin',
      required: true
    },
    estimatedArrival: Date,
    actualArrival: Date,
    estimatedFillLevel: Number,
    actualFillLevel: Number,
    collected: {
      type: Boolean,
      default: false
    },
    collectedAt: Date,
    wasteType: String,
    quantity: Number,
    notes: String
  }],
  totalDistance: Number,
  estimatedDuration: Number,
  actualDuration: Number,
  fuelUsed: Number,
  optimizationScore: Number,
  routeGeometry: {
    type: {
      type: String,
      enum: ['LineString'],
      default: 'LineString'
    },
    coordinates: [[Number]]
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Index for date queries
routeSchema.index({ date: 1, driver: 1 });

module.exports = mongoose.model('Route', routeSchema);