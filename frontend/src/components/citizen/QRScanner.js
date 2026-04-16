import React, { useState, useRef, useEffect } from 'react';
import {
  Container,
  Typography,
  Paper,
  Button,
  Box,
  Alert,
  Card,
  CardContent,
  Chip,
  LinearProgress,
  useTheme,
  alpha,
  IconButton,
  Tooltip,
  Stack,
  Avatar,
  CircularProgress
} from '@mui/material';
import {
  QrCodeScanner,
  CameraAlt,
  CheckCircle,
  Info,
  LocationOn,
  Delete,
  Schedule,
  Close,
  Refresh,
  FlipCameraAndroid
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import Webcam from 'react-webcam';
import jsQR from 'jsqr';
import { showSuccess, showError } from '../../utils/toast';
import { useNavigate } from 'react-router-dom';

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 }
  }
};

const QRScanner = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const webcamRef = useRef(null);
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [facingMode, setFacingMode] = useState('environment');
  const [cameraReady, setCameraReady] = useState(false);
  const [scanningInterval, setScanningInterval] = useState(null);

  useEffect(() => {
    return () => {
      if (scanningInterval) {
        clearInterval(scanningInterval);
      }
    };
  }, [scanningInterval]);

  const captureAndScan = () => {
    if (!scanning || !webcamRef.current) return;
    
    const imageSrc = webcamRef.current.getScreenshot();
    if (!imageSrc) return;
    
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0, img.width, img.height);
      const imageData = ctx.getImageData(0, 0, img.width, img.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height);
      
      if (code) {
        // QR Code found!
        if (scanningInterval) {
          clearInterval(scanningInterval);
          setScanningInterval(null);
        }
        processQRData(code.data);
      }
    };
    
    img.src = imageSrc;
  };

  useEffect(() => {
    if (scanning && webcamRef.current) {
      // Start scanning every 500ms
      const interval = setInterval(captureAndScan, 500);
      setScanningInterval(interval);
      setCameraReady(true);
      
      return () => {
        if (interval) clearInterval(interval);
      };
    }
  }, [scanning]);

  const processQRData = async (decodedText) => {
    setScanning(false);
    setCameraReady(false);
    
    try {
      let binData;
      if (decodedText.startsWith('{')) {
        binData = JSON.parse(decodedText);
      } else {
        binData = { binId: decodedText };
      }
      
      // Mock bin details - replace with API call
      const mockBinDetails = {
        binId: binData.binId || 'BIN-123',
        location: 'Sector 12, Central Park',
        fillLevel: Math.floor(Math.random() * 100),
        lastCollected: '2 hours ago',
        type: 'General Waste',
        capacity: '1000L',
        status: 'Partial',
        address: 'Central Park, Near Gate 1, Indore',
        nextCollection: 'Today, 4:00 PM'
      };
      
      setResult(mockBinDetails);
      showSuccess('QR Code scanned successfully!');
    } catch (err) {
      showError('Invalid QR code format');
      setScanning(true);
      setCameraReady(true);
    }
  };

  const startScanner = () => {
    setError(null);
    setResult(null);
    setScanning(true);
  };

  const stopScanner = () => {
    setScanning(false);
    setCameraReady(false);
    if (scanningInterval) {
      clearInterval(scanningInterval);
      setScanningInterval(null);
    }
  };

  const switchCamera = () => {
    setFacingMode(prev => prev === 'environment' ? 'user' : 'environment');
  };

  const handleReportIssue = () => {
    navigate('/citizen/report', { state: { binId: result.binId } });
  };

  const handleViewOnMap = () => {
    navigate('/citizen/nearby');
  };

  const getStatusColor = (status) => {
    if (status === 'Full') return '#EF4444';
    if (status === 'Partial') return '#F59E0B';
    return '#10B981';
  };

  const getStatusIcon = (status) => {
    if (status === 'Full') return <Delete sx={{ color: '#EF4444' }} />;
    if (status === 'Partial') return <Schedule sx={{ color: '#F59E0B' }} />;
    return <CheckCircle sx={{ color: '#10B981' }} />;
  };

  const videoConstraints = {
    facingMode: facingMode,
    width: { ideal: 1280 },
    height: { ideal: 720 }
  };

  if (result) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Paper
            elevation={0}
            sx={{
              p: 4,
              borderRadius: 4,
              background: alpha(theme.palette.background.paper, 0.95),
              border: `1px solid ${alpha('#4F46E5', 0.1)}`,
              textAlign: 'center'
            }}
          >
            <Avatar
              sx={{
                width: 80,
                height: 80,
                margin: '0 auto 20px',
                background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                boxShadow: `0 8px 20px ${alpha('#10B981', 0.3)}`
              }}
            >
              <CheckCircle sx={{ fontSize: 48, color: 'white' }} />
            </Avatar>

            <Typography variant="h5" sx={{ fontWeight: 700, mb: 1, color: '#10B981' }}>
              QR Code Scanned!
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Bin information retrieved successfully
            </Typography>

            <Card
              elevation={0}
              sx={{
                mb: 3,
                borderRadius: 3,
                background: alpha('#4F46E5', 0.03),
                border: `1px solid ${alpha('#4F46E5', 0.1)}`,
                textAlign: 'left'
              }}
            >
              <CardContent>
                <Stack spacing={2}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                      Bin #{result.binId}
                    </Typography>
                    <Chip
                      icon={getStatusIcon(result.status)}
                      label={result.status}
                      sx={{ bgcolor: alpha(getStatusColor(result.status), 0.1), color: getStatusColor(result.status), fontWeight: 600 }}
                    />
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LocationOn sx={{ fontSize: 18, color: '#4F46E5' }} />
                    <Typography variant="body2">{result.location}</Typography>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Info sx={{ fontSize: 18, color: '#4F46E5' }} />
                    <Typography variant="body2">{result.address}</Typography>
                  </Box>

                  <Box>
                    <Typography variant="caption" sx={{ fontWeight: 600 }}>Fill Level</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                      <Box sx={{ flex: 1 }}>
                        <LinearProgress
                          variant="determinate"
                          value={result.fillLevel}
                          sx={{
                            height: 8,
                            borderRadius: 4,
                            bgcolor: alpha(getStatusColor(result.status), 0.2),
                            '& .MuiLinearProgress-bar': { bgcolor: getStatusColor(result.status), borderRadius: 4 }
                          }}
                        />
                      </Box>
                      <Typography variant="body2" fontWeight={600}>{result.fillLevel}%</Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography variant="caption" color="text.secondary">Type</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>{result.type}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">Capacity</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>{result.capacity}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">Last Collected</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>{result.lastCollected}</Typography>
                    </Box>
                  </Box>

                  <Box sx={{ bgcolor: alpha('#4F46E5', 0.05), p: 1.5, borderRadius: 2 }}>
                    <Typography variant="caption" sx={{ fontWeight: 600 }}>Next Collection</Typography>
                    <Typography variant="body2">{result.nextCollection}</Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>

            <Stack direction="row" spacing={2}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<LocationOn />}
                onClick={handleViewOnMap}
                sx={{ borderRadius: 2, borderColor: alpha('#4F46E5', 0.5), color: '#4F46E5' }}
              >
                View on Map
              </Button>
              <Button
                fullWidth
                variant="contained"
                startIcon={<Delete />}
                onClick={handleReportIssue}
                sx={{ borderRadius: 2, bgcolor: '#4F46E5' }}
              >
                Report Issue
              </Button>
            </Stack>

            <Button
              variant="text"
              startIcon={<Refresh />}
              onClick={() => {
                setResult(null);
                startScanner();
              }}
              sx={{ mt: 2, color: '#4F46E5' }}
            >
              Scan Another QR Code
            </Button>
          </Paper>
        </motion.div>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <motion.div variants={fadeInUp}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              QR Scanner
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Scan QR code on bins to get information and report issues
            </Typography>
          </Box>
        </motion.div>

        {/* Scanner Area */}
        <motion.div variants={fadeInUp}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 4,
              background: alpha(theme.palette.background.paper, 0.95),
              border: `1px solid ${alpha('#4F46E5', 0.1)}`,
              textAlign: 'center'
            }}
          >
            {error && (
              <Alert 
                severity="error" 
                sx={{ mb: 3, borderRadius: 2 }}
                action={
                  <Button color="inherit" size="small" onClick={startScanner}>
                    Retry
                  </Button>
                }
              >
                {error}
              </Alert>
            )}

            {!scanning ? (
              <Box sx={{ py: 4 }}>
                <Avatar
                  sx={{
                    width: 100,
                    height: 100,
                    margin: '0 auto 20px',
                    background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
                    boxShadow: `0 8px 20px ${alpha('#4F46E5', 0.3)}`
                  }}
                >
                  <QrCodeScanner sx={{ fontSize: 50, color: 'white' }} />
                </Avatar>
                
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                  Ready to Scan
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Position the QR code within the frame to scan
                </Typography>
                
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<CameraAlt />}
                  onClick={startScanner}
                  sx={{
                    borderRadius: 2,
                    px: 4,
                    py: 1.5,
                    background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 8px 20px rgba(79, 70, 229, 0.4)'
                    }
                  }}
                >
                  Start Scanning
                </Button>
              </Box>
            ) : (
              <Box>
                <Box
                  sx={{
                    position: 'relative',
                    width: '100%',
                    maxWidth: 400,
                    margin: '0 auto',
                    borderRadius: 2,
                    overflow: 'hidden',
                    backgroundColor: '#000',
                    minHeight: 300,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Webcam
                    audio={false}
                    ref={webcamRef}
                    screenshotFormat="image/jpeg"
                    videoConstraints={videoConstraints}
                    onUserMedia={() => setCameraReady(true)}
                    onUserMediaError={() => {
                      setError('Unable to access camera. Please check permissions.');
                      setScanning(false);
                    }}
                    style={{
                      width: '100%',
                      height: 'auto',
                      objectFit: 'cover'
                    }}
                  />
                  
                  {/* Viewfinder overlay */}
                  <Box
                    sx={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      width: 200,
                      height: 200,
                      border: '2px solid rgba(255,255,255,0.8)',
                      borderRadius: 2,
                      boxShadow: '0 0 0 9999px rgba(0,0,0,0.5)',
                      pointerEvents: 'none'
                    }}
                  />
                  
                  {!cameraReady && (
                    <Box sx={{ position: 'absolute', textAlign: 'center', color: 'white' }}>
                      <CircularProgress sx={{ color: 'white' }} />
                      <Typography sx={{ mt: 2 }}>Initializing camera...</Typography>
                    </Box>
                  )}
                </Box>
                
                {/* Scanner Controls */}
                <Stack direction="row" spacing={2} justifyContent="center" sx={{ mt: 3 }}>
                  <Tooltip title="Switch Camera">
                    <span>
                      <IconButton
                        onClick={switchCamera}
                        sx={{ bgcolor: alpha('#4F46E5', 0.1), color: '#4F46E5' }}
                      >
                        <FlipCameraAndroid />
                      </IconButton>
                    </span>
                  </Tooltip>
                  <Tooltip title="Stop Scanning">
                    <span>
                      <IconButton
                        onClick={stopScanner}
                        sx={{ bgcolor: alpha('#EF4444', 0.1), color: '#EF4444' }}
                      >
                        <Close />
                      </IconButton>
                    </span>
                  </Tooltip>
                </Stack>
                
                <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
                  Align QR code within the white frame
                </Typography>
              </Box>
            )}
          </Paper>
        </motion.div>

        {/* Instructions */}
        <motion.div variants={fadeInUp}>
          <Paper
            elevation={0}
            sx={{
              mt: 3,
              p: 3,
              borderRadius: 4,
              background: alpha(theme.palette.background.paper, 0.95),
              border: `1px solid ${alpha('#4F46E5', 0.1)}`
            }}
          >
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Info sx={{ color: '#4F46E5' }} />
              How to Scan
            </Typography>
            <Stack spacing={1.5}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{ width: 24, height: 24, borderRadius: '50%', bgcolor: alpha('#4F46E5', 0.1), color: '#4F46E5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 600 }}>1</Box>
                <Typography variant="body2">Click "Start Scanning" to activate camera</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{ width: 24, height: 24, borderRadius: '50%', bgcolor: alpha('#4F46E5', 0.1), color: '#4F46E5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 600 }}>2</Box>
                <Typography variant="body2">Allow camera permissions when prompted</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{ width: 24, height: 24, borderRadius: '50%', bgcolor: alpha('#4F46E5', 0.1), color: '#4F46E5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 600 }}>3</Box>
                <Typography variant="body2">Point camera at the QR code on the bin</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{ width: 24, height: 24, borderRadius: '50%', bgcolor: alpha('#4F46E5', 0.1), color: '#4F46E5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 600 }}>4</Box>
                <Typography variant="body2">View bin details and report issues if needed</Typography>
              </Box>
            </Stack>
          </Paper>
        </motion.div>
      </motion.div>
    </Container>
  );
};

export default QRScanner;