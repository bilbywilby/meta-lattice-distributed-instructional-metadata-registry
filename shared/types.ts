export enum ReportStatus {
  LOCAL = 'LOCAL',
  QUEUED = 'QUEUED',
  SYNCED = 'SYNCED'
}
export enum SentinelTab {
  TERMINAL = 'TERMINAL',
  MESH = 'MESH',
  SPECS = 'SPECS'
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
export interface SentinelLog {
  id: string;
  timestamp: number;
  event: string;
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  metadata?: Record<string, any>;
}
export interface Identity {
  nodeId: string;
  publicKey: string;
  createdAt: string;
}
export interface OutboxItem {
  id: string;
  opType: string;
  payload: any;
  retryCount: number;
  lastAttempt: number;
}
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  [key: string]: any;
}
export interface RegistrySchema {
  id: string;
  name: string;
  description: string;
  version: string;
  fields: {
    name: string;
    type: 'string' | 'number' | 'boolean' | 'enum';
    required: boolean;
  }[];
}