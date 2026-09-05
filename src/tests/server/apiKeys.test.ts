import { describe, it, expect, beforeEach } from 'vitest';
import {
  API_KEY_PREFIX,
  createApiKey,
  deleteApiKey,
  findApiKey,
  hashApiKey,
  normalizeEnvironment,
  normalizeScopes,
  normalizeWhiteLabelConfig,
  resetApiKeyStore,
  revokeApiKey,
  rotateApiKey
} from '../../../server/core/apiKeys';

describe('server/core/apiKeys', () => {
  beforeEach(() => {
    resetApiKeyStore();
  });

  it('hashes secrets deterministically into a 64-char sha256 hex digest', () => {
    const secret = `${API_KEY_PREFIX}abcdef`;
    const h1 = hashApiKey(secret);
    const h2 = hashApiKey(secret);
    expect(h1).toMatch(/^[0-9a-f]{64}$/);
    expect(h1).toBe(h2);
  });

  it('creates, validates, rotates, revokes and deletes a persisted key', async () => {
    const { apiKey, secretKey } = await createApiKey({
      ownerId: 'usr_1',
      ownerEmail: 'dev@example.com',
      name: 'ci-key',
      environment: 'production',
      scopes: ['execute:engines', 'read:reports']
    });

    expect(apiKey.keyPrefix).toBe(`${secretKey.slice(0, 16)}...`);
    expect(apiKey).not.toHaveProperty('keyHash');
    expect(apiKey).not.toHaveProperty('secretKey');

    const found = findApiKey(secretKey);
    expect(found).not.toBeNull();
    expect(found?.id).toBe(apiKey.id);

    const rotated = await rotateApiKey('usr_1', apiKey.id);
    expect(rotated).not.toBeNull();
    expect(findApiKey(secretKey)).toBeNull();
    expect(findApiKey(rotated!.newSecretKey)).not.toBeNull();

    const revoked = await revokeApiKey('usr_1', apiKey.id);
    expect(revoked?.status).toBe('revoked');
    expect(findApiKey(rotated!.newSecretKey)).toBeNull();

    const deleted = await deleteApiKey('usr_1', apiKey.id);
    expect(deleted).toBe(true);
  });

  it('does not let one owner rotate another owner key', async () => {
    const { apiKey } = await createApiKey({
      ownerId: 'usr_1',
      ownerEmail: 'a@example.com',
      name: 'mine',
      environment: 'development',
      scopes: ['read:reports']
    });
    const rotated = await rotateApiKey('usr_2', apiKey.id);
    expect(rotated).toBeNull();
  });

  it('validates scopes/environment/white-label payloads', () => {
    expect(normalizeScopes(['execute:engines', 'read:reports'])).toEqual(['execute:engines', 'read:reports']);
    expect(normalizeScopes(['execute:engines', 'nope'])).toBeNull();
    expect(normalizeScopes('not-an-array')).toBeNull();
    expect(normalizeScopes([])).toBeNull();

    expect(normalizeEnvironment('production')).toBe('production');
    expect(normalizeEnvironment('test')).toBeNull();

    expect(normalizeWhiteLabelConfig({ organizationName: 'X' })).toEqual({ organizationName: 'X' });
    expect(normalizeWhiteLabelConfig('nope')).toBeNull();
    expect(normalizeWhiteLabelConfig({ a: {}, b: 1 })).toBeNull();
  });
});
