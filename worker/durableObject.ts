import { DurableObject } from "cloudflare:workers";
import type { MetadataEntity, RegistryStats, MetadataSchema, EntityHistory, AuditLog, AuditAction } from '@shared/types';
export class GlobalDurableObject extends DurableObject {
  private async getEntitiesMap(): Promise<Map<string, MetadataEntity>> {
    return (await this.ctx.storage.get<Map<string, MetadataEntity>>("metadata_entities")) || new Map();
  }
  private async getSchemasMap(): Promise<Map<string, MetadataSchema>> {
    return (await this.ctx.storage.get<Map<string, MetadataSchema>>("metadata_schemas")) || new Map();
  }
  private async getAuditLogsList(): Promise<AuditLog[]> {
    return (await this.ctx.storage.get<AuditLog[]>("audit_logs")) || [];
  }
  private async createAuditLog(action: AuditAction, entityId: string, metadata: any = {}) {
    const logs = await this.getAuditLogsList();
    const newLog: AuditLog = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      action,
      entityId,
      actor: "Operator-01", // Mock User
      metadata
    };
    logs.unshift(newLog); // Keep latest at top
    await this.ctx.storage.put("audit_logs", logs.slice(0, 100)); // Keep last 100
  }
  async getRegistryStats(): Promise<RegistryStats> {
    const entities = await this.getEntitiesMap();
    const txCount = (await this.ctx.storage.get<number>("tx_count")) || 0;
    const distribution: Record<string, number> = {};
    entities.forEach(e => {
      distribution[e.type] = (distribution[e.type] || 0) + 1;
    });
    return {
      totalEntities: entities.size,
      entityTypeDistribution: distribution,
      totalTransactions: txCount,
      lastUpdate: new Date().toISOString(),
      storageUsage: JSON.stringify(Array.from(entities.entries())).length
    };
  }
  async getEntities(): Promise<MetadataEntity[]> {
    const entities = await this.getEntitiesMap();
    return Array.from(entities.values());
  }
  async getEntity(id: string): Promise<MetadataEntity | undefined> {
    const entities = await this.getEntitiesMap();
    return entities.get(id);
  }
  async addEntity(entity: Omit<MetadataEntity, 'createdAt' | 'updatedAt' | 'version' | 'hash'>): Promise<MetadataEntity> {
    const entities = await this.getEntitiesMap();
    const txCount = (await this.ctx.storage.get<number>("tx_count")) || 0;
    const now = new Date().toISOString();
    const newEntity: MetadataEntity = {
      ...entity,
      version: 1,
      hash: crypto.randomUUID().split('-')[0],
      createdAt: now,
      updatedAt: now
    };
    entities.set(newEntity.id, newEntity);
    await this.ctx.storage.put("metadata_entities", entities);
    await this.ctx.storage.put("tx_count", txCount + 1);
    // History
    const history: EntityHistory[] = (await this.ctx.storage.get<EntityHistory[]>(`history_${newEntity.id}`)) || [];
    history.push({
      id: crypto.randomUUID(),
      entityId: newEntity.id,
      version: newEntity.version,
      hash: newEntity.hash,
      content: newEntity.content,
      updatedAt: now,
      changeNote: "Initial creation"
    });
    await this.ctx.storage.put(`history_${newEntity.id}`, history);
    await this.createAuditLog('CREATE', newEntity.id, { version: 1 });
    return newEntity;
  }
  async updateEntity(id: string, updates: Partial<MetadataEntity>): Promise<MetadataEntity | undefined> {
    const entities = await this.getEntitiesMap();
    const existing = entities.get(id);
    if (!existing) return undefined;
    const now = new Date().toISOString();
    const updated: MetadataEntity = {
      ...existing,
      ...updates,
      version: existing.version + 1,
      hash: crypto.randomUUID().split('-')[0],
      updatedAt: now
    };
    entities.set(id, updated);
    await this.ctx.storage.put("metadata_entities", entities);
    // Snapshot history
    const history: EntityHistory[] = (await this.ctx.storage.get<EntityHistory[]>(`history_${id}`)) || [];
    history.push({
      id: crypto.randomUUID(),
      entityId: id,
      version: updated.version,
      hash: updated.hash,
      content: updated.content,
      updatedAt: now,
      changeNote: "State transition"
    });
    await this.ctx.storage.put(`history_${id}`, history);
    await this.createAuditLog('UPDATE', id, { version: updated.version, previousHash: existing.hash });
    return updated;
  }
  async getEntityHistory(id: string): Promise<EntityHistory[]> {
    return (await this.ctx.storage.get<EntityHistory[]>(`history_${id}`)) || [];
  }
  async deleteEntity(id: string): Promise<boolean> {
    const entities = await this.getEntitiesMap();
    const deleted = entities.delete(id);
    if (deleted) {
      await this.ctx.storage.put("metadata_entities", entities);
      const txCount = (await this.ctx.storage.get<number>("tx_count")) || 0;
      await this.ctx.storage.put("tx_count", txCount + 1);
      await this.ctx.storage.delete(`history_${id}`);
      await this.createAuditLog('DELETE', id);
    }
    return deleted;
  }
  async getAuditLogs(): Promise<AuditLog[]> {
    return await this.getAuditLogsList();
  }
  async getSchemas(): Promise<MetadataSchema[]> {
    const schemas = await this.getSchemasMap();
    return Array.from(schemas.values());
  }
  async addSchema(schema: Omit<MetadataSchema, 'version' | 'entityCount' | 'createdAt'>): Promise<MetadataSchema> {
    const schemas = await this.getSchemasMap();
    const newSchema: MetadataSchema = {
      ...schema,
      version: 1,
      entityCount: 0,
      createdAt: new Date().toISOString()
    };
    schemas.set(newSchema.id, newSchema);
    await this.ctx.storage.put("metadata_schemas", schemas);
    return newSchema;
  }
}