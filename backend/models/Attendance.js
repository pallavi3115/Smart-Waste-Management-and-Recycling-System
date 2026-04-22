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
  if (this.checkIn?.time && this.checkOut?.time) {
    const duration = (this.checkOut.time - this.checkIn.time) / (1000 * 60 * 60);
    return Math.round(duration * 10) / 10;
  }
  return 0;
});

// Method to check if driver is late
attendanceSchema.methods.isLate = function() {
  if (!this.checkIn?.time) return false;
  const checkInHour = this.checkIn.time.getHours();
  const checkInMinute = this.checkIn.time.getMinutes();
  
  // Morning shift: late after 9:00 AM
  if (this.shift === 'Morning') {
    return checkInHour > 9 || (checkInHour === 9 && checkInMinute > 0);
  }
  // Evening shift: late after 5:00 PM
  if (this.shift === 'Evening') {
    return checkInHour > 17 || (checkInHour === 17 && checkInMinute > 0);
  }
  // Night shift: late after 9:00 PM
  if (this.shift === 'Night') {
    return checkInHour > 21 || (checkInHour === 21 && checkInMinute > 0);
  }
  return false;
};

module.exports = mongoose.model('Attendance', attendanceSchema);