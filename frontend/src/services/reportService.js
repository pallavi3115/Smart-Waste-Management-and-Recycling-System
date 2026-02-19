import api from './api';

export const reportService = {
  // Create new report
  async createReport(reportData) {
    try {
      // Don't use FormData for now - send as JSON
      const response = await api.post('/reports', reportData);
      return response.data;
    } catch (error) {
      console.error('Error in createReport:', error);
      throw error;
    }
  },

  // Get user's reports
  async getMyReports() {
    try {
      const response = await api.get('/reports/my-reports');
      return response.data;
    } catch (error) {
      console.error('Error in getMyReports:', error);
      throw error;
    }
  },

  // Get report by ID
  async getReportById(id) {
    try {
      const response = await api.get(`/reports/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error in getReportById:', error);
      throw error;
    }
  },

  // Update report status
  async updateReportStatus(id, statusData) {
    try {
      const response = await api.put(`/reports/${id}/status`, statusData);
      return response.data;
    } catch (error) {
      console.error('Error in updateReportStatus:', error);
      throw error;
    }
  },

  // Add comment to report
  async addComment(id, comment) {
    try {
      const response = await api.post(`/reports/${id}/comments`, { comment });
      return response.data;
    } catch (error) {
      console.error('Error in addComment:', error);
      throw error;
    }
  },

  // Vote on report
  async voteReport(id, type) {
    try {
      const response = await api.post(`/reports/${id}/vote`, { type });
      return response.data;
    } catch (error) {
      console.error('Error in voteReport:', error);
      throw error;
    }
  },

  // Submit feedback
  async submitFeedback(id, feedback) {
    try {
      const response = await api.post(`/reports/${id}/feedback`, feedback);
      return response.data;
    } catch (error) {
      console.error('Error in submitFeedback:', error);
      throw error;
    }
  },

  // Get nearby reports
  async getNearbyReports(lat, lng, radius = 5000) {
    try {
      const response = await api.get(`/reports/nearby?lat=${lat}&lng=${lng}&radius=${radius}`);
      return response.data;
    } catch (error) {
      console.error('Error in getNearbyReports:', error);
      throw error;
    }
  }
};