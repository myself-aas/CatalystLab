import type { Request, Response } from 'express';
import { getAttachedIdentity } from '../../src/lib/serverAuth';

export function isProductionRuntime(): boolean {
  return process.env.NODE_ENV === 'production';
}

/**
 * Demo surfaces (vitest, local sandbox) may skip identity when
 * ALLOW_UNAUTH_DEMO=true AND the process is not production.
 * Production is always default-deny.
 */
export function isDemoUnauthAllowed(): boolean {
  // Only the test runner may skip identity. Staging/dev with
  // ALLOW_UNAUTH_DEMO must still authenticate.
  return process.env.NODE_ENV === 'test' && process.env.ALLOW_UNAUTH_DEMO === 'true';
}

/**
 * Require a verified Firebase identity. Demo flag is ignored in production.
 */
export function requireIdentity(req: Request, res: Response): boolean {
  if (isDemoUnauthAllowed()) return true;
  const identity = getAttachedIdentity(req);
  if (!identity?.uid) {
    res.status(401).json({
      success: false,
      error: 'Authentication required.'
    });
    return false;
  }
  return true;
}

/** @deprecated Use requireIdentity — kept for existing imports. */
export const requireIdentityInProduction = requireIdentity;

/**
 * Require a signed superadmin custom claim.
 * 401 when anonymous, 403 when signed in but not admin.
 */
export function requireSuperadmin(req: Request, res: Response): boolean {
  if (isDemoUnauthAllowed()) return true;
  const identity = getAttachedIdentity(req);
  if (!identity?.uid) {
    res.status(401).json({
      success: false,
      error: 'Authentication required.'
    });
    return false;
  }
  if (!identity.isSuperadmin) {
    res.status(403).json({
      success: false,
      error: 'Admin authentication required.'
    });
    return false;
  }
  return true;
}

/** @deprecated Use requireSuperadmin. */
export const requireSuperadminInProduction = requireSuperadmin;
