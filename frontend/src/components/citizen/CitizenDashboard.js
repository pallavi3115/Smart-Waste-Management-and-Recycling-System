import React from 'react';
import { Container, Typography, Grid, Card, CardContent, Button } from '@mui/material'; // Removed Paper
import { useNavigate } from 'react-router-dom';
import { Report, Recycling, EmojiEvents, LocationOn } from '@mui/icons-material';

// ... rest remains the same

const CitizenDashboard = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Citizen Dashboard
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ textAlign: 'center', p: 2 }}>
            <Report sx={{ fontSize: 60, color: 'primary.main' }} />
            <CardContent>
              <Typography variant="h6">Report Issue</Typography>
              <Button variant="contained" onClick={() => navigate('/citizen/report')}>
                Report Now
              </Button>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ textAlign: 'center', p: 2 }}>
            <Recycling sx={{ fontSize: 60, color: 'success.main' }} />
            <CardContent>
              <Typography variant="h6">Recycling Guide</Typography>
              <Button variant="outlined" onClick={() => navigate('/citizen/recycling-guide')}>
                Learn More
              </Button>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ textAlign: 'center', p: 2 }}>
            <EmojiEvents sx={{ fontSize: 60, color: 'warning.main' }} />
            <CardContent>
              <Typography variant="h6">My Rewards</Typography>
              <Button variant="outlined" onClick={() => navigate('/citizen/rewards')}>
                View Rewards
              </Button>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ textAlign: 'center', p: 2 }}>
            <LocationOn sx={{ fontSize: 60, color: 'info.main' }} />
            <CardContent>
              <Typography variant="h6">Nearby Bins</Typography>
              <Button variant="outlined" onClick={() => navigate('/citizen/nearby')}>
                Find Bins
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default CitizenDashboard;