import React from 'react';
import { Skeleton, Grid, Card, Box } from '@mui/material';

const DashboardSkeleton = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Skeleton variant="text" width={300} height={60} sx={{ mb: 3 }} />
      <Grid container spacing={3}>
        {[1, 2, 3, 4].map((item) => (
          <Grid item xs={12} sm={6} md={3} key={item}>
            <Card sx={{ p: 3 }}>
              <Skeleton variant="circular" width={60} height={60} sx={{ mb: 2 }} />
              <Skeleton variant="text" width="60%" />
              <Skeleton variant="text" width="80%" />
              <Skeleton variant="text" width="40%" />
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default DashboardSkeleton;