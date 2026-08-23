import { describe, it, expect, beforeEach, beforeAll } from 'vitest';
import {
  VISITOR_DAILY_LIMIT,
  FREE_DAILY_LIMIT,
  STARTER_DAILY_LIMIT,
  PRO_DAILY_LIMIT,
  TEAM_DAILY_LIMIT,
  ENTERPRISE_DAILY_LIMIT,
  MASTER_AUDIT_COST,
  SINGLE_ENGINE_COST,
  getRateLimitStatus,
  recordAuditLaunch
} from '../utils/rateLimiter';

// In-memory localStorage mock for node environment
const createMockLocalStorage = () => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = String(value); },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; }
  };
};

describe('Rate Limiter & Quota Allocation Engine', () => {
  beforeAll(() => {
    (globalThis as any).localStorage = createMockLocalStorage();
  });

  beforeEach(() => {
    localStorage.clear();
  });

  it('should define correct tier daily unit capacities', () => {
    expect(VISITOR_DAILY_LIMIT).toBe(20);
    expect(FREE_DAILY_LIMIT).toBe(50);
    expect(STARTER_DAILY_LIMIT).toBe(150);
    expect(PRO_DAILY_LIMIT).toBe(500);
    expect(TEAM_DAILY_LIMIT).toBe(1500);
    expect(ENTERPRISE_DAILY_LIMIT).toBe(5000);
  });

  it('should calculate correct unit weights for master and single engine scans', () => {
    expect(MASTER_AUDIT_COST).toBe(10);
    expect(SINGLE_ENGINE_COST).toBe(1);
  });

  it('should grant unlimited access for superadmin users', () => {
    const adminUser = {
      uid: 'admin_123',
      email: 'shuvoasifahmed@gmail.com'
    } as any;

    const status = getRateLimitStatus(adminUser, true);
    expect(status.isUnlimited).toBe(true);
    expect(status.tier).toBe('superadmin');
    expect(status.limit).toBeNull();
    expect(status.isExceeded).toBe(false);
  });

  it('should correctly allocate quota for anonymous visitor sessions', () => {
    const status = getRateLimitStatus(null, false);
    expect(status.tier).toBe('visitor');
    expect(status.limit).toBe(VISITOR_DAILY_LIMIT);
    expect(status.masterLimit).toBe(Math.floor(VISITOR_DAILY_LIMIT / MASTER_AUDIT_COST));
    expect(status.singleLimit).toBe(VISITOR_DAILY_LIMIT);
    expect(status.isExceeded).toBe(false);
  });

  it('should decrement remaining units when an audit launch is recorded', () => {
    const visitorStatusInitial = getRateLimitStatus(null, false);
    expect(visitorStatusInitial.remaining).toBe(VISITOR_DAILY_LIMIT);

    // Record single engine audit (1 unit)
    recordAuditLaunch(null, false, 'single');
    const statusAfterSingle = getRateLimitStatus(null, false);
    expect(statusAfterSingle.used).toBe(1);
    expect(statusAfterSingle.remaining).toBe(VISITOR_DAILY_LIMIT - 1);

    // Record master audit (10 units)
    recordAuditLaunch(null, false, 'master');
    const statusAfterMaster = getRateLimitStatus(null, false);
    expect(statusAfterMaster.used).toBe(11);
    expect(statusAfterMaster.remaining).toBe(VISITOR_DAILY_LIMIT - 11);
  });
});
