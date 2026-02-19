import api from './api';

export const aiService = {
  // Classify waste from image
  async classifyWaste(image) {
    const response = await api.post('/ai/classify', { image });
    return response.data;
  },

  // Suggest report category from image
  async suggestCategory(image) {
    const response = await api.post('/ai/suggest', { image });
    return response.data;
  },

  // Analyze waste trends
  async analyzeTrends(days = 30) {
    const response = await api.get(`/ai/analyze?days=${days}`);
    return response.data;
  },

  // Chat with AI assistant
  async chat(message) {
    const response = await api.post('/ai/chat', { message });
    return response.data;
  },

  // Optimize collection routes
  async optimizeRoutes(bins, trucks) {
    const response = await api.post('/ai/optimize-routes', { bins, trucks });
    return response.data;
  }
};