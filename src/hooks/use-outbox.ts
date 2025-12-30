import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { db, addLog } from '@/lib/db';
import { OutboxItem, Report, ReportStatus } from '@shared/types';
import { useLiveQuery } from 'dexie-react-hooks';
export function useOutboxSync() {
  const [isSyncing, setIsSyncing] = useState(false);
  const syncLock = useRef(false);
  const liveQueue = useLiveQuery(() => db.outbox.orderBy('id').toArray());
  const queue = useMemo(() => liveQueue ?? [], [liveQueue]);
  const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
  const processQueue = useCallback(async () => {
    if (syncLock.current || !isOnline || queue.length === 0) return;
    syncLock.current = true;
    setIsSyncing(true);
    // Batch process top 5 items
    const batch = queue.slice(0, 5);
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
            await addLog(`SYNC_OK: ${item.payload.id.slice(0,8)}`, 'INFO', { id: item.id });
          });
        } else {
          throw new Error(`Worker Rejected: ${response.status}`);
        }
      } catch (err) {
        const nextRetry = (item.retryCount || 0) + 1;
        if (nextRetry >= 5) {
          await db.transaction('rw', [db.outbox, db.sentinel_logs], async () => {
            await db.outbox.delete(item.id);
            await addLog(`SYNC_FATAL: ${item.id.slice(0,8)}`, 'CRITICAL', { error: String(err) });
          });
        } else {
          await db.outbox.update(item.id, {
            retryCount: nextRetry,
            lastAttempt: Date.now()
          });
          await addLog(`SYNC_RETRY: ${item.id.slice(0,8)}`, 'WARNING', { retry: nextRetry });
        }
      }
    }
    setIsSyncing(false);
    syncLock.current = false;
  }, [isOnline, queue]);
  useEffect(() => {
    if (isOnline && queue.length > 0) {
      const timer = setTimeout(processQueue, 5000);
      return () => clearTimeout(timer);
    }
  }, [isOnline, queue.length, processQueue]);
  return {
    queueSize: queue.length,
    isSyncing,
    isOnline
  };
}