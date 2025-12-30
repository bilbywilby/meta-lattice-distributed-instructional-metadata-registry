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
    this.version(6).stores({
      identity: 'nodeId',
      reports: 'id, createdAt, status, geohash, parentUnitId',
      outbox: 'id, lastAttempt',
      kv_store: 'key',
      sentinel_logs: '++id, timestamp, severity, componentTag',
      registry_schemas: 'id, name, version',
      news_cache: 'id, contentHash, fetchedAt',
      volt_traces: '++id, timestamp',
      wiki_pages: 'id, slug, category',
      wiki_revisions: 'id, pageId, timestamp'
    });
    this.on("versionchange", () => {
      this.close();
      if (typeof window !== 'undefined') {
        console.warn("[DATABASE] Migration detected. Session terminating.");
      }
    });
  }
}
export const db = new SentinelV4DB();
export async function addLog(event: string, severity: SentinelLog['severity'] = 'INFO', metadata?: Record<string, any>) {
  try {
    const log: Omit<SentinelLog, 'id'> = {
      timestamp: Date.now(),
      event,
      severity,
      componentTag: "WEB_PORT_CORE",
      metadata
    };
    await db.sentinel_logs.add(log as any);
  } catch (err) {
    console.error(`[DB_LOG_ERROR] ${err}`);
  }
}
export async function addTrace(message: string, color: VoltTrace['color'] = 'blue') {
  try {
    const trace: Omit<VoltTrace, 'id'> = {
      timestamp: Date.now(),
      message,
      color
    };
    await db.volt_traces.add(trace as any);
  } catch (err) {
    console.error(`[DB_TRACE_ERROR] ${err}`);
  }
}
export async function pruneData() {
  try {
    const now = Date.now();
    const dayAgo = now - 24 * 60 * 60 * 1000;
    await db.sentinel_logs.where('timestamp').below(dayAgo).delete();
    await db.volt_traces.where('timestamp').below(dayAgo).delete();
    await db.news_cache.where('fetchedAt').below(dayAgo).delete();
  } catch (err) {
    console.error(`[DB_PRUNE_ERROR] ${err}`);
  }
}
if (typeof window !== 'undefined') {
  setInterval(() => {
    pruneData().catch(console.error);
  }, 60 * 60 * 1000);
}
export async function wipeNode() {
  await db.delete();
  if (typeof window !== 'undefined') {
    window.location.reload();
  }
}