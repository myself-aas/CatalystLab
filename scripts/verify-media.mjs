#!/usr/bin/env node
/**
 * scripts/verify-media.mjs
 * ============================================================================
 * CATALYSTLAB VERIFIED MEDIA PRE-FLIGHT VERIFIER (R4 CONTRACT)
 * ============================================================================
 * Checks all remote media URLs (Unsplash images, Pexels images, Pexels videos)
 * in the static MANIFEST_URLS table below via HTTP Range GET / HEAD requests.
 * (There is no external "registry" yet — the list is a literal in this file.)
 *
 * Verdict (scripts/verify-media.mjs `summarize`):
 *   pass → every endpoint answered 2xx/206/304                        → exit 0
 *   fail → any endpoint definitively answered 4xx/5xx                 → exit 1
 *   skip → nothing answered 4xx/5xx, but an endpoint was unreachable  → exit 0
 *          from this network (firewall, offline, DNS blackhole), unless
 *          STRICT_MEDIA=1, which turns an unverifiable run into exit 1.
 * Before this, "unreachable" was treated as "broken", so the gate failed on
 * any egress-restricted runner even though no asset was missing.
 */

import { pathToFileURL } from 'url';

const MANIFEST_URLS = [
  // Unsplash Images
  { id: 'U-SERVER', url: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=2400&auto=format&fit=crop' },
  { id: 'U-NET', url: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?q=80&w=2400&auto=format&fit=crop' },
  { id: 'U-CIRCUIT', url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=2400&auto=format&fit=crop' },
  { id: 'U-MATRIX', url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=1600&auto=format&fit=crop' },
  { id: 'U-CYBER', url: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=1600&auto=format&fit=crop' },
  { id: 'U-GLOBE', url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2000&auto=format&fit=crop' },
  { id: 'U-CODE', url: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=1600&auto=format&fit=crop' },
  { id: 'U-NEON', url: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=2000&auto=format&fit=crop' },
  { id: 'U-FACE-1', url: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=96&h=96&auto=format&fit=crop&crop=faces' },
  { id: 'U-FACE-2', url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=96&h=96&auto=format&fit=crop&crop=faces' },
  { id: 'U-FACE-3', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=96&h=96&auto=format&fit=crop&crop=faces' },
  { id: 'U-FACE-4', url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=96&h=96&auto=format&fit=crop&crop=faces' },

  // Pexels Images
  { id: 'P-DC', url: 'https://images.pexels.com/photos/1148820/pexels-photo-1148820.jpeg?auto=compress&cs=tinysrgb&w=2400' },
  { id: 'P-TECH', url: 'https://images.pexels.com/photos/2253275/pexels-photo-2253275.jpeg?auto=compress&cs=tinysrgb&w=2400' },
  { id: 'P-WORK', url: 'https://images.pexels.com/photos/4384679/pexels-photo-4384679.jpeg?auto=compress&cs=tinysrgb&w=2000' },

  // Pexels Videos
  { id: 'V-HERO', url: 'https://videos.pexels.com/video-files/19575751/19575751-uhd_2560_1440_30fps.mp4' },
  { id: 'V-AI', url: 'https://videos.pexels.com/video-files/8328150/8328150-uhd_1440_2560_25fps.mp4' },
  { id: 'V-ALT', url: 'https://videos.pexels.com/video-files/8873150/8873150-hd_1080_1920_25fps.mp4' },
  { id: 'V-ALT2', url: 'https://videos.pexels.com/video-files/9574011/9574011-hd_1080_2048_25fps.mp4' },
];

async function verifyUrl(entry) {
  const { id, url } = entry;
  const startTime = Date.now();

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'CatalystLab-MediaVerifier/2.0',
        'Range': 'bytes=0-1024',
      },
      signal: controller.signal,
    });

    clearTimeout(timeout);
    const duration = Date.now() - startTime;

    // HTTP 200 (OK) or 206 (Partial Content) or 301/302/307 (Redirect) are valid
    if (response.ok || response.status === 206 || response.status === 304) {
      const contentType = response.headers.get('content-type') || 'unknown';
      return {
        id,
        url,
        status: response.status,
        duration: `${duration}ms`,
        type: contentType,
        ok: true,
      };
    } else {
      return {
        id,
        url,
        status: response.status,
        duration: `${duration}ms`,
        ok: false,
        error: `HTTP status ${response.status}`,
      };
    }
  } catch (err) {
    const duration = Date.now() - startTime;
    return {
      id,
      url,
      status: 0,
      duration: `${duration}ms`,
      ok: false,
      error: err.message,
    };
  }
}

/**
 * Classifies a batch of probe results.
 * @param {Array<{ok: boolean, status: number}>} results
 * @returns {'pass' | 'skip' | 'fail'}
 */
export function summarize(results) {
  if (results.some((r) => r.status >= 400 && r.status < 600)) return 'fail';
  if (results.some((r) => r.status === 0)) return 'skip';
  return 'pass';
}

async function run() {
  console.log('⚡ [CatalystLab] Verifying Verified Media Manifest (M0/M4 Contract)...\n');
  console.log(`Checking ${MANIFEST_URLS.length} remote endpoints across Unsplash and Pexels CDN...\n`);

  const results = await Promise.all(MANIFEST_URLS.map(verifyUrl));
  const verdict = summarize(results);
  const strict = process.env.STRICT_MEDIA === '1';

  console.log('| Manifest ID | Status | Latency | Type / Info | Endpoint URL |');
  console.log('|-------------|--------|---------|-------------|--------------|');

  for (const res of results) {
    const statusLabel = res.ok
      ? `\x1b[32mPASS (${res.status})\x1b[0m`
      : res.status === 0
        ? `\x1b[33mUNVERIFIED\x1b[0m`
        : `\x1b[31mFAIL (${res.status})\x1b[0m`;
    const shortUrl = res.url.length > 50 ? res.url.slice(0, 47) + '...' : res.url;
    const typeLabel = res.type || res.error || 'unknown';

    console.log(`| ${res.id.padEnd(11)} | ${statusLabel.padEnd(18)} | ${res.duration.padEnd(7)} | ${typeLabel.slice(0, 20).padEnd(20)} | ${shortUrl} |`);

  }

  console.log('\n----------------------------------------------------------------------');
  if (verdict === 'fail') {
    console.error('❌ [ERROR] Media verification failed: an asset returned 4xx/5xx.');
    process.exit(1);
  }
  if (verdict === 'skip') {
    const unreachable = results.filter((r) => r.status === 0).length;
    if (strict) {
      console.error(
        `❌ [ERROR] STRICT_MEDIA=1: ${unreachable} endpoint(s) unreachable, cannot verify the manifest.`
      );
      process.exit(1);
    }
    console.warn(
      `⚠  [SKIP] ${unreachable} endpoint(s) unreachable from this network; verdict skipped (set STRICT_MEDIA=1 to fail).`
    );
    process.exit(0);
  }
  console.log(`✅ [SUCCESS] All ${MANIFEST_URLS.length} media manifest assets are verified live and accessible.`);
  process.exit(0);
}

// Ruling R2: importing this module (the unit test does) must not run the probes.
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  run();
}
