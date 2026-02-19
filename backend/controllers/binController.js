const Bin = require('../models/Bin');
const CollectionLog = require('../models/CollectionLog');
const Notification = require('../models/Notification');

// @desc    Register new bin
// @route   POST /api/bins/register
// @access  Admin
exports.registerBin = async (req, res) => {
  try {
    const { binId, location, type, capacity } = req.body;

    const bin = await Bin.create({
      binId,
      location,
      type,
      capacity
    });

    res.status(201).json({
      success: true,
      data: bin
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update bin status (IoT)
// @route   POST /api/bins/update
// @access  Public
exports.updateBinStatus = async (req, res) => {
  try {
    const { binId, fillLevel, fireAlert, status } = req.body;

    const bin = await Bin.findOne({ binId });
    
    if (!bin) {
      return res.status(404).json({
        success: false,
        message: 'Bin not found'
      });
    }

    bin.currentFillLevel = fillLevel || bin.currentFillLevel;
    if (fireAlert !== undefined) bin.fireAlert = fireAlert;
    if (status) bin.status = status;
    bin.lastUpdated = Date.now();
    
    await bin.save();

    res.json({
      success: true,
      data: bin
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get all bins
// @route   GET /api/bins/all
// @access  Public
exports.getAllBins = async (req, res) => {
  try {
    const bins = await Bin.find();
    res.json({
      success: true,
      count: bins.length,
      data: bins
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get bin by ID
// @route   GET /api/bins/status/:id
// @access  Public
exports.getBinById = async (req, res) => {
  try {
    const bin = await Bin.findById(req.params.id);
    
    if (!bin) {
      return res.status(404).json({
        success: false,
        message: 'Bin not found'
      });
    }

    res.json({
      success: true,
      data: bin
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Record collection
// @route   POST /api/bins/collect
// @access  Driver
exports.recordCollection = async (req, res) => {
  try {
    const { binId, quantity, wasteType } = req.body;

    const bin = await Bin.findById(binId);
    if (!bin) {
      return res.status(404).json({
        success: false,
        message: 'Bin not found'
      });
    }

    const collectionLog = await CollectionLog.create({
      bin: binId,
      driver: req.user.id,
      fillLevelBefore: bin.currentFillLevel,
      fillLevelAfter: 0,
      wasteType,
      quantity
    });

    bin.currentFillLevel = 0;
    await bin.save();

    res.json({
      success: true,
      data: collectionLog
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get bin statistics
// @route   GET /api/bins/stats
// @access  Admin
exports.getBinStats = async (req, res) => {
  try {
    const totalBins = await Bin.countDocuments();
    const fullBins = await Bin.countDocuments({ status: 'Full' });
    const fireAlerts = await Bin.countDocuments({ fireAlert: true });

    res.json({
      success: true,
      data: {
        totalBins,
        fullBins,
        fireAlerts
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};