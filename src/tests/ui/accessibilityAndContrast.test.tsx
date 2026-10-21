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
    expect(screen.getAllByRole('navigation').length).toBeGreaterThan(0);
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

  it('ensures HeroSection paints high-contrast theme tokens on its solid canvas', () => {
    render(<HeroSection />, { wrapper });

    // The 2026-10-21 design-system refactor replaced the photographic hero
    // (which needed a `hero-contrast-scrim` gradient overlay for WCAG
    // contrast) with a solid `bg-background` canvas, so contrast now comes
    // from the canonical theme/type tokens instead of a scrim layer.
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toBeInTheDocument();
    expect(heading.className).toContain('framer-hero-title');
    expect(heading.className).toContain('text-foreground');

    const heroSection = heading.closest('section');
    expect(heroSection).not.toBeNull();
    expect(heroSection?.className).toContain('bg-background');

    const inputs = screen.getAllByPlaceholderText(/your-domain\.com/i);
    expect(inputs.length).toBeGreaterThanOrEqual(1);
    inputs.forEach((input) => {
      expect(input).toHaveAttribute('aria-label');
    });
  });
});
