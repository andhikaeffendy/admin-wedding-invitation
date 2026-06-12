"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Scan, Search, Check, AlertTriangle, X, Camera, User, Gift, History, Wifi, WifiOff, Upload } from "lucide-react";
import { getGuestByToken } from "@/lib/dummy-data";
import { addToOfflineQueue, getOfflineQueueCount, syncOfflineQueue, onOnlineChange, isOnline } from "@/lib/scanner/offline-queue";
import CameraScanner from "@/components/CameraScanner";
import type { ScanResult } from "@/lib/types";

export default function ScannerPage() {
  const [mode, setMode] = useState<'camera' | 'manual'>('manual');
  const [searchToken, setSearchToken] = useState("");
  const [result, setResult] = useState<ScanResult | null>(null);
  const [scanning, setScanning] = useState(false);
  const [online, setOnline] = useState(true);
  const [queueCount, setQueueCount] = useState(0);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    setOnline(isOnline());
    setQueueCount(getOfflineQueueCount());
    return onOnlineChange((on) => {
      setOnline(on);
      if (on && getOfflineQueueCount() > 0) handleSync();
    });
  }, []);

  const handleScan = async () => {
    if (!searchToken.trim()) return;
    let token = searchToken.trim();
    // Auto-extract guest token from URL if pasted
    if (token.startsWith('http://') || token.startsWith('https://')) {
      try {
        const url = new URL(token);
        const guestParam = url.searchParams.get('guest');
        if (guestParam) token = guestParam;
      } catch {}
    }
    setScanning(true);
    try {
      const res = await fetch('/api/data/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });
      const data = await res.json();
      if (!online) {
        addToOfflineQueue(searchToken.trim(), data.status === 'SUCCESS_CHECKIN' ? 'checkin' : 'souvenir', data.guest_name);
        setQueueCount(getOfflineQueueCount());
        data.message = '📴 Offline mode. Data tersimpan lokal.';
      }
      setResult(data);
    } catch {
      setResult({ status: 'INVALID_QR', guest_name: '', category: '', pax: 0, message: 'Gagal scan. Coba lagi.' });
    }
    setScanning(false);
  };

  const handleCameraScan = async (token: string) => {
    setSearchToken(token);
    try {
      const res = await fetch('/api/data/scan', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token }) });
      const data = await res.json();
      if (!online) {
        addToOfflineQueue(token, data.status === 'SUCCESS_CHECKIN' ? 'checkin' : 'souvenir', data.guest_name);
        setQueueCount(getOfflineQueueCount());
        data.message = '📴 Offline mode.';
      }
      setResult(data);
    } catch {
      setResult({ status: 'INVALID_QR', guest_name: '', category: '', pax: 0, message: 'Gagal scan' });
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    const asyncProcess = async (token: string) => {
      const res = await fetch('/api/data/scan', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token }) });
      return await res.json();
    };
    const { synced, failed } = await syncOfflineQueue(asyncProcess);
    setQueueCount(getOfflineQueueCount());
    setSyncing(false);
  };

  const reset = () => { setResult(null); setSearchToken(""); };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'SUCCESS_CHECKIN': return { icon: Check, bg: 'bg-[#6F7F55]', text: 'Check-in Berhasil', desc: 'Tamu berhasil check-in. Selamat datang!' };
      case 'SUCCESS_SOUVENIR': return { icon: Gift, bg: 'bg-[#C9A86A]', text: 'Souvenir Berhasil', desc: 'Souvenir berhasil di-claim!' };
      case 'ALREADY_COMPLETED': return { icon: AlertTriangle, bg: 'bg-[#B86B4B]', text: 'QR Sudah Digunakan', desc: 'QR sudah digunakan 2x.' };
      default: return { icon: X, bg: 'bg-red-500', text: 'QR Tidak Valid', desc: 'QR tidak ditemukan dalam database.' };
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#22382D]">QR Scanner</h1>
          <p className="text-[#6F7F55] text-sm">Scan QR tamu untuk check-in dan souvenir</p>
        </div>
        {/* Online/Offline indicator */}
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${online ? 'bg-[#6F7F55]/10 text-[#6F7F55]' : 'bg-[#C9A86A]/10 text-[#C9A86A]'}`}>
          {online ? <Wifi size={14} /> : <WifiOff size={14} />}
          {online ? 'Online' : 'Offline'}
        </div>
      </div>

      {/* Offline Queue Banner */}
      {queueCount > 0 && (
        <div className="p-3 bg-[#C9A86A]/10 border border-[#C9A86A]/20 rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-[#C9A86A]">
            <Upload size={16} />
            <span>{queueCount} scan menunggu sync</span>
          </div>
          <button onClick={handleSync} disabled={syncing} className="btn-ghost-admin text-xs">
            {syncing ? 'Syncing...' : 'Sync Sekarang'}
          </button>
        </div>
      )}

      {/* Mode Toggle */}
      <div className="flex gap-2">
        <button onClick={() => { setMode('manual'); reset(); }} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${mode === 'manual' ? 'bg-[#22382D] text-white' : 'bg-white border border-[#22382D]/10 text-[#6F7F55]'}`}>
          <Search size={16} /> Manual Search
        </button>
        <button onClick={() => { setMode('camera'); reset(); }} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${mode === 'camera' ? 'bg-[#22382D] text-white' : 'bg-white border border-[#22382D]/10 text-[#6F7F55]'}`}>
          <Camera size={16} /> Camera Scan
        </button>
      </div>

      {/* Camera Mode */}
      {mode === 'camera' && !result && (
        <div className="card-admin">
          <CameraScanner onScan={handleCameraScan} isScanning={scanning} />
        </div>
      )}

      {/* Manual Search */}
      {mode === 'manual' && !result && (
        <div className="card-admin">
          <label className="label-admin">Masukkan Guest Token / QR Code</label>
          <div className="flex gap-2">
            <input
              value={searchToken}
              onChange={(e) => setSearchToken(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleScan()}
              placeholder="tok-xxxxxxxxxx"
              className="input-admin flex-1"
            />
            <button onClick={handleScan} disabled={scanning} className="btn-primary-admin flex items-center gap-2">
              {scanning ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Scan size={18} />}
              Scan
            </button>
          </div>
          <p className="text-xs text-[#A9B89B] mt-2">Contoh token: tok-a1b2c3d4e5</p>
        </div>
      )}

      {/* Result */}
      <AnimatePresence>
        {result && (
          <motion.div className="card-admin" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
            <div className={`${getStatusConfig(result.status).bg} -mx-5 -mt-5 p-6 rounded-t-xl text-white mb-4`}>
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    {(() => { const cfg = getStatusConfig(result.status); return <cfg.icon size={32} />; })()}
                    <h2 className="text-xl font-bold">{getStatusConfig(result.status).text}</h2>
                  </div>
                  <p className="text-white/80 text-sm">{result.message}</p>
                </div>
                <button onClick={reset} className="text-white/60 hover:text-white"><X size={20} /></button>
              </div>
            </div>
            {result.status !== 'INVALID_QR' && (
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-3 bg-[#F7F1E6] rounded-lg">
                  <User size={18} className="text-[#C9A86A] mx-auto mb-1" />
                  <p className="text-xs text-[#A9B89B]">Nama</p>
                  <p className="text-sm font-medium text-[#22382D]">{result.guest_name}</p>
                </div>
                <div className="p-3 bg-[#F7F1E6] rounded-lg">
                  <span className="text-lg">🏷️</span>
                  <p className="text-xs text-[#A9B89B]">Kategori</p>
                  <p className="text-sm font-medium text-[#22382D]">{result.category}</p>
                </div>
                <div className="p-3 bg-[#F7F1E6] rounded-lg">
                  <span className="text-lg">👥</span>
                  <p className="text-xs text-[#A9B89B]">Pax</p>
                  <p className="text-sm font-medium text-[#22382D]">{result.pax} org</p>
                </div>
              </div>
            )}
            <button onClick={reset} className="btn-primary-admin w-full mt-4 flex items-center justify-center gap-2">
              <History size={16} /> Scan Lagi
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
