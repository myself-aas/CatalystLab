import { describe, expect, it } from 'vitest';
import { summarize } from '../../../scripts/verify-media.mjs';

describe('media verification verdicts', () => {
  it('passes when every endpoint answered', () => {
    expect(summarize([{ ok: true, status: 200 }, { ok: true, status: 206 }])).toBe('pass');
  });
  it('skips when a CDN was merely unreachable', () => {
    expect(summarize([{ ok: true, status: 200 }, { ok: false, status: 0 }])).toBe('skip');
  });
  it('fails when an asset is definitively gone', () => {
    expect(summarize([{ ok: false, status: 404 }])).toBe('fail');
  });
  it('fails on a server error rather than skipping it', () => {
    expect(summarize([{ ok: false, status: 503 }])).toBe('fail');
  });
});
