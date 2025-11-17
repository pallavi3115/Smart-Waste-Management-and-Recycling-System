const mongoose = require('mongoose');

const binSchema = new mongoose.Schema({
  location: {
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true }
  },
  fill_level: { type: Number, default: 0 },
  fire_alert: { type: Boolean, default: false },
  status: {
    type: String,
    enum: ['Empty', 'Partial', 'Full', 'Blocked'],
    default: 'Empty'
  },
  last_updated: { type: Date, default: Date.now },
  assigned_truck: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Truck'
  },
  area: { type: String, required: true }
}, {
  timestamps: true
});

module.exports = mongoose.model('Bin', binSchema);
