const mongoose = require("mongoose");

const binSchema = new mongoose.Schema(
  {
    binId: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },

    capacity: {
      type: Number,
      required: true,
      min: 1
    },

    currentFillLevel: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },

    type: {
      type: String,
      enum: ["General", "Recyclable", "Organic", "Hazardous", "E-Waste"],
      default: "General"
    },

    status: {
      type: String,
      enum: ["Empty", "Partial", "Full"],
      default: "Empty"
    },

    area: {
      type: String,
      required: true,
      trim: true
    },

    // 📍 GeoJSON Location
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point"
      },
      coordinates: {
        type: [Number],
        required: true
      }
    },

    batteryLevel: {
      type: Number,
      default: 100,
      min: 0,
      max: 100
    },

    alerts: {
      fire: { type: Boolean, default: false }
    },

    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

// 🔥 Index for map queries (VERY IMPORTANT)
binSchema.index({ location: "2dsphere" });

module.exports = mongoose.model("Bin", binSchema);