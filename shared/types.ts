export enum ReportStatus {
  LOCAL = 'LOCAL',
  QUEUED = 'QUEUED',
  SYNCED = 'SYNCED',
  SENT = 'SENT'
}
export enum LatticeTab {
  PUBLISH = 'PUBLISH',
  LEDGER = 'LEDGER',
  SCHEMAS = 'SCHEMAS',
  AUDIT = 'AUDIT'
}
export enum LatticeStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  REVOKED = 'REVOKED'
}
export interface InstructionalUnit {
  id: string;
  type: 'InstructionalUnit';
  title: string;
  summary: string;
  version: string;
  status: LatticeStatus;
  author: string;
  content: {
    format: 'MARKDOWN' | 'URI' | 'JSON_LD';
    value: string;
  };
  tags: string[];
  rights?: string;
  provenance?: {
    parentUnitId?: string;
    originNode?: string;
  };
  signature?: string;
  schemaVersion: string;
}
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  detail?: string;
  [key: string]: any;
}
export interface Identity {
  nodeId: string;
  publicKey: string;
  createdAt: string;
}
export interface SentinelLog {
  id: string;
  timestamp: number;
  event: string;
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  metadata?: Record<string, any>;
}
export interface VoltTrace {
  id: string;
  timestamp: number;
  message: string;
  color: 'blue' | 'purple' | 'emerald' | 'rose' | 'amber';
}
export interface Report {
  id: string;
  createdAt: number;
  status: ReportStatus;
  title: string;
  street: string;
  tags: string[];
  lat: number;
  lon: number;
  geohash: string;
  mediaIds: string[];
}
export interface OutboxItem {
  id: string;
  opType: string;
  payload: any;
  retryCount: number;
  lastAttempt: number;
}
export interface RegistrySchema {
  id: string;
  name: string;
  description: string;
  version: string;
  fields: any[];
}