// Chatbot.js - Fixed Version with Correct Imports/Exports
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
  Fade,
  Alert,
  Snackbar,
  Tooltip,
  Button
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
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
  AutoAwesome as AutoAwesomeIcon,
  Warning as WarningIcon,
  Refresh as RefreshIcon,
  WifiOff as WifiOffIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
// Fix: Import named exports correctly
import { getGeminiResponse, getFallbackResponse } from '../../services/geminiService';

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
  const [error, setError] = useState(null);
  const [offlineMode, setOfflineMode] = useState(false);
  const messagesEndRef = useRef(null);

  const quickActions = [
    { text: "How to recycle?", icon: <RecyclingIcon />, query: "How do I recycle plastic bottles?" },
    { text: "Report issue", icon: <WarningIcon />, query: "How to report a waste issue?" },
    { text: "Nearby bins", icon: <LocationOnIcon />, query: "Where are recycling bins near me?" },
    { text: "Collection schedule", icon: <ScheduleIcon />, query: "When is waste collection?" },
    { text: "Earn points", icon: <AutoAwesomeIcon />, query: "How to earn rewards points?" }
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 6000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = { 
      text: input, 
      sender: 'user',
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    setIsTyping(true);
    setError(null);

    try {
      let aiResponse;
      
      if (offlineMode) {
        aiResponse = getFallbackResponse(input);
      } else {
        try {
          const chatHistory = messages.slice(-10);
          aiResponse = await getGeminiResponse(input, chatHistory);
          setOfflineMode(false);
        } catch (apiError) {
          console.error('API Error:', apiError);
          if (apiError.message?.includes('503') || apiError.message?.includes('high demand')) {
            setError('Gemini AI is currently busy. Using offline responses.');
            setOfflineMode(true);
          } else {
            setError('Failed to connect to AI service. Using offline responses.');
            setOfflineMode(true);
          }
          aiResponse = getFallbackResponse(input);
        }
      }
      
      const botResponse = {
        text: aiResponse,
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botResponse]);
      
    } catch (error) {
      console.error('Chatbot Error:', error);
      setError('Unable to get response. Please try again.');
      const fallbackResponse = getFallbackResponse(input);
      const botResponse = {
        text: fallbackResponse,
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botResponse]);
    } finally {
      setLoading(false);
      setIsTyping(false);
    }
  };

  const handleQuickAction = (query) => {
    setInput(query);
    setTimeout(() => {
      handleSend();
    }, 100);
  };

  const clearChat = () => {
    setMessages([
      { 
        text: "Hello! 👋 I'm your AI waste management assistant. How can I help you today?", 
        sender: 'bot',
        timestamp: new Date()
      }
    ]);
    setError(null);
    setOfflineMode(false);
  };

  const retryConnection = () => {
    setOfflineMode(false);
    setError(null);
  };

  const formatTime = (timestamp) => {
    return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <>
      <Zoom in timeout={500}>
        <Fab
          color="primary"
          aria-label="chat"
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
              '0%': { boxShadow: '0 0 0 0 rgba(79, 70, 229, 0.7)' },
              '70%': { boxShadow: '0 0 0 15px rgba(79, 70, 229, 0)' },
              '100%': { boxShadow: '0 0 0 0 rgba(79, 70, 229, 0)' },
            },
          }}
          onClick={() => setOpen(true)}
        >
          <AutoAwesomeIcon sx={{ mr: 1 }} />
          <ChatIcon />
        </Fab>
      </Zoom>

      <Drawer
        anchor="right"
        open={open}
        onClose={() => setOpen(false)}
        PaperProps={{
          sx: {
            width: { xs: '100%', sm: 420 },
            maxWidth: '100%',
            borderRadius: { xs: 0, sm: '24px 0 0 24px' },
            background: alpha(theme.palette.background.paper, 0.98),
            backdropFilter: 'blur(20px)',
            boxShadow: '-4px 0 20px rgba(0,0,0,0.1)',
            overflow: 'hidden'
          }
        }}
      >
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ p: 2.5, background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)', color: 'white', display: 'flex', alignItems: 'center' }}>
            <Avatar sx={{ bgcolor: 'white', color: '#4F46E5', width: 40, height: 40, mr: 1.5 }}>
              <BotIcon />
            </Avatar>
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>Waste Assistant</Typography>
              <Typography variant="caption" sx={{ opacity: 0.9, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: offlineMode ? '#F59E0B' : '#4ade80', display: 'inline-block', mr: 0.5 }} />
                {offlineMode ? 'Offline Mode • Limited Responses' : 'AI-powered • Online'}
              </Typography>
            </Box>
            <Tooltip title="Clear chat">
              <IconButton color="inherit" onClick={clearChat} size="small" sx={{ mr: 1 }}>
                <DeleteIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Close">
              <IconButton color="inherit" onClick={() => setOpen(false)}>
                <CloseIcon />
              </IconButton>
            </Tooltip>
          </Box>

          {offlineMode && (
            <Alert 
              severity="warning" 
              sx={{ borderRadius: 0, m: 0 }}
              action={
                <Button color="inherit" size="small" onClick={retryConnection} startIcon={<RefreshIcon />}>
                  Retry
                </Button>
              }
            >
              <Typography variant="body2">Offline Mode Active - Using local responses. Click retry to reconnect to AI.</Typography>
            </Alert>
          )}

          <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 2, background: alpha(theme.palette.primary.main, 0.02) }}>
            {error && (
              <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }} icon={<WifiOffIcon />}>
                {error}
              </Alert>
            )}

            <AnimatePresence>
              {messages.map((msg, index) => (
                <motion.div key={index} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                  <Box sx={{ display: 'flex', justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'flex-end', maxWidth: '85%' }}>
                      {msg.sender === 'bot' && (
                        <Avatar sx={{ bgcolor: alpha('#4F46E5', 0.1), color: '#4F46E5', mr: 1, width: 32, height: 32 }}>
                          <BotIcon sx={{ fontSize: 18 }} />
                        </Avatar>
                      )}
                      <Box>
                        <Paper sx={{ p: 2, bgcolor: msg.sender === 'user' ? '#4F46E5' : '#f5f5f5', color: msg.sender === 'user' ? '#ffffff' : '#1a1a1a', borderRadius: msg.sender === 'user' ? '18px 4px 18px 18px' : '4px 18px 18px 18px' }}>
                          <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{msg.text}</Typography>
                        </Paper>
                        <Typography variant="caption" sx={{ display: 'block', mt: 0.5, ml: 1, color: 'text.secondary', fontSize: '0.7rem' }}>
                          {formatTime(msg.timestamp)}
                        </Typography>
                      </Box>
                      {msg.sender === 'user' && (
                        <Avatar sx={{ bgcolor: alpha('#7C3AED', 0.1), color: '#7C3AED', ml: 1, width: 32, height: 32 }}>
                          <PersonIcon sx={{ fontSize: 18 }} />
                        </Avatar>
                      )}
                    </Box>
                  </Box>
                </motion.div>
              ))}
              
              {isTyping && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: 2 }}>
                    <Avatar sx={{ bgcolor: alpha('#4F46E5', 0.1), color: '#4F46E5', mr: 1, width: 32, height: 32 }}>
                      <BotIcon sx={{ fontSize: 18 }} />
                    </Avatar>
                    <Paper sx={{ p: 2, bgcolor: '#f5f5f5', borderRadius: '4px 18px 18px 18px' }}>
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.5, repeat: Infinity, delay: 0 }} style={{ fontSize: 20, color: '#4F46E5' }}>•</motion.span>
                        <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }} style={{ fontSize: 20, color: '#4F46E5' }}>•</motion.span>
                        <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.5, repeat: Infinity, delay: 0.6 }} style={{ fontSize: 20, color: '#4F46E5' }}>•</motion.span>
                      </Box>
                    </Paper>
                  </Box>
                </motion.div>
              )}
            </AnimatePresence>
            
            {messages.length === 1 && !loading && !isTyping && (
              <Fade in timeout={500}>
                <Box sx={{ mt: 3 }}>
                  <Divider sx={{ my: 2 }}>
                    <Chip label="Quick Actions" size="small" sx={{ bgcolor: alpha('#4F46E5', 0.1), color: '#4F46E5', fontWeight: 500 }} />
                  </Divider>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'center' }}>
                    {quickActions.map((action, idx) => (
                      <motion.div key={idx} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Chip icon={action.icon} label={action.text} onClick={() => handleQuickAction(action.query)} sx={{ bgcolor: alpha('#4F46E5', 0.05), border: `1px solid ${alpha('#4F46E5', 0.2)}`, cursor: 'pointer' }} />
                      </motion.div>
                    ))}
                  </Box>
                </Box>
              </Fade>
            )}
            
            <div ref={messagesEndRef} />
          </Box>

          <Box sx={{ p: 2, borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`, background: alpha(theme.palette.background.paper, 0.95) }}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Ask me anything about waste management..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !loading && handleSend()}
              disabled={loading}
              InputProps={{
                endAdornment: (
                  <IconButton color="primary" onClick={handleSend} disabled={!input.trim() || loading}>
                    {loading ? <CircularProgress size={20} /> : <SendIcon />}
                  </IconButton>
                ),
              }}
            />
            <Typography variant="caption" sx={{ display: 'block', textAlign: 'center', mt: 1, color: 'text.secondary' }}>
              {offlineMode ? 'Offline Mode • Limited Responses Available' : 'Powered by Google Gemini AI'}
            </Typography>
          </Box>
        </Box>
      </Drawer>
    </>
  );
};

// IMPORTANT: Default export at the end
export default Chatbot;