const mongoose = require("mongoose");

const Bin = mongoose.model("Bin");
const RecyclingCenter = mongoose.model("RecyclingCenter");

exports.getAnalytics = async (req, res) => {
  try {
    const bins = await Bin.find();
    const centers = await RecyclingCenter.find();

    // ===== BIN STATS =====
    const totalBins = bins.length;

    const fullBins = bins.filter(b => b.status === "Full").length;
    const emptyBins = bins.filter(b => b.status === "Empty").length;

    const avgFill =
      bins.reduce((acc, b) => acc + (b.currentFillLevel || 0), 0) /
      (bins.length || 1);

    // ===== CRITICAL BINS (🔥 IMPORTANT FIX)
    const criticalBins = bins.filter(b => b.currentFillLevel >= 80);

    // ===== CENTER LOAD =====
    let totalCapacity = 0;
    let totalUsed = 0;

    centers.forEach(c => {
      if (typeof c.capacity === "object") {
        totalCapacity += c.capacity.total || 0;
        totalUsed += c.capacity.current || 0;
      } else {
        totalCapacity += c.capacity || 0;
      }
    });

    const avgCenterLoad = totalCapacity
      ? ((totalUsed / totalCapacity) * 100)
      : 0;

    // ===== WEEKLY TREND (dummy for now)
    const weeklyTrend = [40, 60, 55, 70, 80, 90, 65];

    // ===== FINAL RESPONSE (frontend compatible)
    const data = {
      totalBins,
      fullBins,
      emptyBins,
      avgFill: avgFill.toFixed(1),
      avgCenterLoad: avgCenterLoad.toFixed(1),
      weeklyTrend,
      criticalBins
    };

    res.json({
      success: true,
      data
    });

  } catch (error) {
    console.error("Analytics Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch analytics"
    });
  }
};