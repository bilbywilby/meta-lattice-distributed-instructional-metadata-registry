import Dexie, { type Table } from 'dexie';
import {
  Identity,
  Report,
  OutboxItem,
  SentinelLog,
  RegistrySchema
} from '@shared/types';
export class SentinelV4DB extends Dexie {
  identity!: Table<Identity>;
  reports!: Table<Report>;
  outbox!: Table<OutboxItem>;
  kv_store!: Table<{ key: string; value: any }>;
  sentinel_logs!: Table<SentinelLog>;
  registry_schemas!: Table<RegistrySchema>;
  constructor() {
    super('LehighValleyHub_Sentinel_v4');
    this.version(4).stores({
      identity: 'nodeId',
      reports: 'id, createdAt, status, geohash',
      outbox: 'id, lastAttempt',
      kv_store: 'key',
      sentinel_logs: '++id, timestamp, severity',
      registry_schemas: 'id, name, version'
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
export async function pruneData() {
  const now = Date.now();
  const dayAgo = now - 24 * 60 * 60 * 1000;
  // 24h rolling prune for logs
  await db.sentinel_logs.where('timestamp').below(dayAgo).delete();
}
// Global prune interval every 60 minutes
if (typeof window !== 'undefined') {
  setInterval(() => {
    pruneData().catch(console.error);
  }, 60 * 60 * 1000);
}
export async function wipeNode() {
  await db.delete();
  window.location.reload();
}