import React from 'react';
import { Container, Typography, Paper } from '@mui/material';

const TestPage = () => {
  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>
          Test Page - Routing is Working!
        </Typography>
        <Typography variant="body1">
          If you can see this, routing is working properly.
        </Typography>
      </Paper>
    </Container>
  );
};

export default TestPage;