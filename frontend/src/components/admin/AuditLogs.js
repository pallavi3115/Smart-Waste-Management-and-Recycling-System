import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  Chip,
  Grid,
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
  Avatar,
  alpha,
  Container,
  Button,
  Menu,
  MenuItem,
  Tabs,
  Tab,
  InputAdornment,
  Pagination,
  Stack,
  Skeleton,
  Fade,
  Zoom,
  LinearProgress,
  Badge,
  Select,
  FormControl,
  InputLabel,
  Rating
} from "@mui/material";
import { alpha as alphaColor, useTheme } from "@mui/material/styles";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon,
  Person as PersonIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Visibility as VisibilityIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Timeline as TimelineIcon,
  Analytics as AnalyticsIcon,
  Clear as ClearIcon,
  Print as PrintIcon,
  Share as ShareIcon,
  History as HistoryIcon,
  Security as SecurityIcon,
  AdminPanelSettings as AdminIcon,
  DeviceHub as DeviceIcon,
  Login as LoginIcon,
  Logout as LogoutIcon,
  Settings as SettingsIcon,
  Store as StoreIcon,
  LocationOn as LocationIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  CalendarToday as CalendarIcon,
  AccessTime as TimeIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon
} from "@mui/icons-material";
import { toast } from 'react-hot-toast';
import api from "../../services/api";

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 }
  }
};

const cardHover = {
  hover: { 
    y: -8, 
    transition: { duration: 0.2 },
    boxShadow: '0 20px 40px rgba(99, 102, 241, 0.15)'
  }
};

// Professional color palette
const colors = {
  primary: '#6366F1',
  primaryDark: '#4F46E5',
  secondary: '#10B981',
  danger: '#EF4444',
  warning: '#F59E0B',
  info: '#06B6D4',
  purple: '#8B5CF6',
  pink: '#EC4899',
  gray: '#64748B',
  dark: '#1E293B',
  light: '#F8FAFC',
  white: '#FFFFFF'
};

