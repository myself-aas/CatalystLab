import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

// --- Modules under test ------------------------------------------------------

import { serializeJsonLd } from '../lib/structuredData';
import {
  checkUrlSchema,
  engineRunSchemaFactory,
  monitorProbeSchema,
  stateSyncSchema,
  telemetryEventSchema,
  firstIssue
} from '../lib/validation';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { resetVerifierCache, attachIdentity, identityToEntitlements, type VerifiedIdentity } from '../lib/serverAuth';

// --- firebase-admin mocks (hoisted) -------------------------------------------

const verifyIdTokenMock = vi.fn();
const firestoreGetMock = vi.fn();

vi.mock('firebase-admin/app', () => ({
  getApps: () => [{ name: 'test-app' }],
  initializeApp: () => ({}),
  cert: (input: unknown) => input
}));

vi.mock('firebase-admin/auth', () => ({
  getAuth: () => ({ verifyIdToken: verifyIdTokenMock })
}));

vi.mock('firebase-admin/firestore', () => ({
  getFirestore: () => ({
    collection: () => ({
      where: () => ({
        limit: () => ({ get: firestoreGetMock })
      })
    })
  })
}));

// --- JSON-LD escaping ---------------------------------------------------------

describe('serializeJsonLd (Phase 1: script-breakout hardening)', () => {
  it('escapes < so </script> cannot terminate the JSON-LD block', () => {
    const out = serializeJsonLd({ name: '</script><img src=x onerror=alert(1)>' });
    expect(out).not.toContain('</script>');
    expect(out).toContain('\\u003c/script>');
  });

  it('round-trips through JSON.parse with identical data', () => {
    const data = { position: 2, name: 'a<b>c' };
    expect(JSON.parse(serializeJsonLd(data))).toEqual(data);
  });
});

// --- Request schema validation ------------------------------------------------

describe('request validation schemas (Phase 1: zod boundaries)', () => {
  it('telemetry schema strips unknown keys and bounds props', () => {
    const parsed = telemetryEventSchema.parse({
      name: 'pageview',
      url: 'https://example.com/x',
      evilField: 'dropped',
      props: { plan: 'pro' }
    });
    expect(parsed.name).toBe('pageview');
    expect(parsed.props).toEqual({ plan: 'pro' });
    expect('evilField' in parsed).toBe(false);
  });

  it('telemetry schema rejects oversized strings', () => {
    const result = telemetryEventSchema.safeParse({ name: 'x'.repeat(65) });
    expect(result.success).toBe(false);
  });

  it('state sync schema enforces collection enum and documentId charset', () => {
    expect(stateSyncSchema.safeParse({ collection: 'domains', actionType: 'insert', documentId: 'd-1' }).success).toBe(true);
    expect(stateSyncSchema.safeParse({ collection: 'users', actionType: 'insert', documentId: 'd-1' }).success).toBe(false);
    expect(stateSyncSchema.safeParse({ collection: 'domains', actionType: 'drop', documentId: 'd-1' }).success).toBe(false);
    expect(stateSyncSchema.safeParse({ collection: 'domains', actionType: 'insert', documentId: '../etc' }).success).toBe(false);
  });

  it('state sync schema defaults payload to an empty object', () => {
    const parsed = stateSyncSchema.parse({ collection: 'goals', actionType: 'delete', documentId: 'g1' });
    expect(parsed.payload).toEqual({});
  });

  it('engine run schema validates engine membership', () => {
    const schema = engineRunSchemaFactory(['health', 'latency'] as const);
    expect(schema.safeParse({ url: 'https://x.com', engine: 'health' }).success).toBe(true);
    expect(schema.safeParse({ url: 'https://x.com', engine: 'nuclear' }).success).toBe(false);
  });

  it('check-url and monitor-probe schemas bound URL length', () => {
    expect(checkUrlSchema.safeParse({ url: 'https://ok.example' }).success).toBe(true);
    expect(checkUrlSchema.safeParse({ url: 'https://' + 'a'.repeat(2100) }).success).toBe(false);
    expect(monitorProbeSchema.safeParse({ url: 42 }).success).toBe(false);
  });

  it('firstIssue renders a path-prefixed message', () => {
    const result = stateSyncSchema.safeParse({ collection: 'nope', actionType: 'insert', documentId: 'x' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(firstIssue(result.error)).toContain('collection');
    }
  });
});

// --- Identity middleware --------------------------------------------------------

function makeReqRes(authHeader?: string) {
  const req = {
    headers: authHeader ? { authorization: authHeader } : {},
    path: '/api/test'
  } as unknown as import('express').Request;
  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn()
  } as unknown as import('express').Response;
  const next = vi.fn();
  return { req, res, next };
}

