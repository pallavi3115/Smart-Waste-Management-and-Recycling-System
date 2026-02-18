import api from './api';

export const binService = {
  async getAllBins() {
    const response = await api.get('/bins/all');
    return response.data;
  },

  async getBinById(id) {
    const response = await api.get(`/bins/status/${id}`);
    return response.data;
  },

  async updateBinStatus(binId, data) {
    const response = await api.post('/bins/update', { binId, ...data });
    return response.data;
  },

  async registerBin(binData) {
    const response = await api.post('/bins/register', binData);
    return response.data;
  }
};