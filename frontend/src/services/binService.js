import api from './api';

export const binService = {
  // Get all bins
  getAllBins: async () => {
    const response = await api.get('/bins/all');
    return response.data;
  },

  // Get bin status
  getBinStatus: async (binId) => {
    const response = await api.get(`/bins/status/${binId}`);
    return response.data;
  },

  // Register new bin
  registerBin: async (binData) => {
    const response = await api.post('/bins/register', binData);
    return response.data;
  },

  // Update bin status
  updateBinStatus: async (updateData) => {
    const response = await api.post('/bins/update', updateData);
    return response.data;
  }
};