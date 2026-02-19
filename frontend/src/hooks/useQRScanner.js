import { useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

export const useQRScanner = () => {
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const startScanning = (elementId) => {
    setScanning(true);
    const html5QrCode = new Html5Qrcode(elementId);

    html5QrCode.start(
      { facingMode: "environment" },
      {
        fps: 10,
        qrbox: { width: 250, height: 250 }
      },
      (decodedText) => {
        setResult(decodedText);
        stopScanning();
      },
      (errorMessage) => {
        console.log(errorMessage);
      }
    ).catch((err) => {
      setError(err);
      setScanning(false);
    });

    return () => {
      html5QrCode.stop();
    };
  };

  const stopScanning = () => {
    setScanning(false);
  };

  return { scanning, result, error, startScanning, stopScanning };
};