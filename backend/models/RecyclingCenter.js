const mongoose = require('mongoose');

const recyclingCenterSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  capacity: {
    type: Number,
    required: true
  },
  latitude: {
    type: Number,
    required: true
  },
  longitude: {
    type: Number,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  current_load: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  // ADD THESE MISSING FIELDS
  phone: {
    type: String,
    default: 'N/A'
  },
  email: {
    type: String,
    default: 'N/A'
  },
  operatingHours: {
    type: String,
    default: '9:00 AM - 6:00 PM'
  },
  contactPerson: {
    type: String,
    default: 'Not specified'
  },
  description: {
    type: String,
    default: ''
  },
  materials: [{
    type: String
  }],
  rating: {
    average: { type: Number, default: 0 },
    count: { type: Number, default: 0 }
  },
  totalProcessed: {
    type: Number,
    default: 0
  },
  co2Saved: {
    type: Number,
    default: 0
  },
  energySaved: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('RecyclingCenter', recyclingCenterSchema);