import Dexie, { type Table } from 'dexie';
import { Identity, SentinelLog, OutboxItem, Report, MediaEntry, FeedItem } from '@shared/types';
import { v4 as uuidv4 } from 'uuid';
export class ValleyDB extends Dexie {
  identity!: Table<Identity>;
  sentinel_logs!: Table<SentinelLog>;
  reports!: Table<Report>;
  media!: Table<MediaEntry>;
  outbox!: Table<OutboxItem>;
  feed_cache!: Table<FeedItem>;
  kv_store!: Table<{ key: string; value: any }>;
  constructor() {
    // Renamed to production specification branding
    super('LehighValleyHub_Sentinel_v4');
    this.version(1).stores({
      identity: 'nodeId',
      sentinel_logs: 'id, timestamp',
      reports: 'id, status, createdAt',
      media: 'id, reportId',
      outbox: 'id, lastAttempt',
      feed_cache: 'id, fetchedAt, contentHash',
      kv_store: 'key'
    });
  }
}
export const db = new ValleyDB();
export async function addLog(event: string, severity: SentinelLog['severity'] = 'INFO', metadata?: Record<string, any>) {
  const log: SentinelLog = {
    id: uuidv4(),
    timestamp: Date.now(),
    event,
    severity,
    metadata
  };
  await db.sentinel_logs.add(log);
}
export async function clearAllLogs() {
  await db.sentinel_logs.clear();
}
export async function wipeSession() {
  await db.delete();
  localStorage.clear();
  window.location.reload();
}
export async function pruneLogs() {
  const now = Date.now();
  const dayAgo = now - 24 * 60 * 60 * 1000;
  await db.sentinel_logs.where('timestamp').below(dayAgo).delete();
  // Prune old reports (24h as per feedback)
  await db.reports.where('createdAt').below(dayAgo).delete();
  const weekAgo = now - 7 * 24 * 60 * 60 * 1000;
  await db.feed_cache.where('fetchedAt').below(weekAgo).delete();
}