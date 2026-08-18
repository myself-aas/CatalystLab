export type EngineType = 
  | 'master-audit'
  | 'health' 
  | 'latency' 
  | 'ai_ready' 
  | 'repo' 
  | 'eco' 
  | 'compliance' 
  | 'migration' 
  | 'llmo';

export interface AuditReport {
  id?: string;
  url: string;
  engine: string;
  output: string;
  createdAt: number;
  ownerId: string;
  ownerEmail?: string;
  title?: string;
  score?: number;
}

export interface EngineMeta {
  id: EngineType;
  name: string;
  category: 'Core' | 'Developer & AI' | 'Enterprise';
  icon: string;
  color: string;
  badgeClass: string;
  description: string;
  pythonScript: string;
  route: string;
}

export interface EngineExecutionResult {
  engine: EngineType;
  output: string;
  success: boolean;
  error?: string;
}

export interface BlogPost {
  id?: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  tags: string[];
  authorName: string;
  authorEmail: string;
  authorAvatar?: string;
  status: 'published' | 'draft' | 'archived';
  readTime: string;
  coverImage?: string;
  createdAt: number;
  updatedAt?: number;
  views?: number;
}

export interface MonitoredSite {
  id?: string;
  name: string;
  url: string;
  checkIntervalMinutes?: number;
  status: 'healthy' | 'degraded' | 'down' | 'untested';
  lastCheckedAt?: number;
  responseTimeMs?: number;
  statusCode?: number;
  sslDaysRemaining?: number;
  sslValid?: boolean;
  uptimePercentage?: number;
  createdAt: number;
  ownerId: string;
  notes?: string;
}

export interface SiteProbeResult {
  success: boolean;
  url: string;
  statusCode?: number;
  responseTimeMs: number;
  status: 'healthy' | 'degraded' | 'down';
  sslValid?: boolean;
  sslDaysRemaining?: number;
  contentType?: string;
  contentLength?: number;
  headers?: Record<string, string>;
  error?: string;
  timestamp: number;
}

export interface SystemHealthStats {
  status: string;
  uptimeSeconds: number;
  memoryUsageMb: {
    rss: number;
    heapTotal: number;
    heapUsed: number;
  };
  activeEnginesCount: number;
  totalAuditsLogged: number;
  nodeVersion: string;
  platform: string;
  timestamp: number;
}
