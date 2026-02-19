const Reward = require('../models/Reward');
const User = require('../models/User');

// @desc    Get user rewards
// @route   GET /api/rewards/my-rewards
// @access  Private
exports.getMyRewards = async (req, res) => {
  try {
    let reward = await Reward.findOne({ user: req.user.id });

    if (!reward) {
      // Create reward record if not exists
      reward = await Reward.create({
        user: req.user.id,
        points: 0,
        level: 1
      });
    }

    const nextLevel = reward.getNextLevel();

    res.json({
      success: true,
      data: {
        ...reward.toObject(),
        nextLevel
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get leaderboard
// @route   GET /api/rewards/leaderboard
// @access  Public
exports.getLeaderboard = async (req, res) => {
  try {
    const { timeframe = 'all', limit = 100 } = req.query;

    let matchStage = {};
    const now = new Date();

    if (timeframe === 'weekly') {
      const weekAgo = new Date(now.setDate(now.getDate() - 7));
      matchStage = { 'statistics.lastActive': { $gte: weekAgo } };
    } else if (timeframe === 'monthly') {
      const monthAgo = new Date(now.setMonth(now.getMonth() - 1));
      matchStage = { 'statistics.lastActive': { $gte: monthAgo } };
    }

    const leaderboard = await Reward.aggregate([
      { $match: matchStage },
      {
        $lookup: {
          from: 'users',
          localField: 'user',
          foreignField: '_id',
          as: 'userInfo'
        }
      },
      { $unwind: '$userInfo' },
      {
        $project: {
          'userInfo.name': 1,
          'userInfo.profilePicture': 1,
          points: 1,
          level: 1,
          'statistics': 1,
          badges: 1,
          rank: { $literal: 0 }
        }
      },
      { $sort: { points: -1 } },
      { $limit: parseInt(limit) }
    ]);

    // Calculate ranks
    leaderboard.forEach((entry, index) => {
      entry.rank = index + 1;
    });

    // Get user's rank if authenticated
    let userRank = null;
    if (req.user) {
      const userReward = await Reward.findOne({ user: req.user.id });
      if (userReward) {
        const higherPoints = await Reward.countDocuments({
          points: { $gt: userReward.points }
        });
        userRank = higherPoints + 1;
      }
    }

    res.json({
      success: true,
      data: {
        leaderboard,
        userRank,
        timeframe
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Claim reward
// @route   POST /api/rewards/claim
// @access  Private
exports.claimReward = async (req, res) => {
  try {
    const { rewardName, pointsCost } = req.body;

    const reward = await Reward.findOne({ user: req.user.id });

    if (!reward) {
      return res.status(404).json({
        success: false,
        message: 'Reward record not found'
      });
    }

    if (reward.points < pointsCost) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient points'
      });
    }

    // Deduct points
    reward.points -= pointsCost;

    // Generate unique code
    const claimCode = `SWM-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`.toUpperCase();

    reward.rewards.push({
      name: rewardName,
      pointsCost,
      claimedAt: new Date(),
      code: claimCode
    });

    await reward.save();

    res.json({
      success: true,
      data: {
        remainingPoints: reward.points,
        claimCode,
        reward: reward.rewards[reward.rewards.length - 1]
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get available rewards
// @route   GET /api/rewards/shop
// @access  Private
exports.getRewardShop = async (req, res) => {
  try {
    const availableRewards = [
      {
        id: 1,
        name: '₹50 Gift Card',
        description: 'Amazon/Flipkart voucher',
        pointsCost: 500,
        icon: '🎁',
        category: 'Shopping'
      },
      {
        id: 2,
        name: 'Plant a Tree',
        description: 'We will plant a tree in your name',
        pointsCost: 200,
        icon: '🌳',
        category: 'Environment'
      },
      {
        id: 3,
        name: 'Premium Badge',
        description: 'Exclusive profile badge',
        pointsCost: 1000,
        icon: '⭐',
        category: 'Profile'
      },
      {
        id: 4,
        name: '2x Points Multiplier',
        description: 'Double points for 7 days',
        pointsCost: 800,
        icon: '⚡',
        category: 'Boost'
      },
      {
        id: 5,
        name: 'Community Hero Title',
        description: 'Special title on profile',
        pointsCost: 1500,
        icon: '👑',
        category: 'Profile'
      },
      {
        id: 6,
        name: 'Recycling Kit',
        description: 'Free recycling starter kit',
        pointsCost: 300,
        icon: '♻️',
        category: 'Physical'
      }
    ];

    const userReward = await Reward.findOne({ user: req.user.id });
    const userPoints = userReward ? userReward.points : 0;

    const rewardsWithStatus = availableRewards.map(reward => ({
      ...reward,
      canAfford: userPoints >= reward.pointsCost,
      userPoints
    }));

    res.json({
      success: true,
      data: rewardsWithStatus
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get achievement progress
// @route   GET /api/rewards/achievements
// @access  Private
exports.getAchievements = async (req, res) => {
  try {
    const reward = await Reward.findOne({ user: req.user.id });

    const achievements = [
      {
        id: 'report_10',
        title: 'Active Citizen',
        description: 'Submit 10 reports',
        target: 10,
        current: reward?.statistics.totalReports || 0,
        icon: '📋',
        points: 100
      },
      {
        id: 'report_50',
        title: 'Community Hero',
        description: 'Submit 50 reports',
        target: 50,
        current: reward?.statistics.totalReports || 0,
        icon: '🦸',
        points: 500
      },
      {
        id: 'recycle_100',
        title: 'Recycling Master',
        description: 'Recycle 100kg of waste',
        target: 100,
        current: reward?.statistics.totalRecycled || 0,
        icon: '♻️',
        points: 200
      },
      {
        id: 'recycle_1000',
        title: 'Environment Savior',
        description: 'Recycle 1 ton of waste',
        target: 1000,
        current: reward?.statistics.totalRecycled || 0,
        icon: '🌍',
        points: 1000
      },
      {
        id: 'streak_7',
        title: 'Perfect Week',
        description: 'Active for 7 consecutive days',
        target: 7,
        current: reward?.statistics.currentStreak || 0,
        icon: '📅',
        points: 150
      },
      {
        id: 'streak_30',
        title: 'Dedicated Citizen',
        description: 'Active for 30 consecutive days',
        target: 30,
        current: reward?.statistics.currentStreak || 0,
        icon: '🔥',
        points: 500
      }
    ];

    const achievementsWithProgress = achievements.map(achievement => ({
      ...achievement,
      progress: (achievement.current / achievement.target) * 100,
      completed: achievement.current >= achievement.target
    }));

    res.json({
      success: true,
      data: achievementsWithProgress
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};