import api from './api';

export const userService = {
  // Get user profile
  async getProfile() {
    try {
      const response = await api.get('/users/profile');
      return response.data;
    } catch (error) {
      console.error('Error fetching profile:', error);
      throw error;
    }
  },

  // Update user profile
  async updateProfile(profileData) {
    try {
      const response = await api.put('/users/profile', profileData);
      return response.data;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  },

  // Get user statistics
  async getUserStats() {
    try {
      const response = await api.get('/users/stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching user stats:', error);
      throw error;
    }
  },

  // Get user reports
  async getUserReports() {
    try {
      const response = await api.get('/users/reports');
      return response.data;
    } catch (error) {
      console.error('Error fetching user reports:', error);
      throw error;
    }
  },

  // Get user rewards
  async getUserRewards() {
    try {
      const response = await api.get('/users/rewards');
      return response.data;
    } catch (error) {
      console.error('Error fetching user rewards:', error);
      throw error;
    }
  },

  // Change password
  async changePassword(passwordData) {
    try {
      const response = await api.put('/users/change-password', passwordData);
      return response.data;
    } catch (error) {
      console.error('Error changing password:', error);
      throw error;
    }
  },

  // Update notification preferences
  async updateNotifications(preferences) {
    try {
      const response = await api.put('/users/notifications', preferences);
      return response.data;
    } catch (error) {
      console.error('Error updating notifications:', error);
      throw error;
    }
  }
};