const mongoose = require("mongoose");

const analyticsSchema = new mongoose.Schema(
  {
    // 📊 BIN DATA
    totalBins: {
      type: Number,
      default: 0
    },
    fullBins: {
      type: Number,
      default: 0
    },
    emptyBins: {
      type: Number,
      default: 0
    },
    partialBins: {
      type: Number,
      default: 0
    },
    avgFill: {
      type: Number,
      default: 0
    },
    fireAlerts: {
      type: Number,
      default: 0
    },

    // ♻️ RECYCLING CENTER DATA
    totalCenters: {
      type: Number,
      default: 0
    },
    fullCenters: {
      type: Number,
      default: 0
    },
    utilizationRate: {
      type: Number,
      default: 0
    },

    // 📍 AREA DATA
    areaDistribution: [
      {
        area: String,
        count: Number
      }
    ],

    // 📅 MONTHLY DATA
    monthlyData: [
      {
        month: Number,
        bins: Number
      }
    ],

    // 🔥 INSIGHTS
    criticalBins: [
      {
        binId: String,
        area: String,
        fill: Number
      }
    ]
  },
  {
    timestamps: true // IMPORTANT (date wise tracking)
  }
);

module.exports = mongoose.model("Analytics", analyticsSchema);