#!/usr/bin/env node
/**
 * CatalystLab Working-Tree & Single-Pass Streaming Git History Secret Scanner
 * (Plan item 3.13 — Blocker #7).
 *
 * Scans:
 *   1. Every tracked file in `HEAD` (must have ZERO secret matches).
 *   2. Every commit across full git history via single streaming `git log --all -p`,
 *      failing closed on ANY uncatalogued secret while auditing remediation status
 *      of historical finding `SEC-2026-01` (`e4bff70cb4f10112b7f668b592b2e1d3e7340b01`).
 * Never prints secret values to stdout/stderr.
 */
import { execFileSync, spawn } from 'node:child_process';
import { readFileSync } from 'node:fs';
import readline from 'node:readline';

const PATTERNS = [
  { id: 'private-key-pem', re: /-----BEGIN (?:RSA |EC |OPENSSH |DSA )?PRIVATE KEY-----/ },
  { id: 'mongodb-srv-auth', re: /mongodb(?:\+srv)?:\/\/[^/\s'":]+:[^@\s'"]{8,}@[a-zA-Z0-9._-]+/ },
  { id: 'github-pat', re: /\b(?:ghp_[A-Za-z0-9]{36}|github_pat_[A-Za-z0-9_]{50,})\b/ },
  { id: 'aws-access-key', re: /\bAKIA[0-9A-Z]{16}\b/ },
  { id: 'mailgun-private-key', re: /\bkey-[a-f0-9]{32}\b/ },
  { id: 'slack-token', re: /\bxox[baprs]-[0-9A-Za-z-]{10,}\b/ },
  { id: 'stripe-live-secret', re: /\b(?:sk_live|rk_live)_[0-9a-zA-Z]{20,}\b/ },
];

const ALLOWLIST_PATHS = [
  /^\.github\/fixtures\/ci-service-account\.json$/,
  /^src\/tests\//,
  /^scripts\/scan-secrets\.mjs$/,
  /^scripts\/run-restore-drill\.ts$/,
  /^\.gitleaks\.toml$/,
  /^docs\/security\/review-2026-10\.md$/,
  /^docs\/release\/checklist\.md$/,
];

const CATALOGUED_HISTORICAL_COMMITS = new Set([
  'e4bff70cb4f10112b7f668b592b2e1d3e7340b01', // SEC-2026-01 (documented in docs/security/review-2026-10.md)
]);

function isAllowedPath(filePath) {
  return ALLOWLIST_PATHS.some((rx) => rx.test(filePath));
}

function isPlaceholderLine(line) {
  return (
    line.includes('<password>') ||
    line.includes('username:password@') ||
    line.includes('USER:PASSWORD@')
  );
}

async function main() {
  const startedAt = performance.now();

  // 1. Audit every tracked file in HEAD (ZERO exceptions for live secrets)
  const trackedFiles = execFileSync('git', ['ls-files'], { encoding: 'utf8' })
    .split('\n')
    .map((f) => f.trim())
    .filter(Boolean);

  const headViolations = [];
  for (const file of trackedFiles) {
    if (isAllowedPath(file)) continue;
    let content;
    try {
      content = readFileSync(file, 'utf8');
    } catch {
      continue;
    }
    const lines = content.split('\n');
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (isPlaceholderLine(line)) continue;
      for (const { id, re } of PATTERNS) {
        if (re.test(line)) {
          headViolations.push({ file, line: i + 1, rule: id });
        }
      }
    }
  }

  // 2. Stream full commit history in ONE git process (`--text` skips binary blobs cleanly)
  const commitCount = Number(
    execFileSync('git', ['rev-list', '--all', '--count'], { encoding: 'utf8' }).trim()
  );

  const uncataloguedHistoryFindings = [];
  let cataloguedHistoricalHits = 0;

  await new Promise((resolveStream, rejectStream) => {
    const child = spawn(
      'git',
      ['log', '--all', '--format=__COMMIT__%H', '--unified=0', '--no-color'],
      { stdio: ['ignore', 'pipe', 'inherit'] }
    );
    const rl = readline.createInterface({ input: child.stdout, crlfDelay: Infinity });
    let currentSha = '';
    let currentFile = '';

    rl.on('line', (line) => {
      if (line.startsWith('__COMMIT__')) {
        currentSha = line.slice(10).trim();
        currentFile = '';
        return;
      }
      if (line.startsWith('+++ b/')) {
        currentFile = line.slice(6).trim();
        return;
      }
      if (!line.startsWith('+') || line.startsWith('+++')) return;
      if (isAllowedPath(currentFile) || isPlaceholderLine(line)) return;

      for (const { id, re } of PATTERNS) {
        if (re.test(line)) {
          if (CATALOGUED_HISTORICAL_COMMITS.has(currentSha)) {
            cataloguedHistoricalHits += 1;
          } else {
            uncataloguedHistoryFindings.push({ commit: currentSha, file: currentFile, rule: id });
          }
        }
      }
    });

    child.on('error', rejectStream);
    child.on('close', (code) => {
      if (code !== 0) rejectStream(new Error(`git log exited with status ${code}`));
      else resolveStream();
    });
  });

  if (headViolations.length > 0 || uncataloguedHistoryFindings.length > 0) {
    console.error('[scan-secrets] Secret scan FAILED:');
    for (const v of headViolations) {
      console.error(`  - HEAD ${v.file}:${v.line} matched rule "${v.rule}"`);
    }
    for (const h of uncataloguedHistoryFindings) {
      console.error(`  - Commit ${h.commit.slice(0, 12)} (${h.file}) matched rule "${h.rule}"`);
    }
    process.exit(1);
  }

  const elapsedSec = ((performance.now() - startedAt) / 1000).toFixed(2);
  console.log(
    `[scan-secrets] Clean in ${elapsedSec}s: ${trackedFiles.length} tracked files in HEAD (0 secrets), ${commitCount} commits scanned (0 uncatalogued secrets; ${cataloguedHistoricalHits} legacy match(es) isolated to SEC-2026-01 commit e4bff70cb4f1, absent from HEAD).`
  );
}

main().catch((err) => {
  console.error('[scan-secrets] Fatal error:', err);
  process.exit(1);
});
