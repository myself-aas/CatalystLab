import { auth } from './firebase';

/**
 * Builds Authorization headers for API calls that require server-side
 * identity verification (e.g. /api/state/sync).
 *
 * Returns the Firebase ID token for the signed-in user, refreshed by the
 * Firebase SDK when it is close to expiry. When no user is signed in the
 * returned object is empty and the server will respond 401 (fail closed).
 */
export async function buildAuthHeaders(extraHeaders: Record<string, string> = {}): Promise<Record<string, string>> {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    return { ...extraHeaders };
  }
  try {
    const token = await currentUser.getIdToken();
    return { ...extraHeaders, Authorization: `Bearer ${token}` };
  } catch {
    return { ...extraHeaders };
  }
}

/**
 * Drop-in fetch wrapper that attaches the signed-in user's Bearer ID token
 * (when present) so server endpoints can resolve the caller's tier. Falls
 * back to a plain fetch for anonymous visitors.
 */
export async function authorizedFetch(input: RequestInfo | URL, init: RequestInit = {}): Promise<Response> {
  const headers = await buildAuthHeaders(
    (init.headers as Record<string, string> | undefined) ?? {}
  );
  return fetch(input, { ...init, headers });
}
