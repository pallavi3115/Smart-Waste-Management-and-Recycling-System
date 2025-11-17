const mongoose = require('mongoose');

const recyclingCenterSchema = new mongoose.Schema({
  name: { type: String, required: true },
  location: {
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true }
  },
  capacity: { type: Number, required: true },
  current_load: { type: Number, default: 0 },
  materials_supported: [{ type: String }],
  contact_info: { type: String },
  operating_hours: { type: String }
}, {
  timestamps: true
});

module.exports = mongoose.model('RecyclingCenter', recyclingCenterSchema);