const RecyclingCenter = require('../models/RecyclingCenter');
const RecyclingLog = require('../models/RecyclingLog');
const Reward = require('../models/Reward');
const { getIO } = require('../config/socket');

// @desc    Get all recycling centers
// @route   GET /api/recycling/centers
// @access  Public
exports.getCenters = async (req, res) => {
  try {
    const { material, nearby, lat, lng, radius = 10000 } = req.query;

    let query = { isActive: true, verified: true };

    // Filter by accepted materials
    if (material) {
      query['materials.type'] = material;
      query['materials.isAccepted'] = true;
    }

    // Nearby centers
    if (nearby === 'true' && lat && lng) {
      query['location.coordinates'] = {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(lng), parseFloat(lat)]
          },
          $maxDistance: parseInt(radius)
        }
      };
    }

    const centers = await RecyclingCenter.find(query)
      .select('-reviews -certifications');

    // Add open status
    const centersWithStatus = centers.map(center => ({
      ...center.toObject(),
      isOpenNow: center.isOpenNow(),
      fillPercentage: center.getFillPercentage()
    }));

    res.json({
      success: true,
      count: centersWithStatus.length,
      data: centersWithStatus
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get center by ID
// @route   GET /api/recycling/centers/:id
// @access  Public
exports.getCenterById = async (req, res) => {
  try {
    const center = await RecyclingCenter.findById(req.params.id)
      .populate('reviews.user', 'name profilePicture');

    if (!center) {
      return res.status(404).json({
        success: false,
        message: 'Recycling center not found'
      });
    }

    res.json({
      success: true,
      data: {
        ...center.toObject(),
        isOpenNow: center.isOpenNow(),
        fillPercentage: center.getFillPercentage()
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Log recycling activity
// @route   POST /api/recycling/log
// @access  Private
exports.logRecycling = async (req, res) => {
  try {
    const {
      centerId,
      materialType,
      quantity,
      method,
      images,
      location
    } = req.body;

    const center = await RecyclingCenter.findById(centerId);
    if (!center) {
      return res.status(404).json({
        success: false,
        message: 'Recycling center not found'
      });
    }

    // Check if center accepts this material
    const material = center.materials.find(m => m.type === materialType);
    if (!material || !material.isAccepted) {
      return res.status(400).json({
        success: false,
        message: 'This center does not accept this material'
      });
    }

    // Check capacity
    if (center.capacity.current + quantity > center.capacity.total) {
      return res.status(400).json({
        success: false,
        message: 'Center is at full capacity'
      });
    }

    // Create recycling log
    const log = await RecyclingLog.create({
      user: req.user.id,
      center: centerId,
      materialType,
      quantity,
      method,
      images,
      location,
      estimatedValue: quantity * (material.pricePerKg || 0)
    });

    // Update center capacity
    center.capacity.current += quantity;
    material.currentLoad = (material.currentLoad || 0) + quantity;
    await center.save();

    // Award points to user
    const reward = await Reward.findOne({ user: req.user.id });
    if (reward) {
      await reward.addPoints(log.pointsEarned, `Recycled ${quantity}kg of ${materialType}`);
    }

    // Notify via socket
    const io = getIO();
    io.emit('recyclingActivity', {
      userId: req.user.id,
      materialType,
      quantity,
      pointsEarned: log.pointsEarned,
      environmentalImpact: {
        co2Saved: log.co2Saved,
        waterSaved: log.waterSaved,
        energySaved: log.energySaved
      }
    });

    res.status(201).json({
      success: true,
      data: {
        log,
        pointsEarned: log.pointsEarned,
        environmentalImpact: {
          co2Saved: log.co2Saved,
          waterSaved: log.waterSaved,
          energySaved: log.energySaved
        }
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get user's recycling history
// @route   GET /api/recycling/my-logs
// @access  Private
exports.getMyLogs = async (req, res) => {
  try {
    const logs = await RecyclingLog.find({ user: req.user.id })
      .populate('center', 'name location')
      .sort('-createdAt');

    // Calculate totals
    const totals = await RecyclingLog.aggregate([
      { $match: { user: req.user._id } },
      {
        $group: {
          _id: '$materialType',
          totalQuantity: { $sum: '$quantity' },
          totalPoints: { $sum: '$pointsEarned' },
          totalCO2: { $sum: '$co2Saved' }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        logs,
        summary: totals
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get recycling statistics
// @route   GET /api/recycling/stats
// @access  Public
exports.getRecyclingStats = async (req, res) => {
  try {
    // Overall stats
    const overall = await RecyclingLog.aggregate([
      {
        $group: {
          _id: null,
          totalRecycled: { $sum: '$quantity' },
          totalPoints: { $sum: '$pointsEarned' },
          totalCO2: { $sum: '$co2Saved' },
          totalWater: { $sum: '$waterSaved' },
          totalEnergy: { $sum: '$energySaved' },
          uniqueUsers: { $addToSet: '$user' }
        }
      },
      {
        $project: {
          totalRecycled: 1,
          totalPoints: 1,
          totalCO2: 1,
          totalWater: 1,
          totalEnergy: 1,
          uniqueUsers: { $size: '$uniqueUsers' }
        }
      }
    ]);

    // By material type
    const byMaterial = await RecyclingLog.aggregate([
      {
        $group: {
          _id: '$materialType',
          quantity: { $sum: '$quantity' },
          points: { $sum: '$pointsEarned' }
        }
      },
      { $sort: { quantity: -1 } }
    ]);

    // Daily trend (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const dailyTrend = await RecyclingLog.aggregate([
      {
        $match: {
          createdAt: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          quantity: { $sum: '$quantity' },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Center stats
    const centerStats = await RecyclingCenter.aggregate([
      {
        $project: {
          name: 1,
          fillPercentage: {
            $multiply: [{ $divide: ['$capacity.current', '$capacity.total'] }, 100]
          },
          totalMaterials: { $size: '$materials' }
        }
      },
      { $sort: { fillPercentage: -1 } },
      { $limit: 10 }
    ]);

    res.json({
      success: true,
      data: {
        overall: overall[0] || {},
        byMaterial,
        dailyTrend,
        topCenters: centerStats
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Add review to center
// @route   POST /api/recycling/centers/:id/review
// @access  Private
exports.addReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;

    const center = await RecyclingCenter.findById(req.params.id);
    
    if (!center) {
      return res.status(404).json({
        success: false,
        message: 'Recycling center not found'
      });
    }

    // Check if user already reviewed
    const existingReview = center.reviews.find(
      review => review.user.toString() === req.user.id
    );

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this center'
      });
    }

    // Add review
    center.reviews.push({
      user: req.user.id,
      rating,
      comment
    });

    center.updateRating();
    await center.save();

    // Award points for review
    const reward = await Reward.findOne({ user: req.user.id });
    if (reward) {
      await reward.addPoints(5, 'Recycling center review');
    }

    res.json({
      success: true,
      data: center.reviews[center.reviews.length - 1]
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};