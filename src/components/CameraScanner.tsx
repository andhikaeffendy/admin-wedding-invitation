"use client";
import { useEffect, useRef, useState } from 'react';
import { Camera, CameraOff, AlertCircle } from 'lucide-react';

interface CameraScannerProps {
  onScan: (token: string) => void;
  isScanning: boolean;
}

export default function CameraScanner({ onScan, isScanning }: CameraScannerProps) {
  const [hasCamera, setHasCamera] = useState(false);
  const [error, setError] = useState('');
  const [isActive, setIsActive] = useState(false);
  const scannerRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check camera availability
    if (typeof window !== 'undefined' && 'mediaDevices' in navigator) {
      navigator.mediaDevices.enumerateDevices()
        .then(devices => setHasCamera(devices.some(d => d.kind === 'videoinput')))
        .catch(() => setHasCamera(false));
    }

    return () => {
      if (scannerRef.current) {
        try { scannerRef.current.stop(); } catch (e) {}
      }
    };
  }, []);

  const startScanner = async () => {
    setError('');
    setIsActive(true);

    try {
      const { Html5Qrcode } = await import('html5-qrcode');
      const scanner = new Html5Qrcode('camera-scanner-viewport');
      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText: string) => {
          // Extract guest token from various QR payload formats
          let token = decodedText;
          try {
            // Try JSON payload first (old format: {guest_token: "xxx"})
            const payload = JSON.parse(decodedText);
            if (payload.guest_token) token = payload.guest_token;
            else if (payload.token) token = payload.token;
            else if (payload.guestToken) token = payload.guestToken;
          } catch {
            // Not JSON — try URL format: /i/slug?guest=tok-xxx
            try {
              const url = new URL(decodedText);
              const guestParam = url.searchParams.get('guest');
              if (guestParam) token = guestParam;
            } catch {
              // Not a URL either — use raw text
            }
          }
          stopScanner();
          onScan(token);
        },
        () => {} // ignore errors during scan
      );
    } catch (err: any) {
      setError('Tidak dapat mengakses kamera: ' + (err.message || 'Unknown error'));
      setIsActive(false);
    }
  };

  const stopScanner = () => {
    if (scannerRef.current) {
      try {
        scannerRef.current.stop();
      } catch (e) {}
    }
    setIsActive(false);
  };

  if (!hasCamera) {
    return (
      <div className="p-8 text-center">
        <CameraOff size={40} className="text-[#A9B89B] mx-auto mb-3" />
        <p className="text-[#6F7F55] text-sm">Kamera tidak tersedia</p>
        <p className="text-[#A9B89B] text-xs mt-1">Gunakan manual search untuk scan QR</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {error && (
        <div className="p-3 bg-[#B86B4B]/10 border border-[#B86B4B]/20 rounded-lg flex items-center gap-2 text-sm text-[#B86B4B]">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      <div
        ref={containerRef}
        id="camera-scanner-viewport"
        className={`aspect-square rounded-xl overflow-hidden bg-[#22382D] ${isActive ? '' : 'flex items-center justify-center'}`}
      >
        {!isActive && (
          <div className="text-center">
            <Camera size={48} className="text-[#A9B89B] mx-auto mb-2" />
            <p className="text-[#A9B89B] text-sm mb-3">Arahkan kamera ke QR Code tamu</p>
            <button
              onClick={startScanner}
              disabled={isScanning}
              className="btn-primary-admin text-sm"
            >
              {isScanning ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Scanning...
                </div>
              ) : (
                'Aktifkan Kamera'
              )}
            </button>
          </div>
        )}
      </div>

      {isActive && (
        <button onClick={stopScanner} className="btn-outline-admin w-full text-sm">
          <CameraOff size={16} className="inline mr-1" /> Matikan Kamera
        </button>
      )}
    </div>
  );
}
