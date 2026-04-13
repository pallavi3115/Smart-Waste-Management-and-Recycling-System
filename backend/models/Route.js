// const mongoose = require('mongoose');

// const routeSchema = new mongoose.Schema({
//   driver: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User',
//     required: true
//   },
//   truckId: String,
//   date: {
//     type: Date,
//     required: true
//   },
//   startTime: Date,
//   endTime: Date,
//   status: {
//     type: String,
//     enum: ['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'],
//     default: 'SCHEDULED'
//   },
//   stops: [{
//     bin: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: 'Bin',
//       required: true
//     },
//     estimatedArrival: Date,
//     actualArrival: Date,
//     estimatedFillLevel: Number,
//     actualFillLevel: Number,
//     collected: {
//       type: Boolean,
//       default: false
//     },
//     collectedAt: Date,
//     wasteType: String,
//     quantity: Number,
//     notes: String
//   }],
//   totalDistance: Number,
//   estimatedDuration: Number,
//   actualDuration: Number,
//   fuelUsed: Number,
//   optimizationScore: Number,
//   routeGeometry: {
//     type: {
//       type: String,
//       enum: ['LineString'],
//       default: 'LineString'
//     },
//     coordinates: [[Number]]
//   },
//   createdBy: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User'
//   }
// }, {
//   timestamps: true
// });

// // Index for date queries
// routeSchema.index({ date: 1, driver: 1 });

// module.exports = mongoose.model('Route', routeSchema);

const mongoose = require('mongoose');

const routeSchema = new mongoose.Schema({
  routeId: {
    type: String,
    required: true,
    unique: true
  },
  driver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Driver',
    required: true
  },
  truckId: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  shift: {
    type: String,
    enum: ['Morning', 'Evening', 'Night'],
    required: true
  },
  status: {
    type: String,
    enum: ['Assigned', 'Started', 'In Progress', 'Completed', 'Cancelled', 'Delayed'],
    default: 'Assigned'
  },
  startTime: Date,
  endTime: Date,
  estimatedDuration: Number, // in minutes
  actualDuration: Number,
  totalDistance: Number, // in km
  fuelUsed: Number, // in liters
  stops: [{
    stopId: Number,
    bin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Bin',
      required: true
    },
    binDetails: {
      location: {
        lat: Number,
        lng: Number,
        address: String
      },
      expectedFillLevel: Number,
      actualFillLevel: Number,
      binType: String
    },
    estimatedArrival: Date,
    actualArrival: Date,
    estimatedDeparture: Date,
    actualDeparture: Date,
    status: {
      type: String,
      enum: ['Pending', 'Completed', 'Skipped', 'Failed'],
      default: 'Pending'
    },
    wasteCollected: {
      type: Number,
      default: 0
    },
    wasteType: {
      type: String,
      enum: ['General', 'Recyclable', 'Organic', 'Hazardous']
    },
    photos: [{
      before: String,
      after: String,
      timestamp: Date
    }],
    notes: String,
    issues: [String]
  }],
  routeGeometry: {
    type: {
      type: String,
      enum: ['LineString'],
      default: 'LineString'
    },
    coordinates: [[Number]]
  },
  alerts: [{
    type: String,
    message: String,
    timestamp: Date,
    resolved: { type: Boolean, default: false }
  }],
  notes: String,
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Indexes
routeSchema.index({ driver: 1, date: -1 });
routeSchema.index({ status: 1, date: 1 });
routeSchema.index({ routeId: 1 });

// Virtual for progress
routeSchema.virtual('progress').get(function() {
  const completed = this.stops.filter(s => s.status === 'Completed').length;
  return (completed / this.stops.length) * 100;
});

// Method to calculate total waste collected
routeSchema.methods.getTotalWaste = function() {
  return this.stops.reduce((total, stop) => total + (stop.wasteCollected || 0), 0);
};

// Method to check if route is on schedule
routeSchema.methods.isOnSchedule = function() {
  if (!this.startTime) return true;
  const expectedProgress = (Date.now() - this.startTime) / (this.estimatedDuration * 60 * 1000);
  const actualProgress = this.progress / 100;
  return actualProgress >= expectedProgress - 0.1;
};

module.exports = mongoose.model('Route', routeSchema);