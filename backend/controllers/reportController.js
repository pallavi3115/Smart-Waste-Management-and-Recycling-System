const Report = require('../models/Report');

// @desc    Create new report
// @route   POST /api/reports
// @access  Private
exports.createReport = async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      location,
      isAnonymous,
      media
    } = req.body;

    // Validate required fields
    if (!title || !description || !category) {
      return res.status(400).json({
        success: false,
        message: 'Please provide title, description and category'
      });
    }

    // Ensure user exists
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    // Create report with proper user ID
    const reportData = {
      user: req.user.id, // This should now be a valid ObjectId string
      title,
      description,
      category,
      location: location || null,
      media: media || {},
      isAnonymous: isAnonymous || false,
      status: 'PENDING'
    };

    const report = await Report.create(reportData);

    res.status(201).json({
      success: true,
      data: report,
      message: 'Report created successfully'
    });
  } catch (error) {
    console.error('Error creating report:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    }

    res.status(400).json({
      success: false,
      message: error.message || 'Failed to create report'
    });
  }
};

// @desc    Get user's reports
// @route   GET /api/reports/my-reports
// @access  Private
exports.getMyReports = async (req, res) => {
  try {
    const reports = await Report.find({ user: req.user.id })
      .sort('-createdAt');

    res.json({
      success: true,
      count: reports.length,
      data: reports
    });
  } catch (error) {
    console.error('Error fetching reports:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get all reports (Admin)
// @route   GET /api/reports
// @access  Private/Admin
exports.getReports = async (req, res) => {
  try {
    const reports = await Report.find()
      .populate('user', 'name email')
      .sort('-createdAt');

    res.json({
      success: true,
      count: reports.length,
      data: reports
    });
  } catch (error) {
    console.error('Error fetching reports:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get single report
// @route   GET /api/reports/:id
// @access  Private
exports.getReportById = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id)
      .populate('user', 'name email')
      .populate('assignedTo', 'name email');

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    // Check if user owns the report or is admin
    if (report.user._id.toString() !== req.user.id && req.user.role !== 'Admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this report'
      });
    }

    res.json({
      success: true,
      data: report
    });
  } catch (error) {
    console.error('Error fetching report:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update report status
// @route   PUT /api/reports/:id/status
// @access  Private/Admin
exports.updateReportStatus = async (req, res) => {
  try {
    const { status, assignedTo } = req.body;

    const report = await Report.findById(req.params.id);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    report.status = status || report.status;
    if (assignedTo) report.assignedTo = assignedTo;
    if (status === 'RESOLVED') report.resolvedAt = new Date();

    await report.save();

    res.json({
      success: true,
      data: report
    });
  } catch (error) {
    console.error('Error updating report:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};