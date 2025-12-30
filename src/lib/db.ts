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
    super('TheValleyHub_DB_v4');
    this.version(7).stores({
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
  const weekAgo = now - 7 * 24 * 60 * 60 * 1000;
  await db.feed_cache.where('fetchedAt').below(weekAgo).delete();
  const feedCount = await db.feed_cache.count();
  if (feedCount > 50) {
    const oldest = await db.feed_cache.orderBy('fetchedAt').limit(feedCount - 50).toArray();
    await db.feed_cache.bulkDelete(oldest.map(i => i.id));
  }
}