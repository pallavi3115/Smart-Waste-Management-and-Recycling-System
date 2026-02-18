import React from 'react';
import { Alert, AlertTitle, Box, Button } from '@mui/material';

const ErrorAlert = ({ message, onRetry }) => {
  return (
    <Box sx={{ p: 3, display: 'flex', justifyContent: 'center' }}>
      <Alert 
        severity="error"
        sx={{ maxWidth: 600 }}
        action={
          onRetry && (
            <Button color="inherit" size="small" onClick={onRetry}>
              Retry
            </Button>
          )
        }
      >
        <AlertTitle>Error</AlertTitle>
        {message || 'An error occurred. Please try again.'}
      </Alert>
    </Box>
  );
};

export default ErrorAlert;