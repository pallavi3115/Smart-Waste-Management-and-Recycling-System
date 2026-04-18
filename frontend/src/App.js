// App.js - Completely Fixed Version
import { CssBaseline } from '@mui/material';
import { Toaster } from 'react-hot-toast';
import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { SocketProvider } from './contexts/SocketContext';
import CustomThemeProvider from './contexts/ThemeContext';

// Pages
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import HelpPage from './pages/HelpPage';
import LandingPage from './pages/LandingPage';
import NotificationsPage from './pages/NotificationsPage';
import SettingsPage from './pages/SettingsPage';
import TestPage from './pages/TestPage';

// Citizen Components
import CitizenDashboard from './components/citizen/CitizenDashboard';
import MyReports from './components/citizen/MyReports';
import NearbyBins from './components/citizen/NearbyBins';
import PublicToilets from './components/citizen/PublicToilets';
import QRScanner from './components/citizen/QRScanner';
import RecyclingGuide from './components/citizen/RecyclingGuide';
import ReportIssue from './components/citizen/ReportIssue';
import RewardCenter from './components/citizen/RewardCenter';

// Admin Components
import AdminDashboard from './components/admin/AdminDashboard';
import Analytics from './components/admin/Analytics';
import AuditLogs from './components/admin/AuditLogs';
import BinManagement from './components/admin/BinManagement';
import RecyclingCenters from './components/admin/RecyclingCenters';
import Reports from './components/admin/reports'; // ✅ ADD THIS
import RouteOptimization from './components/admin/RouteOptimization';
import StaffManagement from './components/admin/StaffManagement';

// Driver Components
import AssignedRoutes from './components/driver/AssignedRoutes';
import Attendance from './components/driver/Attendance';
import CollectionProof from './components/driver/CollectionProof';
import DriverDashboard from './components/driver/DriverDashboard';
import DriverEarnings from './components/driver/DriverEarnings';
import DriverNotifications from './components/driver/DriverNotifications';
import DriverPerformance from './components/driver/DriverPerformance';
import DriverProfile from './components/driver/DriverProfile';
import RouteDetails from './components/driver/RouteDetails';

// Profile Components
import EditProfile from './components/profile/EditProfile';
import ProfilePage from './components/profile/ProfilePage';

// Common Components
import Chatbot from './components/common/Chatbot';
import ErrorBoundary from './components/common/ErrorBoundary';
import Layout from './components/common/Layout';
import LoadingSpinner from './components/common/LoadingSpinner';
import PrivateRoute from './components/common/PrivateRoute';

const AppContent = () => {
  const { loading, user } = useAuth();

  if (loading) return <LoadingSpinner />;

  return (
    <>
      <Routes>

        {/* PUBLIC */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/test" element={<TestPage />} />

        {/* PROFILE */}
        <Route path="/profile" element={<PrivateRoute><Layout /></PrivateRoute>}>
          <Route index element={<ProfilePage />} />
          <Route path="edit" element={<EditProfile />} />
        </Route>

        {/* OTHER */}
        <Route path="/notifications" element={<PrivateRoute><Layout /></PrivateRoute>}>
          <Route index element={<NotificationsPage />} />
        </Route>

        <Route path="/settings" element={<PrivateRoute><Layout /></PrivateRoute>}>
          <Route index element={<SettingsPage />} />
        </Route>

        <Route path="/help" element={<PrivateRoute><Layout /></PrivateRoute>}>
          <Route index element={<HelpPage />} />
        </Route>

        {/* CITIZEN */}
        <Route path="/citizen" element={<PrivateRoute allowedRoles={['Citizen']}><Layout /></PrivateRoute>}>
          <Route index element={<CitizenDashboard />} />
          <Route path="report" element={<ReportIssue />} />
          <Route path="my-reports" element={<MyReports />} />
          <Route path="recycling-guide" element={<RecyclingGuide />} />
          <Route path="rewards" element={<RewardCenter />} />
          <Route path="nearby" element={<NearbyBins />} />
          <Route path="toilets" element={<PublicToilets />} />
          <Route path="scan" element={<QRScanner />} />
        </Route>

        {/* ADMIN */}
        <Route path="/admin" element={
          <PrivateRoute allowedRoles={['Admin', 'Supervisor']}>
            <Layout />
          </PrivateRoute>
        }>
          <Route index element={<AdminDashboard />} />
          <Route path="bins" element={<BinManagement />} />
          <Route path="centers" element={<RecyclingCenters />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="routes" element={<RouteOptimization />} />
          <Route path="staff" element={<StaffManagement />} />
          <Route path="audit" element={<AuditLogs />} />

          {/* ✅ REPORTS ROUTE ADDED */}
          <Route path="reports" element={<Reports />} />
        </Route>

        {/* DRIVER */}
        <Route path="/driver" element={
          <PrivateRoute allowedRoles={['Driver']}>
            <Layout />
          </PrivateRoute>
        }>
          <Route index element={<DriverDashboard />} />
          <Route path="routes" element={<AssignedRoutes />} />
          <Route path="routes/:id" element={<RouteDetails />} />
          <Route path="collection" element={<CollectionProof />} />
          <Route path="attendance" element={<Attendance />} />
          <Route path="earnings" element={<DriverEarnings />} />
          <Route path="performance" element={<DriverPerformance />} />
          <Route path="profile" element={<DriverProfile />} />
          <Route path="notifications" element={<DriverNotifications />} />
        </Route>

        {/* FALLBACK */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>

      <Toaster position="top-right" />
      {user && <Chatbot />}
    </>
  );
};

const App = () => {
  return (
    <ErrorBoundary>
      <CustomThemeProvider>
        <AuthProvider>
          <SocketProvider>
            <CssBaseline />
            <Router>
              <AppContent />
            </Router>
          </SocketProvider>
        </AuthProvider>
      </CustomThemeProvider>
    </ErrorBoundary>
  );
};

export default App;