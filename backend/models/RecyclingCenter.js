const mongoose = require('mongoose');

const recyclingCenterSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide center name'],
    trim: true
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
    zone: String,
    landmark: String
  },
  contactInfo: {
    phone: String,
    email: String,
    website: String,
    emergencyContact: String
  },
  operatingHours: {
    monday: { open: String, close: String, closed: Boolean },
    tuesday: { open: String, close: String, closed: Boolean },
    wednesday: { open: String, close: String, closed: Boolean },
    thursday: { open: String, close: String, closed: Boolean },
    friday: { open: String, close: String, closed: Boolean },
    saturday: { open: String, close: String, closed: Boolean },
    sunday: { open: String, close: String, closed: Boolean }
  },
  capacity: {
    total: {
      type: Number,
      required: true // in tons
    },
    current: {
      type: Number,
      default: 0
    },
    unit: {
      type: String,
      enum: ['kg', 'tons'],
      default: 'tons'
    }
  },
  materials: [{
    type: {
      type: String,
      enum: ['Plastic', 'Glass', 'Paper', 'Metal', 'E-Waste', 'Organic', 'Hazardous']
    },
    capacity: Number,
    currentLoad: Number,
    pricePerKg: Number, // for incentivized recycling
    isAccepted: {
      type: Boolean,
      default: true
    }
  }],
  services: [{
    name: String,
    description: String,
    price: Number,
    available: Boolean
  }],
  facilities: [{
    type: String,
    enum: ['Parking', 'Wheelchair Access', 'Weighbridge', 'Shredder', 'Compactor']
  }],
  certifications: [{
    name: String,
    issuedBy: String,
    validUntil: Date
  }],
  images: [{
    url: String,
    caption: String
  }],
  rating: {
    average: {
      type: Number,
      min: 0,
      max: 5,
      default: 0
    },
    count: {
      type: Number,
      default: 0
    }
  },
  reviews: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    rating: Number,
    comment: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  verified: {
    type: Boolean,
    default: false
  },
  queue: {
    currentLength: Number,
    averageWaitTime: Number,
    lastUpdated: Date
  }
}, {
  timestamps: true
});

// Indexes
recyclingCenterSchema.index({ 'location.coordinates': '2dsphere' });
recyclingCenterSchema.index({ 'materials.type': 1 });

// Check if center is open now
recyclingCenterSchema.methods.isOpenNow = function() {
  const now = new Date();
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const today = days[now.getDay()];
  
  const hours = this.operatingHours[today];
  if (!hours || hours.closed) return false;
  
  const currentTime = now.toTimeString().slice(0, 5);
  return currentTime >= hours.open && currentTime <= hours.close;
};

// Calculate fill percentage
recyclingCenterSchema.methods.getFillPercentage = function() {
  return (this.capacity.current / this.capacity.total) * 100;
};

// Update rating
recyclingCenterSchema.methods.updateRating = function() {
  if (this.reviews.length === 0) return;
  
  const sum = this.reviews.reduce((acc, review) => acc + review.rating, 0);
  this.rating.average = sum / this.reviews.length;
  this.rating.count = this.reviews.length;
};

module.exports = mongoose.model('RecyclingCenter', recyclingCenterSchema);