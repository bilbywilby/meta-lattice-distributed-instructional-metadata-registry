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
    const batchSize = 5;
    const batch = queue.slice(0, batchSize);
    for (const item of batch) {
      try {
        const response = await fetch(`/api/v1/reports`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(item.payload)
        });
        if (response.ok) {
          // Atomic update
          await db.transaction('rw', [db.reports, db.outbox, db.sentinel_logs], async () => {
            await db.reports.update(item.payload.id, { status: ReportStatus.SENT });
            await db.outbox.delete(item.id);
            await addLog(`SYNC_SUCCESS: ${item.opType}`, 'INFO', { id: item.id });
          });
        } else {
          throw new Error('Server rejected payload');
        }
      } catch (err) {
        const nextRetry = (item.retryCount || 0) + 1;
        if (nextRetry >= 5) {
          await db.transaction('rw', [db.reports, db.outbox, db.sentinel_logs], async () => {
            await db.reports.update(item.payload.id, { status: ReportStatus.FAILED });
            await db.outbox.delete(item.id);
            await addLog(`SYNC_FATAL: ${item.opType}`, 'CRITICAL', { id: item.id, err: String(err) });
          });
        } else {
          await db.outbox.update(item.id, {
            retryCount: nextRetry,
            lastAttempt: Date.now()
          });
          await addLog(`SYNC_RETRY: ${item.opType}`, 'WARNING', { id: item.id, retry: nextRetry });
        }
      }
    }
    setIsSyncing(false);
    syncLock.current = false;
  }, [isOnline, queue]);
  useEffect(() => {
    if (isOnline && queue.length > 0) {
      const timer = setTimeout(processQueue, 3000);
      return () => clearTimeout(timer);
    }
  }, [isOnline, queue.length, processQueue]);
  const enqueueReport = useCallback(async (report: Report) => {
    await db.transaction('rw', [db.reports, db.outbox, db.sentinel_logs], async () => {
      await db.reports.add(report);
      const outboxItem: OutboxItem = {
        id: report.id,
        opType: 'CREATE_REPORT',
        payload: report,
        retryCount: 0,
        lastAttempt: Date.now()
      };
      await db.outbox.add(outboxItem);
      await addLog(`REPORT_QUEUED: ${report.id}`, 'INFO');
    });
  }, []);
  return {
    queueSize: queue.length,
    isSyncing,
    isOnline,
    enqueueReport
  };
}