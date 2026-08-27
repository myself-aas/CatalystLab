import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FullscreenCard } from '../../components/ui/FullscreenCard';
import { FullscreenImageCard } from '../../components/ui/FullscreenImageCard';
import { ParallaxCard } from '../../components/common/ParallaxCard';
import { ParallaxSection } from '../../components/common/ParallaxSection';

describe('Browserbase UI-Test: Fullscreen Cards & 3D Parallax Systems', () => {
  it('renders FullscreenCard with title, subtitle, score and dark gradient scrim', () => {
    const { container } = render(
      <FullscreenCard
        title="VitalZyme DOM Analyzer"
        subtitle="Engine 01"
        description="High-frequency DOM tree depth and layout stability metrics analyzer."
        score="98/100"
        badge="Enterprise"
        category="Architecture"
        metric="12.4ms"
        metricLabel="Avg Response"
      />
    );

    expect(screen.getByText('VitalZyme DOM Analyzer')).toBeInTheDocument();
    expect(screen.getByText('Engine 01')).toBeInTheDocument();
    expect(screen.getByText('98/100')).toBeInTheDocument();
    expect(screen.getByText('Enterprise')).toBeInTheDocument();
    expect(screen.getByText('12.4ms')).toBeInTheDocument();
    expect(screen.getByText('Avg Response')).toBeInTheDocument();

    // Verify dark gradient scrim presence
    const scrim = container.querySelector('[aria-hidden="true"]');
    expect(scrim).toBeInTheDocument();
  });

  it('handles mouse movements and hover events for 3D tilt without crashing', () => {
    const { container } = render(
      <FullscreenCard
        title="EdgeVmax Real-Time Latency"
        subtitle="Engine 02"
        description="Edge compute distributed ping and network jitter telemetry."
        score="95/100"
        badge="Verified"
      />
    );

    const card = container.firstChild as HTMLElement;
    expect(card).toBeInTheDocument();

    // Trigger mouse enter, move, and leave
    fireEvent.mouseEnter(card);
    fireEvent.mouseMove(card, { clientX: 150, clientY: 200 });
    fireEvent.mouseLeave(card);
  });

  it('renders FullscreenImageCard with gradient overlay and action buttons', () => {
    const { container } = render(
      <FullscreenImageCard
        title="SynthShift CSS Parser"
        subtitle="Diagnostic Tool"
        badge="Active"
        score="100%"
        action={<button id="test-run-btn">Run Benchmark</button>}
      >
        <p>Testing child content within FullscreenImageCard.</p>
      </FullscreenImageCard>
    );

    expect(screen.getByText('SynthShift CSS Parser')).toBeInTheDocument();
    expect(screen.getByText('Diagnostic Tool')).toBeInTheDocument();
    expect(screen.getByText('Active')).toBeInTheDocument();
    expect(screen.getByText('100%')).toBeInTheDocument();
    expect(screen.getByText('Run Benchmark')).toBeInTheDocument();
    expect(screen.getByText('Testing child content within FullscreenImageCard.')).toBeInTheDocument();

    // Verify gradient scrim overlay exists
    const gradientOverlay = container.querySelector('.bg-gradient-to-t');
    expect(gradientOverlay).toBeInTheDocument();
  });

  it('renders ParallaxCard and ParallaxSection with children and speed attributes', () => {
    render(
      <ParallaxSection className="test-section">
        <ParallaxCard speed={0.5} className="test-card">
          <div data-testid="parallax-child">Parallax Inner Content</div>
        </ParallaxCard>
      </ParallaxSection>
    );

    expect(screen.getByTestId('parallax-child')).toBeInTheDocument();
    expect(screen.getByText('Parallax Inner Content')).toBeInTheDocument();
  });
});
