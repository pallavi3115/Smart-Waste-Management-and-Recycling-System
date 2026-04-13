import React from 'react';
import { Skeleton, Grid, Card, Box, Container, useTheme, alpha } from '@mui/material';

const DashboardSkeleton = () => {
  const theme = useTheme();
  
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Header Skeleton */}
      <Card
        elevation={0}
        sx={{
          p: 3,
          mb: 4,
          borderRadius: 4,
          background: `linear-gradient(135deg, ${alpha('#4F46E5', 0.05)} 0%, ${alpha('#7C3AED', 0.02)} 100%)`,
          border: `1px solid ${alpha('#4F46E5', 0.1)}`,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, flexWrap: 'wrap' }}>
          <Skeleton variant="circular" width={80} height={80} />
          <Box sx={{ flex: 1 }}>
            <Skeleton variant="text" width={250} height={40} sx={{ mb: 1 }} />
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Skeleton variant="rounded" width={120} height={32} />
              <Skeleton variant="rounded" width={100} height={32} />
              <Skeleton variant="rounded" width={80} height={32} />
            </Box>
          </Box>
          <Skeleton variant="rounded" width={140} height={40} />
        </Box>
      </Card>

      {/* Stats Grid */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {[1, 2, 3, 4].map((item) => (
          <Grid item xs={12} sm={6} md={3} key={item}>
            <Card
              elevation={0}
              sx={{
                p: 2.5,
                borderRadius: 4,
                background: alpha(theme.palette.background.paper, 0.95),
                border: `1px solid ${alpha('#4F46E5', 0.1)}`,
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Skeleton variant="text" width={80} height={24} sx={{ mb: 1 }} />
                  <Skeleton variant="text" width={100} height={40} />
                </Box>
                <Skeleton variant="circular" width={48} height={48} />
              </Box>
              <Skeleton variant="text" width={120} height={20} sx={{ mt: 2 }} />
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Today's Route Card */}
      <Card
        elevation={0}
        sx={{
          p: 3,
          mb: 4,
          borderRadius: 4,
          background: alpha(theme.palette.background.paper, 0.95),
          border: `1px solid ${alpha('#4F46E5', 0.1)}`,
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box>
            <Skeleton variant="text" width={180} height={28} sx={{ mb: 1 }} />
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Skeleton variant="rounded" width={80} height={24} />
              <Skeleton variant="rounded" width={80} height={24} />
              <Skeleton variant="rounded" width={80} height={24} />
            </Box>
          </Box>
          <Skeleton variant="circular" width={48} height={48} />
        </Box>
        <Skeleton variant="rounded" height={8} sx={{ mb: 2, borderRadius: 4 }} />
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Skeleton variant="rounded" width={100} height={32} />
            <Skeleton variant="rounded" width={100} height={32} />
            <Skeleton variant="rounded" width={100} height={32} />
          </Box>
          <Skeleton variant="rounded" width={120} height={36} />
        </Box>
      </Card>

      {/* Quick Actions */}
      <Grid container spacing={3}>
        {[1, 2, 3, 4].map((item) => (
          <Grid item xs={12} sm={6} md={3} key={item}>
            <Card
              elevation={0}
              sx={{
                p: 3,
                textAlign: 'center',
                borderRadius: 4,
                background: alpha(theme.palette.background.paper, 0.95),
                border: `1px solid ${alpha('#4F46E5', 0.1)}`,
              }}
            >
              <Skeleton variant="circular" width={60} height={60} sx={{ mx: 'auto', mb: 2 }} />
              <Skeleton variant="text" width={120} height={28} sx={{ mx: 'auto', mb: 1 }} />
              <Skeleton variant="text" width={100} height={20} sx={{ mx: 'auto' }} />
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default DashboardSkeleton;