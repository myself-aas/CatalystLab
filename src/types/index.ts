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
