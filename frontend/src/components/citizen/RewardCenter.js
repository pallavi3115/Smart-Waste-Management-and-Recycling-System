import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  LinearProgress,
  Chip,
  Box,
  Avatar,
  Paper,
  useTheme,
  alpha,
  Divider,
  IconButton,
  Tooltip,
  Stack,
  Fade,
  Grow,
  Zoom,
  Tabs,
  Tab,
  Badge,
  Snackbar,
  Alert
} from '@mui/material';
import {
  EmojiEvents,
  LocalOffer,
  Recycling as RecyclingIcon,
  Star as StarIcon,
  Forest as ForestIcon,
  Bolt as BoltIcon,
  CardGiftcard as GiftCardIcon,
  TrendingUp as TrendingUpIcon,
  History as HistoryIcon,
  Lock as LockIcon,
  CheckCircle as CheckCircleIcon,
  Info as InfoIcon,
  Close as CloseIcon,
  VolunteerActivism as VolunteerIcon,
  Psychology as PsychologyIcon,
  RocketLaunch as RocketIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import CountUp from 'react-countup';
import { showSuccess, showError } from '../../utils/toast';

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 }
  }
};

const cardVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
  hover: { y: -8, transition: { duration: 0.2 } }
};

const RewardCenter = () => {
  const theme = useTheme();
  const [userPoints, setUserPoints] = useState(1250);
  const [userLevel, setUserLevel] = useState(3);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState(0);
  const [claimedRewards, setClaimedRewards] = useState([]);
  const [showCongrats, setShowCongrats] = useState(false);
  const [lastClaimedReward, setLastClaimedReward] = useState(null);
  const [userStats, setUserStats] = useState({
    totalReports: 24,
    issuesResolved: 18,
    streakDays: 7,
    rank: 'Gold Contributor',
    nextRankPoints: 2000,
    badges: ['Eco Warrior', 'Quick Responder', 'Community Hero']
  });

  // Level configuration
  const levels = [
    { level: 1, name: 'Bronze Citizen', minPoints: 0, icon: '🥉', color: '#CD7F32' },
    { level: 2, name: 'Silver Citizen', minPoints: 500, icon: '🥈', color: '#C0C0C0' },
    { level: 3, name: 'Gold Citizen', minPoints: 1000, icon: '🥇', color: '#FFD700' },
    { level: 4, name: 'Platinum Citizen', minPoints: 2000, icon: '💎', color: '#E5E4E2' },
    { level: 5, name: 'Diamond Citizen', minPoints: 3500, icon: '💠', color: '#B9F2FF' },
    { level: 6, name: 'Eco Legend', minPoints: 5000, icon: '🌟', color: '#FF6B6B' }
  ];

  // Available rewards
  const rewards = [
    { 
      id: 1,
      name: '₹50 Gift Card', 
      points: 500, 
      icon: '🎁',
      iconComponent: <GiftCardIcon />,
      color: '#FF6B6B',
      description: 'Get ₹50 Amazon/Flipkart gift card',
      category: 'voucher',
      popularity: 89,
      limitedTime: false
    },
    { 
      id: 2,
      name: 'Plant a Tree', 
      points: 200, 
      icon: '🌳',
      iconComponent: <ForestIcon />,
      color: '#10B981',
      description: 'We\'ll plant a tree in your name',
      category: 'eco',
      popularity: 95,
      limitedTime: true,
      limitedOffer: 'Earth Month Special'
    },
    { 
      id: 3,
      name: 'Premium Badge', 
      points: 1000, 
      icon: '⭐',
      iconComponent: <StarIcon />,
      color: '#F59E0B',
      description: 'Exclusive profile badge',
      category: 'badge',
      popularity: 78,
      limitedTime: false
    },
    { 
      id: 4,
      name: '2x Multiplier', 
      points: 800, 
      icon: '⚡',
      iconComponent: <BoltIcon />,
      color: '#8B5CF6',
      description: 'Double points for 7 days',
      category: 'boost',
      popularity: 88,
      limitedTime: true,
      limitedOffer: 'Limited Stock'
    },
    { 
      id: 5,
      name: 'Eco T-Shirt', 
      points: 1500, 
      icon: '👕',
      iconComponent: <VolunteerIcon />,
      color: '#3B82F6',
      description: 'Organic cotton eco-friendly t-shirt',
      category: 'merchandise',
      popularity: 82,
      limitedTime: false
    },
    { 
      id: 6,
      name: 'Water Bottle', 
      points: 750, 
      icon: '💧',
      iconComponent: <RecyclingIcon />,
      color: '#06B6D4',
      description: 'Reusable stainless steel bottle',
      category: 'merchandise',
      popularity: 91,
      limitedTime: false
    },
    { 
      id: 7,
      name: '1 Month Premium', 
      points: 2000, 
      icon: '👑',
      iconComponent: <RocketIcon />,
      color: '#EC4899',
      description: 'Unlock all premium features',
      category: 'subscription',
      popularity: 75,
      limitedTime: false
    },
    { 
      id: 8,
      name: 'Charity Donation', 
      points: 100, 
      icon: '🤝',
      iconComponent: <VolunteerIcon />,
      color: '#14B8A6',
      description: 'Donate to environmental causes',
      category: 'charity',
      popularity: 97,
      limitedTime: false
    }
  ];

  // User's reward history
  const rewardHistory = [
    { id: 1, name: 'Plant a Tree', points: 200, date: '2024-03-15', status: 'delivered' },
    { id: 2, name: '₹25 Gift Card', points: 250, date: '2024-03-10', status: 'used' },
    { id: 3, name: '2x Multiplier', points: 800, date: '2024-03-01', status: 'expired' }
  ];

  useEffect(() => {
    // Simulate loading user data
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Update level based on points
    const currentLevel = levels.reduce((prev, curr) => {
      return userPoints >= curr.minPoints ? curr : prev;
    }, levels[0]);
    setUserLevel(currentLevel.level);
  }, [userPoints, levels]);

  const handleClaimReward = (reward) => {
    if (userPoints >= reward.points) {
      setUserPoints(prev => prev - reward.points);
      setClaimedRewards(prev => [...prev, reward.id]);
      setLastClaimedReward(reward);
      setShowCongrats(true);
      showSuccess(`🎉 Successfully claimed ${reward.name}!`);
      
      // Update stats
      setUserStats(prev => ({
        ...prev,
        pointsSpent: (prev.pointsSpent || 0) + reward.points,
        rewardsClaimed: (prev.rewardsClaimed || 0) + 1
      }));
      
      // Auto-hide congratulations
      setTimeout(() => {
        setShowCongrats(false);
      }, 3000);
    } else {
      showError(`Need ${reward.points - userPoints} more points to claim ${reward.name}`);
    }
  };

  const getCurrentLevel = () => {
    return levels.find(level => level.level === userLevel) || levels[0];
  };

  const getNextLevel = () => {
    const currentIndex = levels.findIndex(level => level.level === userLevel);
    return levels[currentIndex + 1] || null;
  };

  const getProgressToNextLevel = () => {
    const currentLevel = getCurrentLevel();
    const nextLevel = getNextLevel();
    if (!nextLevel) return 100;
    const pointsEarned = userPoints - currentLevel.minPoints;
    const pointsNeeded = nextLevel.minPoints - currentLevel.minPoints;
    return (pointsEarned / pointsNeeded) * 100;
  };

  const getFilteredRewards = () => {
    if (selectedTab === 0) return rewards;
    if (selectedTab === 1) return rewards.filter(r => r.points <= 500);
    if (selectedTab === 2) return rewards.filter(r => r.points > 500 && r.points <= 1500);
    if (selectedTab === 3) return rewards.filter(r => r.points > 1500);
    if (selectedTab === 4) return rewards.filter(r => r.category === 'voucher');
    if (selectedTab === 5) return rewards.filter(r => r.category === 'merchandise');
    if (selectedTab === 6) return rewards.filter(r => r.category === 'eco');
    return rewards;
  };

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 3 }}>Reward Center</Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Skeleton variant="rectangular" height={300} sx={{ borderRadius: 4 }} />
          </Grid>
          <Grid item xs={12} md={8}>
            <Skeleton variant="rectangular" height={500} sx={{ borderRadius: 4 }} />
          </Grid>
        </Grid>
      </Container>
    );
  }

  const currentLevelInfo = getCurrentLevel();
  const nextLevelInfo = getNextLevel();
  const progressToNextLevel = getProgressToNextLevel();

  return (
    <Container maxWidth="xl" sx={{ mt: 3, mb: 4 }}>
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <motion.div variants={fadeInUp}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 800, background: 'linear-gradient(135deg, #F59E0B 0%, #FFD700 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Reward Center
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Earn points, unlock achievements, and get rewarded for your eco-friendly actions
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Paper elevation={0} sx={{ p: 1.5, px: 2, borderRadius: 3, bgcolor: alpha('#F59E0B', 0.1) }}>
                <Typography variant="caption" color="text.secondary">Total Points Earned</Typography>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#F59E0B' }}>
                  <CountUp end={userStats.totalReports * 50 + userStats.issuesResolved * 25} duration={2} />
                </Typography>
              </Paper>
              <Paper elevation={0} sx={{ p: 1.5, px: 2, borderRadius: 3, bgcolor: alpha('#10B981', 0.1) }}>
                <Typography variant="caption" color="text.secondary">Streak</Typography>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#10B981' }}>
                  {userStats.streakDays} days 🔥
                </Typography>
              </Paper>
            </Box>
          </Box>
        </motion.div>

        <Grid container spacing={3}>
          {/* Left Column - User Stats */}
          <Grid item xs={12} md={4}>
            <motion.div variants={fadeInUp}>
              <Card
                elevation={0}
                sx={{
                  borderRadius: 4,
                  overflow: 'hidden',
                  background: `linear-gradient(135deg, ${alpha('#4F46E5', 0.05)} 0%, ${alpha('#7C3AED', 0.02)} 100%)`,
                  border: `1px solid ${alpha('#4F46E5', 0.1)}`,
                  position: 'relative'
                }}
              >
                {/* Level Badge */}
                <Box
                  sx={{
                    position: 'absolute',
                    top: 20,
                    right: 20,
                    background: `linear-gradient(135deg, ${currentLevelInfo.color} 0%, ${alpha(currentLevelInfo.color, 0.7)} 100%)`,
                    borderRadius: 3,
                    px: 2,
                    py: 0.5,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                  }}
                >
                  <Typography variant="h6">{currentLevelInfo.icon}</Typography>
                  <Typography variant="caption" sx={{ color: 'white', fontWeight: 600 }}>
                    Lvl {currentLevelInfo.level}
                  </Typography>
                </Box>

                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                    <Avatar
                      sx={{
                        width: 80,
                        height: 80,
                        background: `linear-gradient(135deg, ${currentLevelInfo.color} 0%, ${alpha(currentLevelInfo.color, 0.7)} 100%)`,
                        fontSize: 40
                      }}
                    >
                      {currentLevelInfo.icon}
                    </Avatar>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 700 }}>
                        {userStats.rank}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {currentLevelInfo.name}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Points Display */}
                  <Box sx={{ textAlign: 'center', mb: 3 }}>
                    <Typography variant="caption" color="text.secondary">Available Points</Typography>
                    <Typography variant="h2" sx={{ fontWeight: 800, color: '#F59E0B' }}>
                      <CountUp end={userPoints} duration={2} />
                    </Typography>
                  </Box>

                  {/* Level Progress */}
                  {nextLevelInfo && (
                    <Box sx={{ mb: 3 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="caption" color="text.secondary">
                          Progress to {nextLevelInfo.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {nextLevelInfo.minPoints - userPoints} points needed
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={progressToNextLevel}
                        sx={{
                          height: 8,
                          borderRadius: 4,
                          bgcolor: alpha(currentLevelInfo.color, 0.2),
                          '& .MuiLinearProgress-bar': {
                            background: `linear-gradient(90deg, ${currentLevelInfo.color}, ${nextLevelInfo.color})`,
                            borderRadius: 4
                          }
                        }}
                      />
                    </Box>
                  )}

                  <Divider sx={{ my: 2 }} />

                  {/* Stats Grid */}
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h5" sx={{ fontWeight: 700, color: '#4F46E5' }}>
                          {userStats.totalReports}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">Reports</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h5" sx={{ fontWeight: 700, color: '#10B981' }}>
                          {userStats.issuesResolved}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">Resolved</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h5" sx={{ fontWeight: 700, color: '#F59E0B' }}>
                          {userStats.rewardsClaimed || 3}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">Rewards</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h5" sx={{ fontWeight: 700, color: '#8B5CF6' }}>
                          {userStats.streakDays}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">Day Streak</Typography>
                      </Box>
                    </Grid>
                  </Grid>

                  <Divider sx={{ my: 2 }} />

                  {/* Badges */}
                  <Typography variant="subtitle2" sx={{ mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <StarIcon sx={{ fontSize: 18, color: '#F59E0B' }} />
                    Earned Badges
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {userStats.badges.map((badge, idx) => (
                      <Tooltip key={idx} title={badge}>
                        <Chip
                          label={badge}
                          size="small"
                          sx={{
                            bgcolor: alpha('#4F46E5', 0.1),
                            color: '#4F46E5',
                            '&:hover': { bgcolor: alpha('#4F46E5', 0.2) }
                          }}
                        />
                      </Tooltip>
                    ))}
                  </Box>
                </CardContent>
              </Card>

              {/* Quick Tips */}
              <Paper
                elevation={0}
                sx={{
                  mt: 2,
                  p: 2,
                  borderRadius: 3,
                  bgcolor: alpha('#10B981', 0.05),
                  border: `1px solid ${alpha('#10B981', 0.1)}`
                }}
              >
                <Typography variant="subtitle2" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <InfoIcon sx={{ fontSize: 18, color: '#10B981' }} />
                  💡 Ways to Earn More Points
                </Typography>
                <Stack spacing={1}>
                  <Typography variant="caption" color="text.secondary">• Report issues: +10-25 points</Typography>
                  <Typography variant="caption" color="text.secondary">• Get issues resolved: +50 points</Typography>
                  <Typography variant="caption" color="text.secondary">• Maintain daily streak: Bonus points</Typography>
                  <Typography variant="caption" color="text.secondary">• Refer friends: +100 points each</Typography>
                </Stack>
              </Paper>
            </motion.div>
          </Grid>

          {/* Right Column - Rewards */}
          <Grid item xs={12} md={8}>
            <motion.div variants={fadeInUp}>
              <Paper
                elevation={0}
                sx={{
                  borderRadius: 4,
                  overflow: 'hidden',
                  border: `1px solid ${alpha('#4F46E5', 0.1)}`,
                  background: alpha(theme.palette.background.paper, 0.95)
                }}
              >
                {/* Tabs */}
                <Box sx={{ borderBottom: `1px solid ${alpha('#4F46E5', 0.1)}`, px: 2 }}>
                  <Tabs
                    value={selectedTab}
                    onChange={(e, v) => setSelectedTab(v)}
                    variant="scrollable"
                    scrollButtons="auto"
                    sx={{
                      '& .MuiTab-root': {
                        textTransform: 'none',
                        minWidth: 'auto',
                        px: 2,
                        '&.Mui-selected': {
                          color: '#4F46E5'
                        }
                      },
                      '& .MuiTabs-indicator': {
                        backgroundColor: '#4F46E5'
                      }
                    }}
                  >
                    <Tab label="All Rewards" />
                    <Tab label="Under 500" />
                    <Tab label="500-1500" />
                    <Tab label="Premium" />
                    <Tab label="Vouchers" />
                    <Tab label="Merchandise" />
                    <Tab label="Eco" />
                  </Tabs>
                </Box>

                <Box sx={{ p: 3 }}>
                  <Grid container spacing={2}>
                    <AnimatePresence>
                      {getFilteredRewards().map((reward, index) => (
                        <Grid item xs={12} sm={6} key={reward.id}>
                          <motion.div
                            variants={cardVariants}
                            initial="hidden"
                            animate="visible"
                            whileHover="hover"
                            transition={{ delay: index * 0.05 }}
                          >
                            <Card
                              elevation={0}
                              sx={{
                                borderRadius: 3,
                                border: `1px solid ${alpha(reward.color, 0.2)}`,
                                background: alpha(theme.palette.background.paper, 0.95),
                                transition: 'all 0.3s',
                                position: 'relative',
                                overflow: 'visible',
                                '&:hover': {
                                  boxShadow: `0 8px 25px ${alpha(reward.color, 0.15)}`,
                                  borderColor: alpha(reward.color, 0.4)
                                }
                              }}
                            >
                              {reward.limitedTime && (
                                <Chip
                                  label={reward.limitedOffer || 'Limited Time'}
                                  size="small"
                                  sx={{
                                    position: 'absolute',
                                    top: -10,
                                    right: 10,
                                    bgcolor: '#EF4444',
                                    color: 'white',
                                    fontWeight: 600,
                                    zIndex: 1
                                  }}
                                />
                              )}
                              <CardContent sx={{ p: 2.5 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                                  <Avatar
                                    sx={{
                                      bgcolor: alpha(reward.color, 0.1),
                                      color: reward.color,
                                      width: 48,
                                      height: 48
                                    }}
                                  >
                                    {reward.iconComponent}
                                  </Avatar>
                                  <Box sx={{ flex: 1 }}>
                                    <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1rem' }}>
                                      {reward.name}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                      {reward.description}
                                    </Typography>
                                  </Box>
                                </Box>

                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                                  <Chip
                                    icon={<LocalOffer />}
                                    label={`${reward.points} points`}
                                    size="small"
                                    sx={{
                                      bgcolor: alpha(reward.color, 0.1),
                                      color: reward.color,
                                      fontWeight: 600
                                    }}
                                  />
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    <TrendingUpIcon sx={{ fontSize: 12, color: '#F59E0B' }} />
                                    <Typography variant="caption" color="text.secondary">
                                      {reward.popularity}% claimed
                                    </Typography>
                                  </Box>
                                </Box>

                                <Button
                                  variant={userPoints >= reward.points ? 'contained' : 'outlined'}
                                  fullWidth
                                  onClick={() => handleClaimReward(reward)}
                                  disabled={claimedRewards.includes(reward.id) || userPoints < reward.points}
                                  sx={{
                                    borderRadius: 2,
                                    py: 1,
                                    ...(userPoints >= reward.points && {
                                      background: `linear-gradient(135deg, ${reward.color} 0%, ${alpha(reward.color, 0.8)} 100%)`,
                                      '&:hover': {
                                        transform: 'translateY(-2px)',
                                        boxShadow: `0 5px 15px ${alpha(reward.color, 0.4)}`
                                      }
                                    })
                                  }}
                                >
                                  {claimedRewards.includes(reward.id) ? (
                                    <>
                                      <CheckCircleIcon sx={{ mr: 1, fontSize: 16 }} />
                                      Claimed
                                    </>
                                  ) : userPoints >= reward.points ? (
                                    'Claim Reward'
                                  ) : (
                                    `Need ${reward.points - userPoints} more points`
                                  )}
                                </Button>
                              </CardContent>
                            </Card>
                          </motion.div>
                        </Grid>
                      ))}
                    </AnimatePresence>
                  </Grid>

                  {getFilteredRewards().length === 0 && (
                    <Box sx={{ textAlign: 'center', py: 8 }}>
                      <Typography variant="h6" color="text.secondary">No rewards found</Typography>
                      <Typography variant="body2" color="text.secondary">Try a different category</Typography>
                    </Box>
                  )}
                </Box>
              </Paper>

              {/* Reward History */}
              <Paper
                elevation={0}
                sx={{
                  mt: 3,
                  p: 3,
                  borderRadius: 4,
                  border: `1px solid ${alpha('#4F46E5', 0.1)}`,
                  background: alpha(theme.palette.background.paper, 0.95)
                }}
              >
                <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <HistoryIcon sx={{ color: '#4F46E5' }} />
                  Reward History
                </Typography>
                <Grid container spacing={2}>
                  {rewardHistory.map((history) => (
                    <Grid item xs={12} key={history.id}>
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          p: 1.5,
                          borderRadius: 2,
                          bgcolor: alpha('#4F46E5', 0.03),
                          '&:hover': { bgcolor: alpha('#4F46E5', 0.06) }
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar sx={{ bgcolor: alpha('#4F46E5', 0.1), width: 40, height: 40 }}>
                            <GiftCardIcon sx={{ fontSize: 20, color: '#4F46E5' }} />
                          </Avatar>
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {history.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {new Date(history.date).toLocaleDateString()}
                            </Typography>
                          </Box>
                        </Box>
                        <Box sx={{ textAlign: 'right' }}>
                          <Chip
                            label={`-${history.points} pts`}
                            size="small"
                            sx={{ bgcolor: alpha('#EF4444', 0.1), color: '#EF4444' }}
                          />
                          <Typography variant="caption" display="block" color="text.secondary">
                            {history.status}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </Paper>
            </motion.div>
          </Grid>
        </Grid>

        {/* Congratulations Snackbar */}
        <Snackbar
          open={showCongrats}
          autoHideDuration={3000}
          onClose={() => setShowCongrats(false)}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert
            severity="success"
            sx={{
              borderRadius: 2,
              background: 'linear-gradient(135deg, #10B981 0%, #34D399 100%)',
              color: 'white',
              '& .MuiAlert-icon': { color: 'white' }
            }}
          >
            🎉 Congratulations! You've claimed {lastClaimedReward?.name}!
          </Alert>
        </Snackbar>
      </motion.div>
    </Container>
  );
};

// Skeleton component for loading state
const Skeleton = ({ variant, height, sx }) => (
  <Box sx={{ ...sx, bgcolor: 'rgba(0,0,0,0.1)', height, borderRadius: 4 }} />
);

export default RewardCenter;