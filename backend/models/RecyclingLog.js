const mongoose = require('mongoose');

const recyclingLogSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  center: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'RecyclingCenter',
    required: true
  },
  bin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Bin'
  },
  materialType: {
    type: String,
    enum: ['Plastic', 'Glass', 'Paper', 'Metal', 'E-Waste', 'Organic', 'Hazardous'],
    required: true
  },
  quantity: {
    type: Number,
    required: true // in kg
  },
  estimatedValue: Number,
  pointsEarned: Number,
  co2Saved: Number, // in kg
  waterSaved: Number, // in liters
  energySaved: Number, // in kWh
  method: {
    type: String,
    enum: ['Drop-off', 'Pickup', 'Collection Bin'],
    default: 'Drop-off'
  },
  images: [{
    url: String,
    publicId: String
  }],
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: [Number]
  },
  verified: {
    type: Boolean,
    default: false
  },
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  verifiedAt: Date,
  certificateIssued: {
    type: Boolean,
    default: false
  },
  certificateUrl: String,
  transactionId: String, // For blockchain integration
  notes: String
}, {
  timestamps: true
});

// Indexes
recyclingLogSchema.index({ user: 1, createdAt: -1 });
recyclingLogSchema.index({ center: 1, materialType: 1 });

// Calculate environmental impact
recyclingLogSchema.pre('save', function(next) {
  // Approximate impact factors per kg
  const impactFactors = {
    Plastic: { co2: 3.5, water: 100, energy: 20 },
    Glass: { co2: 2.5, water: 50, energy: 15 },
    Paper: { co2: 2.0, water: 30, energy: 10 },
    Metal: { co2: 5.0, water: 150, energy: 30 },
    'E-Waste': { co2: 4.0, water: 120, energy: 25 },
    Organic: { co2: 1.5, water: 20, energy: 5 },
    Hazardous: { co2: 6.0, water: 200, energy: 40 }
  };

  const factor = impactFactors[this.materialType];
  if (factor) {
    this.co2Saved = this.quantity * factor.co2;
    this.waterSaved = this.quantity * factor.water;
    this.energySaved = this.quantity * factor.energy;
  }

  // Points calculation (10 points per kg)
  this.pointsEarned = this.quantity * 10;
  
  next();
});

module.exports = mongoose.model('RecyclingLog', recyclingLogSchema);