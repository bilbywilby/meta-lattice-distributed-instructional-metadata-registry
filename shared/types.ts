export interface Identity {
  nodeId: string;
  publicKey: string;
  createdAt: string;
}
export enum ReportStatus {
  DRAFT = 'DRAFT',
  QUEUED = 'QUEUED',
  SENT = 'SENT',
  FAILED = 'FAILED',
  LOCAL = 'LOCAL'
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
  schemaId?: string;
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
export enum AggregatorTab {
  HUB = 'HUB',
  LOOP = 'LOOP',
  INTEL = 'INTEL',
  WIKI = 'WIKI'
}
export interface NewsItem {
  id: string;
  source: string;
  avatar: string;
  time: string;
  tags: string[];
  title: string;
  content: string;
  link: string;
  category: 'Economy' | 'Infrastructure' | 'Social' | 'Security';
}
export type FeedItem = NewsItem & {
  contentHash: string;
  fetchedAt: number;
};
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
export interface VoltTrace {
  id: string;
  timestamp: number;
  message: string;
  color: 'blue' | 'emerald' | 'rose' | 'amber' | 'purple';
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
export interface SentinelLog {
  id: string;
  timestamp: number;
  event: string;
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  metadata?: Record<string, any>;
}
export interface SchemaField {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'enum';
  required: boolean;
  options?: string[];
}
export interface RegistrySchema {
  id: string;
  name: string;
  description: string;
  version: string;
  fields: SchemaField[];
}
export interface DemoItem {
  id: string;
  name: string;
  value: number;
}