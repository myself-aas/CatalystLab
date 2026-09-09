import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { MainMenuOverlay } from '../../components/layout/MainMenuOverlay';
import Navbar from '../../components/layout/Navbar';
import { AuthProvider } from '../../context/AuthContext';
import { ThemeProvider } from '../../context/ThemeContext';
import { SubscriptionProvider } from '../../context/SubscriptionContext';
import { RoleSecurityProvider } from '../../context/RoleSecurityContext';

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

describe('Unified Right-Side Hamburger Menu & Navigation Drawer', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders right-side drawer with 100dvh responsive viewport height and proper dialog semantics', () => {
    const handleClose = vi.fn();
    render(
      <MainMenuOverlay
        isOpen={true}
        onClose={handleClose}
        currentWorkspace="Acme Mesh Prod"
      />,
      { wrapper }
    );

    // Verify dialog with role and aria-label
    const dialog = screen.getByRole('dialog', { name: /Main Navigation Menu/i });
    expect(dialog).toBeInTheDocument();

    // Verify right-side placement and responsive full viewport height classes
    expect(dialog.className).toContain('fixed');
    expect(dialog.className).toContain('right-0');
    expect(dialog.className).toContain('h-[100dvh]');

    // Verify workspace switcher is rendered inside the drawer
    expect(screen.getByText('Acme Mesh Prod')).toBeInTheDocument();
    expect(screen.getByText(/Active Workspace/i)).toBeInTheDocument();

    // Verify dashboard navigation section
    expect(screen.getByText(/Platform Overview/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Overview/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Audits/i })).toBeInTheDocument();

    // Verify diagnostic hub and engines explorer
    expect(screen.getByText(/Diagnostic Hub/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /8 Engines Explorer/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Automated PR Patches/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Security & OWASP/i })).toBeInTheDocument();

    // Verify explore & resources
    expect(screen.getByText(/Explore & Resources/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Documentation & Architecture/i })).toBeInTheDocument();

    // Verify close on close button click
    const closeBtn = screen.getByLabelText(/Close navigation menu/i);
    fireEvent.click(closeBtn);
    expect(handleClose).toHaveBeenCalledTimes(1);

    // Verify close on Escape key
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(handleClose).toHaveBeenCalledTimes(2);
  });

  it('renders visitor state with Sign In / Sign Up CTAs and Run Autonomous Audit CTA', () => {
    const handleClose = vi.fn();
    render(
      <MainMenuOverlay
        isOpen={true}
        onClose={handleClose}
      />,
      { wrapper }
    );

    // Visitor actions
    expect(screen.getByRole('link', { name: /Log In/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Sign Up/i })).toBeInTheDocument();
    expect(screen.getByText(/Run Autonomous Audit/i)).toBeInTheDocument();
  });

  it('triggers the unified drawer from Navbar hamburger button and custom event', () => {
    render(<Navbar />, { wrapper });

    // Click the Navbar hamburger button
    const hamburgerBtn = screen.getByLabelText(/Open mobile navigation menu/i);
    fireEvent.click(hamburgerBtn);

    // The right-side drawer dialog should now be in the document
    const dialog = screen.getByRole('dialog', { name: /Main Navigation Menu/i });
    expect(dialog).toBeInTheDocument();
    expect(dialog.className).toContain('right-0');
    expect(dialog.className).toContain('h-[100dvh]');
  });
});
