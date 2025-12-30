import Dexie, { type Table } from 'dexie';
import { 
  Identity, 
  NewsItem, 
  LoopPost, 
  WikiPage, 
  WikiRevision, 
  VoltTrace,
  SentinelLog
} from '@shared/types';
export class ValleyAggregatorDB extends Dexie {
  identity!: Table<Identity>;
  news_cache!: Table<NewsItem & { fetchedAt: number }>;
  loop_posts!: Table<LoopPost & { timestamp: number }>;
  wiki_pages!: Table<WikiPage>;
  wiki_revisions!: Table<WikiRevision>;
  volt_traces!: Table<VoltTrace>;
  kv_store!: Table<{ key: string; value: any }>;
  sentinel_logs!: Table<SentinelLog>;
  constructor() {
    super('TheValley_v1.1_Aggregator');
    this.version(1).stores({
      identity: 'nodeId',
      news_cache: 'id, category, fetchedAt',
      loop_posts: 'id, timestamp, userId',
      wiki_pages: 'id, slug, category',
      wiki_revisions: 'id, pageId, timestamp',
      volt_traces: 'id, timestamp',
      kv_store: 'key',
      sentinel_logs: 'id, timestamp, severity'
    });
  }
}
export const db = new ValleyAggregatorDB();
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
  // Keep last 50 loop posts
  const loopCount = await db.loop_posts.count();
  if (loopCount > 50) {
    const oldest = await db.loop_posts.orderBy('timestamp').limit(loopCount - 50).toArray();
    await db.loop_posts.bulkDelete(oldest.map(p => p.id));
  }
}