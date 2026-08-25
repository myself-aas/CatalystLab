import { executeHealthEngine } from './health';
import { executeAiReadinessEngine } from './ai-readiness';
import { executeRepoHygieneEngine } from './repo-hygiene';
import { executeEdgeLatencyEngine } from './edge-latency';
import { executeEcoCarbonEngine } from './eco-carbon';
import { executeComplianceEngine } from './compliance';
import { executeMigrationEngine } from './migration';
import { executeAiSearchEngine } from './ai-search';
import type { DiagnosticEngineId, EngineResult } from '../../types/telemetry';

export {
  executeHealthEngine,
  executeAiReadinessEngine,
  executeRepoHygieneEngine,
  executeEdgeLatencyEngine,
  executeEcoCarbonEngine,
  executeComplianceEngine,
  executeMigrationEngine,
  executeAiSearchEngine,
};

export const ENGINE_EXECUTORS: Record<DiagnosticEngineId, (url: string) => Promise<EngineResult>> = {
  health: executeHealthEngine,
  ai_ready: executeAiReadinessEngine,
  repo: executeRepoHygieneEngine,
  latency: executeEdgeLatencyEngine,
  eco: executeEcoCarbonEngine,
  compliance: executeComplianceEngine,
  migration: executeMigrationEngine,
  ai_search: executeAiSearchEngine,
};

export async function executeSingleDiagnosticEngine(
  engineId: DiagnosticEngineId,
  targetUrl: string
): Promise<EngineResult> {
  const executor = ENGINE_EXECUTORS[engineId];
  if (!executor) {
    throw new Error(`Invalid or unsupported diagnostic engine: ${engineId}`);
  }
  return executor(targetUrl);
}
