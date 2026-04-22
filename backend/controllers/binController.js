const Bin = require("../models/Bin");
const sendFireAlertEmail = require('../utils/email');

// ➕ Register Bin
exports.registerBin = async (req, res) => {
  try {
    const { binId, capacity, type, area, location } = req.body;

    // ✅ Validation
    if (!binId || !capacity || !area || !location?.coordinates) {
      return res.status(400).json({
        success: false,
        message: "All fields required"
      });
    }

    // ✅ Check duplicate binId
    const existingBin = await Bin.findOne({ binId });
    if (existingBin) {
      return res.status(400).json({
        success: false,
        message: "Bin already exists"
      });
    }

    // ✅ Create bin
    const newBin = await Bin.create({
      binId,
      capacity,
      type,
      area,
      location
    });

    res.status(201).json({
      success: true,
      data: newBin
    });

  } catch (error) {
    console.error("Register Bin Error:", error);

    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};


// 📋 Get All Bins
exports.getAllBins = async (req, res) => {
  try {
    const bins = await Bin.find().sort({ createdAt: -1 });

    res.json({
      success: true,
      data: bins
    });

  } catch (error) {
    console.error("Get Bins Error:", error);

    res.status(500).json({
      success: false,
      message: "Server Error"
    });
  }
};


// 🔍 Get Single Bin
exports.getBinById = async (req, res) => {
  try {
    const bin = await Bin.findById(req.params.id);

    if (!bin) {
      return res.status(404).json({
        success: false,
        message: "Bin not found"
      });
    }

    res.json({
      success: true,
      data: bin
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching bin"
    });
  }
};


// 🔄 Update Bin Status (IoT)
exports.updateBinStatus = async (req, res) => {
  try {
    const io = req.app.get('io'); // 👈 VERY IMPORTANT

    const { binId, currentFillLevel, batteryLevel, fire } = req.body;

    const bin = await Bin.findOne({ binId });

    if (!bin) {
      return res.status(404).json({
        success: false,
        message: "Bin not found"
      });
    }

    // ✅ UPDATE FILL LEVEL
    if (currentFillLevel !== undefined) {
      bin.currentFillLevel = currentFillLevel;

      // 🔴 AUTO STATUS
      if (currentFillLevel >= 80) {
        bin.status = "Full";
        console.log(`⚠️ Bin ${binId} is FULL`);
      } else if (currentFillLevel >= 30) {
        bin.status = "Partial";
      } else {
        bin.status = "Empty";
      }
    }

    // 🔋 BATTERY
    if (batteryLevel !== undefined) {
      bin.batteryLevel = batteryLevel;
    }

    // 🔥 FIRE ALERT
    if (fire !== undefined) {
      bin.alerts.fire = fire;

      if (fire === true) {
        await sendFireAlertEmail(binId); // 👈 EMAIL TRIGGER
      }
    }

    await bin.save();

    // 🚀 REAL-TIME UPDATE (MAIN THING)
    io.emit('bin:update', bin);

    res.json({
      success: true,
      data: bin
    });

  } catch (error) {
    console.error("Update Error:", error);

    res.status(500).json({
      success: false,
      message: "Update failed"
    });
  }
};


// 📊 Stats
exports.getBinStats = async (req, res) => {
  try {
    const bins = await Bin.find();

    const totalBins = bins.length;
    const fullBins = bins.filter(b => b.status === "Full").length;
    const activeBins = bins.filter(b => b.isActive).length;

    const avgFill = totalBins
      ? Math.round(
          bins.reduce((sum, b) => sum + (b.currentFillLevel || 0), 0) / totalBins
        )
      : 0;

    res.json({
      success: true,
      data: {
        totalBins,
        fullBins,
        activeBins,
        avgFill
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Stats error"
    });
  }
};