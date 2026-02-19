import React, { useState } from 'react';
import { Container, Typography, Paper, Button, Box, Alert } from '@mui/material';
import { QrCodeScanner } from '@mui/icons-material';

const QRScanner = () => {
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState(null);

  const handleScan = () => {
    setScanning(true);
    // Simulate scanning
    setTimeout(() => {
      setResult({
        binId: 'BIN-123',
        location: 'Sector 12, Central Park',
        fillLevel: 45,
        lastCollected: '2 hours ago'
      });
      setScanning(false);
    }, 2000);
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        QR Scanner
      </Typography>
      <Typography variant="body2" color="textSecondary" paragraph>
        Scan QR code on bins to get information and report issues.
      </Typography>

      <Paper sx={{ p: 4, textAlign: 'center' }}>
        {!result ? (
          <Box>
            <QrCodeScanner sx={{ fontSize: 100, color: 'primary.main', mb: 2 }} />
            <Button 
              variant="contained" 
              size="large"
              onClick={handleScan}
              disabled={scanning}
            >
              {scanning ? 'Scanning...' : 'Start Scanning'}
            </Button>
          </Box>
        ) : (
          <Box>
            <Alert severity="success" sx={{ mb: 2 }}>
              QR Code Scanned Successfully!
            </Alert>
            <Typography variant="h6">Bin #{result.binId}</Typography>
            <Typography>Location: {result.location}</Typography>
            <Typography>Fill Level: {result.fillLevel}%</Typography>
            <Typography>Last Collected: {result.lastCollected}</Typography>
            <Button 
              variant="outlined" 
              onClick={() => setResult(null)}
              sx={{ mt: 2 }}
            >
              Scan Again
            </Button>
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default QRScanner;