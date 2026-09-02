import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AuditScoreMatrixRadar } from '../../components/telemetry/AuditScoreMatrixRadar';
import type { MasterTelemetryReport } from '../../types/telemetry';

const mockReport: MasterTelemetryReport = {
  id: 'rep_test_123',
  targetUrl: 'https://catalystlab.tech',
  normalizedUrl: 'https://catalystlab.tech',
  domainSlug: 'catalystlab.tech',
  overallScore: 91,
  grade: 'A',
  startedAt: new Date().toISOString(),
  completedAt: new Date().toISOString(),
  totalDurationMs: 820,
  isCompleted: true,
  initiatedBy: { tier: 'pro', ipHash: 'mock-hash' },
  engines: {
    health: {
      engineId: 'health',
      name: 'Website Health',
      category: 'Performance',
      status: 'COMPLETE',
      executionTimeMs: 120,
      score: 95,
      rawLogStream: []
    },
    ai_ready: {
      engineId: 'ai_ready',
      name: 'AI Readiness',
      category: 'Intelligence',
      status: 'COMPLETE',
      executionTimeMs: 110,
      score: 88,
      rawLogStream: []
    },
    repo: {
      engineId: 'repo',
      name: 'Repo Hygiene',
      category: 'Architecture',
      status: 'COMPLETE',
      executionTimeMs: 90,
      score: 84,
      rawLogStream: []
    },
    latency: {
      engineId: 'latency',
      name: 'Edge Latency',
      category: 'Performance',
      status: 'COMPLETE',
      executionTimeMs: 80,
      score: 90,
      rawLogStream: []
    },
    eco: {
      engineId: 'eco',
      name: 'Eco Footprint',
      category: 'Performance',
      status: 'COMPLETE',
      executionTimeMs: 60,
      score: 98,
      rawLogStream: []
    },
    compliance: {
      engineId: 'compliance',
      name: 'OWASP Compliance',
      category: 'Security',
      status: 'COMPLETE',
      executionTimeMs: 95,
      score: 92,
      rawLogStream: []
    },
    migration: {
      engineId: 'migration',
      name: 'Platform Migration',
      category: 'Architecture',
      status: 'COMPLETE',
      executionTimeMs: 140,
      score: 82,
      rawLogStream: []
    },
    ai_search: {
      engineId: 'ai_search',
      name: 'AI Search Optimization',
      category: 'Intelligence',
      status: 'COMPLETE',
      executionTimeMs: 125,
      score: 89,
      rawLogStream: []
    }
  }
};

describe('AuditScoreMatrixRadar & Multi-Axis SVG Visualizer', () => {
  it('renders radar chart with accessible label and all 8 engines', () => {
    render(<AuditScoreMatrixRadar report={mockReport} />);

    // Accessible radar SVG
    const svgChart = screen.getByRole('img', {
      name: /multi-axis radar chart showing 8 engine scores/i
    });
    expect(svgChart).toBeInTheDocument();

    // Composite header
    expect(screen.getByText(/8-Engine Telemetry Matrix & Multi-Axis Radar/i)).toBeInTheDocument();
    expect(screen.getByText('91/100')).toBeInTheDocument();

    // Check presence of key engine labels in radar/matrix
    expect(screen.getAllByText(/Core Vitals/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/AI Crawler/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/Supply Chain/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/Edge Latency/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/Eco SWD/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/DevSecOps/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/Migration AST/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/LLMO Search/i).length).toBeGreaterThanOrEqual(1);
  });

  it('toggles industry benchmark overlay', () => {
    render(<AuditScoreMatrixRadar report={mockReport} />);

    const benchmarkBtn = screen.getByRole('button', { name: /Industry Benchmark/i });
    expect(benchmarkBtn).toBeInTheDocument();

    // Initially active
    fireEvent.click(benchmarkBtn);
    // Button state toggles
    fireEvent.click(benchmarkBtn);
  });

  it('filters score matrix rows by category', () => {
    render(<AuditScoreMatrixRadar report={mockReport} />);

    // Click Performance filter
    const perfBtn = screen.getByRole('button', { name: /PERFORMANCE/i });
    fireEvent.click(perfBtn);

    // Only Performance engines (Core Vitals, Edge Latency, Eco SWD) should be visible in matrix
    expect(screen.getByText(/Core Web Vitals & DOM Depth/i)).toBeInTheDocument();
    expect(screen.getByText(/Global Edge Network Latency/i)).toBeInTheDocument();
    expect(screen.getByText(/Eco Carbon & SWD Rating/i)).toBeInTheDocument();

    // Switch back to ALL
    const allBtn = screen.getByRole('button', { name: /ALL/i });
    fireEvent.click(allBtn);
    expect(screen.getByText(/AI Agent & LLM Readiness/i)).toBeInTheDocument();
  });

  it('triggers onSelectEngine callback on inspecting an engine', () => {
    const handleSelect = vi.fn();
    render(<AuditScoreMatrixRadar report={mockReport} onSelectEngine={handleSelect} />);

    // Click inspect button for Core Web Vitals
    const inspectBtn = screen.getByRole('button', {
      name: /Inspect Core Web Vitals & DOM Depth/i
    });
    fireEvent.click(inspectBtn);

    expect(handleSelect).toHaveBeenCalledWith('health');
  });
});
