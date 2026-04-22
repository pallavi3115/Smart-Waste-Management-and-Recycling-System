import api from './api';

export const driverService = {
  // Get dashboard data
  async getDashboard() {
    const response = await api.get('/driver/dashboard');
    return response.data;
  },

  // Update location
  async updateLocation(location) {
    const response = await api.post('/driver/location', location);
    return response.data;
  },

  // Get driver profile
  async getProfile() {
    const response = await api.get('/driver/profile');
    return response.data;
  },

  // Update driver profile
  async updateProfile(profileData) {
    const response = await api.put('/driver/profile', profileData);
    return response.data;
  },

  // Toggle online status
  async toggleStatus() {
    const response = await api.put('/driver/toggle-status');
    return response.data;
  },

  // Get earnings
  async getEarnings() {
    const response = await api.get('/driver/earnings');
    return response.data;
  },

  // Get assigned routes
  async getRoutes(params) {
    const response = await api.get('/driver/routes', { params });
    return response.data;
  },

  // Get route details
  async getRouteDetails(id) {
    const response = await api.get(`/driver/routes/${id}`);
    return response.data;
  },

  // Start route
  async startRoute(id) {
    const response = await api.put(`/driver/routes/${id}/start`);
    return response.data;
  },

  // Complete stop
  async completeStop(routeId, stopId, data) {
    const response = await api.post(`/driver/routes/${routeId}/stop/${stopId}/complete`, data);
    return response.data;
  },

  // Report issue
  async reportIssue(routeId, data) {
    const response = await api.post(`/driver/routes/${routeId}/report-issue`, data);
    return response.data;
  },

  // Check in
  async checkIn(data) {
    const response = await api.post('/driver/attendance/check-in', data);
    return response.data;
  },

  // Check out
  async checkOut(data) {
    const response = await api.post('/driver/attendance/check-out', data);
    return response.data;
  },

  
// Submit collection proof with photos
async submitCollectionProof(routeId, stopId, formData) {
  const response = await api.post(`/driver/routes/${routeId}/stop/${stopId}/proof`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return response.data;
},

  // Get attendance
  async getAttendance(params) {
    const response = await api.get('/driver/attendance', { params });
    return response.data;
  }
};