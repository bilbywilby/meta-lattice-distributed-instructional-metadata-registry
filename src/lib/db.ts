import Dexie, { type Table } from 'dexie';
import {
  Identity,
  FeedItem,
  LoopPost,
  WikiPage,
  WikiRevision,
  VoltTrace,
  SentinelLog,
  Report,
  OutboxItem,
  RegistrySchema
} from '@shared/types';
export class ValleyAggregatorDB extends Dexie {
  identity!: Table<Identity>;
  news_cache!: Table<FeedItem>;
  loop_posts!: Table<LoopPost & { timestamp: number }>;
  wiki_pages!: Table<WikiPage>;
  wiki_revisions!: Table<WikiRevision>;
  volt_traces!: Table<VoltTrace>;
  kv_store!: Table<{ key: string; value: any }>;
  sentinel_logs!: Table<SentinelLog>;
  reports!: Table<Report>;
  outbox!: Table<OutboxItem>;
  registry_schemas!: Table<RegistrySchema>;
  constructor() {
    super('TheValley_v1.3_Aggregator');
    this.version(3).stores({
      identity: 'nodeId',
      news_cache: 'id, category, fetchedAt, contentHash',
      loop_posts: 'id, timestamp, userId',
      wiki_pages: 'id, slug, category',
      wiki_revisions: 'id, pageId, timestamp',
      volt_traces: 'id, timestamp',
      kv_store: 'key',
      sentinel_logs: 'id, timestamp, severity',
      reports: 'id, status, geohash, schemaId',
      outbox: 'id, lastAttempt',
      registry_schemas: 'id, name, version'
    });
  }
}
export const db = new ValleyAggregatorDB();
export async function addLog(event: string, severity: SentinelLog['severity'] = 'INFO', metadata?: Record<string, any>) {
  const log: SentinelLog = {
    id: crypto.randomUUID(),
    timestamp: Date.now(),
    event,
    severity,
    metadata
  };
  await db.sentinel_logs.add(log);
}
export async function addTrace(message: string, color: VoltTrace['color'] = 'blue') {
  const trace: VoltTrace = {
    id: crypto.randomUUID(),
    timestamp: Date.now(),
    message,
    color
  };
  await db.volt_traces.add(trace);
}
export async function pruneData() {
  const now = Date.now();
  const dayAgo = now - 24 * 60 * 60 * 1000;
  await db.news_cache.where('fetchedAt').below(dayAgo).delete();
  await db.volt_traces.where('timestamp').below(dayAgo).delete();
  const loopCount = await db.loop_posts.count();
  if (loopCount > 50) {
    const oldest = await db.loop_posts.orderBy('timestamp').limit(loopCount - 50).toArray();
    await db.loop_posts.bulkDelete(oldest.map(p => p.id));
  }
}