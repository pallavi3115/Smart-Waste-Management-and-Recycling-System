import React, { useState, useRef, useEffect } from 'react';
import {
  Fab,
  Drawer,
  Box,
  TextField,
  IconButton,
  Typography,
  Avatar,
  Paper,
  CircularProgress,
  useTheme,
  alpha,
  Chip,
  Divider,
  Zoom,
  Fade
} from '@mui/material';
import {
  Chat as ChatIcon,
  Send as SendIcon,
  Close as CloseIcon,
  SmartToy as BotIcon,
  Person as PersonIcon,
  Delete as DeleteIcon,
  Recycling as RecyclingIcon,
  LocationOn as LocationOnIcon,
  Help as HelpIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
  AutoAwesome as AutoAwesomeIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

const Chatbot = () => {
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { 
      text: "Hello! 👋 I'm your AI waste management assistant. How can I help you today?", 
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  // Suggested quick actions
  const quickActions = [
    { text: "How to recycle?", icon: <RecyclingIcon />, query: "How do I recycle plastic bottles?" },
    { text: "Report issue", icon: <DeleteIcon />, query: "How to report a waste issue?" },
    { text: "Nearby bins", icon: <LocationOnIcon />, query: "Where are the nearest bins?" },
    { text: "Collection schedule", icon: <ScheduleIcon />, query: "When is waste collection?" }
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { 
      text: input, 
      sender: 'user',
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    setIsTyping(true);

    // Simulate AI thinking
    setTimeout(() => {
      const botResponse = {
        text: getBotResponse(input),
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botResponse]);
      setLoading(false);
      setIsTyping(false);
    }, 1500);
  };

  const handleQuickAction = (query) => {
    setInput(query);
    setTimeout(() => {
      handleSend();
    }, 100);
  };

  const getBotResponse = (query) => {
    const lowerQuery = query.toLowerCase();
    
    const responses = {
      'recycle': '♻️ **Recycling Guide:**\n\nYou can recycle plastic bottles, glass containers, paper products, and metal cans. Here are some tips:\n• Rinse containers before recycling\n• Remove caps and labels\n• Flatten cardboard boxes\n• Check local recycling guidelines\n\nWould you like to find a recycling center near you?',
      'plastic': '🥤 **Plastic Recycling:**\n\nMost plastic bottles and containers are recyclable. Look for the recycling symbol (♻️) with numbers 1, 2, 4, 5. Avoid recycling plastic bags, straws, and styrofoam.',
      'glass': '🥃 **Glass Recycling:**\n\nGlass bottles and jars are 100% recyclable! Separate by color (clear, green, brown). Remove lids and rinse before recycling.',
      'paper': '📄 **Paper Recycling:**\n\nRecycle newspapers, magazines, office paper, and cardboard. Keep paper dry and clean. Remove plastic windows from envelopes.',
      'report': '📝 **Report an Issue:**\n\nTo report a waste management issue:\n1. Go to your dashboard\n2. Click "Report Issue"\n3. Capture a photo\n4. Select category\n5. Add description\n6. Submit\n\nYou can track the status of your report in real-time!',
      'bin': '🗑️ **Smart Bins:**\n\nOur IoT-enabled smart bins monitor fill levels in real-time. When a bin reaches 80% capacity, our system automatically schedules collection. You can view bin locations and fill levels on the map.',
      'collection': '📅 **Collection Schedule:**\n\nWaste collection schedules vary by area. You can check your specific schedule in the "Nearby Bins" section. General collection days are Monday, Wednesday, and Friday.',
      'nearby': '📍 **Find Nearby Facilities:**\n\nUse the "Nearby Facilities" section to find:\n• Recycling centers\n• Public toilets\n• Smart bin locations\n• Collection points\n\nThe map shows real-time availability and directions.',
      'reward': '🏆 **Rewards Program:**\n\nEarn points for:\n• Submitting reports (10 points)\n• Recycling waste (20 points/kg)\n• Referring friends (50 points)\n• Weekly streaks (100 points)\n\nRedeem points for gift cards, plant trees, or premium badges!',
      'help': '🆘 **Need Help?**\n\nI can assist you with:\n• Recycling guidelines\n• Reporting issues\n• Finding facilities\n• Collection schedules\n• Rewards program\n• Account support\n\nWhat would you like to know?',
      'default': "🤖 I understand you need assistance with waste management. Here's what I can help with:\n\n• Recycling guidelines\n• Reporting waste issues\n• Finding nearby facilities\n• Collection schedules\n• Rewards program\n\nCould you please rephrase your question or select from the quick actions below?"
    };
    
    for (let [key, value] of Object.entries(responses)) {
      if (lowerQuery.includes(key)) return value;
    }
    return responses.default;
  };

  const formatTime = (timestamp) => {
    return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <>
      {/* Chat Button with Pulse Animation */}
      <Zoom in timeout={500}>
        <Fab
          color="primary"
          sx={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            zIndex: 1000,
            background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
            boxShadow: '0 8px 20px rgba(79, 70, 229, 0.4)',
            '&:hover': {
              transform: 'scale(1.1)',
              boxShadow: '0 12px 30px rgba(79, 70, 229, 0.5)'
            },
            animation: 'pulse 2s infinite',
            '@keyframes pulse': {
              '0%': {
                boxShadow: '0 0 0 0 rgba(79, 70, 229, 0.7)',
              },
              '70%': {
                boxShadow: '0 0 0 15px rgba(79, 70, 229, 0)',
              },
              '100%': {
                boxShadow: '0 0 0 0 rgba(79, 70, 229, 0)',
              },
            },
          }}
          onClick={() => setOpen(true)}
        >
          <AutoAwesomeIcon sx={{ mr: 1 }} />
          <ChatIcon />
        </Fab>
      </Zoom>

      {/* Chat Drawer */}
      <Drawer
        anchor="right"
        open={open}
        onClose={() => setOpen(false)}
        PaperProps={{
          sx: {
            width: { xs: '100%', sm: 400 },
            maxWidth: '100%',
            borderRadius: { xs: 0, sm: '24px 0 0 24px' },
            background: theme.palette.mode === 'light' 
              ? alpha(theme.palette.background.paper, 0.98)
              : alpha(theme.palette.background.paper, 0.98),
            backdropFilter: 'blur(20px)',
            boxShadow: '-4px 0 20px rgba(0,0,0,0.1)',
            overflow: 'hidden'
          }
        }}
      >
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          {/* Header */}
          <Box
            sx={{
              p: 2.5,
              background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
              color: 'white',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <Avatar
              sx={{
                bgcolor: 'white',
                color: '#4F46E5',
                width: 40,
                height: 40,
                mr: 1.5
              }}
            >
              <BotIcon />
            </Avatar>
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Waste Assistant
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.9 }}>
                AI-powered • Online
              </Typography>
            </Box>
            <IconButton color="inherit" onClick={() => setOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>

          {/* Messages Area */}
          <Box
            sx={{
              flexGrow: 1,
              overflowY: 'auto',
              p: 2,
              background: alpha(theme.palette.primary.main, 0.02),
              '&::-webkit-scrollbar': {
                width: '6px',
              },
              '&::-webkit-scrollbar-track': {
                background: alpha(theme.palette.primary.main, 0.1),
                borderRadius: '3px',
              },
              '&::-webkit-scrollbar-thumb': {
                background: alpha(theme.palette.primary.main, 0.3),
                borderRadius: '3px',
                '&:hover': {
                  background: alpha(theme.palette.primary.main, 0.5),
                },
              },
            }}
          >
            <AnimatePresence>
              {messages.map((msg, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                      mb: 2
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'flex-end', maxWidth: '85%' }}>
                      {msg.sender === 'bot' && (
                        <Avatar
                          sx={{
                            bgcolor: alpha('#4F46E5', 0.1),
                            color: '#4F46E5',
                            mr: 1,
                            width: 32,
                            height: 32
                          }}
                        >
                          <BotIcon sx={{ fontSize: 18 }} />
                        </Avatar>
                      )}
                      <Box>
                        <Paper
                          sx={{
                            p: 2,
                            // Fixed: User messages now have proper contrast
                            bgcolor: msg.sender === 'user'
                              ? '#4F46E5'  // Solid color instead of gradient
                              : theme.palette.mode === 'light' ? '#f5f5f5' : '#2d2d2d',
                            color: msg.sender === 'user' 
                              ? '#ffffff'  // White text on dark background
                              : theme.palette.mode === 'light' ? '#1a1a1a' : '#ffffff',  // Dark text on light background
                            borderRadius: msg.sender === 'user'
                              ? '18px 4px 18px 18px'
                              : '4px 18px 18px 18px',
                            border: msg.sender === 'bot'
                              ? `1px solid ${alpha('#4F46E5', 0.2)}`
                              : 'none',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                            wordBreak: 'break-word',
                            whiteSpace: 'pre-wrap'
                          }}
                        >
                          <Typography
                            variant="body2"
                            sx={{
                              whiteSpace: 'pre-wrap',
                              wordBreak: 'break-word',
                              lineHeight: 1.5,
                              color: 'inherit'
                            }}
                          >
                            {msg.text}
                          </Typography>
                        </Paper>
                        <Typography
                          variant="caption"
                          sx={{
                            display: 'block',
                            mt: 0.5,
                            ml: 1,
                            color: 'text.secondary',
                            fontSize: '0.7rem'
                          }}
                        >
                          {formatTime(msg.timestamp)}
                        </Typography>
                      </Box>
                      {msg.sender === 'user' && (
                        <Avatar
                          sx={{
                            bgcolor: alpha('#7C3AED', 0.1),
                            color: '#7C3AED',
                            ml: 1,
                            width: 32,
                            height: 32
                          }}
                        >
                          <PersonIcon sx={{ fontSize: 18 }} />
                        </Avatar>
                      )}
                    </Box>
                  </Box>
                </motion.div>
              ))}
              
              {/* Typing Indicator */}
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: 2 }}>
                    <Avatar sx={{ bgcolor: alpha('#4F46E5', 0.1), color: '#4F46E5', mr: 1, width: 32, height: 32 }}>
                      <BotIcon sx={{ fontSize: 18 }} />
                    </Avatar>
                    <Paper sx={{ p: 2, bgcolor: theme.palette.mode === 'light' ? '#f5f5f5' : '#2d2d2d', borderRadius: '4px 18px 18px 18px' }}>
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <motion.span
                          animate={{ opacity: [0.3, 1, 0.3] }}
                          transition={{ duration: 1.5, repeat: Infinity, delay: 0 }}
                          style={{ fontSize: 20, color: '#4F46E5' }}
                        >
                          •
                        </motion.span>
                        <motion.span
                          animate={{ opacity: [0.3, 1, 0.3] }}
                          transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }}
                          style={{ fontSize: 20, color: '#4F46E5' }}
                        >
                          •
                        </motion.span>
                        <motion.span
                          animate={{ opacity: [0.3, 1, 0.3] }}
                          transition={{ duration: 1.5, repeat: Infinity, delay: 0.6 }}
                          style={{ fontSize: 20, color: '#4F46E5' }}
                        >
                          •
                        </motion.span>
                      </Box>
                    </Paper>
                  </Box>
                </motion.div>
              )}
            </AnimatePresence>
            
            {/* Quick Actions (show when no recent messages) */}
            {messages.length === 1 && !loading && !isTyping && (
              <Fade in timeout={500}>
                <Box sx={{ mt: 3 }}>
                  <Divider sx={{ my: 2 }}>
                    <Chip
                      label="Quick Actions"
                      size="small"
                      sx={{
                        bgcolor: alpha('#4F46E5', 0.1),
                        color: '#4F46E5',
                        fontWeight: 500
                      }}
                    />
                  </Divider>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'center' }}>
                    {quickActions.map((action, idx) => (
                      <motion.div
                        key={idx}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Chip
                          icon={action.icon}
                          label={action.text}
                          onClick={() => handleQuickAction(action.query)}
                          sx={{
                            bgcolor: alpha('#4F46E5', 0.05),
                            border: `1px solid ${alpha('#4F46E5', 0.2)}`,
                            '&:hover': {
                              bgcolor: alpha('#4F46E5', 0.1),
                              borderColor: '#4F46E5'
                            }
                          }}
                        />
                      </motion.div>
                    ))}
                  </Box>
                </Box>
              </Fade>
            )}
            
            <div ref={messagesEndRef} />
          </Box>

          {/* Input Area */}
          <Box
            sx={{
              p: 2,
              borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              background: alpha(theme.palette.background.paper, 0.95)
            }}
          >
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Type your message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              disabled={loading}
              InputProps={{
                endAdornment: (
                  <IconButton
                    color="primary"
                    onClick={handleSend}
                    disabled={!input.trim() || loading}
                    sx={{
                      bgcolor: input.trim() ? alpha('#4F46E5', 0.1) : 'transparent',
                      '&:hover': {
                        bgcolor: alpha('#4F46E5', 0.2)
                      }
                    }}
                  >
                    {loading ? <CircularProgress size={20} /> : <SendIcon />}
                  </IconButton>
                ),
                sx: {
                  borderRadius: 3,
                  bgcolor: alpha(theme.palette.background.paper, 0.8),
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: alpha('#4F46E5', 0.3),
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#4F46E5',
                  },
                }
              }}
            />
            <Typography
              variant="caption"
              sx={{
                display: 'block',
                textAlign: 'center',
                mt: 1,
                color: 'text.secondary'
              }}
            >
              AI-powered assistant • Ask me anything about waste management
            </Typography>
          </Box>
        </Box>
      </Drawer>
    </>
  );
};

export default Chatbot;