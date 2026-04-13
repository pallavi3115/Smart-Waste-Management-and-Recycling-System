const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  driver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Driver',
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
  checkIn: {
    time: Date,
    location: {
      lat: Number,
      lng: Number,
      address: String
    },
    photo: String,
    notes: String
  },
  checkOut: {
    time: Date,
    location: {
      lat: Number,
      lng: Number,
      address: String
    },
    photo: String,
    notes: String
  },
  status: {
    type: String,
    enum: ['Present', 'Absent', 'Late', 'Half Day', 'Leave', 'Holiday'],
    default: 'Present'
  },
  lateMinutes: {
    type: Number,
    default: 0
  },
  overtime: {
    type: Number,
    default: 0
  },
  breakTime: {
    type: Number,
    default: 0
  },
  notes: String,
  approved: {
    type: Boolean,
    default: false
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Compound index for unique daily attendance
attendanceSchema.index({ driver: 1, date: 1, shift: 1 }, { unique: true });

// Virtual for work duration
attendanceSchema.virtual('workDuration').get(function() {
  if (this.checkIn.time && this.checkOut.time) {
    return (this.checkOut.time - this.checkIn.time) / (1000 * 60 * 60);
  }
  return 0;
});

module.exports = mongoose.model('Attendance', attendanceSchema);
