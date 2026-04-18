import { useEffect, useState } from 'react';

import {
  Avatar,
  Box,
  Card,
  CardContent,
  Chip,
  Grid,
  LinearProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography
} from '@mui/material';

import { alpha } from '@mui/material/styles';

// ✅ Icons add kiye
import DeleteIcon from '@mui/icons-material/Delete';
import RecyclingIcon from '@mui/icons-material/Recycling';
import WarningIcon from '@mui/icons-material/Warning';

import { binService } from '../../services/binService';
import { recyclingService } from '../../services/recyclingService';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorAlert from '../ErrorAlert';

const AdminDashboard = () => {
  const [bins, setBins] = useState([]);
  const [centers, setCenters] = useState([]);
  const [stats, setStats] = useState({
    totalBins: 0,
    utilizationRate: '0%',
    fullBins: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      let binsData = [];
      let centersData = [];

      try {
        const binsRes = await binService.getAllBins();
        binsData = binsRes.data?.data || binsRes.data || [];
      } catch {}

      try {
        const centersRes = await recyclingService.getAllCenters();
        centersData = centersRes.data?.data || centersRes.data || [];
      } catch {}

      setBins(binsData);
      setCenters(centersData);

      // ✅ Dynamic Stats
      const fullBins = binsData.filter(b => b.status === 'Full').length;

      const avgFill =
        binsData.length > 0
          ? Math.round(
              binsData.reduce((acc, b) => acc + (b.currentFillLevel || 0), 0) /
                binsData.length
            )
          : 0;

      setStats({
        totalBins: binsData.length,
        utilizationRate: avgFill + '%',
        fullBins
      });

      setError(null);
    } catch (err) {
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Empty': return 'success';
      case 'Partial': return 'warning';
      case 'Full': return 'error';
      default: return 'default';
    }
  };

  if (loading) return <LoadingSpinner message="Loading dashboard..." />;
  if (error) return <ErrorAlert message={error} onRetry={fetchDashboardData} />;

  return (
    <Box sx={{ p: 3 }}>

      <Typography variant="h4" sx={{ mb: 3, fontWeight: 700 }}>
        📊 Smart Analytics Dashboard
      </Typography>

      {/* 🔥 Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>

        {[
          {
            title: 'Total Bins',
            value: stats.totalBins,
            icon: <DeleteIcon />,
            color: '#4F46E5'
          },
          {
            title: 'Full Bins',
            value: stats.fullBins,
            icon: <WarningIcon />,
            color: '#EF4444'
          },
          {
            title: 'Fire Alerts',
            value: bins.filter(b => b.alerts?.fire).length,
            icon: <WarningIcon />,
            color: '#F59E0B'
          },
          {
            title: 'Avg Fill Level',
            value: stats.utilizationRate,
            icon: <RecyclingIcon />,
            color: '#10B981'
          }
        ].map((item, index) => (

          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card
              sx={{
                borderRadius: 4,
                background: alpha(item.color, 0.08),
                border: `1px solid ${alpha(item.color, 0.2)}`,
                transition: '0.3s',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: `0 10px 25px ${alpha(item.color, 0.3)}`
                }
              }}
            >
              <CardContent>
                <Avatar sx={{ bgcolor: item.color, mb: 2 }}>
                  {item.icon}
                </Avatar>

                <Typography variant="h6">{item.title}</Typography>

                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                  {item.value}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* 🔥 Bin Levels */}
      <Paper sx={{ p: 3, mb: 4, borderRadius: 4 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          📦 Bin Fill Levels
        </Typography>

        {bins.slice(0, 5).map((bin) => (
          <Box key={bin._id} sx={{ mb: 2 }}>
            <Typography variant="body2">
              {bin.area} ({bin.currentFillLevel || 0}%)
            </Typography>

            <LinearProgress
              variant="determinate"
              value={bin.currentFillLevel || 0}
              sx={{ height: 8, borderRadius: 5 }}
            />
          </Box>
        ))}
      </Paper>

      {/* 🔥 Table */}
      <Paper sx={{ p: 3, mb: 4, borderRadius: 4 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          🗑 Smart Bins Status
        </Typography>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><b>Bin ID</b></TableCell>
                <TableCell><b>Area</b></TableCell>
                <TableCell><b>Fill</b></TableCell>
                <TableCell><b>Status</b></TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {bins.map((bin) => (
                <TableRow key={bin._id}>
                  <TableCell>{bin.binId || bin._id}</TableCell>
                  <TableCell>{bin.area}</TableCell>
                  <TableCell>{bin.currentFillLevel || 0}%</TableCell>
                  <TableCell>
                    <Chip
                      label={bin.status}
                      color={getStatusColor(bin.status)}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>

          </Table>
        </TableContainer>
      </Paper>

      {/* 🔥 Centers */}
      <Paper sx={{ p: 3, borderRadius: 4 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          ♻️ Recycling Centers
        </Typography>

        <Grid container spacing={2}>
          {centers.map((c) => {
            const percent = (c.current_load / c.capacity) * 100;

            return (
              <Grid item xs={12} md={6} key={c._id}>
                <Card sx={{ borderRadius: 3 }}>
                  <CardContent>
                    <Typography variant="h6">{c.name}</Typography>

                    <Typography variant="body2" sx={{ mb: 1 }}>
                      Load: {c.current_load}/{c.capacity}
                    </Typography>

                    <LinearProgress
                      variant="determinate"
                      value={percent}
                      sx={{ height: 8, borderRadius: 5 }}
                    />
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      </Paper>

    </Box>
  );
};

export default AdminDashboard;