import React from 'react';
import { Container, Typography, Paper } from '@mui/material';

const NearbyBins = () => {
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Nearby Bins
      </Typography>
      <Paper sx={{ p: 3, height: 500, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <Typography variant="body1" color="textSecondary">
          Map view will be displayed here. Please integrate Google Maps API.
        </Typography>
      </Paper>
    </Container>
  );
};

export default NearbyBins;