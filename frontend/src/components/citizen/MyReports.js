import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Chip,
  Button,
  Card,
  CardContent,
  Grid,
  Avatar,
  Rating,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress,
  Alert
} from '@mui/material';
import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineDot,
  TimelineConnector,
  TimelineContent,
  TimelineOppositeContent
} from '@mui/lab';
import {
  Pending as PendingIcon,
  CheckCircle as CheckCircleIcon,
  Replay as ReplayIcon,
  Cancel as CancelIcon,
  Feedback as FeedbackIcon,
  Schedule as ScheduleIcon,
  Assignment as AssignmentIcon
} from '@mui/icons-material';
import { reportService } from '../../services/reportService';
import { formatDistance } from 'date-fns';
import Swal from 'sweetalert2';

const MyReports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState(null);
  const [feedbackDialog, setFeedbackDialog] = useState(false);
  const [feedback, setFeedback] = useState({
    rating: 5,
    comment: ''
  });

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const response = await reportService.getMyReports();
      setReports(response.data || []);
    } catch (error) {
      console.error('Error fetching reports:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to load reports'
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'PENDING': return <PendingIcon sx={{ color: '#ff9800' }} />;
      case 'ASSIGNED': return <AssignmentIcon sx={{ color: '#2196f3' }} />;
      case 'IN_PROGRESS': return <ScheduleIcon sx={{ color: '#4caf50' }} />;
      case 'RESOLVED': return <CheckCircleIcon sx={{ color: '#4caf50' }} />;
      case 'REOPENED': return <ReplayIcon sx={{ color: '#f44336' }} />;
      default: return <CancelIcon sx={{ color: '#f44336' }} />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING': return 'warning';
      case 'ASSIGNED': return 'info';
      case 'IN_PROGRESS': return 'success';
      case 'RESOLVED': return 'success';
      case 'REOPENED': return 'error';
      default: return 'default';
    }
  };

  const handleFeedback = async () => {
    try {
      await reportService.submitFeedback(selectedReport._id, feedback);
      setFeedbackDialog(false);
      Swal.fire({
        icon: 'success',
        title: 'Thank You!',
        text: 'Your feedback helps us improve our services.'
      });
      fetchReports();
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to submit feedback'
      });
    }
  };

  const calculateProgress = (report) => {
    if (report.status === 'RESOLVED') return 100;
    if (report.status === 'IN_PROGRESS') return 66;
    if (report.status === 'ASSIGNED') return 33;
    return 10;
  };

  if (loading) return <LinearProgress />;

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        My Reports
      </Typography>
      <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
        Track the status of your complaints
      </Typography>

      {reports.length === 0 ? (
        <Alert severity="info">You haven't submitted any reports yet.</Alert>
      ) : (
        <Grid container spacing={3}>
          {reports.map((report) => (
            <Grid item xs={12} key={report._id}>
              <Card>
                <CardContent>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={8}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                          {report.category?.charAt(0) || 'R'}
                        </Avatar>
                        <Box>
                          <Typography variant="h6">{report.title}</Typography>
                          <Typography variant="body2" color="textSecondary">
                            {report.category} • Reported {report.createdAt ? 
                              formatDistance(new Date(report.createdAt), new Date(), { addSuffix: true }) : 
                              'Recently'}
                          </Typography>
                        </Box>
                      </Box>

                      <Typography variant="body1" paragraph>
                        {report.description}
                      </Typography>

                      {report.media?.images && report.media.images.length > 0 && (
                        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                          <img 
                            src={report.media.images[0].url} 
                            alt="Report" 
                            style={{ width: 100, height: 100, objectFit: 'cover', borderRadius: 8 }}
                          />
                        </Box>
                      )}

                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                        <Chip
                          icon={getStatusIcon(report.status)}
                          label={report.status}
                          color={getStatusColor(report.status)}
                          size="small"
                        />
                        {report.assignedTo && (
                          <Typography variant="body2">
                            Assigned to: {report.assignedTo.name}
                          </Typography>
                        )}
                      </Box>

                      <Box sx={{ width: '100%', mb: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="body2">Resolution Progress</Typography>
                          <Typography variant="body2">{calculateProgress(report)}%</Typography>
                        </Box>
                        <LinearProgress 
                          variant="determinate" 
                          value={calculateProgress(report)}
                          color={getStatusColor(report.status)}
                        />
                      </Box>
                    </Grid>

                    <Grid item xs={12} md={4}>
                      <Paper variant="outlined" sx={{ p: 2 }}>
                        <Typography variant="subtitle2" gutterBottom>
                          Timeline
                        </Typography>
                        <Timeline>
                          <TimelineItem>
                            <TimelineOppositeContent color="textSecondary" variant="caption">
                              {report.createdAt ? 
                                formatDistance(new Date(report.createdAt), new Date(), { addSuffix: true }) : 
                                'Recently'}
                            </TimelineOppositeContent>
                            <TimelineSeparator>
                              <TimelineDot color="primary">
                                <PendingIcon fontSize="small" />
                              </TimelineDot>
                              <TimelineConnector />
                            </TimelineSeparator>
                            <TimelineContent>Reported</TimelineContent>
                          </TimelineItem>
                          
                          {report.status !== 'PENDING' && (
                            <TimelineItem>
                              <TimelineOppositeContent color="textSecondary" variant="caption">
                                {report.assignedAt ? 
                                  formatDistance(new Date(report.assignedAt), new Date(), { addSuffix: true }) : 
                                  'Recently'}
                              </TimelineOppositeContent>
                              <TimelineSeparator>
                                <TimelineDot color="info">
                                  <AssignmentIcon fontSize="small" />
                                </TimelineDot>
                                <TimelineConnector />
                              </TimelineSeparator>
                              <TimelineContent>Assigned</TimelineContent>
                            </TimelineItem>
                          )}

                          {report.status === 'IN_PROGRESS' && (
                            <TimelineItem>
                              <TimelineOppositeContent color="textSecondary" variant="caption">
                                In Progress
                              </TimelineOppositeContent>
                              <TimelineSeparator>
                                <TimelineDot color="success">
                                  <ScheduleIcon fontSize="small" />
                                </TimelineDot>
                                <TimelineConnector />
                              </TimelineSeparator>
                              <TimelineContent>In Progress</TimelineContent>
                            </TimelineItem>
                          )}

                          {report.status === 'RESOLVED' && (
                            <TimelineItem>
                              <TimelineOppositeContent color="textSecondary" variant="caption">
                                {report.resolvedAt ? 
                                  formatDistance(new Date(report.resolvedAt), new Date(), { addSuffix: true }) : 
                                  'Recently'}
                              </TimelineOppositeContent>
                              <TimelineSeparator>
                                <TimelineDot color="success">
                                  <CheckCircleIcon fontSize="small" />
                                </TimelineDot>
                              </TimelineSeparator>
                              <TimelineContent>Resolved</TimelineContent>
                            </TimelineItem>
                          )}
                        </Timeline>

                        {report.status === 'RESOLVED' && !report.citizenFeedback && (
                          <Button
                            variant="outlined"
                            startIcon={<FeedbackIcon />}
                            fullWidth
                            onClick={() => {
                              setSelectedReport(report);
                              setFeedbackDialog(true);
                            }}
                            sx={{ mt: 2 }}
                          >
                            Rate Resolution
                          </Button>
                        )}

                        {report.citizenFeedback && (
                          <Box sx={{ mt: 2 }}>
                            <Typography variant="subtitle2">Your Feedback</Typography>
                            <Rating value={report.citizenFeedback.rating} readOnly size="small" />
                            <Typography variant="body2">{report.citizenFeedback.comment}</Typography>
                          </Box>
                        )}
                      </Paper>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Feedback Dialog */}
      <Dialog open={feedbackDialog} onClose={() => setFeedbackDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Rate Resolution</DialogTitle>
        <DialogContent>
          <Box sx={{ textAlign: 'center', my: 2 }}>
            <Typography variant="h6" gutterBottom>
              How satisfied are you with the resolution?
            </Typography>
            <Rating
              value={feedback.rating}
              onChange={(e, newValue) => setFeedback({ ...feedback, rating: newValue })}
              size="large"
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Additional Comments"
              multiline
              rows={4}
              value={feedback.comment}
              onChange={(e) => setFeedback({ ...feedback, comment: e.target.value })}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFeedbackDialog(false)}>Cancel</Button>
          <Button onClick={handleFeedback} variant="contained" color="primary">
            Submit Feedback
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default MyReports;