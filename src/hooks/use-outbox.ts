import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { db, addLog } from '@/lib/db';
import { ReportStatus, SyncBatchStatus } from '@shared/types';
import { useLiveQuery } from 'dexie-react-hooks';
export function useOutboxSync() {
  const [syncStatus, setSyncStatus] = useState<SyncBatchStatus>(SyncBatchStatus.IDLE);
  const syncLock = useRef(false);
  const lastSyncTime = useRef(0);
  const liveQueue = useLiveQuery(() => db.outbox.orderBy('id').toArray());
  const queue = useMemo(() => liveQueue ?? [], [liveQueue]);
  const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
  const processQueue = useCallback(async () => {
    // Prevent overlapping syncs or rapid fire calls
    if (syncLock.current || !isOnline || queue.length === 0) return;
    const now = Date.now();
    if (now - lastSyncTime.current < 5000) return; // Minimum 5s between batch attempts
    syncLock.current = true;
    lastSyncTime.current = now;
    setSyncStatus(SyncBatchStatus.BATCHING);
    const batchSize = 5;
    const batch = queue.slice(0, batchSize);
    await addLog("WORK_MANAGER_DISPATCH", "INFO", { batch_size: batch.length });
    setSyncStatus(SyncBatchStatus.UPLOADING);
    for (const item of batch) {
      try {
        const response = await fetch(`/api/v1/reports`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(item.payload)
        });
        if (response.ok) {
          await db.transaction('rw', [db.reports, db.outbox, db.sentinel_logs], async () => {
            await db.reports.update(item.payload.id, { status: ReportStatus.SYNCED });
            await db.outbox.delete(item.id);
            await addLog(`SYNC_OK: ${item.payload.id.slice(0,8)}`, 'INFO', { id: item.id, component: 'WorkManager' });
          });
        } else {
          throw new Error(`Worker Rejected: ${response.status}`);
        }
      } catch (err) {
        const nextRetry = (item.retryCount || 0) + 1;
        if (nextRetry >= 5) {
          await db.transaction('rw', [db.outbox, db.sentinel_logs], async () => {
            await db.outbox.delete(item.id);
            await addLog(`SYNC_FATAL: ${item.id.slice(0,8)}`, 'CRITICAL', { error: String(err), component: 'WorkManager' });
          });
        } else {
          await db.outbox.update(item.id, {
            retryCount: nextRetry,
            lastAttempt: Date.now()
          });
          await addLog(`SYNC_RETRY: ${item.id.slice(0,8)}`, 'WARNING', { retry: nextRetry, component: 'WorkManager' });
        }
      }
    }
    setSyncStatus(SyncBatchStatus.SUCCESS);
    setTimeout(() => {
      setSyncStatus(SyncBatchStatus.IDLE);
      syncLock.current = false;
    }, 2000);
  }, [isOnline, queue]);
  useEffect(() => {
    if (isOnline && queue.length > 0) {
      const timer = setTimeout(processQueue, 3000);
      return () => clearTimeout(timer);
    }
  }, [isOnline, queue.length, processQueue]);
  return {
    queueSize: queue.length,
    isSyncing: syncStatus !== SyncBatchStatus.IDLE,
    syncStatus,
    isOnline
  };
}