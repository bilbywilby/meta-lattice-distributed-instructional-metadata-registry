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
export interface PrivacyStatus {
  aesStatus: 'ACTIVE' | 'INACTIVE';
  pruningStatus: 'ENABLED' | 'STANDBY';
  jitterLevel: number;
}
export enum ReportStatus {
  LOCAL = 'LOCAL',
  QUEUED = 'QUEUED',
  SENT = 'SENT',
  FAILED = 'FAILED',
  MESH_SHARED = 'MESH_SHARED'
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
  residencyCommitment?: string;
}
export interface MediaEntry {
  id: string;
  reportId: string;
  blob: Blob;
  mime: string;
  size: number;
  uploadedUrl?: string;
}
export interface OutboxItem {
  id: string;
  opType: 'CREATE_REPORT' | 'UPDATE_REPORT' | 'DELETE_REPORT';
  payload: any;
  retryCount: number;
  lastAttempt?: number;
}
export interface FeedItem {
  id: string;
  title: string;
  link: string;
  pubDate: string;
  content: string;
  source: string;
  contentHash: string;
  fetchedAt: number;
}
export interface MeshPeer {
  id: string;
  status: 'searching' | 'connected' | 'idle';
  latency?: number;
}
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  [key: string]: any;
}