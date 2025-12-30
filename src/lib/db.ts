import Dexie, { type Table } from 'dexie';
import {
  Identity,
  Report,
  OutboxItem,
  SentinelLog,
  RegistrySchema,
  FeedItem,
  VoltTrace,
  WikiPage,
  WikiRevision
} from '@shared/types';
export class SentinelV4DB extends Dexie {
  identity!: Table<Identity>;
  reports!: Table<Report>;
  outbox!: Table<OutboxItem>;
  kv_store!: Table<{ key: string; value: any }>;
  sentinel_logs!: Table<SentinelLog>;
  registry_schemas!: Table<RegistrySchema>;
  news_cache!: Table<FeedItem>;
  volt_traces!: Table<VoltTrace>;
  wiki_pages!: Table<WikiPage>;
  wiki_revisions!: Table<WikiRevision>;
  constructor() {
    super('LehighValleyHub_Sentinel_v4');
    this.version(5).stores({
      identity: 'nodeId',
      reports: 'id, createdAt, status, geohash',
      outbox: 'id, lastAttempt',
      kv_store: 'key',
      sentinel_logs: '++id, timestamp, severity',
      registry_schemas: 'id, name, version',
      news_cache: 'id, contentHash, fetchedAt',
      volt_traces: '++id, timestamp',
      wiki_pages: 'id, slug, category',
      wiki_revisions: 'id, pageId, timestamp'
    });
  }
}
export const db = new SentinelV4DB();
export async function addLog(event: string, severity: SentinelLog['severity'] = 'INFO', metadata?: Record<string, any>) {
  const log: Omit<SentinelLog, 'id'> = {
    timestamp: Date.now(),
    event,
    severity,
    metadata
  };
  await db.sentinel_logs.add(log as any);
}
export async function addTrace(message: string, color: VoltTrace['color'] = 'blue') {
  const trace: Omit<VoltTrace, 'id'> = {
    timestamp: Date.now(),
    message,
    color
  };
  await db.volt_traces.add(trace as any);
}
export async function pruneData() {
  const now = Date.now();
  const dayAgo = now - 24 * 60 * 60 * 1000;
  await db.sentinel_logs.where('timestamp').below(dayAgo).delete();
  await db.volt_traces.where('timestamp').below(dayAgo).delete();
  await db.news_cache.where('fetchedAt').below(dayAgo).delete();
}
if (typeof window !== 'undefined') {
  setInterval(() => {
    pruneData().catch(console.error);
  }, 60 * 60 * 1000);
}
export async function wipeNode() {
  await db.delete();
  window.location.reload();
}