describe('attachIdentity middleware (Phase 1: server-derived tiers)', () => {
  beforeEach(() => {
    resetVerifierCache();
    verifyIdTokenMock.mockReset();
    firestoreGetMock.mockReset();
    firestoreGetMock.mockResolvedValue({ empty: true, docs: [] });
    process.env.FIREBASE_SERVICE_ACCOUNT_JSON = JSON.stringify({ project_id: 'test', client_email: 'x', private_key: 'y' });
  });

  afterEach(() => {
    delete process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  });

  it('passes anonymous requests through without an identity', async () => {
    const { req, res, next } = makeReqRes();
    await attachIdentity(req, res, next);
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  it('rejects an invalid token with 401 (fail closed)', async () => {
    verifyIdTokenMock.mockRejectedValue(new Error('bad token'));
    const { req, res, next } = makeReqRes('Bearer forged-token');
    await attachIdentity(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('attaches free-tier identity for a valid token without subscription doc', async () => {
    verifyIdTokenMock.mockResolvedValue({ uid: 'uid-1', email: 'a@b.c' });
    const { req, res, next } = makeReqRes('Bearer valid-token');
    await attachIdentity(req, res, next);
    expect(next).toHaveBeenCalled();
    const identity = (req as import('express').Request & { verifiedIdentity?: VerifiedIdentity }).verifiedIdentity;
    expect(identity?.uid).toBe('uid-1');
    expect(identity?.plan).toBe('free');
    expect(identity?.isSuperadmin).toBe(false);
  });

  it('derives superadmin exclusively from signed custom claims', async () => {
    verifyIdTokenMock.mockResolvedValue({ uid: 'uid-2', role: 'superadmin' });
    const { req, next } = makeReqRes('Bearer valid-token');
    const res = { status: vi.fn().mockReturnThis(), json: vi.fn() } as unknown as import('express').Response;
    await attachIdentity(req, res, next);
    const identity = (req as import('express').Request & { verifiedIdentity?: VerifiedIdentity }).verifiedIdentity;
    expect(identity?.isSuperadmin).toBe(true);
    expect(identity?.plan).toBe('free');
  });

  it('maps Firestore subscription docs to plan + trial entitlements', async () => {
    verifyIdTokenMock.mockResolvedValue({ uid: 'uid-3' });
    firestoreGetMock.mockResolvedValue({
      empty: false,
      docs: [{ data: () => ({ planId: 'pro', status: 'trialing' }) }]
    });
    const { req, next } = makeReqRes('Bearer valid-token');
    const res = { status: vi.fn().mockReturnThis(), json: vi.fn() } as unknown as import('express').Response;
    await attachIdentity(req, res, next);
    const identity = (req as import('express').Request & { verifiedIdentity?: VerifiedIdentity }).verifiedIdentity;
    expect(identity?.plan).toBe('pro');
    expect(identity?.isTrialActive).toBe(true);
  });
});

describe('identityToEntitlements mapping', () => {
  const base: VerifiedIdentity = { uid: 'u', plan: 'free', isTrialActive: false, isSuperadmin: false };

  it('superadmin gets unlimited', () => {
    const mapped = identityToEntitlements({ ...base, isSuperadmin: true }, 50);
    expect(mapped.limit).toBeNull();
    expect(mapped.burstMax).toBe(Infinity);
  });

  it('paid plans map to their unit budgets', () => {
    expect(identityToEntitlements({ ...base, plan: 'enterprise' }, 50).limit).toBe(5000);
    expect(identityToEntitlements({ ...base, plan: 'team' }, 50).limit).toBe(1500);
    expect(identityToEntitlements({ ...base, plan: 'pro' }, 50).limit).toBe(500);
    expect(identityToEntitlements({ ...base, plan: 'starter' }, 50).limit).toBe(150);
  });

  it('unknown plans fall back to the free allowance', () => {
    expect(identityToEntitlements({ ...base, plan: 'mystery' }, 50).limit).toBe(50);
  });
});

// --- Error boundary -----------------------------------------------------------

function Boom(): React.ReactElement {
  throw new Error('render explosion');
}

describe('ErrorBoundary (Phase 1: recovery UI)', () => {
  it('renders the recovery card instead of crashing the tree', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    render(
      <MemoryRouter>
        <ErrorBoundary variant="route">
          <Boom />
        </ErrorBoundary>
      </MemoryRouter>
    );
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText('Something disrupted this view')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /reload/i })).toBeInTheDocument();
    expect(screen.getByText(/render explosion/)).toBeInTheDocument();
    errorSpy.mockRestore();
  });

  it('renders children untouched when nothing throws', () => {
    render(
      <MemoryRouter>
        <ErrorBoundary variant="route">
          <div data-testid="fine">all good</div>
        </ErrorBoundary>
      </MemoryRouter>
    );
    expect(screen.getByTestId('fine')).toBeInTheDocument();
  });

  it('reloads on button click', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const reloadSpy = vi.fn();
    Object.defineProperty(window, 'location', {
      writable: true,
      value: { ...window.location, reload: reloadSpy }
    });
    render(
      <MemoryRouter>
        <ErrorBoundary variant="root">
          <Boom />
        </ErrorBoundary>
      </MemoryRouter>
    );
    fireEvent.click(screen.getByRole('button', { name: /reload/i }));
    expect(reloadSpy).toHaveBeenCalled();
    errorSpy.mockRestore();
  });
});
