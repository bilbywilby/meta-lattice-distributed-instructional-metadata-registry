export interface MetadataEntity {
  id: string;
  type: string;
  name: string;
  content: Record<string, any>;
  version: number;
  hash: string;
  dependencies: string[];
  createdAt: string;
  updatedAt: string;
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