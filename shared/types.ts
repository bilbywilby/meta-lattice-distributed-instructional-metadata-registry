export type EntityType = 'resource' | 'module' | 'assessment' | 'competency';
export type AuditAction = 'CREATE' | 'UPDATE' | 'DELETE' | 'ROLLBACK';
export interface MetadataEntity {
  id: string;
  type: EntityType;
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
export interface AuditLog {
  id: string;
  timestamp: string;
  action: AuditAction;
  entityId: string;
  actor: string;
  metadata: {
    version?: number;
    previousHash?: string;
    note?: string;
  };
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