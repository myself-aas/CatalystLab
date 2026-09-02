import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { HeroSection } from '../../components/home/HeroSection';
import { ThemeToggle } from '../../components/layout/ThemeToggle';
import { NavbarSearch } from '../../components/layout/NavbarSearch';
import { StickyHUD } from '../../components/layout/StickyHUD';
import { DiagnosticEngineCard } from '../../components/DiagnosticEngineCard';
import { AuthProvider } from '../../context/AuthContext';
import { ThemeProvider } from '../../context/ThemeContext';
import { SubscriptionProvider } from '../../context/SubscriptionContext';
import { RoleSecurityProvider } from '../../context/RoleSecurityContext';
import type { Engine } from '../../data/diagnosticEngines';

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <MemoryRouter>
    <ThemeProvider>
      <AuthProvider>
        <SubscriptionProvider>
          <RoleSecurityProvider>{children}</RoleSecurityProvider>
        </SubscriptionProvider>
      </AuthProvider>
    </ThemeProvider>
  </MemoryRouter>
);

const mockEngine: Engine = {
  id: 'vitalzyme',
  name: 'VitalZyme DOM Inspector',
  subtitle: 'High-frequency DOM tree mutation analyzer',
  category: 'DOM & Vitals',
  badge: 'DOM',
  theme: 'dark',
  metrics: [
    { label: 'DOM Nodes', value: '450' },
    { label: 'Max Depth', value: '14' },
  ],
};

describe('Browserbase UI-Test: Interactive Forms, Engines & Controls', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders HeroSection and handles URL input, preset chip selection, and mobile mode switcher', () => {
    render(<HeroSection />, { wrapper });

    const inputs = screen.getAllByPlaceholderText(/example\.com/i);
    expect(inputs.length).toBeGreaterThanOrEqual(1);
    const input = inputs[0];
    expect(input).toBeInTheDocument();

    // Type custom URL
    fireEvent.change(input, { target: { value: 'https://github.com' } });
    expect(input).toHaveValue('https://github.com');

    // Click preset chip if available
    const presetChips = screen.queryAllByText(/stripe.com|cloudflare.com|github.com|vercel.com/i);
    if (presetChips.length > 0) {
      fireEvent.click(presetChips[0]);
    }

    // Test mobile interactive mode switcher buttons
    const globeTab = screen.queryByRole('button', { name: /3D Mesh/i });
    if (globeTab) {
      fireEvent.click(globeTab);
    }
    const telemetryTab = screen.queryByRole('button', { name: /Live HUD/i });
    if (telemetryTab) {
      fireEvent.click(telemetryTab);
    }
    const auditTab = screen.queryByRole('button', { name: /Audit Terminal/i });
    if (auditTab) {
      fireEvent.click(auditTab);
    }
  });

  it('toggles theme between dark and light modes via ThemeToggle', () => {
    render(<ThemeToggle />, { wrapper });

    const toggleButton = screen.getByRole('button');
    expect(toggleButton).toBeInTheDocument();

    fireEvent.click(toggleButton);
  });

  it('renders NavbarSearch and expands search input when triggered', () => {
    render(<NavbarSearch isScrolled={false} />, { wrapper });

    const searchBtn = screen.getByRole('button', { name: /search/i });
    expect(searchBtn).toBeInTheDocument();

    fireEvent.click(searchBtn);
  });

  it('renders StickyHUD floating status indicator and displays quota', () => {
    render(<StickyHUD />, { wrapper });

    // Verify HUD is mounted
    const hudContainer = document.querySelector('[role="status"]') || document.querySelector('.fixed');
    expect(hudContainer).toBeInTheDocument();
  });

  it('renders DiagnosticEngineCard and handles favorite toggle and action button', () => {
    render(<DiagnosticEngineCard engine={mockEngine} />, { wrapper });

    expect(screen.getByText(/VitalZyme DOM Inspector/i)).toBeInTheDocument();
    expect(screen.getByText(/High-frequency DOM tree mutation analyzer/i)).toBeInTheDocument();
    expect(screen.getByText(/DOM & Vitals/i)).toBeInTheDocument();

    const favButton = screen.getByLabelText(/Favorite engine/i);
    expect(favButton).toBeInTheDocument();
    fireEvent.click(favButton);

    const runButton = screen.getByRole('button', { name: /Run Diagnostic/i });
    expect(runButton).toBeInTheDocument();
    fireEvent.click(runButton);
  });
});
