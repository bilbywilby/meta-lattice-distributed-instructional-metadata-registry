export interface MetadataEntity {
  id: string;
  type: string;
  name: string;
  content: Record<string, any>;
  version: number;
  hash: string;
  schemaId?: string;
  dependencies: string[];
  createdAt: string;
  updatedAt: string;
}
export interface EntityHistory {
  id: string;
  entityId: string;
  version: number;
  hash: string;
  content: Record<string, any>;
  updatedAt: string;
  changeNote?: string;
}
export interface MetadataSchema {
  id: string;
  name: string;
  version: number;
  structure: Record<string, any>;
  entityCount: number;
  createdAt: string;
}
export interface RegistryStats {
  totalEntities: number;
  entityTypeDistribution: Record<string, number>;
  totalTransactions: number;
  lastUpdate: string;
  storageUsage: number;
}
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}
export type EntityType = 'resource' | 'module' | 'assessment' | 'competency';