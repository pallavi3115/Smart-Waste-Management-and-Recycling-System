// src/components/admin/StaffManagement.js - Updated to match backend routes
import React, { useState, useEffect } from 'react';
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  MenuItem,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  IconButton,
  Tooltip,
  alpha,
  Container,
  Tabs,
  Tab,
  LinearProgress,
  Alert,
  Rating,
  Stack,
  Divider,
  Fade,
  Grow,
  Skeleton,
  Switch,
  FormControlLabel,
  CircularProgress
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationOnIcon,
  AdminPanelSettings as AdminIcon,
  DirectionsCar as DriverIcon,
  SupervisorAccount as SupervisorIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Dashboard as DashboardIcon,
  Assessment as AssessmentIcon,
  Close as CloseIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Clear as ClearIcon,
  Sync as SyncIcon,
  People as PeopleIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import api from '../../services/api';
import { adminService } from '../../services/adminService';

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

function StaffManagement() {
  const [staff, setStaff] = useState([]);
  const [filteredStaff, setFilteredStaff] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [syncing, setSyncing] = useState(false);
  const [autoSync, setAutoSync] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    drivers: 0,
    admins: 0,
    supervisors: 0,
    activeStaff: 0,
    attendanceRate: 94
  });

  const [form, setForm] = useState({
    name: "",
    email: "",
    role: "Driver",
    phoneNumber: "",
    address: "",
    employeeId: "",
    joiningDate: new Date().toISOString().split('T')[0],
    status: "Active",
    userId: null,
    password: "default123" // For new staff creation
  });

  useEffect(() => {
    fetchStaff();
  }, []);

  useEffect(() => {
    filterStaff();
  }, [staff, searchQuery, roleFilter]);

  // Auto-sync every 30 seconds if enabled
  useEffect(() => {
    if (autoSync) {
      const interval = setInterval(() => {
        syncWithUsers();
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [autoSync]);

  const fetchStaff = async () => {
    setLoading(true);
    setApiError(false);
    try {
      // Use adminService to fetch users from backend
      const response = await api.get('/admin/users');
      const users = response.data?.data || [];
      
      // Transform user data to staff format
      const staffData = users.map(user => ({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phoneNumber || user.phone || '',
        area: user.address?.city || user.area || 'Not Assigned',
        employeeId: user.employeeId || `${user.role === 'Driver' ? 'DRV' : user.role === 'Admin' ? 'ADM' : 'SPV'}${user._id.slice(-4)}`,
        joiningDate: user.createdAt ? new Date(user.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        status: user.isActive !== false ? 'Active' : 'Inactive',
        userId: user._id
      }));
      
      setStaff(staffData);
      setFilteredStaff(staffData);
      updateStats(staffData);
      
      if (staffData.length === 0) {
        toast.success('No staff members found. Add some!');
      } else {
        toast.success(`Loaded ${staffData.length} staff members`);
      }
    } catch (err) {
      console.error("Error fetching staff:", err);
      setApiError(true);
      toast.error("Failed to fetch staff data");
      loadMockData();
    } finally {
      setLoading(false);
    }
  };

  // Sync staff with registered users (fetch users with Driver role)
  const syncWithUsers = async () => {
    setSyncing(true);
    try {
      // Fetch all users from the system
      const response = await api.get("/admin/users");
      const allUsers = response.data?.data || [];
      
      // Filter users with role Driver
      const driverUsers = allUsers.filter(user => user.role === 'Driver');
      
      // Get existing staff IDs
      const existingStaffIds = staff.map(s => s.userId).filter(id => id);
      
      // Find new drivers not in staff
      const newDrivers = driverUsers.filter(driver => !existingStaffIds.includes(driver._id));
      
      if (newDrivers.length > 0) {
        toast.success(`${newDrivers.length} new driver(s) found. Refresh to see them.`);
        fetchStaff(); // Refresh staff list
      } else {
        toast.success('No new drivers found. All drivers are already in staff list.');
      }
    } catch (err) {
      console.error("Error syncing with users:", err);
      toast.error("Failed to sync with user database");
    } finally {
      setSyncing(false);
    }
  };

  const loadMockData = () => {
    const mockStaff = [
      { _id: '1', name: 'Rajesh Kumar', email: 'rajesh@smartwaste.com', role: 'Admin', phone: '9876543210', area: 'Head Office', employeeId: 'ADM001', joiningDate: '2023-01-15', status: 'Active' },
      { _id: '2', name: 'Priya Singh', email: 'priya@smartwaste.com', role: 'Driver', phone: '9876543211', area: 'Zone A', employeeId: 'DRV001', joiningDate: '2023-02-10', status: 'Active' },
      { _id: '3', name: 'Amit Verma', email: 'amit@smartwaste.com', role: 'Driver', phone: '9876543212', area: 'Zone B', employeeId: 'DRV002', joiningDate: '2023-03-05', status: 'Active' },
      { _id: '4', name: 'Sunita Rani', email: 'sunita@smartwaste.com', role: 'Supervisor', phone: '9876543213', area: 'Zone A', employeeId: 'SPV001', joiningDate: '2023-01-20', status: 'Active' },
      { _id: '5', name: 'Mohan Lal', email: 'mohan@smartwaste.com', role: 'Driver', phone: '9876543214', area: 'Zone C', employeeId: 'DRV003', joiningDate: '2023-04-12', status: 'Inactive' }
    ];
    setStaff(mockStaff);
    setFilteredStaff(mockStaff);
    updateStats(mockStaff);
  };

  const updateStats = (staffData) => {
    const total = staffData.length;
    const drivers = staffData.filter(s => s.role === 'Driver').length;
    const admins = staffData.filter(s => s.role === 'Admin').length;
    const supervisors = staffData.filter(s => s.role === 'Supervisor').length;
    const activeStaff = staffData.filter(s => s.status === 'Active').length;

    setStats({
      total,
      drivers,
      admins,
      supervisors,
      activeStaff,
      attendanceRate: 94
    });
  };

  const filterStaff = () => {
    let filtered = [...staff];

    if (roleFilter !== 'ALL') {
      filtered = filtered.filter(s => s.role === roleFilter);
    }

    if (searchQuery) {
      filtered = filtered.filter(s =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.employeeId?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredStaff(filtered);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    if (!form.name || !form.email || !form.phoneNumber) {
      toast.error("Please fill all required fields ⚠️");
      return;
    }

    try {
      if (editingStaff) {
        // Update existing staff (user)
        await api.put(`/admin/users/${editingStaff._id}`, {
          name: form.name,
          phoneNumber: form.phoneNumber,
          address: { city: form.area },
          role: form.role,
          status: form.status
        });
        toast.success("Staff updated successfully ✅");
      } else {
        // Create new staff (user)
        await api.post("/admin/users", {
          name: form.name,
          email: form.email,
          password: form.password || "password123",
          role: form.role,
          phoneNumber: form.phoneNumber,
          address: { city: form.area },
          employeeId: form.employeeId
        });
        toast.success("Staff added successfully ✅");
      }

      setOpenDialog(false);
      setForm({
        name: "",
        email: "",
        role: "Driver",
        phoneNumber: "",
        address: "",
        employeeId: "",
        joiningDate: new Date().toISOString().split('T')[0],
        status: "Active",
        userId: null,
        password: "default123"
      });
      setEditingStaff(null);
      fetchStaff();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Error saving staff ❌");
    }
  };

  const handleDelete = async (staffId) => {
    if (window.confirm("Are you sure you want to delete this staff member?")) {
      try {
        await api.delete(`/admin/users/${staffId}`);
        toast.success("Staff deleted successfully");
        fetchStaff();
      } catch (err) {
        toast.error("Failed to delete staff");
      }
    }
  };

  const handleEdit = (staffMember) => {
    setEditingStaff(staffMember);
    setForm({
      name: staffMember.name,
      email: staffMember.email,
      role: staffMember.role,
      phoneNumber: staffMember.phone,
      address: staffMember.area,
      employeeId: staffMember.employeeId || "",
      joiningDate: staffMember.joiningDate || new Date().toISOString().split('T')[0],
      status: staffMember.status || "Active",
      userId: staffMember.userId || null,
      password: "default123"
    });
    setOpenDialog(true);
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'Admin': return <AdminIcon sx={{ fontSize: 16 }} />;
      case 'Driver': return <DriverIcon sx={{ fontSize: 16 }} />;
      case 'Supervisor': return <SupervisorIcon sx={{ fontSize: 16 }} />;
      default: return <PersonIcon sx={{ fontSize: 16 }} />;
    }
  };

  const getRoleColor = (role) => {
    if (role === "Admin") return "#EF4444";
    if (role === "Driver") return "#F59E0B";
    return "#10B981";
  };

  const statsCards = [
    { title: "Total Staff", value: stats.total, icon: <PeopleIcon />, color: "#6366F1", trend: "+12%", trendUp: true },
    { title: "Drivers", value: stats.drivers, icon: <DriverIcon />, color: "#F59E0B", trend: "+8%", trendUp: true },
    { title: "Admins", value: stats.admins, icon: <AdminIcon />, color: "#EF4444", trend: "+5%", trendUp: true },
    { title: "Supervisors", value: stats.supervisors, icon: <SupervisorIcon />, color: "#10B981", trend: "+3%", trendUp: true },
    { title: "Active Staff", value: stats.activeStaff, icon: <PersonIcon />, color: "#10B981", trend: "+10%", trendUp: true },
    { title: "Attendance", value: `${stats.attendanceRate}%`, icon: <AssessmentIcon />, color: "#8B5CF6", trend: "+2%", trendUp: true }
  ];

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ mt: 3, mb: 4 }}>
        <Box sx={{ mb: 3 }}>
          <Skeleton variant="rectangular" height={100} sx={{ borderRadius: 2 }} />
        </Box>
        <Grid container spacing={2.5}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Grid item xs={12} sm={6} md={4} lg={2} key={i}>
              <Skeleton variant="rectangular" height={120} sx={{ borderRadius: 3 }} />
            </Grid>
          ))}
        </Grid>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 3, mb: 4 }}>
      <motion.div variants={staggerContainer} initial="hidden" animate="visible">
        {/* Header */}
        <motion.div variants={fadeInUp}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 800, background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Staff Management
              </Typography>
              <Typography variant="body2" sx={{ color: '#64748B' }}>
                Manage your team members and automatically sync with registered drivers
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={autoSync}
                    onChange={(e) => setAutoSync(e.target.checked)}
                    size="small"
                    sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: '#6366F1' } }}
                  />
                }
                label="Auto Sync"
                sx={{ mr: 0 }}
              />
              <Tooltip title="Sync with registered drivers">
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={syncing ? <CircularProgress size={16} /> : <SyncIcon />}
                  onClick={syncWithUsers}
                  disabled={syncing}
                  sx={{ borderRadius: 2, textTransform: 'none', borderColor: alpha('#6366F1', 0.5), color: '#6366F1' }}
                >
                  {syncing ? 'Syncing...' : 'Sync Drivers'}
                </Button>
              </Tooltip>
              <Button
                variant="outlined"
                size="small"
                startIcon={<RefreshIcon />}
                onClick={fetchStaff}
                sx={{ borderRadius: 2, textTransform: 'none', borderColor: alpha('#6366F1', 0.5), color: '#6366F1' }}
              >
                Refresh
              </Button>
              <Button
                variant="contained"
                size="small"
                startIcon={<DownloadIcon />}
                sx={{ borderRadius: 2, textTransform: 'none', bgcolor: '#6366F1' }}
              >
                Export
              </Button>
              <Button
                variant="contained"
                size="small"
                startIcon={<AddIcon />}
                onClick={() => setOpenDialog(true)}
                sx={{ borderRadius: 2, textTransform: 'none', bgcolor: '#6366F1' }}
              >
                Add Staff
              </Button>
            </Box>
          </Box>
        </motion.div>

        {/* API Error Alert */}
        {apiError && (
          <Alert severity="warning" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setApiError(false)}>
            <strong>Demo Mode:</strong> Unable to connect to server. Showing sample data.
          </Alert>
        )}

        {/* Stats Cards */}
        <Grid container spacing={2.5} sx={{ mb: 4 }}>
          {statsCards.map((stat, i) => (
            <Grid item xs={12} sm={6} md={4} lg={2} key={i}>
              <motion.div variants={fadeInUp} whileHover={{ y: -4 }}>
                <Card sx={{ borderRadius: 3, border: `1px solid ${alpha(stat.color, 0.15)}`, background: alpha(stat.color, 0.02) }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Box>
                        <Typography sx={{ fontSize: '0.7rem', fontWeight: 600, color: '#64748B', textTransform: 'uppercase' }}>
                          {stat.title}
                        </Typography>
                        <Typography variant="h4" sx={{ fontWeight: 800, color: '#1E293B', mt: 0.5 }}>
                          {stat.value}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 1 }}>
                          {stat.trendUp ? <TrendingUpIcon sx={{ fontSize: 12, color: '#10B981' }} /> : <TrendingDownIcon sx={{ fontSize: 12, color: '#EF4444' }} />}
                          <Typography sx={{ fontSize: '0.7rem', color: stat.trendUp ? '#10B981' : '#EF4444', fontWeight: 500 }}>
                            {stat.trend}
                          </Typography>
                          <Typography sx={{ fontSize: '0.65rem', color: '#94A3B8' }}>vs last month</Typography>
                        </Box>
                      </Box>
                      <Avatar sx={{ width: 48, height: 48, bgcolor: alpha(stat.color, 0.1), color: stat.color }}>
                        {stat.icon}
                      </Avatar>
                    </Box>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>

        {/* Tabs and Filters */}
        <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)} sx={{ mb: 3, borderBottom: `1px solid ${alpha('#6366F1', 0.1)}` }}>
          <Tab icon={<DashboardIcon />} iconPosition="start" label="All Staff" />
          <Tab icon={<AssessmentIcon />} iconPosition="start" label="Analytics" />
        </Tabs>

        {/* All Staff Tab */}
        {activeTab === 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {/* Filters */}
            <Paper sx={{ p: 2, mb: 3, borderRadius: 3, border: `1px solid ${alpha('#6366F1', 0.1)}`, display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
              <TextField
                select
                label="Role Filter"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                size="small"
                sx={{ minWidth: 150 }}
                InputProps={{ startAdornment: <FilterListIcon sx={{ fontSize: 18, mr: 1, color: '#64748B' }} /> }}
              >
                <MenuItem value="ALL">All Roles</MenuItem>
                <MenuItem value="Admin">Admin</MenuItem>
                <MenuItem value="Driver">Driver</MenuItem>
                <MenuItem value="Supervisor">Supervisor</MenuItem>
              </TextField>

              <TextField
                label="Search by name, email or ID"
                size="small"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                sx={{ flex: 1, minWidth: 250 }}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ fontSize: 18, color: '#64748B', mr: 1 }} />,
                  endAdornment: searchQuery && (
                    <IconButton size="small" onClick={() => setSearchQuery('')}>
                      <ClearIcon fontSize="small" />
                    </IconButton>
                  )
                }}
              />

              <Typography variant="caption" sx={{ color: '#94A3B8' }}>
                Showing {filteredStaff.length} of {staff.length} staff members
              </Typography>
            </Paper>

            {/* Staff Table */}
            <Paper sx={{ p: 3, borderRadius: 4, border: `1px solid ${alpha('#6366F1', 0.1)}`, overflow: 'hidden' }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>📋 Staff Directory</Typography>
              
              {filteredStaff.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <PersonIcon sx={{ fontSize: 48, color: alpha('#6366F1', 0.3), mb: 2 }} />
                  <Typography variant="body2" color="text.secondary">No staff members found</Typography>
                  <Button variant="contained" onClick={() => setOpenDialog(true)} sx={{ mt: 2, bgcolor: '#6366F1' }}>
                    Add Staff Member
                  </Button>
                </Box>
              ) : (
                <TableContainer sx={{ overflowX: 'auto' }}>
                  <Table sx={{ minWidth: 800 }}>
                    <TableHead sx={{ bgcolor: '#F8FAFC' }}>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 700 }}>Staff</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Contact</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Role</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Area/Zone</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Employee ID</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredStaff.map((s) => (
                        <TableRow key={s._id} hover>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                              <Avatar sx={{ bgcolor: getRoleColor(s.role), width: 40, height: 40 }}>
                                {s.name?.charAt(0).toUpperCase()}
                              </Avatar>
                              <Box>
                                <Typography variant="body2" sx={{ fontWeight: 500 }}>{s.name}</Typography>
                                <Typography variant="caption" color="text.secondary">{s.employeeId || 'N/A'}</Typography>
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <EmailIcon sx={{ fontSize: 12, color: '#64748B' }} />
                                <Typography variant="caption">{s.email}</Typography>
                              </Box>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <PhoneIcon sx={{ fontSize: 12, color: '#64748B' }} />
                                <Typography variant="caption">{s.phone}</Typography>
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Chip
                              icon={getRoleIcon(s.role)}
                              label={s.role}
                              size="small"
                              sx={{ bgcolor: alpha(getRoleColor(s.role), 0.1), color: getRoleColor(s.role), fontWeight: 500 }}
                            />
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <LocationOnIcon sx={{ fontSize: 12, color: '#64748B' }} />
                              <Typography variant="body2">{s.area || 'Not assigned'}</Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">{s.employeeId || 'N/A'}</Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={s.status || 'Active'}
                              size="small"
                              sx={{ bgcolor: (s.status === 'Active') ? alpha('#10B981', 0.1) : alpha('#EF4444', 0.1), color: (s.status === 'Active') ? '#10B981' : '#EF4444' }}
                            />
                          </TableCell>
                          <TableCell>
                            <Stack direction="row" spacing={0.5}>
                              <Tooltip title="Edit">
                                <IconButton size="small" onClick={() => handleEdit(s)}>
                                  <EditIcon sx={{ fontSize: 18, color: '#6366F1' }} />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Delete">
                                <IconButton size="small" onClick={() => handleDelete(s._id)}>
                                  <DeleteIcon sx={{ fontSize: 18, color: '#EF4444' }} />
                                </IconButton>
                              </Tooltip>
                            </Stack>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Paper>
          </motion.div>
        )}

        {/* Analytics Tab */}
        {activeTab === 1 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Grid container spacing={2.5}>
              <Grid item xs={12} lg={6}>
                <Paper sx={{ p: 3, borderRadius: 4, border: `1px solid ${alpha('#6366F1', 0.1)}` }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>📊 Staff Distribution</Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="body2">Drivers</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#F59E0B' }}>{stats.drivers} ({Math.round((stats.drivers / stats.total) * 100)}%)</Typography>
                      </Box>
                      <LinearProgress variant="determinate" value={(stats.drivers / stats.total) * 100} sx={{ height: 8, borderRadius: 4, bgcolor: alpha('#F59E0B', 0.1), '& .MuiLinearProgress-bar': { bgcolor: '#F59E0B', borderRadius: 4 } }} />
                    </Box>
                    <Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="body2">Admins</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#EF4444' }}>{stats.admins} ({Math.round((stats.admins / stats.total) * 100)}%)</Typography>
                      </Box>
                      <LinearProgress variant="determinate" value={(stats.admins / stats.total) * 100} sx={{ height: 8, borderRadius: 4, bgcolor: alpha('#EF4444', 0.1), '& .MuiLinearProgress-bar': { bgcolor: '#EF4444', borderRadius: 4 } }} />
                    </Box>
                    <Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="body2">Supervisors</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#10B981' }}>{stats.supervisors} ({Math.round((stats.supervisors / stats.total) * 100)}%)</Typography>
                      </Box>
                      <LinearProgress variant="determinate" value={(stats.supervisors / stats.total) * 100} sx={{ height: 8, borderRadius: 4, bgcolor: alpha('#10B981', 0.1), '& .MuiLinearProgress-bar': { bgcolor: '#10B981', borderRadius: 4 } }} />
                    </Box>
                  </Box>
                </Paper>
              </Grid>
              <Grid item xs={12} lg={6}>
                <Paper sx={{ p: 3, borderRadius: 4, border: `1px solid ${alpha('#6366F1', 0.1)}`, height: '100%' }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>📈 Performance Metrics</Typography>
                  <Stack spacing={2}>
                    <Box sx={{ p: 2, bgcolor: alpha('#10B981', 0.05), borderRadius: 2 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: '#10B981' }}>Attendance Rate</Typography>
                      <Typography variant="h3" sx={{ fontWeight: 700 }}>{stats.attendanceRate}%</Typography>
                      <Typography variant="caption" color="text.secondary">↑ 2% from last month</Typography>
                    </Box>
                    <Box sx={{ p: 2, bgcolor: alpha('#6366F1', 0.05), borderRadius: 2 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: '#6366F1' }}>Staff Satisfaction</Typography>
                      <Typography variant="h3" sx={{ fontWeight: 700 }}>4.8/5</Typography>
                      <Rating value={4.8} readOnly precision={0.5} size="small" />
                    </Box>
                    <Box sx={{ p: 2, bgcolor: alpha('#F59E0B', 0.05), borderRadius: 2 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: '#F59E0B' }}>Average Performance</Typography>
                      <Typography variant="h3" sx={{ fontWeight: 700 }}>92%</Typography>
                      <Typography variant="caption" color="text.secondary">↑ 5% from last month</Typography>
                    </Box>
                  </Stack>
                </Paper>
              </Grid>
            </Grid>
          </motion.div>
        )}

        {/* Add/Edit Staff Dialog */}
        <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
          <DialogTitle sx={{ bgcolor: alpha('#6366F1', 0.03), borderBottom: `1px solid ${alpha('#6366F1', 0.1)}` }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>{editingStaff ? 'Edit Staff' : 'Add New Staff'}</Typography>
              <IconButton onClick={() => setOpenDialog(false)} size="small"><CloseIcon /></IconButton>
            </Box>
          </DialogTitle>
          <DialogContent sx={{ pt: 3 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField fullWidth label="Full Name" name="name" value={form.name} onChange={handleChange} required />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Email" name="email" type="email" value={form.email} onChange={handleChange} required />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Phone" name="phoneNumber" value={form.phoneNumber} onChange={handleChange} required />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Employee ID" name="employeeId" value={form.employeeId} onChange={handleChange} helperText="Leave blank for auto-generation" />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Area/Zone" name="address" value={form.address} onChange={handleChange} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth select label="Role" name="role" value={form.role} onChange={handleChange}>
                  <MenuItem value="Driver">Driver</MenuItem>
                  <MenuItem value="Admin">Admin</MenuItem>
                  <MenuItem value="Supervisor">Supervisor</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Joining Date" name="joiningDate" type="date" value={form.joiningDate} onChange={handleChange} InputLabelProps={{ shrink: true }} />
              </Grid>
              <Grid item xs={12}>
                <TextField fullWidth select label="Status" name="status" value={form.status} onChange={handleChange}>
                  <MenuItem value="Active">Active</MenuItem>
                  <MenuItem value="Inactive">Inactive</MenuItem>
                  <MenuItem value="On Leave">On Leave</MenuItem>
                </TextField>
              </Grid>
              {!editingStaff && (
                <Grid item xs={12}>
                  <TextField fullWidth label="Password" name="password" type="password" value={form.password} onChange={handleChange} helperText="Default: password123" />
                </Grid>
              )}
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 2.5, borderTop: `1px solid ${alpha('#6366F1', 0.1)}`, gap: 1 }}>
            <Button onClick={() => setOpenDialog(false)} sx={{ color: '#64748B' }}>Cancel</Button>
            <Button onClick={handleSubmit} variant="contained" sx={{ bgcolor: '#6366F1', borderRadius: 2 }}>
              {editingStaff ? 'Update Staff' : 'Add Staff'}
            </Button>
          </DialogActions>
        </Dialog>
      </motion.div>
    </Container>
  );
}

export default StaffManagement;