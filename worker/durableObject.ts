import { DurableObject } from "cloudflare:workers";
import type { MetadataEntity, RegistryStats } from '@shared/types';
export class GlobalDurableObject extends DurableObject {
  private async getEntitiesMap(): Promise<Map<string, MetadataEntity>> {
    const entities = await this.ctx.storage.get<Map<string, MetadataEntity>>("metadata_entities");
    return entities || new Map();
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
  async addEntity(entity: Omit<MetadataEntity, 'createdAt' | 'updatedAt' | 'version' | 'hash'>): Promise<MetadataEntity> {
    const entities = await this.getEntitiesMap();
    const txCount = (await this.ctx.storage.get<number>("tx_count")) || 0;
    const now = new Date().toISOString();
    const newEntity: MetadataEntity = {
      ...entity,
      version: 1,
      hash: crypto.randomUUID().split('-')[0], // Mock hash for now
      createdAt: now,
      updatedAt: now
    };
    entities.set(newEntity.id, newEntity);
    await this.ctx.storage.put("metadata_entities", entities);
    await this.ctx.storage.put("tx_count", txCount + 1);
    return newEntity;
  }
  async deleteEntity(id: string): Promise<boolean> {
    const entities = await this.getEntitiesMap();
    const deleted = entities.delete(id);
    if (deleted) {
      await this.ctx.storage.put("metadata_entities", entities);
      const txCount = (await this.ctx.storage.get<number>("tx_count")) || 0;
      await this.ctx.storage.put("tx_count", txCount + 1);
    }
    return deleted;
  }
}