import React from 'react';
import { Container, Typography } from '@mui/material';

const BinManagement = () => {
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Bin Management
      </Typography>
      <Typography variant="body1">
        Bin management interface will be displayed here.
      </Typography>
    </Container>
  );
};

export default BinManagement;