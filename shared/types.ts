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
export interface OutboxItem {
  id: string;
  payload: string;
  encryptedAt: string;
  destinationNode?: string;
}
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}