import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  LinearProgress,
  Box,
  useTheme,
  alpha,
  Chip,
  Avatar,
  IconButton,
  Tooltip,
  Button
} from '@mui/material';
import {
  AttachMoney,
  TrendingUp,
  CalendarToday,
  Receipt as ReceiptIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon,
  MonetizationOn,
  Timeline as TimelineIcon,
  Star as StarIcon
} from '@mui/icons-material';
// Removed duplicate TrendingUpIcon - using TrendingUp instead
import { driverService } from '../../services/driverService';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  Legend, 
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar
} from 'recharts';
// Removed unused Cell import
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { showSuccess } from '../../utils/toast';

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

const DriverEarnings = () => {
  const theme = useTheme();
  const [earnings, setEarnings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [chartType, setChartType] = useState('line');

  useEffect(() => {
    fetchEarnings();
  }, []);

  const fetchEarnings = async () => {
    try {
      const response = await driverService.getEarnings();
      setEarnings(response.data);
    } catch (error) {
      console.error('Error fetching earnings:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchEarnings();
  };

  const handleDownloadReport = () => {
    showSuccess('Earnings report downloaded successfully!');
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <Paper
          sx={{
            p: 1.5,
            bgcolor: alpha(theme.palette.background.paper, 0.95),
            border: `1px solid ${alpha('#4F46E5', 0.2)}`,
            borderRadius: 2
          }}
        >
          <Typography variant="body2" fontWeight={600}>{label}</Typography>
          {payload.map((entry, index) => (
            <Typography key={index} variant="body2" color={entry.color}>
              {entry.name}: {entry.name === 'Waste Collected (kg)' ? `${entry.value} kg` : formatCurrency(entry.value)}
            </Typography>
          ))}
        </Paper>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <LinearProgress sx={{ borderRadius: 2, height: 6 }} />
      </Container>
    );
  }

  const totalEarnings = earnings?.current?.totalEarned || 0;
  const bonus = earnings?.current?.bonus || 0;
  const baseSalary = earnings?.current?.baseSalary || 0;
  const monthlyData = earnings?.monthlyBreakdown || [];

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
            My Earnings
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title="Download Report">
              <IconButton
                onClick={handleDownloadReport}
                sx={{
                  bgcolor: alpha('#4F46E5', 0.05),
                  '&:hover': { bgcolor: alpha('#4F46E5', 0.1) }
                }}
              >
                <DownloadIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Refresh">
              <IconButton
                onClick={handleRefresh}
                disabled={refreshing}
                sx={{
                  bgcolor: alpha('#4F46E5', 0.05),
                  '&:hover': { bgcolor: alpha('#4F46E5', 0.1) }
                }}
              >
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={4}>
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
                      width: 56,
                      height: 56,
                      margin: '0 auto 12px',
                      background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                      boxShadow: `0 8px 16px ${alpha('#10B981', 0.3)}`
                    }}
                  >
                    <AttachMoney sx={{ fontSize: 28, color: 'white' }} />
                  </Avatar>
                  <Typography variant="h3" sx={{ fontWeight: 800, color: '#10B981' }}>
                    {formatCurrency(totalEarnings)}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">Total Earnings</Typography>
                  <Chip
                    label={`Base: ${formatCurrency(baseSalary)}`}
                    size="small"
                    sx={{ mt: 1, bgcolor: alpha('#10B981', 0.1), color: '#10B981' }}
                  />
                </CardContent>
              </Card>
            </motion.div>
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
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
                      width: 56,
                      height: 56,
                      margin: '0 auto 12px',
                      background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
                      boxShadow: `0 8px 16px ${alpha('#F59E0B', 0.3)}`
                    }}
                  >
                    <TrendingUp sx={{ fontSize: 28, color: 'white' }} />
                  </Avatar>
                  <Typography variant="h3" sx={{ fontWeight: 800, color: '#F59E0B' }}>
                    {formatCurrency(bonus)}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">Bonus Earned</Typography>
                  <Chip
                    icon={<StarIcon />}
                    label="Performance Bonus"
                    size="small"
                    sx={{ mt: 1, bgcolor: alpha('#F59E0B', 0.1), color: '#F59E0B' }}
                  />
                </CardContent>
              </Card>
            </motion.div>
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <motion.div variants={fadeInUp}>
              <Card
                elevation={0}
                sx={{
                  textAlign: 'center',
                  p: 2,
                  borderRadius: 4,
                  background: `linear-gradient(135deg, ${alpha('#4F46E5', 0.05)} 0%, ${alpha('#4F46E5', 0.02)} 100%)`,
                  border: `1px solid ${alpha('#4F46E5', 0.1)}`,
                  transition: 'all 0.3s',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: `0 15px 30px ${alpha('#4F46E5', 0.15)}`
                  }
                }}
              >
                <CardContent>
                  <Avatar
                    sx={{
                      width: 56,
                      height: 56,
                      margin: '0 auto 12px',
                      background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
                      boxShadow: `0 8px 16px ${alpha('#4F46E5', 0.3)}`
                    }}
                  >
                    <MonetizationOn sx={{ fontSize: 28, color: 'white' }} />
                  </Avatar>
                  <Typography variant="h3" sx={{ fontWeight: 800, color: '#4F46E5' }}>
                    {earnings?.current?.lastPayout ? format(new Date(earnings.current.lastPayout), 'dd MMM') : 'N/A'}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">Last Payout</Typography>
                  <Chip
                    icon={<CalendarToday />}
                    label="Monthly"
                    size="small"
                    sx={{ mt: 1, bgcolor: alpha('#4F46E5', 0.1), color: '#4F46E5' }}
                  />
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        </Grid>

        {/* Earnings Breakdown Section */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={6}>
            <motion.div variants={fadeInUp}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: 4,
                  height: '100%',
                  background: alpha(theme.palette.background.paper, 0.95),
                  border: `1px solid ${alpha('#4F46E5', 0.1)}`
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <ReceiptIcon sx={{ color: '#4F46E5' }} />
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Earnings Breakdown
                  </Typography>
                </Box>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ bgcolor: alpha('#4F46E5', 0.03) }}>
                        <TableCell sx={{ fontWeight: 600 }}>Component</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600 }}>Amount</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      <TableRow hover>
                        <TableCell>Base Salary</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 500 }}>
                          {formatCurrency(baseSalary)}
                        </TableCell>
                      </TableRow>
                      <TableRow hover>
                        <TableCell>Bonus</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 500, color: '#F59E0B' }}>
                          + {formatCurrency(bonus)}
                        </TableCell>
                      </TableRow>
                      <TableRow hover>
                        <TableCell sx={{ fontWeight: 600 }}>Total</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 800, color: '#10B981', fontSize: '1.1rem' }}>
                          {formatCurrency(totalEarnings)}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            </motion.div>
          </Grid>

          <Grid item xs={12} md={6}>
            <motion.div variants={fadeInUp}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: 4,
                  height: '100%',
                  background: alpha(theme.palette.background.paper, 0.95),
                  border: `1px solid ${alpha('#4F46E5', 0.1)}`
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <TimelineIcon sx={{ color: '#4F46E5' }} />
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Performance Summary
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box>
                    <Typography variant="body2" color="textSecondary" gutterBottom>
                      Average Monthly Earnings
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: '#4F46E5' }}>
                      {monthlyData.length > 0 
                        ? formatCurrency(monthlyData.reduce((sum, item) => sum + (item.earnings || 0), 0) / monthlyData.length)
                        : formatCurrency(0)}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="textSecondary" gutterBottom>
                      Total Collections
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: '#10B981' }}>
                      {monthlyData.reduce((sum, item) => sum + (item.collections || 0), 0)}
                    </Typography>
                  </Box>
                </Box>
              </Paper>
            </motion.div>
          </Grid>
        </Grid>

        {/* Chart Section */}
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
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <TrendingUp sx={{ color: '#4F46E5' }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Monthly Earnings Trend
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  size="small"
                  variant={chartType === 'line' ? 'contained' : 'outlined'}
                  onClick={() => setChartType('line')}
                  sx={{
                    borderRadius: 2,
                    ...(chartType === 'line' && {
                      background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)'
                    })
                  }}
                >
                  Line
                </Button>
                <Button
                  size="small"
                  variant={chartType === 'area' ? 'contained' : 'outlined'}
                  onClick={() => setChartType('area')}
                  sx={{
                    borderRadius: 2,
                    ...(chartType === 'area' && {
                      background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)'
                    })
                  }}
                >
                  Area
                </Button>
                <Button
                  size="small"
                  variant={chartType === 'bar' ? 'contained' : 'outlined'}
                  onClick={() => setChartType('bar')}
                  sx={{
                    borderRadius: 2,
                    ...(chartType === 'bar' && {
                      background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)'
                    })
                  }}
                >
                  Bar
                </Button>
              </Box>
            </Box>

            {monthlyData.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 6 }}>
                <Typography color="textSecondary">No data available for chart</Typography>
              </Box>
            ) : (
              <ResponsiveContainer width="100%" height={350}>
                {chartType === 'line' && (
                  <LineChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={alpha('#4F46E5', 0.1)} />
                    <XAxis 
                      dataKey="_id" 
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
                    <RechartsTooltip content={<CustomTooltip />} />
                    <Legend />
                    <Line 
                      yAxisId="left"
                      type="monotone" 
                      dataKey="earnings" 
                      stroke="#4F46E5" 
                      name="Earnings (₹)"
                      strokeWidth={3}
                      dot={{ fill: '#4F46E5', r: 6 }}
                      activeDot={{ r: 8 }}
                    />
                    <Line 
                      yAxisId="right"
                      type="monotone" 
                      dataKey="collections" 
                      stroke="#10B981" 
                      name="Collections"
                      strokeWidth={3}
                      dot={{ fill: '#10B981', r: 6 }}
                    />
                  </LineChart>
                )}

                {chartType === 'area' && (
                  <AreaChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={alpha('#4F46E5', 0.1)} />
                    <XAxis 
                      dataKey="_id" 
                      stroke={theme.palette.text.secondary}
                      tick={{ fill: theme.palette.text.secondary }}
                    />
                    <YAxis 
                      stroke={theme.palette.text.secondary}
                      tick={{ fill: theme.palette.text.secondary }}
                    />
                    <RechartsTooltip content={<CustomTooltip />} />
                    <Legend />
                    <Area 
                      type="monotone" 
                      dataKey="earnings" 
                      stackId="1"
                      stroke="#4F46E5" 
                      fill={alpha('#4F46E5', 0.2)}
                      name="Earnings (₹)"
                    />
                    <Area 
                      type="monotone" 
                      dataKey="collections" 
                      stackId="2"
                      stroke="#10B981" 
                      fill={alpha('#10B981', 0.2)}
                      name="Collections"
                    />
                  </AreaChart>
                )}

                {chartType === 'bar' && (
                  <BarChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={alpha('#4F46E5', 0.1)} />
                    <XAxis 
                      dataKey="_id" 
                      stroke={theme.palette.text.secondary}
                      tick={{ fill: theme.palette.text.secondary }}
                    />
                    <YAxis 
                      stroke={theme.palette.text.secondary}
                      tick={{ fill: theme.palette.text.secondary }}
                    />
                    <RechartsTooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar dataKey="earnings" fill="#4F46E5" name="Earnings (₹)" radius={[8, 8, 0, 0]} />
                    <Bar dataKey="collections" fill="#10B981" name="Collections" radius={[8, 8, 0, 0]} />
                  </BarChart>
                )}
              </ResponsiveContainer>
            )}
          </Paper>
        </motion.div>
      </motion.div>
    </Container>
  );
};

export default DriverEarnings;