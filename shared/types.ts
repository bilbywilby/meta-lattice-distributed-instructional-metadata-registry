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
  INTEL = 'INTEL',
  AUDIT = 'AUDIT'
}
export enum LatticeStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  REVOKED = 'REVOKED'
}
export enum NewsStage {
  RAW = 'RAW',
  STAGED = 'STAGED',
  CONSENSUS = 'CONSENSUS'
}
export enum SentinelTab {
  TERMINAL = 'TERMINAL',
  REGISTRY = 'REGISTRY',
  MESH = 'MESH',
  SCHEMAS = 'SCHEMAS',
  SPECS = 'SPECS'
}
export enum AggregatorTab {
  HUB = 'HUB',
  LOOP = 'LOOP',
  INTEL = 'INTEL',
  WIKI = 'WIKI'
}
export enum SyncBatchStatus {
  IDLE = 'IDLE',
  BATCHING = 'BATCHING',
  UPLOADING = 'UPLOADING',
  SUCCESS = 'SUCCESS',
  RETRYING = 'RETRYING'
}
export interface NewsItem {
  id: string;
  stage: NewsStage;
  title: string;
  summary: string;
  source: string;
  timestamp: number;
  region: string;
  poliScore: number; // -1 to +1
  reliability: number; // 0 to 1
  agentVotes: Record<string, { vote: string; justification: string }>;
  checksum: string;
  link?: string;
}
export interface FeedParams {
  region?: string;
  biasMax?: number;
  days?: number;
  page?: number;
}
export interface DemoItem {
  id: string;
  name: string;
  value: number;
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
  componentTag: string;
  metadata?: Record<string, any>;
}
export interface LatticeEvent {
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
  residencyHash?: string;
  parentUnitId?: string;
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
  fields: SchemaField[];
}
export interface SchemaField {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'enum';
  required: boolean;
}
export interface FeedItem {
  id: string;
  source: string;
  title: string;
  content: string;
  link?: string;
  fetchedAt: number;
  contentHash: string;
}
export interface WikiPage {
  id: string;
  slug: string;
  title: string;
  category: string;
  content: string;
  lastModified: number;
}
export interface WikiRevision {
  id: string;
  pageId: string;
  author: string;
  timestamp: number;
  content: string;
  summary: string;
}
export interface LoopPost {
  id: string;
  userId: string;
  user: string;
  avatar: string;
  action: string;
  location: string;
  time: string;
  content: string;
  likes: number;
  tags: string[];
}