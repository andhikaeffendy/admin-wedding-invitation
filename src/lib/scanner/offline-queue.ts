// Offline Scanner Queue - stores scans locally when offline, syncs when online
export interface OfflineScanRecord {
  id: string;
  guestToken: string;
  scanType: 'checkin' | 'souvenir';
  scannedAt: string;
  synced: boolean;
  guestName?: string;
}

const STORAGE_KEY = 'wedding-offline-queue';

function getQueue(): OfflineScanRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveQueue(queue: OfflineScanRecord[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
}

export function addToOfflineQueue(guestToken: string, scanType: 'checkin' | 'souvenir', guestName?: string): OfflineScanRecord {
  const queue = getQueue();
  const record: OfflineScanRecord = {
    id: `offline-${Date.now()}-${globalThis.crypto.randomUUID().replace(/-/g, '').slice(0, 8)}`,
    guestToken,
    scanType,
    scannedAt: new Date().toISOString(),
    synced: false,
    guestName,
  };
  queue.push(record);
  saveQueue(queue);
  return record;
}

export function getPendingScans(): OfflineScanRecord[] {
  return getQueue().filter(r => !r.synced);
}

export function getOfflineQueueCount(): number {
  return getPendingScans().length;
}

export async function syncOfflineQueue(
  processScan: (token: string) => Promise<{ status: string }>
): Promise<{ synced: number; failed: number }> {
  const queue = getQueue();
  let synced = 0;
  let failed = 0;

  for (const record of queue) {
    if (record.synced) continue;
    try {
      const result = await processScan(record.guestToken);
      if (result.status !== 'INVALID_QR') {
        record.synced = true;
        synced++;
      } else {
        failed++;
      }
    } catch {
      failed++;
    }
  }

  saveQueue(queue);
  return { synced, failed };
}

export function clearOfflineQueue() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
}

// Online/offline detection
export function isOnline(): boolean {
  return typeof navigator !== 'undefined' ? navigator.onLine : true;
}

export function onOnlineChange(callback: (online: boolean) => void) {
  if (typeof window === 'undefined') return () => {};
  const handler = () => callback(navigator.onLine);
  window.addEventListener('online', handler);
  window.addEventListener('offline', handler);
  return () => {
    window.removeEventListener('online', handler);
    window.removeEventListener('offline', handler);
  };
}
