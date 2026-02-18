import React, { useState, useEffect } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Warning as WarningIcon,
  Recycling as RecyclingIcon
  // Removed TrendingUpIcon
} from '@mui/icons-material';
import { binService } from '../../services/binService';
import { recyclingService } from '../../services/recyclingService';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorAlert from '../ErrorAlert'; // This path is correct

// ... rest of the code remains the same

const AdminDashboard = () => {
  const [bins, setBins] = useState([]);
  const [centers, setCenters] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [binsRes, centersRes, statsRes] = await Promise.all([
        binService.getAllBins(),
        recyclingService.getAllCenters(),
        recyclingService.getStats()
      ]);

      setBins(binsRes.data);
      setCenters(centersRes.data);
      setStats(statsRes.data);
      setError(null);
    } catch (err) {
      setError('Failed to load dashboard data');
      console.error('Dashboard error:', err);
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
      <Typography variant="h4" gutterBottom>
        Admin Dashboard
      </Typography>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: 'primary.main', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="h6">Total Bins</Typography>
                  <Typography variant="h3">{stats?.totalBins || bins.length}</Typography>
                </Box>
                <DeleteIcon sx={{ fontSize: 48, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: 'error.main', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="h6">Full Bins</Typography>
                  <Typography variant="h3">
                    {bins.filter(b => b.status === 'Full').length}
                  </Typography>
                </Box>
                <WarningIcon sx={{ fontSize: 48, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: 'warning.main', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="h6">Fire Alerts</Typography>
                  <Typography variant="h3">
                    {bins.filter(b => b.fire_alert).length}
                  </Typography>
                </Box>
                <WarningIcon sx={{ fontSize: 48, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: 'success.main', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="h6">Recycling Rate</Typography>
                  <Typography variant="h3">{stats?.utilizationRate || '68%'}</Typography>
                </Box>
                <RecyclingIcon sx={{ fontSize: 48, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Bins Table */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Smart Bins Status
        </Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Bin ID</TableCell>
                <TableCell>Area</TableCell>
                <TableCell>Fill Level</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Fire Alert</TableCell>
                <TableCell>Last Updated</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {bins.map((bin) => (
                <TableRow key={bin.id}>
                  <TableCell>#{bin.id}</TableCell>
                  <TableCell>{bin.area}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box sx={{ width: 100, bgcolor: '#eee', borderRadius: 1, overflow: 'hidden' }}>
                        <Box
                          sx={{
                            width: `${bin.fill_level}%`,
                            height: 8,
                            bgcolor: bin.fill_level > 80 ? 'error.main' : 'primary.main'
                          }}
                        />
                      </Box>
                      {bin.fill_level}%
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={bin.status}
                      color={getStatusColor(bin.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {bin.fire_alert ? (
                      <Chip label="FIRE" color="error" size="small" icon={<WarningIcon />} />
                    ) : (
                      'No'
                    )}
                  </TableCell>
                  <TableCell>
                    {new Date(bin.last_updated).toLocaleString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Recycling Centers */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Recycling Centers
        </Typography>
        <Grid container spacing={3}>
          {centers.map((center) => (
            <Grid item xs={12} md={6} key={center.id}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6">{center.name}</Typography>
                  <Typography color="textSecondary" gutterBottom>
                    Capacity: {center.current_load}/{center.capacity} tons
                  </Typography>
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2" color="textSecondary">
                      Materials Accepted:
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1 }}>
                      {center.materials_supported.map((material) => (
                        <Chip key={material} label={material} size="small" />
                      ))}
                    </Box>
                  </Box>
                  <Box sx={{ mt: 2 }}>
                    <Box
                      sx={{
                        height: 8,
                        bgcolor: '#eee',
                        borderRadius: 4,
                        overflow: 'hidden'
                      }}
                    >
                      <Box
                        sx={{
                          width: `${(center.current_load / center.capacity) * 100}%`,
                          height: '100%',
                          bgcolor: 'success.main'
                        }}
                      />
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Paper>
    </Box>
  );
};

export default AdminDashboard;