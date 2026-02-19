import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { CssBaseline } from '@mui/material';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { SocketProvider } from './contexts/SocketContext';
import CustomThemeProvider from './contexts/ThemeContext';

// Pages
import LandingPage from './pages/LandingPage';
import Login from './components/auth/Login';
import Register from './components/auth/Register';

// Citizen Components
import CitizenDashboard from './components/citizen/CitizenDashboard';
import ReportIssue from './components/citizen/ReportIssue';
import MyReports from './components/citizen/MyReports';
import RecyclingGuide from './components/citizen/RecyclingGuide';
import RewardCenter from './components/citizen/RewardCenter';
import NearbyBins from './components/citizen/NearbyBins';
import PublicToilets from './components/citizen/PublicToilets';
import QRScanner from './components/citizen/QRScanner';

// Admin Components
import AdminDashboard from './components/admin/AdminDashboard';
import BinManagement from './components/admin/BinManagement';
import RecyclingCenters from './components/admin/RecyclingCenters';
import Analytics from './components/admin/Analytics';
import RouteOptimization from './components/admin/RouteOptimization';
import StaffManagement from './components/admin/StaffManagement';
import AuditLogs from './components/admin/AuditLogs';

// Driver Components
import DriverDashboard from './components/driver/DriverDashboard';
import AssignedRoutes from './components/driver/AssignedRoutes';
import CollectionProof from './components/driver/CollectionProof';
import Attendance from './components/driver/Attendance';

// Profile Components
import ProfilePage from './components/profile/ProfilePage';
import EditProfile from './components/profile/EditProfile';

// Common Components
import PrivateRoute from './components/common/PrivateRoute';
import Layout from './components/common/Layout';
import LoadingSpinner from './components/common/LoadingSpinner';
import ErrorBoundary from './components/common/ErrorBoundary';
import Chatbot from './components/common/Chatbot';

// App Content Component with Auth
const AppContent = () => {
  const { loading, user } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/test" element={<div style={{ padding: 20 }}>Test Page Works!</div>} />

        {/* Profile Routes - Accessible by all authenticated users */}
        <Route
          path="/profile"
          element={
            <PrivateRoute>
              <Layout />
            </PrivateRoute>
          }
        >
          <Route index element={<ProfilePage />} />
          <Route path="edit" element={<EditProfile />} />
        </Route>

        {/* Citizen routes */}
        <Route
          path="/citizen"
          element={
            <PrivateRoute allowedRoles={['Citizen']}>
              <Layout />
            </PrivateRoute>
          }
        >
          <Route index element={<CitizenDashboard />} />
          <Route path="report" element={<ReportIssue />} />
          <Route path="my-reports" element={<MyReports />} />
          <Route path="recycling-guide" element={<RecyclingGuide />} />
          <Route path="rewards" element={<RewardCenter />} />
          <Route path="nearby" element={<NearbyBins />} />
          <Route path="toilets" element={<PublicToilets />} />
          <Route path="scan" element={<QRScanner />} />
        </Route>

        {/* Admin routes */}
        <Route
          path="/admin"
          element={
            <PrivateRoute allowedRoles={['Admin', 'Supervisor']}>
              <Layout />
            </PrivateRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="bins" element={<BinManagement />} />
          <Route path="centers" element={<RecyclingCenters />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="routes" element={<RouteOptimization />} />
          <Route path="staff" element={<StaffManagement />} />
          <Route path="audit" element={<AuditLogs />} />
        </Route>

        {/* Driver routes */}
        <Route
          path="/driver"
          element={
            <PrivateRoute allowedRoles={['Driver']}>
              <Layout />
            </PrivateRoute>
          }
        >
          <Route index element={<DriverDashboard />} />
          <Route path="routes" element={<AssignedRoutes />} />
          <Route path="collection" element={<CollectionProof />} />
          <Route path="attendance" element={<Attendance />} />
        </Route>

        {/* Redirect any unknown routes to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* Toast Notifications */}
      <Toaster
        position="top-right"
        reverseOrder={false}
        gutter={8}
        containerClassName=""
        containerStyle={{}}
        toastOptions={{
          className: '',
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
            padding: '16px',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: 500,
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          },
          success: {
            duration: 3000,
            icon: '✅',
            style: {
              background: '#10b981',
              color: '#fff',
            },
          },
          error: {
            duration: 4000,
            icon: '❌',
            style: {
              background: '#ef4444',
              color: '#fff',
            },
          },
          loading: {
            duration: Infinity,
            style: {
              background: '#3b82f6',
              color: '#fff',
            },
          },
        }}
      />

      {/* Optional: Add Chatbot for authenticated users */}
      {user && <Chatbot />}
    </Router>
  );
};

// Main App Component
const App = () => {
  return (
    <ErrorBoundary>
      <CustomThemeProvider>
        <AuthProvider>
          <SocketProvider>
            <CssBaseline />
            <AppContent />
          </SocketProvider>
        </AuthProvider>
      </CustomThemeProvider>
    </ErrorBoundary>
  );
};

export default App;