import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { App } from '../../App';
import { AuthProvider } from '../../context/AuthContext';
import { ThemeProvider } from '../../context/ThemeContext';
import { SubscriptionProvider } from '../../context/SubscriptionContext';
import { RoleSecurityProvider } from '../../context/RoleSecurityContext';
import { FullscreenCard } from '../../components/ui/FullscreenCard';
import { HeroSection } from '../../components/home/HeroSection';

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <MemoryRouter initialEntries={['/']}>
    <ThemeProvider>
      <AuthProvider>
        <SubscriptionProvider>
          <RoleSecurityProvider>{children}</RoleSecurityProvider>
        </SubscriptionProvider>
      </AuthProvider>
    </ThemeProvider>
  </MemoryRouter>
);

describe('Browserbase UI-Test: Accessibility & Visual Contrast Layering', () => {
  it('ensures Skip to Main Content anchor link exists and targets main-content ID', () => {
    render(<App />, { wrapper });
    const skipLink = screen.getByRole('link', { name: /skip to main content/i });
    expect(skipLink).toBeInTheDocument();
    expect(skipLink).toHaveAttribute('href', '#main-content');

    const mainElement = document.getElementById('main-content');
    expect(mainElement).toBeInTheDocument();
  });

  it('ensures primary structural semantic landmarks (nav, main, footer) are present', () => {
    render(<App />, { wrapper });
    expect(screen.getByRole('navigation')).toBeInTheDocument();
    expect(screen.getByRole('main')).toBeInTheDocument();
    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
  });

  it('ensures dark gradient scrim is applied to FullscreenCard for WCAG contrast', () => {
    const { container } = render(
      <FullscreenCard
        imageUrl="https://images.pexels.com/photos/3183132/pexels-photo-3183132.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
        title="Accessibility Contrast Scrim Test"
        badge="A11y Test"
        score="100/100"
      />
    );

    // Look for linear gradient or scrim overlay
    const scrimElement = container.querySelector('[aria-hidden="true"]');
    expect(scrimElement).toBeInTheDocument();
    const style = scrimElement?.getAttribute('style') || '';
    expect(style.toLowerCase()).toContain('linear-gradient');
  });

  it('ensures all interactive buttons have accessible text names or labels', () => {
    render(<App />, { wrapper });
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(0);

    buttons.forEach((btn) => {
      const hasAccessibleName =
        (btn.textContent && btn.textContent.trim().length > 0) ||
        btn.getAttribute('aria-label') ||
        btn.getAttribute('title') ||
        btn.querySelector('svg');
      expect(Boolean(hasAccessibleName)).toBe(true);
    });
  });

  it('ensures HeroSection applies protective contrast scrim overlays and high-contrast typography tokens', () => {
    const { container } = render(<HeroSection />, { wrapper });

    // 1. Verify protective accessibility contrast scrim exists
    const scrim = screen.getByTestId('hero-contrast-scrim');
    expect(scrim).toBeInTheDocument();
    expect(scrim).toHaveAttribute('aria-hidden', 'true');
    expect(scrim.className).toContain('bg-gradient-to-b');

    // 2. Verify all audit inputs have accessible placeholders and aria-labels
    const inputs = screen.getAllByPlaceholderText(/example\.com/i);
    expect(inputs.length).toBeGreaterThanOrEqual(1);
    inputs.forEach((input) => {
      expect(input).toHaveAttribute('aria-label');
      expect(input.className).toContain('placeholder-zinc-300');
    });

    // 3. Verify headline and subheading contrast
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toBeInTheDocument();
    expect(heading.className).toContain('drop-shadow');

    // 4. Verify telemetry badge and signal badges have high-contrast styling
    const beaconBadge = screen.getByText(/Autonomous Architecture & Telemetry OS/i);
    expect(beaconBadge).toBeInTheDocument();

    const presetsLabel = screen.getAllByText(/Presets:/i);
    expect(presetsLabel.length).toBeGreaterThanOrEqual(1);
  });
});
