import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { EngineReportDashboard } from '../../components/tool/EngineReportDashboard';
import type { EngineType } from '../../types';

const FAILED_SCAN = `
--- CORE WEBSITE HEALTH ANALYSIS ---
Target: https://broken.example

  [!] CRITICAL: Failed to complete health scan: getaddrinfo ENOTFOUND
---CATALYST_METRICS---
{ "measured": false, "healthScore": null, "scoreNote": "The scan did not complete, so no readings were recorded." }
`;

const GOOD_SCAN = `
--- CORE WEBSITE HEALTH ANALYSIS ---
Target: https://example.com
  [+] PASS: Lean HTML payload.
  [+] PASS: Lean HTML payload.
  [-] FAIL: Text compression (Brotli/Gzip) is not active. Major performance loss.
  [>] Time To First Byte (TTFB proxy): 128 ms
=> [SCORE] CATALYST HEALTH SCORE: 85/100
---CATALYST_METRICS---
{ "measured": true, "healthScore": 85, "loadTime": 128 }
`;

function renderDashboard(output: string) {
  return render(
    <EngineReportDashboard
      engineType={'health' as EngineType}
      targetUrl="https://example.com"
      output={output}
      onRelaunch={() => {}}
      onSave={() => {}}
      savedReportId={null}
    />
  );
}

describe('engine report only shows measured values', () => {
  it('shows "Not measured" instead of a score when the scan failed', () => {
    renderDashboard(FAILED_SCAN);
    expect(screen.getByText('Not measured')).toBeInTheDocument();
    expect(screen.queryByText(/^\d+\/100$/)).toBeNull();
    expect(screen.getAllByText(/The scan did not complete/).length).toBeGreaterThan(0);
    expect(screen.getByText(/has no readings to summarise/)).toBeInTheDocument();
    // The failure is still visible, so the reader can see what happened.
    expect(screen.getAllByText(/Failed to complete health scan/).length).toBeGreaterThan(0);
  });

  it('shows the score, the failing check and the measured round trip', () => {
    renderDashboard(GOOD_SCAN);
    expect(screen.getByText('85/100')).toBeInTheDocument();
    expect(screen.getAllByText(/Text compression/).length).toBeGreaterThan(0);
    expect(screen.getAllByText('128 ms').length).toBeGreaterThan(0);
    expect(screen.queryByText('Not measured')).toBeNull();
  });
});
