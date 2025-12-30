import Dexie, { type Table } from 'dexie';
import { Identity, SentinelLog, OutboxItem } from '@shared/types';
import { v4 as uuidv4 } from 'uuid';
export class ValleyDB extends Dexie {
  identity!: Table<Identity>;
  sentinel_logs!: Table<SentinelLog>;
  encrypted_outbox!: Table<OutboxItem>;
  constructor() {
    super('TheValleyHub_DB');
    this.version(5).stores({
      identity: 'nodeId',
      sentinel_logs: 'id, timestamp',
      encrypted_outbox: 'id'
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
  const dayAgo = Date.now() - 24 * 60 * 60 * 1000;
  await db.sentinel_logs.where('timestamp').below(dayAgo).delete();
}