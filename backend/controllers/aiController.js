const {
  classifyWaste,
  suggestCategory,
  analyzeTrends,
  chatResponse,
  optimizeRoutes
} = require('../services/aiService');
const Report = require('../models/Report');
const Bin = require('../models/Bin');

// @desc    Classify waste from image
// @route   POST /api/ai/classify
// @access  Public
exports.classify = async (req, res) => {
  try {
    const { image } = req.body;

    if (!image) {
      return res.status(400).json({
        success: false,
        message: 'Image is required'
      });
    }

    const classification = await classifyWaste(image);

    res.json({
      success: true,
      data: classification
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Suggest report category
// @route   POST /api/ai/suggest
// @access  Public
exports.suggest = async (req, res) => {
  try {
    const { image } = req.body;

    if (!image) {
      return res.status(400).json({
        success: false,
        message: 'Image is required'
      });
    }

    const suggestion = await suggestCategory(image);

    res.json({
      success: true,
      data: suggestion
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Analyze trends
// @route   POST /api/ai/analyze
// @access  Private (Admin)
exports.analyze = async (req, res) => {
  try {
    const { days = 30 } = req.query;

    // Get data for analysis
    const since = new Date();
    since.setDate(since.getDate() - days);

    const reports = await Report.find({
      createdAt: { $gte: since }
    }).lean();

    const bins = await Bin.find().lean();

    const analysis = await analyzeTrends({
      reports,
      bins,
      period: `${days} days`
    });

    res.json({
      success: true,
      data: analysis
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Chat with AI assistant
// @route   POST /api/ai/chat
// @access  Private
exports.chat = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        message: 'Message is required'
      });
    }

    const context = {
      city: req.user?.address?.city || 'Indore',
      role: req.user?.role || 'Citizen'
    };

    const response = await chatResponse(message, context);

    res.json({
      success: true,
      data: {
        message: response,
        timestamp: new Date()
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Optimize collection routes
// @route   POST /api/ai/optimize-routes
// @access  Private (Admin)
exports.optimizeRoutes = async (req, res) => {
  try {
    const { bins, trucks } = req.body;

    if (!bins || !trucks) {
      return res.status(400).json({
        success: false,
        message: 'Bins and trucks data required'
      });
    }

    const routes = await optimizeRoutes(bins, trucks);

    res.json({
      success: true,
      data: routes
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};