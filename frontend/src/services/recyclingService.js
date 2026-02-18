import api from './api';

export const recyclingService = {
  async getAllCenters() {
    const response = await api.get('/recycling/centers');
    return response.data;
  },

  async getCenterById(id) {
    const response = await api.get(`/recycling/centers/${id}`);
    return response.data;
  },

  async getStats() {
    const response = await api.get('/recycling/stats');
    return response.data;
  }
};