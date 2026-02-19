import { useState, useEffect, useRef } from 'react';

export const useGeolocation = () => {
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timedOut, setTimedOut] = useState(false);
  
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      setLoading(false);
      return;
    }

    let timeoutId = null;
    let watchId = null;

    const successHandler = (position) => {
      if (isMounted.current) {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
        setLoading(false);
        setError(null);
        setTimedOut(false);
      }
      if (timeoutId) clearTimeout(timeoutId);
    };

    const errorHandler = (error) => {
      if (isMounted.current) {
        let errorMessage = 'Failed to get location';
        
        switch(error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location permission denied. Please enable location services.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information is unavailable.';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out. You can still submit the report without precise location.';
            setTimedOut(true);
            break;
          default:
            errorMessage = 'An unknown error occurred.';
        }
        
        setError(errorMessage);
        setLoading(false);
      }
      if (timeoutId) clearTimeout(timeoutId);
    };

    const options = {
      enableHighAccuracy: false,
      timeout: 30000,
      maximumAge: 60000
    };

    // Set a timeout to show warning if taking too long
    timeoutId = setTimeout(() => {
      if (isMounted.current && loading) {
        setTimedOut(true);
        // Don't set loading to false - keep trying in background
      }
    }, 5000);

    navigator.geolocation.getCurrentPosition(
      successHandler, 
      errorHandler, 
      options
    );

    return () => {
      isMounted.current = false;
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      if (watchId) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array is intentional - only run once on mount

  return { 
    location, 
    error, 
    loading,
    timedOut
  };
};