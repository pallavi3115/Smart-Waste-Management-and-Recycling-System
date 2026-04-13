import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Rating,
  LinearProgress,
  Box,
  useTheme,
  alpha,
  Avatar,
  Chip,
  Skeleton,
  Divider
} from '@mui/material';
import {
  Star as StarIcon,
  Speed as SpeedIcon,
  EmojiEvents as TrophyIcon,
  TrendingUp as TrendingUpIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  ThumbUp as ThumbUpIcon
} from '@mui/icons-material';
import { driverService } from '../../services/driverService';
import { motion } from 'framer-motion';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

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

const DriverPerformance = () => {
  const theme = useTheme();
  const [performance, setPerformance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [weeklyData, setWeeklyData] = useState([]);

  useEffect(() => {
    fetchPerformance();
    fetchWeeklyData();
  }, []);

  const fetchPerformance = async () => {
    try {
      const response = await driverService.getDashboard();
      setPerformance(response.data.performance);
    } catch (error) {
      console.error('Error fetching performance:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchWeeklyData = async () => {
    // Mock weekly performance data
    const mockWeeklyData = [
      { day: 'Mon', collections: 12, rating: 4.5, efficiency: 85 },
      { day: 'Tue', collections: 15, rating: 4.7, efficiency: 88 },
      { day: 'Wed', collections: 18, rating: 4.8, efficiency: 90 },
      { day: 'Thu', collections: 14, rating: 4.6, efficiency: 87 },
      { day: 'Fri', collections: 20, rating: 4.9, efficiency: 92 },
      { day: 'Sat', collections: 10, rating: 4.4, efficiency: 82 },
      { day: 'Sun', collections: 8, rating: 4.3, efficiency: 80 }
    ];
    setWeeklyData(mockWeeklyData);
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 3 }}>
          Performance Metrics
        </Typography>
        <Grid container spacing={3}>
          {[1, 2, 3].map((item) => (
            <Grid item xs={12} md={4} key={item}>
              <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 4 }} />
            </Grid>
          ))}
        </Grid>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            Performance Metrics
          </Typography>
          <Chip
            icon={<TrendingUpIcon />}
            label="Last 30 days"
            sx={{
              bgcolor: alpha('#4F46E5', 0.1),
              color: '#4F46E5',
              fontWeight: 600
            }}
          />
        </Box>

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={4}>
            <motion.div variants={fadeInUp}>
              <Card
                elevation={0}
                sx={{
                  textAlign: 'center',
                  p: 2,
                  borderRadius: 4,
                  background: `linear-gradient(135deg, ${alpha('#F59E0B', 0.05)} 0%, ${alpha('#F59E0B', 0.02)} 100%)`,
                  border: `1px solid ${alpha('#F59E0B', 0.1)}`,
                  transition: 'all 0.3s',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: `0 15px 30px ${alpha('#F59E0B', 0.15)}`
                  }
                }}
              >
                <CardContent>
                  <Avatar
                    sx={{
                      width: 64,
                      height: 64,
                      margin: '0 auto 12px',
                      background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
                      boxShadow: `0 8px 16px ${alpha('#F59E0B', 0.3)}`
                    }}
                  >
                    <StarIcon sx={{ fontSize: 32, color: 'white' }} />
                  </Avatar>
                  <Typography variant="h2" sx={{ fontWeight: 800, color: '#F59E0B' }}>
                    {performance?.rating || 0}
                  </Typography>
                  <Rating
                    value={performance?.rating || 0}
                    readOnly
                    precision={0.5}
                    size="large"
                    sx={{ mb: 1 }}
                  />
                  <Typography variant="body2" color="textSecondary">Overall Rating</Typography>
                  <Chip
                    label="Excellent"
                    size="small"
                    sx={{ mt: 1, bgcolor: alpha('#F59E0B', 0.1), color: '#F59E0B' }}
                  />
                </CardContent>
              </Card>
            </motion.div>
          </Grid>

          <Grid item xs={12} md={4}>
            <motion.div variants={fadeInUp}>
              <Card
                elevation={0}
                sx={{
                  textAlign: 'center',
                  p: 2,
                  borderRadius: 4,
                  background: `linear-gradient(135deg, ${alpha('#3B82F6', 0.05)} 0%, ${alpha('#3B82F6', 0.02)} 100%)`,
                  border: `1px solid ${alpha('#3B82F6', 0.1)}`,
                  transition: 'all 0.3s',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: `0 15px 30px ${alpha('#3B82F6', 0.15)}`
                  }
                }}
              >
                <CardContent>
                  <Avatar
                    sx={{
                      width: 64,
                      height: 64,
                      margin: '0 auto 12px',
                      background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
                      boxShadow: `0 8px 16px ${alpha('#3B82F6', 0.3)}`
                    }}
                  >
                    <SpeedIcon sx={{ fontSize: 32, color: 'white' }} />
                  </Avatar>
                  <Typography variant="h2" sx={{ fontWeight: 800, color: '#3B82F6' }}>
                    {performance?.totalCollections || 0}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">Total Collections</Typography>
                  <Typography variant="caption" color="textSecondary">
                    On-time: {performance?.onTimeDeliveries || 0}
                  </Typography>
                  <Chip
                    icon={<CheckCircleIcon />}
                    label="On Time"
                    size="small"
                    sx={{ mt: 1, bgcolor: alpha('#10B981', 0.1), color: '#10B981' }}
                  />
                </CardContent>
              </Card>
            </motion.div>
          </Grid>

          <Grid item xs={12} md={4}>
            <motion.div variants={fadeInUp}>
              <Card
                elevation={0}
                sx={{
                  textAlign: 'center',
                  p: 2,
                  borderRadius: 4,
                  background: `linear-gradient(135deg, ${alpha('#10B981', 0.05)} 0%, ${alpha('#10B981', 0.02)} 100%)`,
                  border: `1px solid ${alpha('#10B981', 0.1)}`,
                  transition: 'all 0.3s',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: `0 15px 30px ${alpha('#10B981', 0.15)}`
                  }
                }}
              >
                <CardContent>
                  <Avatar
                    sx={{
                      width: 64,
                      height: 64,
                      margin: '0 auto 12px',
                      background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                      boxShadow: `0 8px 16px ${alpha('#10B981', 0.3)}`
                    }}
                  >
                    <TrophyIcon sx={{ fontSize: 32, color: 'white' }} />
                  </Avatar>
                  <Typography variant="h2" sx={{ fontWeight: 800, color: '#10B981' }}>
                    {performance?.customerRating || 0}★
                  </Typography>
                  <Typography variant="body2" color="textSecondary">Customer Rating</Typography>
                  <Typography variant="caption" color="textSecondary">Based on feedback</Typography>
                  <Chip
                    icon={<ThumbUpIcon />}
                    label="Top Rated"
                    size="small"
                    sx={{ mt: 1, bgcolor: alpha('#10B981', 0.1), color: '#10B981' }}
                  />
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        </Grid>

        {/* Performance Insights */}
        <motion.div variants={fadeInUp}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              mb: 4,
              borderRadius: 4,
              background: alpha(theme.palette.background.paper, 0.95),
              border: `1px solid ${alpha('#4F46E5', 0.1)}`
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
              Performance Insights
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" fontWeight={500}>Collection Efficiency</Typography>
                    <Typography variant="body2" fontWeight={500} color="#4F46E5">85%</Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={85}
                    sx={{
                      height: 10,
                      borderRadius: 5,
                      backgroundColor: alpha('#4F46E5', 0.1),
                      '& .MuiLinearProgress-bar': {
                        background: 'linear-gradient(90deg, #4F46E5 0%, #7C3AED 100%)',
                        borderRadius: 5
                      }
                    }}
                  />
                </Box>
              </Grid>
              <Grid item xs={12}>
                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" fontWeight={500}>On-time Delivery Rate</Typography>
                    <Typography variant="body2" fontWeight={500} color="#10B981">92%</Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={92}
                    sx={{
                      height: 10,
                      borderRadius: 5,
                      backgroundColor: alpha('#10B981', 0.1),
                      '& .MuiLinearProgress-bar': {
                        background: 'linear-gradient(90deg, #10B981 0%, #059669 100%)',
                        borderRadius: 5
                      }
                    }}
                  />
                </Box>
              </Grid>
              <Grid item xs={12}>
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" fontWeight={500}>Customer Satisfaction</Typography>
                    <Typography variant="body2" fontWeight={500} color="#F59E0B">88%</Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={88}
                    sx={{
                      height: 10,
                      borderRadius: 5,
                      backgroundColor: alpha('#F59E0B', 0.1),
                      '& .MuiLinearProgress-bar': {
                        background: 'linear-gradient(90deg, #F59E0B 0%, #D97706 100%)',
                        borderRadius: 5
                      }
                    }}
                  />
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </motion.div>

        {/* Weekly Performance Chart */}
        <motion.div variants={fadeInUp}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 4,
              background: alpha(theme.palette.background.paper, 0.95),
              border: `1px solid ${alpha('#4F46E5', 0.1)}`
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
              Weekly Performance Trend
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" stroke={alpha('#4F46E5', 0.1)} />
                <XAxis
                  dataKey="day"
                  stroke={theme.palette.text.secondary}
                  tick={{ fill: theme.palette.text.secondary }}
                />
                <YAxis
                  yAxisId="left"
                  stroke={theme.palette.text.secondary}
                  tick={{ fill: theme.palette.text.secondary }}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  stroke={theme.palette.text.secondary}
                  tick={{ fill: theme.palette.text.secondary }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: alpha(theme.palette.background.paper, 0.95),
                    border: `1px solid ${alpha('#4F46E5', 0.2)}`,
                    borderRadius: 8
                  }}
                />
                <Legend />
                <Bar
                  yAxisId="left"
                  dataKey="collections"
                  fill="#4F46E5"
                  name="Collections"
                  radius={[8, 8, 0, 0]}
                />
                <Bar
                  yAxisId="right"
                  dataKey="rating"
                  fill="#F59E0B"
                  name="Rating"
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </motion.div>

        {/* Achievement Badges */}
        <motion.div variants={fadeInUp}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              mt: 4,
              borderRadius: 4,
              background: alpha(theme.palette.background.paper, 0.95),
              border: `1px solid ${alpha('#4F46E5', 0.1)}`
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              Achievements & Badges
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Chip
                icon={<TrophyIcon />}
                label="100 Collections"
                sx={{ bgcolor: alpha('#F59E0B', 0.1), color: '#F59E0B', p: 2 }}
              />
              <Chip
                icon={<StarIcon />}
                label="5-Star Rating"
                sx={{ bgcolor: alpha('#10B981', 0.1), color: '#10B981', p: 2 }}
              />
              <Chip
                icon={<SpeedIcon />}
                label="Perfect Attendance"
                sx={{ bgcolor: alpha('#3B82F6', 0.1), color: '#3B82F6', p: 2 }}
              />
              <Chip
                icon={<CheckCircleIcon />}
                label="On-Time Champion"
                sx={{ bgcolor: alpha('#8B5CF6', 0.1), color: '#8B5CF6', p: 2 }}
              />
              <Chip
                icon={<ThumbUpIcon />}
                label="Customer Favorite"
                sx={{ bgcolor: alpha('#EF4444', 0.1), color: '#EF4444', p: 2 }}
              />
            </Box>
          </Paper>
        </motion.div>
      </motion.div>
    </Container>
  );
};

export default DriverPerformance;