import React, { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  Switch,
  FormControlLabel,
  Divider,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  useTheme,
  alpha,
  Alert,
  Snackbar
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Security as SecurityIcon,
  Palette as PaletteIcon,
  VolumeUp as VolumeIcon,
  Save as SaveIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useTheme as useCustomTheme } from '../contexts/ThemeContext';

const SettingsPage = () => {
  const theme = useTheme();
  const { mode, toggleTheme } = useCustomTheme();
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    darkMode: mode === 'dark',
    language: 'en',
    soundEnabled: true,
    autoRefresh: true,
    twoFactorAuth: false
  });

  const handleSettingChange = (setting) => {
    setSettings(prev => ({ ...prev, [setting]: !prev[setting] }));
  };

  const handleLanguageChange = (event) => {
    setSettings(prev => ({ ...prev, language: event.target.value }));
  };

  const handleSave = () => {
    setSnackbar({ open: true, message: 'Settings saved successfully!', severity: 'success' });
    // Apply theme change
    if (settings.darkMode !== (mode === 'dark')) {
      toggleTheme();
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 3 }}>
          Settings
        </Typography>

        <Grid container spacing={3}>
          {/* Notification Settings */}
          <Grid item xs={12} md={6}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 4,
                background: alpha(theme.palette.background.paper, 0.95),
                border: `1px solid ${alpha('#4F46E5', 0.1)}`,
                height: '100%'
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <NotificationsIcon sx={{ color: '#4F46E5' }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Notification Preferences
                </Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.emailNotifications}
                    onChange={() => handleSettingChange('emailNotifications')}
                    sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: '#4F46E5' } }}
                  />
                }
                label="Email Notifications"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.pushNotifications}
                    onChange={() => handleSettingChange('pushNotifications')}
                    sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: '#4F46E5' } }}
                  />
                }
                label="Push Notifications"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.smsNotifications}
                    onChange={() => handleSettingChange('smsNotifications')}
                    sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: '#4F46E5' } }}
                  />
                }
                label="SMS Notifications"
              />
            </Paper>
          </Grid>

          {/* Appearance Settings */}
          <Grid item xs={12} md={6}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 4,
                background: alpha(theme.palette.background.paper, 0.95),
                border: `1px solid ${alpha('#4F46E5', 0.1)}`,
                height: '100%'
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <PaletteIcon sx={{ color: '#4F46E5' }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Appearance
                </Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.darkMode}
                    onChange={() => handleSettingChange('darkMode')}
                    sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: '#4F46E5' } }}
                  />
                }
                label="Dark Mode"
              />
              <FormControl fullWidth sx={{ mt: 2 }}>
                <InputLabel>Language</InputLabel>
                <Select
                  value={settings.language}
                  onChange={handleLanguageChange}
                  label="Language"
                  sx={{ borderRadius: 2 }}
                >
                  <MenuItem value="en">English</MenuItem>
                  <MenuItem value="hi">हिन्दी (Hindi)</MenuItem>
                  <MenuItem value="mr">मराठी (Marathi)</MenuItem>
                  <MenuItem value="gu">ગુજરાતી (Gujarati)</MenuItem>
                </Select>
              </FormControl>
            </Paper>
          </Grid>

          {/* Security Settings */}
          <Grid item xs={12} md={6}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 4,
                background: alpha(theme.palette.background.paper, 0.95),
                border: `1px solid ${alpha('#4F46E5', 0.1)}`,
                height: '100%'
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <SecurityIcon sx={{ color: '#4F46E5' }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Security
                </Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.twoFactorAuth}
                    onChange={() => handleSettingChange('twoFactorAuth')}
                    sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: '#4F46E5' } }}
                  />
                }
                label="Two-Factor Authentication"
              />
              <Button
                variant="outlined"
                fullWidth
                sx={{ mt: 2, borderRadius: 2 }}
                onClick={() => alert('Change password functionality')}
              >
                Change Password
              </Button>
            </Paper>
          </Grid>

          {/* Preferences */}
          <Grid item xs={12} md={6}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 4,
                background: alpha(theme.palette.background.paper, 0.95),
                border: `1px solid ${alpha('#4F46E5', 0.1)}`,
                height: '100%'
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <VolumeIcon sx={{ color: '#4F46E5' }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Preferences
                </Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.soundEnabled}
                    onChange={() => handleSettingChange('soundEnabled')}
                    sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: '#4F46E5' } }}
                  />
                }
                label="Sound Effects"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.autoRefresh}
                    onChange={() => handleSettingChange('autoRefresh')}
                    sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: '#4F46E5' } }}
                  />
                }
                label="Auto-refresh Dashboard"
              />
            </Paper>
          </Grid>
        </Grid>

        {/* Save Button */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={handleSave}
            sx={{
              borderRadius: 2,
              px: 4,
              py: 1,
              background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 8px 20px rgba(79, 70, 229, 0.4)'
              }
            }}
          >
            Save Settings
          </Button>
        </Box>

        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </motion.div>
    </Container>
  );
};

export default SettingsPage;