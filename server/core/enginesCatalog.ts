// Canonical engine catalog shared by the Express server and the Vercel
// serverless entry point (api/run-engine.ts).

import { engineRunSchemaFactory } from '../../src/lib/validation';


export const ENGINE_SCRIPT_MAP: Record<string, string> = {
  // Phase 1: Planning & Architecture
  migration: 'platform_migration_audit.py',
  planning_arch: 'platform_migration_audit.py',
  
  // Phase 2: Code Quality & Repo
  repo: 'repo_scanner.py',
  code_quality: 'repo_scanner.py',
  
  // Phase 3: Build & Asset Efficiency
  eco: 'eco_carbon_audit.py',
  build_eco: 'eco_carbon_audit.py',
  
  // Phase 4: Testing & Core Web Vitals
  health: 'website_health.py',
  testing_vitals: 'website_health.py',
  
  // Phase 5: Release & Edge Delivery
  latency: 'edge_latency.py',
  release_edge: 'edge_latency.py',
  
  // Phase 6: Deployment & DevSecOps
  compliance: 'compliance_risk_audit.py',
  devsecops_compliance: 'compliance_risk_audit.py',
  
  // Phase 7: Live Operations & AI Readiness
  ai_ready: 'ai_readiness.py',
  operations_ai_ready: 'ai_readiness.py',
  
  // Phase 8: Continuous Evolution & LLMO
  llmo: 'llmo_optimizer.py',
  evolution_llmo: 'llmo_optimizer.py'
};

export const engineRunSchema = engineRunSchemaFactory(Object.keys(ENGINE_SCRIPT_MAP) as [string, ...string[]]);
