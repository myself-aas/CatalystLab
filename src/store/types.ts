import { EngineType } from '../types';

export type SyncStatus = 'idle' | 'syncing' | 'synced' | 'error' | 'offline';

export type MongoCollectionName = 
  | 'domains' 
  | 'goals' 
  | 'alerts' 
  | 'user_preferences' 
  | 'audit_results' 
  | 'monitored_sites';

export interface OptimisticMutation<T = any> {
  id: string;
  collection: MongoCollectionName;
  actionType: 'insert' | 'update' | 'delete' | 'upsert';
  documentId: string;
  payload: T;
  previousState?: T | null;
  timestamp: number;
  status: 'pending' | 'committed' | 'failed' | 'rolled_back';
  error?: string;
  retryCount: number;
}

export interface DomainDocument {
  _id?: string;
  id: string;
  domain: string;
  verified: boolean;
  verificationToken?: string;
  verificationMethod?: 'dns_txt' | 'meta_tag' | 'file_upload';
  createdAt: number;
  updatedAt?: number;
  ownerId: string;
  sslValid?: boolean;
  sslDaysRemaining?: number;
  trackingScriptActive?: boolean;
  customScriptProxy?: boolean;
  publicDashboard?: boolean;
  customLogoUrl?: string;
  notes?: string;
  tags?: string[];
}

export interface GoalDocument {
  _id?: string;
  id: string;
  domain: string;
  name: string;
  type: 'pageview' | 'custom_event' | 'vitals_lcp' | 'scroll_depth';
  targetValue?: string | number;
  selector?: string;
  convertedCount: number;
  conversionRate?: number;
  active: boolean;
  createdAt: number;
  updatedAt?: number;
  ownerId: string;
}

export interface AlertChannelDocument {
  _id?: string;
  id: string;
  domain: string;
  name: string;
  type: 'email' | 'slack' | 'discord' | 'webhook';
  destination: string; // Email address or Webhook URL
  enabled: boolean;
  events: ('traffic_spike' | 'traffic_drop' | 'audit_regression' | 'ssl_expiry' | 'uptime_downtime')[];
  thresholdDeviationPercent: number; // e.g. 50%
  lastDispatchedAt?: number;
  createdAt: number;
  updatedAt?: number;
  ownerId: string;
}

export interface UserPreferencesDocument {
  _id?: string;
  id: string; // Usually userId or 'default'
  ownerId: string;
  theme: 'dark' | 'light' | 'system';
  defaultTimeframe: '24h' | '7d' | '30d' | 'all';
  autoRefreshIntervalSeconds: number; // 0 for off, or 5, 10, 30, 60
  compactMode: boolean;
  activeDomain: string;
  notificationsEnabled: boolean;
  chartType: 'area' | 'bar' | 'line';
  whiteLabel?: {
    enabled: boolean;
    brandName?: string;
    logoUrl?: string;
    primaryColor?: string;
  };
  updatedAt: number;
}

export interface AuditRecordDocument {
  _id?: string;
  id: string;
  url: string;
  domain: string;
  engine: EngineType;
  score: number;
  grade?: string;
  sdlcPhase?: string;
  output: string;
  specs?: Record<string, any>;
  plotData?: {
    plot1?: any[];
    plot2?: any[];
    plot3?: any[];
  };
  createdAt: number;
  ownerId: string;
}

export interface AnalyticsQueryCache {
  domain: string;
  timeframe: string;
  data: any;
  cachedAt: number;
  ttlMs: number;
}
