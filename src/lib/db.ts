import Dexie, { type Table } from 'dexie';
import { Identity, SentinelLog, OutboxItem } from '@shared/types';
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
export async function wipeSession() {
  await db.delete();
  localStorage.clear();
  window.location.reload();
}
export async function pruneLogs() {
  const dayAgo = Date.now() - 24 * 60 * 60 * 1000;
  await db.sentinel_logs.where('timestamp').below(dayAgo).delete();
}