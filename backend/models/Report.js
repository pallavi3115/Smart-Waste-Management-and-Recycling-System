const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Please provide a title'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Please provide description']
  },
  category: {
    type: String,
    enum: [
      'Overflowing Bin',
      'Bin Damaged',
      'Missed Collection',
      'Illegal Dumping',
      'Fire Hazard',
      'Blocked Drain',
      'Dead Animal',
      'Public Toilet Issue'
    ],
    required: true
  },
  priority: {
    type: String,
    enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
    default: 'MEDIUM'
  },
  status: {
    type: String,
    enum: ['PENDING', 'IN_PROGRESS', 'RESOLVED', 'REJECTED'],
    default: 'PENDING'
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      required: false
    },
    address: String
  },
  media: {
    images: [{
      url: String,
      uploadedAt: {
        type: Date,
        default: Date.now
      }
    }]
  },
  isAnonymous: {
    type: Boolean,
    default: false
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  resolvedAt: Date,
  citizenFeedback: {
    rating: Number,
    comment: String
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Report', reportSchema);