import React, { useState, useEffect } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Alert
} from '@mui/material';
import {
  TrendingUp,
  Warning,
  Recycle
} from '@mui/icons-material';
import { binService } from '../../services/binService';
import BinMap from '../../components/admin/BinMap';
import StatsCard from '../../components/admin/StatsCard';

const AdminDashboard = () => {
  const [bins, setBins] = useState([]);
  const [stats, setStats] = useState({
    totalBins: 0,
    fullBins: 0,
    fireAlerts: 0,
    recyclingRate: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const binsResponse = await binService.getAllBins();
      const binsData = binsResponse.data;
      
      setBins(binsData);
      
      const fullBins = binsData.filter(bin => bin.status === 'Full').length;
      const fireAlerts = binsData.filter(bin => bin.fire_alert).length;
      
      setStats({
        totalBins: binsData.length,
        fullBins,
        fireAlerts,
        recyclingRate: Math.round((binsData.filter(bin => bin.fill_level > 0).length / binsData.length) * 100)
      });
    } catch (err) {
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Typography>Loading...</Typography>;

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Admin Dashboard
      </Typography>
      
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      
      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="Total Bins"
            value={stats.totalBins}
            icon={<TrendingUp />}
            color="#1976d2"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="Full Bins"
            value={stats.fullBins}
            icon={<Warning />}
            color="#f44336"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="Fire Alerts"
            value={stats.fireAlerts}
            icon={<Warning />}
            color="#ff9800"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="Recycling Rate"
            value={`${stats.recyclingRate}%`}
            icon={<Recycle />}
            color="#4caf50"
          />
        </Grid>
      </Grid>
      
      {/* Bin Map */}
      <Grid container spacing={3}>
        <Grid item xs={12} lg={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Bin Locations
              </Typography>
              <BinMap bins={bins} />
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} lg={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Alerts
              </Typography>
              {bins.filter(bin => bin.status === 'Full' || bin.fire_alert).map(bin => (
                <Alert 
                  key={bin._id} 
                  severity={bin.fire_alert ? 'error' : 'warning'}
                  sx={{ mb: 1 }}
                >
                  {bin.fire_alert ? 'Fire Alert' : 'Bin Full'} - {bin.area}
                </Alert>
              ))}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdminDashboard;