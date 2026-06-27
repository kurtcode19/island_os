import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { UilQrcodeScan, UilCamera, UilCameraSlash, UilRefresh } from '@/icons';

interface QRScannerProps {
  onScan: (decodedText: string) => void;
  onError?: (error: string) => void;
  scanning?: boolean;
}

export default function QRScanner({ onScan, onError, scanning: externalScanning }: QRScannerProps) {
  const [internalScanning, setInternalScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const isScanning = externalScanning ?? internalScanning;

  useEffect(() => {
    scannerRef.current = new Html5Qrcode('qr-reader');
    return () => {
      if (scannerRef.current && scannerRef.current.getState()) {
        scannerRef.current.stop().catch(() => {});
      }
    };
  }, []);

  const startScanning = async () => {
    setError(null);
    if (!scannerRef.current) return;

    try {
      await scannerRef.current.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
          stopScanning();
          onScan(decodedText);
        },
        () => {}
      );
      setInternalScanning(true);
    } catch (err: any) {
      const msg = err?.message || 'Camera access denied or not available';
      setError(msg);
      onError?.(msg);
    }
  };

  const stopScanning = async () => {
    if (scannerRef.current && scannerRef.current.getState()) {
      try {
        await scannerRef.current.stop();
      } catch {}
    }
    setInternalScanning(false);
  };

  const toggleScanning = () => {
    if (isScanning) {
      stopScanning();
    } else {
      startScanning();
    }
  };

  return (
    <div className="w-full">
      <div className="relative bg-black rounded-[2rem] overflow-hidden aspect-square max-w-sm mx-auto mb-4">
        <div id="qr-reader" className="w-full h-full"></div>
        {!isScanning && !error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white/60 gap-4">
            <UilQrcodeScan size="48" />
            <p className="text-sm font-medium">Camera off</p>
          </div>
        )}
        {error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white/60 gap-4 p-8 text-center">
            <UilCameraSlash size="48" />
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}
      </div>

      <div className="flex justify-center">
        <button
          onClick={toggleScanning}
          className={`flex items-center gap-3 px-8 py-4 rounded-2xl font-bold text-sm transition-all ${
            isScanning
              ? 'bg-island-coral/10 text-island-coral border border-island-coral/20'
              : 'bg-island-emerald/10 text-island-emerald border border-island-emerald/20 hover:bg-island-emerald/20'
          }`}
        >
          {isScanning ? (
            <><UilCameraSlash size="20" /> Stop Scanning</>
          ) : (
            <><UilCamera size="20" /> {error ? 'Retry Camera' : 'Start Scanning'}</>
          )}
        </button>
      </div>
    </div>
  );
}
