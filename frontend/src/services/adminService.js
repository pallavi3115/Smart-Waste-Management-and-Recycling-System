import api from './api';

export const adminService = {
  // ==================== DASHBOARD APIs ====================
  
  getStats: async () => {
    try {
      const response = await api.get('/admin/dashboard');
      return response.data;
    } catch (error) {
      console.error('Get stats error:', error);
      // Return mock data for fallback
      return {
        success: true,
        data: {
          totalBins: 156,
          binsCollectedToday: 23,
          recyclingRate: '68%',
          activeAlerts: 3,
          monthlyTrend: '+12%'
        }
      };
    }
  },

  getRecentReports: async () => {
    try {
      const response = await api.get('/admin/reports/recent');
      return response.data;
    } catch (error) {
      console.error('Get recent reports error:', error);
      return {
        success: true,
        data: [
          { id: 1, title: 'Overflowing Bin', location: 'Sector 15', status: 'pending', time: '5 min ago', priority: 'high' },
          { id: 2, title: 'Missed Collection', location: 'Block C', status: 'in-progress', time: '1 hour ago', priority: 'medium' },
          { id: 3, title: 'Illegal Dumping', location: 'Park Street', status: 'pending', time: '3 hours ago', priority: 'high' },
          { id: 4, title: 'Broken Bin', location: 'Market Complex', status: 'resolved', time: '5 hours ago', priority: 'low' }
        ]
      };
    }
  },

  getBinStatus: async () => {
    try {
      const response = await api.get('/admin/bins/status');
      return response.data;
    } catch (error) {
      console.error('Get bin status error:', error);
      return {
        success: true,
        data: [
          { id: 1, location: 'Sector 12', fillLevel: 85, status: 'critical' },
          { id: 2, location: 'Sector 15', fillLevel: 60, status: 'warning' },
          { id: 3, location: 'Block A', fillLevel: 30, status: 'normal' },
          { id: 4, location: 'Market Road', fillLevel: 92, status: 'critical' }
        ]
      };
    }
  },

  // ==================== ANALYTICS APIs ====================

  getWeeklyData: async () => {
    try {
      const response = await api.get('/admin/analytics/weekly');
      return response.data;
    } catch (error) {
      console.error('Get weekly data error:', error);
      return {
        success: true,
        data: [
          { day: 'Mon', reports: 12, collections: 45 },
          { day: 'Tue', reports: 8, collections: 52 },
          { day: 'Wed', reports: 15, collections: 48 },
          { day: 'Thu', reports: 10, collections: 55 },
          { day: 'Fri', reports: 18, collections: 60 },
          { day: 'Sat', reports: 6, collections: 35 },
          { day: 'Sun', reports: 3, collections: 20 }
        ]
      };
    }
  },

  getAnalytics: async (timeRange = 'week') => {
    try {
      const response = await api.get(`/admin/analytics?range=${timeRange}`);
      return response.data;
    } catch (error) {
      console.error('Get analytics error:', error);
      return {
        success: true,
        data: {
          reportsTrend: [
            { name: 'Mon', reports: 12, resolved: 8 },
            { name: 'Tue', reports: 8, resolved: 6 },
            { name: 'Wed', reports: 15, resolved: 10 },
            { name: 'Thu', reports: 10, resolved: 9 },
            { name: 'Fri', reports: 18, resolved: 14 },
            { name: 'Sat', reports: 6, resolved: 5 },
            { name: 'Sun', reports: 3, resolved: 3 }
          ],
          wasteByType: [
            { name: 'General Waste', value: 65, color: '#6366F1' },
            { name: 'Recyclable', value: 25, color: '#10B981' },
            { name: 'E-Waste', value: 7, color: '#F59E0B' },
            { name: 'Organic', value: 3, color: '#EF4444' }
          ],
          collectionEfficiency: [
            { month: 'Jan', efficiency: 72 },
            { month: 'Feb', efficiency: 75 },
            { month: 'Mar', efficiency: 78 },
            { month: 'Apr', efficiency: 80 },
            { month: 'May', efficiency: 82 },
            { month: 'Jun', efficiency: 85 }
          ],
          topIssues: [
            { issue: 'Overflowing Bins', count: 45 },
            { issue: 'Missed Collection', count: 32 },
            { issue: 'Illegal Dumping', count: 28 },
            { issue: 'Broken Bins', count: 18 }
          ]
        }
      };
    }
  },

  // ==================== STAFF MANAGEMENT APIs ====================

  // Get all staff/users
  getStaff: async () => {
    try {
      const response = await api.get('/admin/users');
      return response.data;
    } catch (error) {
      console.error('Get staff error:', error);
      return {
        success: true,
        data: [
          { 
            _id: '1', 
            name: 'Rajesh Kumar', 
            email: 'rajesh@test.com', 
            role: 'Driver', 
            phoneNumber: '9876543210',
            employeeId: 'DRV001',
            status: 'Active',
            performance: { rating: 4.5, collections: 128 }
          },
          { 
            _id: '2', 
            name: 'Priya Sharma', 
            email: 'priya@test.com', 
            role: 'Driver', 
            phoneNumber: '9876543211',
            employeeId: 'DRV002',
            status: 'Active',
            performance: { rating: 4.8, collections: 156 }
          }
        ]
      };
    }
  },

  // Get single staff member
  getStaffById: async (id) => {
    try {
      const response = await api.get(`/admin/users/${id}`);
      return response.data;
    } catch (error) {
      console.error('Get staff by id error:', error);
      return { success: true, data: null };
    }
  },

  // Create new staff member
  createStaff: async (staffData) => {
    try {
      const response = await api.post('/admin/users', staffData);
      return response.data;
    } catch (error) {
      console.error('Create staff error:', error);
      return { success: false, message: error.response?.data?.message || 'Failed to create staff' };
    }
  },

  // Update staff member
  updateStaff: async (id, staffData) => {
    try {
      const response = await api.put(`/admin/users/${id}`, staffData);
      return response.data;
    } catch (error) {
      console.error('Update staff error:', error);
      return { success: false, message: error.response?.data?.message || 'Failed to update staff' };
    }
  },

  // Delete staff member
  deleteStaff: async (id) => {
    try {
      const response = await api.delete(`/admin/users/${id}`);
      return response.data;
    } catch (error) {
      console.error('Delete staff error:', error);
      return { success: false, message: error.response?.data?.message || 'Failed to delete staff' };
    }
  },

  // Get staff statistics
  getStaffStats: async () => {
    try {
      const response = await api.get('/admin/staff-stats');
      return response.data;
    } catch (error) {
      console.error('Get staff stats error:', error);
      return {
        success: true,
        data: {
          totalStaff: 12,
          activeDrivers: 8,
          totalDrivers: 10,
          supervisors: 2,
          admins: 2,
          topPerformers: []
        }
      };
    }
  },

  // ==================== BIN MANAGEMENT APIs ====================

  getBins: async () => {
    try {
      const response = await api.get('/admin/bins');
      return response.data;
    } catch (error) {
      console.error('Get bins error:', error);
      return {
        success: true,
        data: [
          { id: 1, location: 'Sector 12', address: 'Near City Park', type: 'general', capacity: 1000, currentFill: 850, status: 'critical', lastEmptied: '2024-01-15', fillLevel: 85 },
          { id: 2, location: 'Sector 15', address: 'Market Complex', type: 'recyclable', capacity: 800, currentFill: 480, status: 'warning', lastEmptied: '2024-01-14', fillLevel: 60 },
          { id: 3, location: 'Block A', address: 'Residential Area', type: 'general', capacity: 1200, currentFill: 360, status: 'normal', lastEmptied: '2024-01-13', fillLevel: 30 },
          { id: 4, location: 'Block C', address: 'Commercial Area', type: 'ewaste', capacity: 500, currentFill: 420, status: 'warning', lastEmptied: '2024-01-14', fillLevel: 84 },
          { id: 5, location: 'Sector 20', address: 'Near School', type: 'general', capacity: 1000, currentFill: 920, status: 'critical', lastEmptied: '2024-01-12', fillLevel: 92 }
        ]
      };
    }
  },

  createBin: async (binData) => {
    try {
      const response = await api.post('/admin/bins', binData);
      return response.data;
    } catch (error) {
      console.error('Create bin error:', error);
      return { success: false, message: error.response?.data?.message || 'Failed to create bin' };
    }
  },

  updateBin: async (id, binData) => {
    try {
      const response = await api.put(`/admin/bins/${id}`, binData);
      return response.data;
    } catch (error) {
      console.error('Update bin error:', error);
      return { success: false, message: error.response?.data?.message || 'Failed to update bin' };
    }
  },

  deleteBin: async (id) => {
    try {
      const response = await api.delete(`/admin/bins/${id}`);
      return response.data;
    } catch (error) {
      console.error('Delete bin error:', error);
      return { success: false, message: error.response?.data?.message || 'Failed to delete bin' };
    }
  },

  // ==================== RECYCLING CENTERS APIs ====================

  getRecyclingCenters: async () => {
  try {
    // Try the correct endpoint
    const response = await api.get('/recycling/centers');
    return response.data;
  } catch (error) {
    console.error('Get recycling centers error:', error);
    return {
      success: true,
      data: [
        { id: 1, name: 'Green Earth Recycling', address: 'Sector 12', type: 'plastic,paper,glass', capacity: 5000, status: 'active' },
        { id: 2, name: 'Eco Center', address: 'Sector 15', type: 'ewaste,metal', capacity: 3000, status: 'active' }
      ]
    };
  }
},

  createRecyclingCenter: async (centerData) => {
    try {
      const response = await api.post('/admin/recycling-centers', centerData);
      return response.data;
    } catch (error) {
      console.error('Create recycling center error:', error);
      return { success: false, message: error.response?.data?.message || 'Failed to create center' };
    }
  },

  updateRecyclingCenter: async (id, centerData) => {
    try {
      const response = await api.put(`/admin/recycling-centers/${id}`, centerData);
      return response.data;
    } catch (error) {
      console.error('Update recycling center error:', error);
      return { success: false, message: error.response?.data?.message || 'Failed to update center' };
    }
  },

  deleteRecyclingCenter: async (id) => {
    try {
      const response = await api.delete(`/admin/recycling-centers/${id}`);
      return response.data;
    } catch (error) {
      console.error('Delete recycling center error:', error);
      return { success: false, message: error.response?.data?.message || 'Failed to delete center' };
    }
  },

  // ==================== ROUTE OPTIMIZATION APIs ====================

  getRoutes: async () => {
    try {
      const response = await api.get('/admin/routes');
      return response.data;
    } catch (error) {
      console.error('Get routes error:', error);
      return {
        success: true,
        data: [
          { id: 1, name: 'Morning Route A', stops: 15, status: 'active', driver: 'John Driver' },
          { id: 2, name: 'Evening Route B', stops: 12, status: 'active', driver: 'Mike Collector' }
        ]
      };
    }
  },

  createRoute: async (routeData) => {
    try {
      const response = await api.post('/admin/routes', routeData);
      return response.data;
    } catch (error) {
      console.error('Create route error:', error);
      return { success: false, message: error.response?.data?.message || 'Failed to create route' };
    }
  },

  updateRoute: async (id, routeData) => {
    try {
      const response = await api.put(`/admin/routes/${id}`, routeData);
      return response.data;
    } catch (error) {
      console.error('Update route error:', error);
      return { success: false, message: error.response?.data?.message || 'Failed to update route' };
    }
  },

  deleteRoute: async (id) => {
    try {
      const response = await api.delete(`/admin/routes/${id}`);
      return response.data;
    } catch (error) {
      console.error('Delete route error:', error);
      return { success: false, message: error.response?.data?.message || 'Failed to delete route' };
    }
  },

  optimizeRoute: async (routeId) => {
    try {
      const response = await api.post(`/admin/routes/${routeId}/optimize`);
      return response.data;
    } catch (error) {
      console.error('Optimize route error:', error);
      return { success: false, message: error.response?.data?.message || 'Failed to optimize route' };
    }
  },

  // ==================== REPORTS APIs ====================

  getAllReports: async (params = {}) => {
    try {
      const response = await api.get('/admin/reports', { params });
      return response.data;
    } catch (error) {
      console.error('Get all reports error:', error);
      return { success: true, data: [] };
    }
  },

  updateReportStatus: async (id, statusData) => {
    try {
      const response = await api.put(`/admin/reports/${id}/status`, statusData);
      return response.data;
    } catch (error) {
      console.error('Update report status error:', error);
      return { success: false, message: error.response?.data?.message || 'Failed to update report' };
    }
  },

  assignReport: async (id, driverId) => {
    try {
      const response = await api.put(`/admin/reports/${id}/assign`, { driverId });
      return response.data;
    } catch (error) {
      console.error('Assign report error:', error);
      return { success: false, message: error.response?.data?.message || 'Failed to assign report' };
    }
  },

  // ==================== NOTIFICATION APIs ====================

  sendNotification: async (notificationData) => {
    try {
      const response = await api.post('/admin/notifications', notificationData);
      return response.data;
    } catch (error) {
      console.error('Send notification error:', error);
      return { success: false, message: error.response?.data?.message || 'Failed to send notification' };
    }
  },

  getNotifications: async () => {
    try {
      const response = await api.get('/admin/notifications');
      return response.data;
    } catch (error) {
      console.error('Get notifications error:', error);
      return { success: true, data: [] };
    }
  }
};

export default adminService;