const mongoose = require('mongoose');

const badgeSchema = new mongoose.Schema({
  name: {
    type: String,
    enum: [
      'FIRST_REPORT',
      'WEEKLY_CHAMPION',
      'MONTHLY_STAR',
      'RECYCLING_MASTER',
      'COMMUNITY_HERO',
      'PERFECT_WEEK',
      'EARLY_BIRD',
      'NIGHT_OWL',
      'ENVIRONMENT_SAVIOR',
      'ZERO_WASTE_HERO',
      'REPORTING_PRO',
      'ECO_WARRIOR'
    ],
    required: true
  },
  icon: String,
  description: String,
  earnedAt: {
    type: Date,
    default: Date.now
  },
  level: {
    type: Number,
    default: 1
  }
});

const achievementSchema = new mongoose.Schema({
  title: String,
  description: String,
  points: Number,
  criteria: {
    type: {
      type: String,
      enum: ['reportCount', 'recyclingAmount', 'streakDays', 'points']
    },
    target: Number,
    current: Number
  },
  completedAt: Date,
  progress: Number
});

const rewardSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  points: {
    type: Number,
    default: 0
  },
  level: {
    type: Number,
    default: 1
  },
  badges: [badgeSchema],
  achievements: [achievementSchema],
  statistics: {
    totalReports: {
      type: Number,
      default: 0
    },
    resolvedReports: {
      type: Number,
      default: 0
    },
    totalRecycled: {
      type: Number,
      default: 0 // in kg
    },
    totalPoints: {
      type: Number,
      default: 0
    },
    currentStreak: {
      type: Number,
      default: 0
    },
    longestStreak: {
      type: Number,
      default: 0
    },
    lastActive: Date,
    weeklyActivity: [{
      week: Number,
      year: Number,
      points: Number,
      reports: Number,
      recycled: Number
    }]
  },
  leaderboard: {
    rank: Number,
    previousRank: Number,
    percentile: Number
  },
  rewards: [{
    name: String,
    description: String,
    pointsCost: Number,
    claimedAt: Date,
    code: String
  }],
  multiplier: {
    type: Number,
    default: 1.0
  },
  multiplierExpiry: Date
}, {
  timestamps: true
});

// Calculate level based on points
rewardSchema.methods.calculateLevel = function() {
  const points = this.points;
  if (points < 100) this.level = 1;
  else if (points < 500) this.level = 2;
  else if (points < 1000) this.level = 3;
  else if (points < 5000) this.level = 4;
  else if (points < 10000) this.level = 5;
  else if (points < 50000) this.level = 6;
  else this.level = 7;
  
  return this.level;
};

// Add points and check achievements
rewardSchema.methods.addPoints = async function(points, reason) {
  // Apply multiplier if active
  if (this.multiplier > 1 && this.multiplierExpiry > new Date()) {
    points *= this.multiplier;
  }

  this.points += points;
  this.statistics.totalPoints += points;
  this.statistics.lastActive = new Date();
  
  // Update streak
  const today = new Date().toDateString();
  const lastActive = this.statistics.lastActive ? 
    new Date(this.statistics.lastActive).toDateString() : null;
  
  if (lastActive && this.isConsecutiveDay(lastActive, today)) {
    this.statistics.currentStreak += 1;
    if (this.statistics.currentStreak > this.statistics.longestStreak) {
      this.statistics.longestStreak = this.statistics.currentStreak;
    }
  } else {
    this.statistics.currentStreak = 1;
  }

  this.calculateLevel();
  
  // Check for badge achievements
  await this.checkBadges();
  
  return this.save();
};

// Check if dates are consecutive
rewardSchema.methods.isConsecutiveDay = function(prevDate, currentDate) {
  const prev = new Date(prevDate);
  const curr = new Date(currentDate);
  const diffTime = Math.abs(curr - prev);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays === 1;
};

// Check for badges
rewardSchema.methods.checkBadges = async function() {
  const badges = [];
  
  // First report badge
  if (this.statistics.totalReports >= 1 && !this.hasBadge('FIRST_REPORT')) {
    badges.push({
      name: 'FIRST_REPORT',
      icon: '📝',
      description: 'Submitted your first report'
    });
  }

  // Recycling master badge
  if (this.statistics.totalRecycled >= 100 && !this.hasBadge('RECYCLING_MASTER')) {
    badges.push({
      name: 'RECYCLING_MASTER',
      icon: '♻️',
      description: 'Recycled 100kg of waste'
    });
  }

  // Perfect week badge
  if (this.statistics.currentStreak >= 7 && !this.hasBadge('PERFECT_WEEK')) {
    badges.push({
      name: 'PERFECT_WEEK',
      icon: '📅',
      description: 'Active for 7 consecutive days'
    });
  }

  // Community hero badge
  if (this.statistics.totalReports >= 50 && !this.hasBadge('COMMUNITY_HERO')) {
    badges.push({
      name: 'COMMUNITY_HERO',
      icon: '🦸',
      description: 'Submitted 50 reports'
    });
  }

  // Environment savior badge
  if (this.statistics.totalRecycled >= 1000 && !this.hasBadge('ENVIRONMENT_SAVIOR')) {
    badges.push({
      name: 'ENVIRONMENT_SAVIOR',
      icon: '🌍',
      description: 'Recycled 1 ton of waste'
    });
  }

  this.badges.push(...badges);
};

// Check if user has specific badge
rewardSchema.methods.hasBadge = function(badgeName) {
  return this.badges.some(badge => badge.name === badgeName);
};

// Get next level requirements
rewardSchema.methods.getNextLevel = function() {
  const levelRequirements = {
    1: 0,
    2: 100,
    3: 500,
    4: 1000,
    5: 5000,
    6: 10000,
    7: 50000
  };

  const nextLevel = this.level + 1;
  const requiredPoints = levelRequirements[nextLevel] || Infinity;
  const pointsNeeded = Math.max(0, requiredPoints - this.points);

  return {
    currentLevel: this.level,
    nextLevel: nextLevel <= 7 ? nextLevel : null,
    pointsNeeded,
    progress: this.level < 7 ? (this.points / requiredPoints) * 100 : 100
  };
};

module.exports = mongoose.model('Reward', rewardSchema);