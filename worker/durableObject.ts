import { DurableObject } from "cloudflare:workers";
import type { MetadataEntity, RegistryStats, MetadataSchema, EntityHistory } from '@shared/types';
export class GlobalDurableObject extends DurableObject {
  private async getEntitiesMap(): Promise<Map<string, MetadataEntity>> {
    return (await this.ctx.storage.get<Map<string, MetadataEntity>>("metadata_entities")) || new Map();
  }
  private async getSchemasMap(): Promise<Map<string, MetadataSchema>> {
    return (await this.ctx.storage.get<Map<string, MetadataSchema>>("metadata_schemas")) || new Map();
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
    // Save initial history
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
    return newEntity;
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
    }
    return deleted;
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