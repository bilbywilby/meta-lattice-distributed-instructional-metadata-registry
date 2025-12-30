import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { db, addLog } from '@/lib/db';
import { OutboxItem, Report, ReportStatus, SyncBatchStatus } from '@shared/types';
import { useLiveQuery } from 'dexie-react-hooks';
export function useOutboxSync() {
  const [syncStatus, setSyncStatus] = useState<SyncBatchStatus>(SyncBatchStatus.IDLE);
  const syncLock = useRef(false);
  const liveQueue = useLiveQuery(() => db.outbox.orderBy('id').toArray());
  const queue = useMemo(() => liveQueue ?? [], [liveQueue]);
  const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
  const processQueue = useCallback(async () => {
    if (syncLock.current || !isOnline || queue.length === 0) return;
    syncLock.current = true;
    setSyncStatus(SyncBatchStatus.BATCHING);
    // Strictly batch 5 items per cycle as per Android WorkManager spec
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
    setTimeout(() => setSyncStatus(SyncBatchStatus.IDLE), 2000);
    syncLock.current = false;
  }, [isOnline, queue]);
  useEffect(() => {
    if (isOnline && queue.length > 0) {
      const timer = setTimeout(processQueue, 10000); // 10s intervals for batch processing
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