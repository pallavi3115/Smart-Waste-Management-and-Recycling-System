import api from './api';

export const recyclingService = {
  // ✅ GET ALL CENTERS
  async getAllCenters() {
    try {
      const res = await api.get('/recycling/centers');
      return res.data?.data || [];   // safe access
    } catch (error) {
      console.error("Get Centers Error:", error);
      return [];
    }
  },

  // ✅ GET STATS
  async getStats() {
    try {
      const res = await api.get('/recycling/stats');
      return res.data?.data || {};
    } catch (error) {
      console.error("Stats Error:", error);
      return {};
    }
  },

  // ✅ CREATE CENTER
  async createCenter(data) {
    try {
      const res = await api.post('/recycling/centers', data);
      return res.data?.data;
    } catch (error) {
      console.error("Create Center Error:", error);
      throw error; // important for alert
    }
  }
};