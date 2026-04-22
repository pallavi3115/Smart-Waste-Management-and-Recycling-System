// src/contexts/DataContext.js
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';

const DataContext = createContext();

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within DataProvider');
  }
  return context;
};

// Mock Data
const getMockBinsData = () => {
  return [
    { _id: '1', binId: 'BN001', area: 'Sector 12', currentFillLevel: 85, status: 'Full', type: 'general', alerts: { fire: false, overflow: true }, lastUpdated: new Date().toISOString(), wifiStrength: 85, temperature: 32 },
    { _id: '2', binId: 'BN002', area: 'Sector 15', currentFillLevel: 60, status: 'Partial', type: 'recyclable', alerts: { fire: false, overflow: false }, lastUpdated: new Date().toISOString(), wifiStrength: 92, temperature: 28 },
    { _id: '3', binId: 'BN003', area: 'Block A', currentFillLevel: 30, status: 'Empty', type: 'general', alerts: { fire: false, overflow: false }, lastUpdated: new Date().toISOString(), wifiStrength: 78, temperature: 26 },
    { _id: '4', binId: 'BN004', area: 'Market Complex', currentFillLevel: 92, status: 'Full', type: 'ewaste', alerts: { fire: true, overflow: true }, lastUpdated: new Date().toISOString(), wifiStrength: 45, temperature: 35 },
    { _id: '5', binId: 'BN005', area: 'Sector 20', currentFillLevel: 45, status: 'Partial', type: 'organic', alerts: { fire: false, overflow: false }, lastUpdated: new Date().toISOString(), wifiStrength: 88, temperature: 27 },
    { _id: '6', binId: 'BN006', area: 'Sector 8', currentFillLevel: 15, status: 'Empty', type: 'general', alerts: { fire: false, overflow: false }, lastUpdated: new Date().toISOString(), wifiStrength: 95, temperature: 25 }
  ];
};

const getMockCentersData = () => {
  return [
    { _id: '1', name: 'Green Earth Recycling', location: 'Sector 12', current_load: 4500, capacity: 5000, type: 'plastic,paper,glass', rating: 4.8, contact: '+91 98765 43210' },
    { _id: '2', name: 'Eco Center', location: 'Sector 15', current_load: 2800, capacity: 3000, type: 'ewaste,metal', rating: 4.6, contact: '+91 98765 43211' },
    { _id: '3', name: 'WasteWise Hub', location: 'Sector 20', current_load: 1800, capacity: 2500, type: 'general,recyclable', rating: 4.7, contact: '+91 98765 43212' }
  ];
};

const getMockReportsData = () => {
  return [
    { _id: '1', title: 'Overflowing Bin', description: 'Bin at Sector 12 is overflowing', status: 'pending', priority: 'high', createdAt: new Date().toISOString(), location: 'Sector 12' },
    { _id: '2', title: 'Missed Collection', description: 'Collection missed in Sector 15', status: 'resolved', priority: 'medium', createdAt: new Date().toISOString(), location: 'Sector 15' },
    { _id: '3', title: 'Illegal Dumping', description: 'Waste dumped illegally near Park', status: 'pending', priority: 'high', createdAt: new Date().toISOString(), location: 'Park Street' },
    { _id: '4', title: 'Broken Bin', description: 'Bin door broken at Market Complex', status: 'in-progress', priority: 'low', createdAt: new Date().toISOString(), location: 'Market Complex' }
  ];
};

const getMockAnalyticsData = () => {
  return {
    reportsTrend: [
      { name: 'Mon', reports: 12, resolved: 8, pending: 4 },
      { name: 'Tue', reports: 8, resolved: 6, pending: 2 },
      { name: 'Wed', reports: 15, resolved: 10, pending: 5 },
      { name: 'Thu', reports: 10, resolved: 9, pending: 1 },
      { name: 'Fri', reports: 18, resolved: 14, pending: 4 },
      { name: 'Sat', reports: 6, resolved: 5, pending: 1 },
      { name: 'Sun', reports: 3, resolved: 3, pending: 0 }
    ],
    wasteByType: [
      { name: 'General Waste', value: 48, color: '#6366F1', icon: '🗑️' },
      { name: 'Recyclable', value: 28, color: '#10B981', icon: '♻️' },
      { name: 'E-Waste', value: 14, color: '#F59E0B', icon: '💻' },
      { name: 'Organic', value: 10, color: '#EF4444', icon: '🍎' }
    ],
    collectionEfficiency: [
      { month: 'Jan', efficiency: 72, target: 75 },
      { month: 'Feb', efficiency: 75, target: 75 },
      { month: 'Mar', efficiency: 78, target: 78 },
      { month: 'Apr', efficiency: 80, target: 80 },
      { month: 'May', efficiency: 82, target: 82 },
      { month: 'Jun', efficiency: 85, target: 85 }
    ],
    topIssues: [
      { issue: 'Overflowing Bins', count: 45 },
      { issue: 'Missed Collection', count: 32 },
      { issue: 'Illegal Dumping', count: 28 },
      { issue: 'Broken Bins', count: 18 }
    ]
  };
};

