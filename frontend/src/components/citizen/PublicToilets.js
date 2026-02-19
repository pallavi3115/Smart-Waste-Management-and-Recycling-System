import React from 'react';
import { Container, Typography, Grid, Card, CardContent, Chip, Box } from '@mui/material';
import { LocationOn, AccessTime, Wc } from '@mui/icons-material';

const PublicToilets = () => {
  const toilets = [
    { name: 'Central Park Toilet', location: 'Near Gate 1', status: 'Open', rating: 4.5 },
    { name: 'Market Complex', location: 'Sector 12', status: 'Open', rating: 4.0 },
    { name: 'Bus Stand', location: 'Main Road', status: 'Maintenance', rating: 3.5 },
  ];

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Public Toilets
      </Typography>

      <Grid container spacing={3}>
        {toilets.map((toilet) => (
          <Grid item xs={12} sm={6} md={4} key={toilet.name}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Wc sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="h6">{toilet.name}</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <LocationOn fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                  <Typography variant="body2">{toilet.location}</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <AccessTime fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                  <Typography variant="body2">24/7</Typography>
                </Box>
                <Chip 
                  label={toilet.status} 
                  size="small"
                  color={toilet.status === 'Open' ? 'success' : 'warning'}
                  sx={{ mt: 1 }}
                />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default PublicToilets;