export enum ReportStatus {
  LOCAL = 'LOCAL',
  QUEUED = 'QUEUED',
  SYNCED = 'SYNCED',
  SENT = 'SENT'
}
export enum SentinelTab {
  TERMINAL = 'TERMINAL',
  MESH = 'MESH',
  SPECS = 'SPECS',
  REGISTRY = 'REGISTRY',
  SCHEMAS = 'SCHEMAS'
}
export enum AggregatorTab {
  HUB = 'HUB',
  LOOP = 'LOOP',
  INTEL = 'INTEL',
  WIKI = 'WIKI'
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
export interface VoltTrace {
  id: string;
  timestamp: number;
  message: string;
  color: 'blue' | 'purple' | 'emerald' | 'rose' | 'amber';
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
export interface SchemaField {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'enum';
  required: boolean;
}
export interface RegistrySchema {
  id: string;
  name: string;
  description: string;
  version: string;
  fields: SchemaField[];
}
export interface FeedItem {
  id: string;
  title: string;
  content: string;
  source: string;
  fetchedAt: number;
  link?: string;
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
export interface DemoItem {
  id: string;
  name: string;
  value: number;
}