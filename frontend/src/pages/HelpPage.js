import React, { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  Card,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  TextField,
  Button,
  useTheme,
  alpha
} from '@mui/material';
import {
  Help as HelpIcon,
  ExpandMore as ExpandMoreIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Chat as ChatIcon,
  Facebook as FacebookIcon,
  Twitter as TwitterIcon,
  YouTube as YouTubeIcon,
  Article as ArticleIcon,
  VideoLibrary as VideoIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';

const HelpPage = () => {
  const theme = useTheme();
  const [searchQuery, setSearchQuery] = useState('');

  const faqs = [
    {
      question: 'How do I report a waste issue?',
      answer: 'To report a waste issue, log in to your account, go to the "Report Issue" section, capture a photo of the issue, select the category, add a description, and submit. You can track the status of your report in real-time.'
    },
    {
      question: 'How do I earn rewards?',
      answer: 'You earn rewards by submitting reports, recycling waste, referring friends, and maintaining weekly streaks. Each report earns 10 points, recycling earns 20 points per kg, referrals earn 50 points, and weekly streaks earn 100 points bonus.'
    },
    {
      question: 'How do I check my collection schedule?',
      answer: 'You can check your collection schedule in the "Nearby Bins" section. Enter your location to see scheduled collection days and times for your area.'
    },
    {
      question: 'What materials can be recycled?',
      answer: 'We accept plastic bottles and containers, glass bottles and jars, paper products, cardboard, metal cans, and electronic waste. Please rinse containers before recycling and remove caps and labels.'
    },
    {
      question: 'How do I become a driver?',
      answer: 'To become a driver, register for a driver account during sign-up or contact our support team. Drivers need a valid license and will undergo training before being assigned to routes.'
    },
    {
      question: 'How do I reset my password?',
      answer: 'Click "Forgot Password" on the login page, enter your registered email address, and you will receive a password reset link. Follow the instructions to create a new password.'
    }
  ];

  const filteredFaqs = faqs.filter(faq =>
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const supportOptions = [
    { icon: <EmailIcon />, title: 'Email Support', value: 'support@smartwaste.com', action: 'mailto:support@smartwaste.com' },
    { icon: <PhoneIcon />, title: 'Phone Support', value: '+91 1800 123 4567', action: 'tel:+9118001234567' },
    { icon: <ChatIcon />, title: 'Live Chat', value: 'Available 24/7', action: '/chat' }
  ];

  const resources = [
    { icon: <ArticleIcon />, title: 'User Guide', description: 'Complete documentation', link: '/docs' },
    { icon: <VideoIcon />, title: 'Video Tutorials', description: 'Watch tutorials', link: '/videos' },
    { icon: <FacebookIcon />, title: 'Facebook', description: 'Follow us', link: 'https://facebook.com' },
    { icon: <TwitterIcon />, title: 'Twitter', description: 'Latest updates', link: 'https://twitter.com' },
    { icon: <YouTubeIcon />, title: 'YouTube', description: 'Video content', link: 'https://youtube.com' }
  ];

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 3 }}>
          Help & Support
        </Typography>

        {/* Search Bar */}
        <Paper
          elevation={0}
          sx={{
            p: 3,
            mb: 4,
            borderRadius: 4,
            background: `linear-gradient(135deg, ${alpha('#4F46E5', 0.05)} 0%, ${alpha('#7C3AED', 0.02)} 100%)`,
            border: `1px solid ${alpha('#4F46E5', 0.1)}`,
            textAlign: 'center'
          }}
        >
          <HelpIcon sx={{ fontSize: 48, color: '#4F46E5', mb: 2 }} />
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
            How can we help you?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Search for answers or browse our FAQs below
          </Typography>
          <TextField
            fullWidth
            placeholder="Search for help..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{
              maxWidth: 500,
              '& .MuiOutlinedInput-root': {
                borderRadius: 3,
                bgcolor: alpha(theme.palette.background.paper, 0.8)
              }
            }}
          />
        </Paper>

        {/* Support Options */}
        <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
          Contact Support
        </Typography>
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {supportOptions.map((option, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Card
                elevation={0}
                sx={{
                  textAlign: 'center',
                  p: 2,
                  borderRadius: 4,
                  background: alpha(theme.palette.background.paper, 0.95),
                  border: `1px solid ${alpha('#4F46E5', 0.1)}`,
                  transition: 'transform 0.3s',
                  '&:hover': { transform: 'translateY(-5px)' }
                }}
              >
                <Box sx={{ color: '#4F46E5', mb: 1 }}>{option.icon}</Box>
                <Typography variant="h6">{option.title}</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  {option.value}
                </Typography>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => window.location.href = option.action}
                  sx={{ borderRadius: 2 }}
                >
                  Contact
                </Button>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* FAQ Section */}
        <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
          Frequently Asked Questions
        </Typography>
        <Paper
          elevation={0}
          sx={{
            p: 3,
            mb: 4,
            borderRadius: 4,
            background: alpha(theme.palette.background.paper, 0.95),
            border: `1px solid ${alpha('#4F46E5', 0.1)}`
          }}
        >
          {filteredFaqs.length === 0 ? (
            <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
              No results found for "{searchQuery}"
            </Typography>
          ) : (
            filteredFaqs.map((faq, index) => (
              <Accordion
                key={index}
                elevation={0}
                sx={{
                  bgcolor: 'transparent',
                  '&:before': { display: 'none' },
                  borderBottom: index < filteredFaqs.length - 1 ? `1px solid ${alpha('#4F46E5', 0.1)}` : 'none'
                }}
              >
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                    {faq.question}
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography variant="body2" color="text.secondary">
                    {faq.answer}
                  </Typography>
                </AccordionDetails>
              </Accordion>
            ))
          )}
        </Paper>

        {/* Resources */}
        <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
          Resources
        </Typography>
        <Grid container spacing={2}>
          {resources.map((resource, index) => (
            <Grid item xs={6} sm={4} md={2.4} key={index}>
              <Card
                elevation={0}
                sx={{
                  textAlign: 'center',
                  p: 2,
                  borderRadius: 3,
                  background: alpha(theme.palette.background.paper, 0.95),
                  border: `1px solid ${alpha('#4F46E5', 0.1)}`,
                  cursor: 'pointer',
                  transition: 'transform 0.3s',
                  '&:hover': { transform: 'translateY(-3px)' }
                }}
                onClick={() => window.open(resource.link, '_blank')}
              >
                <Box sx={{ color: '#4F46E5', mb: 1 }}>{resource.icon}</Box>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {resource.title}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {resource.description}
                </Typography>
              </Card>
            </Grid>
          ))}
        </Grid>
      </motion.div>
    </Container>
  );
};

export default HelpPage;