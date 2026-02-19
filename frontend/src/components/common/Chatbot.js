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
  CircularProgress
} from '@mui/material';
import {
  Chat as ChatIcon,
  Send as SendIcon,
  Close as CloseIcon,
  SmartToy as BotIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

const Chatbot = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { text: "Hello! I'm your waste management assistant. How can I help you today?", sender: 'bot' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { text: input, sender: 'user' };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    // Simulate AI response (replace with actual API call)
    setTimeout(() => {
      const botResponse = {
        text: getBotResponse(input),
        sender: 'bot'
      };
      setMessages(prev => [...prev, botResponse]);
      setLoading(false);
    }, 1000);
  };

  const getBotResponse = (query) => {
    const responses = {
      'recycle': 'You can recycle plastic, glass, paper, and metal at your nearest recycling center.',
      'report': 'To report an issue, go to the "Report Issue" section in your dashboard.',
      'bin': 'Bins are collected daily. You can check collection schedules in the app.',
      'default': 'I understand you need help with waste management. Please visit the Help section or contact support.'
    };
    
    for (let [key, value] of Object.entries(responses)) {
      if (query.toLowerCase().includes(key)) return value;
    }
    return responses.default;
  };

  return (
    <>
      <Fab
        color="primary"
        sx={{ position: 'fixed', bottom: 20, right: 20, zIndex: 1000 }}
        onClick={() => setOpen(true)}
      >
        <ChatIcon />
      </Fab>

      <Drawer
        anchor="right"
        open={open}
        onClose={() => setOpen(false)}
        PaperProps={{ sx: { width: 350, maxWidth: '100%' } }}
      >
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          {/* Header */}
          <Box sx={{ p: 2, bgcolor: 'primary.main', color: 'white', display: 'flex', alignItems: 'center' }}>
            <BotIcon sx={{ mr: 1 }} />
            <Typography variant="h6" sx={{ flexGrow: 1 }}>Waste Assistant</Typography>
            <IconButton color="inherit" onClick={() => setOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>

          {/* Messages */}
          <Box sx={{ flexGrow: 1, overflow: 'auto', p: 2 }}>
            <AnimatePresence>
              {messages.map((msg, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                      mb: 2
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', maxWidth: '80%' }}>
                      {msg.sender === 'bot' && (
                        <Avatar sx={{ bgcolor: 'primary.main', mr: 1, width: 30, height: 30 }}>
                          <BotIcon sx={{ fontSize: 18 }} />
                        </Avatar>
                      )}
                      <Paper
                        sx={{
                          p: 1.5,
                          bgcolor: msg.sender === 'user' ? 'primary.main' : 'grey.100',
                          color: msg.sender === 'user' ? 'white' : 'text.primary',
                          borderRadius: 2
                        }}
                      >
                        <Typography variant="body2">{msg.text}</Typography>
                      </Paper>
                      {msg.sender === 'user' && (
                        <Avatar sx={{ bgcolor: 'secondary.main', ml: 1, width: 30, height: 30 }}>
                          <PersonIcon sx={{ fontSize: 18 }} />
                        </Avatar>
                      )}
                    </Box>
                  </Box>
                </motion.div>
              ))}
              {loading && (
                <Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: 2 }}>
                  <Avatar sx={{ bgcolor: 'primary.main', mr: 1, width: 30, height: 30 }}>
                    <BotIcon sx={{ fontSize: 18 }} />
                  </Avatar>
                  <Paper sx={{ p: 1.5, bgcolor: 'grey.100' }}>
                    <CircularProgress size={20} />
                  </Paper>
                </Box>
              )}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </Box>

          {/* Input */}
          <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Type your message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              InputProps={{
                endAdornment: (
                  <IconButton color="primary" onClick={handleSend} disabled={!input.trim()}>
                    <SendIcon />
                  </IconButton>
                ),
              }}
            />
          </Box>
        </Box>
      </Drawer>
    </>
  );
};

export default Chatbot;