export const DataProvider = ({ children }) => {
  const [bins, setBins] = useState([]);
  const [centers, setCenters] = useState([]);
  const [reports, setReports] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [socketConnected, setSocketConnected] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // Simulate IoT real-time updates
  useEffect(() => {
    // Load mock data
    const loadMockData = () => {
      setBins(getMockBinsData());
      setCenters(getMockCentersData());
      setReports(getMockReportsData());
      setAnalytics(getMockAnalyticsData());
      setLoading(false);
      setLastUpdated(new Date());
    };

    loadMockData();

    // Simulate real-time bin fill level updates (IoT simulation)
    const interval = setInterval(() => {
      setBins(prevBins => 
        prevBins.map(bin => {
          // Randomly update fill level for some bins
          if (Math.random() > 0.7) {
            const change = Math.floor(Math.random() * 10) - 3;
            let newFill = Math.max(0, Math.min(100, (bin.currentFillLevel || 0) + change));
            return {
              ...bin,
              currentFillLevel: newFill,
              status: newFill >= 80 ? 'Full' : newFill >= 50 ? 'Partial' : 'Empty',
              lastUpdated: new Date().toISOString()
            };
          }
          return bin;
        })
      );
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  // Update single bin (for real-time updates)
  const updateBin = useCallback((binId, updates) => {
    setBins(prev => prev.map(bin => 
      bin._id === binId ? { ...bin, ...updates, lastUpdated: new Date().toISOString() } : bin
    ));
  }, []);

  // Add new bin
  const addBin = async (binData) => {
    try {
      const newBin = {
        _id: Date.now().toString(),
        binId: `BN${Math.floor(Math.random() * 1000)}`,
        ...binData,
        currentFillLevel: 0,
        status: 'Empty',
        alerts: { fire: false, overflow: false },
        lastUpdated: new Date().toISOString(),
        wifiStrength: Math.floor(Math.random() * 100)
      };
      setBins(prev => [...prev, newBin]);
      toast.success('Bin added successfully');
      return newBin;
    } catch (error) {
      toast.error('Failed to add bin');
      throw error;
    }
  };

  // Update bin
  const editBin = async (binId, binData) => {
    try {
      setBins(prev => prev.map(bin => 
        bin._id === binId ? { ...bin, ...binData, lastUpdated: new Date().toISOString() } : bin
      ));
      toast.success('Bin updated successfully');
      return { _id: binId, ...binData };
    } catch (error) {
      toast.error('Failed to update bin');
      throw error;
    }
  };

  // Delete bin
  const deleteBin = async (binId) => {
    try {
      setBins(prev => prev.filter(bin => bin._id !== binId));
      toast.success('Bin deleted successfully');
    } catch (error) {
      toast.error('Failed to delete bin');
      throw error;
    }
  };

  // Add recycling center
  const addCenter = async (centerData) => {
    try {
      const newCenter = {
        _id: Date.now().toString(),
        ...centerData,
        rating: 4.5,
        current_load: 0,
        capacity: centerData.capacity || 5000
      };
      setCenters(prev => [...prev, newCenter]);
      toast.success('Recycling center added');
      return newCenter;
    } catch (error) {
      toast.error('Failed to add center');
      throw error;
    }
  };

  // Refresh all data
  const refreshData = useCallback(() => {
    setLoading(true);
    setTimeout(() => {
      setBins(getMockBinsData());
      setCenters(getMockCentersData());
      setReports(getMockReportsData());
      setAnalytics(getMockAnalyticsData());
      setLoading(false);
      setLastUpdated(new Date());
      toast.success('Data refreshed');
    }, 500);
  }, []);

  // Compute derived stats
  const getStats = useCallback(() => {
    const totalBins = bins.length;
    const fullBins = bins.filter(b => (b.currentFillLevel || 0) >= 80).length;
    const activeBins = bins.filter(b => (b.wifiStrength || 0) > 50).length;
    const offlineBins = bins.filter(b => (b.wifiStrength || 0) <= 50).length;
    const avgFillLevel = totalBins > 0 
      ? Math.round(bins.reduce((acc, b) => acc + (b.currentFillLevel || 0), 0) / totalBins)
      : 0;
    const totalRecycled = reports.reduce((acc, r) => acc + (r.recycledAmount || 0), 0);
    const activeAlerts = bins.filter(b => b.alerts?.fire || b.alerts?.overflow).length;

    return {
      totalBins,
      fullBins,
      activeBins,
      offlineBins,
      avgFillLevel,
      totalRecycled,
      activeAlerts,
      totalReports: reports.length,
      resolvedReports: reports.filter(r => r.status === 'resolved').length,
      pendingReports: reports.filter(r => r.status === 'pending').length,
      co2Saved: totalRecycled * 0.8
    };
  }, [bins, reports]);

  const value = {
    // State
    bins,
    centers,
    reports,
    analytics,
    loading,
    socketConnected,
    lastUpdated,
    
    // Actions
    fetchAllData: refreshData,
    refreshData,
    updateBin,
    addBin,
    editBin,
    deleteBin,
    addCenter,
    
    // Computed
    getStats,
    stats: getStats()
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};

export default DataProvider;