function AuditLogs() {
  const theme = useTheme();
  const [logs, setLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [filterAction, setFilterAction] = useState("all");
  const [filterModule, setFilterModule] = useState("all");
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [exportLoading, setExportLoading] = useState(false);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await api.get("/audit-logs");
      const auditLogs = res.data.data || [];
      setLogs(auditLogs);
      setFilteredLogs(auditLogs);
      
      if (auditLogs.length === 0) {
        toast.success('📜 No audit logs found. Logs will appear as users perform actions.', { 
          icon: '🔒',
          duration: 4000
        });
      }
    } catch (error) {
      console.error('Error fetching logs:', error);
      // Mock data for demo
      const mockLogs = generateMockLogs();
      setLogs(mockLogs);
      setFilteredLogs(mockLogs);
      toast.error('Using demo data - Connect to backend for live logs', { duration: 4000 });
    } finally {
      setLoading(false);
    }
  };

  const generateMockLogs = () => {
    const actions = ['CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'VIEW', 'EXPORT'];
    const modules = ['User Management', 'Bin Management', 'Recycling Center', 'Reports', 'Routes', 'Settings'];
    const users = ['Rajesh Kumar (Admin)', 'Priya Sharma (Driver)', 'Amit Verma (Supervisor)', 'Neha Gupta (Admin)', 'Suresh Patel (Citizen)'];
    
    const mockLogs = [];
    for (let i = 0; i < 50; i++) {
      const action = actions[Math.floor(Math.random() * actions.length)];
      const module = modules[Math.floor(Math.random() * modules.length)];
      const user = users[Math.floor(Math.random() * users.length)];
      const date = new Date();
      date.setDate(date.getDate() - Math.floor(Math.random() * 30));
      
      let description = '';
      switch(action) {
        case 'CREATE':
          description = `Created new ${module.toLowerCase()} item`;
          break;
        case 'UPDATE':
          description = `Updated ${module.toLowerCase()} details`;
          break;
        case 'DELETE':
          description = `Deleted ${module.toLowerCase()} record`;
          break;
        case 'LOGIN':
          description = `User logged into the system`;
          break;
        case 'LOGOUT':
          description = `User logged out of the system`;
          break;
        case 'VIEW':
          description = `Viewed ${module.toLowerCase()} data`;
          break;
        case 'EXPORT':
          description = `Exported ${module.toLowerCase()} report`;
          break;
        default:
          description = `Performed ${action} action on ${module}`;
      }
      
      mockLogs.push({
        _id: i.toString(),
        user: user,
        action: action,
        module: module,
        description: description,
        ipAddress: `192.168.1.${Math.floor(Math.random() * 255)}`,
        userAgent: 'Mozilla/5.0',
        details: { changeCount: Math.floor(Math.random() * 5) + 1 },
        createdAt: date,
        updatedAt: date
      });
    }
    return mockLogs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  useEffect(() => {
    filterLogs();
  }, [logs, search, filterAction, filterModule]);

  const filterLogs = () => {
    let filtered = [...logs];
    
    // Search filter
    if (search) {
      filtered = filtered.filter(log =>
        log.user?.toLowerCase().includes(search.toLowerCase()) ||
        log.description?.toLowerCase().includes(search.toLowerCase()) ||
        log.module?.toLowerCase().includes(search.toLowerCase()) ||
        log.action?.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    // Action filter
    if (filterAction !== 'all') {
      filtered = filtered.filter(log => log.action === filterAction);
    }
    
    // Module filter
    if (filterModule !== 'all') {
      filtered = filtered.filter(log => log.module === filterModule);
    }
    
    setFilteredLogs(filtered);
    setPage(1);
  };

  const clearFilters = () => {
    setSearch("");
    setFilterAction("all");
    setFilterModule("all");
  };

  const getColor = (action) => {
    switch(action) {
      case "DELETE": return colors.danger;
      case "CREATE": return colors.secondary;
      case "UPDATE": return colors.warning;
      case "LOGIN": return colors.info;
      case "LOGOUT": return colors.gray;
      case "VIEW": return colors.purple;
      case "EXPORT": return colors.pink;
      default: return colors.primary;
    }
  };

  const getIcon = (action) => {
    switch(action) {
      case "DELETE": return <DeleteIcon />;
      case "CREATE": return <AddIcon />;
      case "UPDATE": return <EditIcon />;
      case "LOGIN": return <LoginIcon />;
      case "LOGOUT": return <LogoutIcon />;
      case "VIEW": return <VisibilityIcon />;
      case "EXPORT": return <DownloadIcon />;
      default: return <HistoryIcon />;
    }
  };

  const getModuleIcon = (module) => {
    switch(module) {
      case "User Management": return <PersonIcon />;
      case "Bin Management": return <LocationIcon />;
      case "Recycling Center": return <StoreIcon />;
      case "Reports": return <AnalyticsIcon />;
      case "Settings": return <SettingsIcon />;
      default: return <DeviceIcon />;
    }
  };

  // Statistics calculations
  const totalLogs = logs.length;
  const uniqueUsers = [...new Set(logs.map(l => l.user))].length;
  const actionsByType = {
    CREATE: logs.filter(l => l.action === "CREATE").length,
    UPDATE: logs.filter(l => l.action === "UPDATE").length,
    DELETE: logs.filter(l => l.action === "DELETE").length,
    LOGIN: logs.filter(l => l.action === "LOGIN").length,
    VIEW: logs.filter(l => l.action === "VIEW").length,
    EXPORT: logs.filter(l => l.action === "EXPORT").length
  };
  
  const modulesByActivity = {};
  logs.forEach(log => {
    modulesByActivity[log.module] = (modulesByActivity[log.module] || 0) + 1;
  });
  
  const topModules = Object.entries(modulesByActivity)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
  
  const todayLogs = logs.filter(l => {
    const today = new Date();
    const logDate = new Date(l.createdAt);
    return logDate.toDateString() === today.toDateString();
  }).length;
  
  const weekLogs = logs.filter(l => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return new Date(l.createdAt) >= weekAgo;
  }).length;

  const paginatedLogs = filteredLogs.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  const exportLogs = async () => {
    setExportLoading(true);
    try {
      const exportData = filteredLogs.map(log => ({
        'User': log.user,
        'Action': log.action,
        'Module': log.module,
        'Description': log.description,
        'IP Address': log.ipAddress || 'N/A',
        'Time': new Date(log.createdAt).toLocaleString()
      }));
      
      const headers = Object.keys(exportData[0] || {});
      const csv = [
        headers.join(','),
        ...exportData.map(row => headers.map(h => `"${row[h] || ''}"`).join(','))
      ].join('\n');
      
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      
      toast.success('Audit logs exported successfully');
    } catch (error) {
      toast.error('Export failed');
    } finally {
      setExportLoading(false);
    }
  };

  const statCards = [
    { title: "Total Events", value: totalLogs, icon: <HistoryIcon />, color: colors.primary, trend: "+" + weekLogs, trendUp: true, subtitle: "Last 7 days: " + weekLogs },
    { title: "Unique Users", value: uniqueUsers, icon: <PersonIcon />, color: colors.purple, trend: "+2", trendUp: true, subtitle: "Active participants" },
    { title: "Today's Activity", value: todayLogs, icon: <CalendarIcon />, color: colors.info, trend: todayLogs > 0 ? "+" + todayLogs : "0", trendUp: todayLogs > 0, subtitle: "Events recorded today" },
    { title: "Creates", value: actionsByType.CREATE, icon: <AddIcon />, color: colors.secondary, trend: "+" + actionsByType.CREATE, trendUp: true, subtitle: "New records" },
    { title: "Updates", value: actionsByType.UPDATE, icon: <EditIcon />, color: colors.warning, trend: "+" + actionsByType.UPDATE, trendUp: true, subtitle: "Modified records" },
    { title: "Deletions", value: actionsByType.DELETE, icon: <DeleteIcon />, color: colors.danger, trend: "-" + actionsByType.DELETE, trendUp: false, subtitle: "Removed records" }
  ];

  const uniqueModules = [...new Set(logs.map(l => l.module))];
  const uniqueActions = [...new Set(logs.map(l => l.action))];

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Skeleton variant="rectangular" height={120} sx={{ borderRadius: 3 }} />
        </Box>
        <Grid container spacing={3}>
          {[1,2,3,4,5,6].map((i) => (
            <Grid item xs={12} sm={6} md={4} lg={2} key={i}>
              <Skeleton variant="rectangular" height={140} sx={{ borderRadius: 3 }} />
            </Grid>
          ))}
        </Grid>
        <Skeleton variant="rectangular" height={400} sx={{ mt: 3, borderRadius: 3 }} />
      </Container>
    );
  }

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      background: `linear-gradient(135deg, ${alphaColor(colors.primary, 0.03)} 0%, ${alphaColor(colors.purple, 0.02)} 100%)`,
      pb: 6
    }}>
      <Container maxWidth="xl" sx={{ pt: 3 }}>
        <motion.div variants={staggerContainer} initial="hidden" animate="visible">
          
          {/* Hero Header */}
          <motion.div variants={fadeInUp}>
            <Paper elevation={0} sx={{ 
              p: 4, 
              mb: 4, 
              borderRadius: 4,
              background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.purple} 100%)`,
              color: 'white',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <Box sx={{ position: 'relative', zIndex: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
                  <Box>
                    <Typography variant="overline" sx={{ opacity: 0.9, letterSpacing: 2 }}>
                      Security & Compliance
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 800, mt: 1, mb: 1 }}>
                      📜 Audit Logs Dashboard
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9, maxWidth: 600 }}>
                      Complete history of all system activities, user actions, and data changes
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button 
                      variant="contained" 
                      startIcon={<DownloadIcon />}
                      onClick={exportLogs}
                      disabled={exportLoading || filteredLogs.length === 0}
                      sx={{ 
                        bgcolor: 'rgba(255,255,255,0.2)', 
                        backdropFilter: 'blur(10px)',
                        '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' }
                      }}
                    >
                      {exportLoading ? 'Exporting...' : 'Export Logs'}
                    </Button>
                    <Button 
                      variant="contained" 
                      startIcon={<RefreshIcon />}
                      onClick={fetchLogs}
                      sx={{ 
                        bgcolor: 'rgba(255,255,255,0.2)', 
                        backdropFilter: 'blur(10px)',
                        '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' }
                      }}
                    >
                      Refresh
                    </Button>
                  </Box>
                </Box>
              </Box>
              <Box sx={{ position: 'absolute', right: -50, top: -50, opacity: 0.1 }}>
                <SecurityIcon sx={{ fontSize: 200 }} />
              </Box>
            </Paper>
          </motion.div>

          {/* Stats Cards */}
          <Grid container spacing={2.5} sx={{ mb: 4 }}>
            {statCards.map((stat, i) => (
              <Grid item xs={12} sm={6} md={4} lg={2} key={i}>
                <motion.div variants={fadeInUp} whileHover="hover">
                  <Card component={motion.div} variants={cardHover} sx={{ borderRadius: 3, position: 'relative', overflow: 'visible' }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <Box>
                          <Typography sx={{ fontSize: '0.65rem', fontWeight: 600, color: colors.gray, textTransform: 'uppercase', letterSpacing: 1 }}>
                            {stat.title}
                          </Typography>
                          <Typography sx={{ fontSize: '1.8rem', fontWeight: 800, color: colors.dark, mt: 1 }}>
                            {stat.value}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {stat.subtitle}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 1 }}>
                            {stat.trendUp ? 
                              <TrendingUpIcon sx={{ fontSize: 12, color: colors.secondary }} /> : 
                              <TrendingDownIcon sx={{ fontSize: 12, color: colors.danger }} />
                            }
                            <Typography variant="caption" sx={{ color: stat.trendUp ? colors.secondary : colors.danger, fontWeight: 600 }}>
                              {stat.trend}
                            </Typography>
                          </Box>
                        </Box>
                        <Avatar sx={{ 
                          width: 48, 
                          height: 48, 
                          bgcolor: alphaColor(stat.color, 0.1), 
                          color: stat.color
                        }}>
                          {stat.icon}
                        </Avatar>
                      </Box>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>

          {/* Filters Section */}
          <Paper sx={{ p: 3, mb: 3, borderRadius: 3 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Search by user, action, module..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  InputProps={{
                    startAdornment: <SearchIcon sx={{ color: colors.gray, mr: 1, fontSize: 20 }} />,
                    endAdornment: search && (
                      <IconButton size="small" onClick={() => setSearch('')}>
                        <ClearIcon fontSize="small" />
                      </IconButton>
                    )
                  }}
                />
              </Grid>
              <Grid item xs={12} md={2}>
                <FormControl fullWidth size="small">
                  <InputLabel>Action Type</InputLabel>
                  <Select
                    value={filterAction}
                    label="Action Type"
                    onChange={(e) => setFilterAction(e.target.value)}
                  >
                    <MenuItem value="all">All Actions</MenuItem>
                    {uniqueActions.map(action => (
                      <MenuItem key={action} value={action}>{action}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={2}>
                <FormControl fullWidth size="small">
                  <InputLabel>Module</InputLabel>
                  <Select
                    value={filterModule}
                    label="Module"
                    onChange={(e) => setFilterModule(e.target.value)}
                  >
                    <MenuItem value="all">All Modules</MenuItem>
                    {uniqueModules.map(module => (
                      <MenuItem key={module} value={module}>{module}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={2}>
                <Button 
                  fullWidth
                  variant="outlined" 
                  startIcon={<ClearIcon />}
                  onClick={clearFilters}
                  sx={{ height: 40 }}
                >
                  Clear Filters
                </Button>
              </Grid>
              <Grid item xs={12} md={2}>
                <Badge badgeContent={filteredLogs.length} color="primary" sx={{ width: '100%' }}>
                  <Button 
                    fullWidth
                    variant="contained" 
                    startIcon={<FilterListIcon />}
                    sx={{ bgcolor: colors.primary, height: 40 }}
                  >
                    {filteredLogs.length} Results
                  </Button>
                </Badge>
              </Grid>
            </Grid>
          </Paper>

          {/* Tabs for different views */}
          <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)} sx={{ mb: 3, borderBottom: `1px solid ${alphaColor(colors.primary, 0.1)}` }}>
            <Tab icon={<HistoryIcon />} iconPosition="start" label="All Activities" />
            <Tab icon={<AnalyticsIcon />} iconPosition="start" label="Analytics" />
            <Tab icon={<SecurityIcon />} iconPosition="start" label="Security Insights" />
          </Tabs>

          {/* All Activities Tab */}
          {activeTab === 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <Paper sx={{ borderRadius: 3, overflow: 'hidden' }}>
                <TableContainer sx={{ maxHeight: 500 }}>
                  <Table stickyHeader>
                    <TableHead>
                      <TableRow sx={{ bgcolor: colors.light }}>
                        <TableCell sx={{ fontWeight: 700 }}>User</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Action</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Module</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Description</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>IP Address</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Time</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      <AnimatePresence>
                        {paginatedLogs.map((log, index) => (
                          <motion.tr
                            key={log._id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ delay: index * 0.03 }}
                            style={{ backgroundColor: index % 2 === 0 ? 'transparent' : alphaColor(colors.primary, 0.02) }}
                          >
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Avatar sx={{ width: 32, height: 32, bgcolor: alphaColor(colors.primary, 0.1) }}>
                                  <PersonIcon sx={{ fontSize: 16 }} />
                                </Avatar>
                                <Typography variant="body2">{log.user}</Typography>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Chip
                                icon={getIcon(log.action)}
                                label={log.action}
                                size="small"
                                sx={{ 
                                  bgcolor: alphaColor(getColor(log.action), 0.1), 
                                  color: getColor(log.action),
                                  fontWeight: 500
                                }}
                              />
                            </TableCell>
                            <TableCell>
                              <Chip
                                icon={getModuleIcon(log.module)}
                                label={log.module}
                                size="small"
                                variant="outlined"
                              />
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2">{log.description}</Typography>
                              {log.details?.changeCount && (
                                <Typography variant="caption" color="text.secondary">
                                  {log.details.changeCount} field(s) changed
                                </Typography>
                              )}
                            </TableCell>
                            <TableCell>
                              <Typography variant="caption" sx={{ fontFamily: 'monospace' }}>
                                {log.ipAddress || 'N/A'}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Tooltip title={new Date(log.createdAt).toLocaleString()}>
                                <Typography variant="caption">
                                  {new Date(log.createdAt).toLocaleDateString()} {new Date(log.createdAt).toLocaleTimeString()}
                                </Typography>
                              </Tooltip>
                            </TableCell>
                          </motion.tr>
                        ))}
                      </AnimatePresence>
                      {paginatedLogs.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                            <SecurityIcon sx={{ fontSize: 64, color: alphaColor(colors.primary, 0.2), mb: 2 }} />
                            <Typography variant="h6" color="text.secondary">No audit logs found</Typography>
                            <Typography variant="body2" color="text.secondary">Try adjusting your filters</Typography>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
                
                {/* Pagination */}
                {filteredLogs.length > 0 && (
                  <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: `1px solid ${alphaColor(colors.gray, 0.1)}` }}>
                    <Typography variant="caption" color="text.secondary">
                      Showing {((page - 1) * rowsPerPage) + 1} to {Math.min(page * rowsPerPage, filteredLogs.length)} of {filteredLogs.length} entries
                    </Typography>
                    <Pagination
                      count={Math.ceil(filteredLogs.length / rowsPerPage)}
                      page={page}
                      onChange={(e, v) => setPage(v)}
                      color="primary"
                    />
                    <FormControl size="small" sx={{ minWidth: 80 }}>
                      <Select
                        value={rowsPerPage}
                        onChange={(e) => { setRowsPerPage(e.target.value); setPage(1); }}
                      >
                        <MenuItem value={10}>10</MenuItem>
                        <MenuItem value={25}>25</MenuItem>
                        <MenuItem value={50}>50</MenuItem>
                      </Select>
                    </FormControl>
                  </Box>
                )}
              </Paper>
            </motion.div>
          )}

          {/* Analytics Tab */}
          {activeTab === 1 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 3, borderRadius: 3 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>📊 Action Distribution</Typography>
                    <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
                      {Object.entries(actionsByType).map(([action, count]) => (
                        <Box key={action} sx={{ mb: 2 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                            <Typography variant="body2">{action}</Typography>
                            <Typography variant="body2" fontWeight={600}>{count}</Typography>
                          </Box>
                          <LinearProgress 
                            variant="determinate" 
                            value={totalLogs > 0 ? (count / totalLogs) * 100 : 0} 
                            sx={{ 
                              height: 8, 
                              borderRadius: 4,
                              bgcolor: alphaColor(getColor(action), 0.1),
                              '& .MuiLinearProgress-bar': { bgcolor: getColor(action) }
                            }} 
                          />
                        </Box>
                      ))}
                    </Box>
                  </Paper>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 3, borderRadius: 3 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>📦 Top Active Modules</Typography>
                    {topModules.map(([module, count], i) => (
                      <Box key={module} sx={{ mb: 2, p: 1.5, bgcolor: alphaColor(colors.primary, 0.03), borderRadius: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Avatar sx={{ width: 28, height: 28, bgcolor: alphaColor(colors.primary, 0.1) }}>
                              {getModuleIcon(module)}
                            </Avatar>
                            <Typography variant="body2">{module}</Typography>
                          </Box>
                          <Typography variant="h6" fontWeight={700}>{count}</Typography>
                        </Box>
                      </Box>
                    ))}
                  </Paper>
                </Grid>
              </Grid>
            </motion.div>
          )}

          {/* Security Insights Tab */}
          {activeTab === 2 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Paper sx={{ p: 3, borderRadius: 3, bgcolor: alphaColor(colors.warning, 0.05) }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                      <WarningIcon sx={{ color: colors.warning }} />
                      Security Recommendations
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={4}>
                        <Box sx={{ p: 2, bgcolor: 'white', borderRadius: 2 }}>
                          <Typography variant="subtitle2" fontWeight={600}>🔐 Review Suspicious Logins</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {logs.filter(l => l.action === 'LOGIN').length} login attempts recorded. Review unusual patterns.
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <Box sx={{ p: 2, bgcolor: 'white', borderRadius: 2 }}>
                          <Typography variant="subtitle2" fontWeight={600}>🗑️ Monitor Deletions</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {actionsByType.DELETE} deletion operations. Ensure they're authorized.
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <Box sx={{ p: 2, bgcolor: 'white', borderRadius: 2 }}>
                          <Typography variant="subtitle2" fontWeight={600}>📊 Export Tracking</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {actionsByType.EXPORT} data exports. Monitor sensitive data access.
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>
                  </Paper>
                </Grid>
              </Grid>
            </motion.div>
          )}
        </motion.div>
      </Container>
    </Box>
  );
}

export default AuditLogs;