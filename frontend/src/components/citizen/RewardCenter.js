import React, { useState } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  LinearProgress,
  Chip,
  Box,
  Avatar
} from '@mui/material';
import { EmojiEvents, LocalOffer } from '@mui/icons-material';

const RewardCenter = () => {
  const [userPoints] = useState(1250);
  const [userLevel] = useState(3);

  const rewards = [
    { name: '₹50 Gift Card', points: 500, icon: '🎁' },
    { name: 'Plant a Tree', points: 200, icon: '🌳' },
    { name: 'Premium Badge', points: 1000, icon: '⭐' },
    { name: '2x Multiplier', points: 800, icon: '⚡' },
  ];

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Reward Center
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                  <EmojiEvents />
                </Avatar>
                <Box>
                  <Typography variant="h6">Your Points</Typography>
                  <Typography variant="h4">{userPoints}</Typography>
                </Box>
              </Box>
              <Typography variant="body2">Level {userLevel} Citizen</Typography>
              <LinearProgress 
                variant="determinate" 
                value={(userPoints / 2000) * 100} 
                sx={{ mt: 2 }}
              />
              <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                {2000 - userPoints} points to next level
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={8}>
          <Typography variant="h6" gutterBottom>
            Available Rewards
          </Typography>
          <Grid container spacing={2}>
            {rewards.map((reward) => (
              <Grid item xs={12} sm={6} key={reward.name}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Typography variant="h5" sx={{ mr: 1 }}>{reward.icon}</Typography>
                      <Typography variant="h6">{reward.name}</Typography>
                    </Box>
                    <Chip 
                      icon={<LocalOffer />} 
                      label={`${reward.points} points`} 
                      size="small"
                      color={userPoints >= reward.points ? 'success' : 'default'}
                    />
                    <Button 
                      variant="contained" 
                      fullWidth 
                      sx={{ mt: 2 }}
                      disabled={userPoints < reward.points}
                    >
                      Claim Reward
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Grid>
      </Grid>
    </Container>
  );
};

export default RewardCenter;