import React from 'react';
import { Container, Typography, Grid, Card, CardContent} from '@mui/material';

const RecyclingGuide = () => {
  const materials = [
    { name: 'Plastic', color: '#ff9800', tips: 'Rinse containers, remove caps' },
    { name: 'Glass', color: '#4caf50', tips: 'Separate by color, remove lids' },
    { name: 'Paper', color: '#2196f3', tips: 'Keep dry, flatten cardboard' },
    { name: 'Metal', color: '#f44336', tips: 'Crush cans, check recyclability' },
    { name: 'E-Waste', color: '#9c27b0', tips: 'Take to special centers' },
    { name: 'Organic', color: '#795548', tips: 'Compost at home' },
  ];

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Recycling Guide
      </Typography>
      <Typography variant="body1" paragraph>
        Learn how to recycle properly and make a difference for our environment.
      </Typography>

      <Grid container spacing={3}>
        {materials.map((material) => (
          <Grid item xs={12} sm={6} md={4} key={material.name}>
            <Card>
              <CardContent>
                <Typography variant="h5" sx={{ color: material.color }}>
                  {material.name}
                </Typography>
                <Typography variant="body2" sx={{ mt: 2 }}>
                  {material.tips}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default RecyclingGuide;