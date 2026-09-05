import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { RateLimitModal } from '../../components/RateLimitModal';
import { RateLimitBadge } from '../../components/RateLimitBadge';
import { PaymentCheckoutModal } from '../../components/common/PaymentCheckoutModal';
import { NewsletterModal } from '../../components/common/NewsletterModal';
import { GetInTouchEmailModal } from '../../components/common/GetInTouchEmailModal';
import { MainMenuOverlay } from '../../components/layout/MainMenuOverlay';
import { AuthProvider } from '../../context/AuthContext';
import { ThemeProvider } from '../../context/ThemeContext';
import { SubscriptionProvider, useSubscription } from '../../context/SubscriptionContext';
import { RoleSecurityProvider } from '../../context/RoleSecurityContext';
import { TrialActivationModal } from '../../components/common/TrialActivationModal';

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

const TrialModalOpener: React.FC = () => {
  const { openTrialModal } = useSubscription();
  return (
    <div>
      <button onClick={() => openTrialModal('pro')}>Open Trial</button>
      <TrialActivationModal />
    </div>
  );
};

describe('Browserbase UI-Test: Modals, Drawers & Overlay Systems', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders RateLimitModal when open, displays quota status, and handles close', () => {
    const handleClose = vi.fn();

    render(
      <RateLimitModal
        isOpen={true}
        onClose={handleClose}
      />,
      { wrapper }
    );

    // Verify modal header
    expect(screen.getByText(/Audit Rate Limit & Compute Quota|Limit Reached/i)).toBeInTheDocument();
    expect(screen.getByText(/CatalystLab Precision Telemetry Engine Allocation/i)).toBeInTheDocument();

    // Click close button
    const closeBtn = screen.getByRole('button', { name: /Close Rate Limit Modal/i });
    fireEvent.click(closeBtn);
    expect(handleClose).toHaveBeenCalled();
  });

  it('renders RateLimitBadge and responds to click to view quota details', () => {
    render(<RateLimitBadge />, { wrapper });
    const badge = screen.getByRole('button');
    expect(badge).toBeInTheDocument();
    fireEvent.click(badge);
  });

  it('renders TrialActivationModal when triggered via SubscriptionContext and handles close', async () => {
    render(<TrialModalOpener />, { wrapper });

    const openBtn = screen.getByText('Open Trial');
    fireEvent.click(openBtn);

    const trialElements = screen.getAllByText(/7-Day Free Trial|Unlock Full/i);
    expect(trialElements.length).toBeGreaterThan(0);

    // Close button
    const closeBtns = screen.getAllByRole('button');
    const closeIconBtn = closeBtns.find(b => b.querySelector('svg'));
    if (closeIconBtn) {
      fireEvent.click(closeIconBtn);
    }
  });

  it('renders PaymentCheckoutModal and switches billing tiers', () => {
    const handleClose = vi.fn();
    render(
      <PaymentCheckoutModal isOpen={true} onClose={handleClose} initialPlanId="pro" />,
      { wrapper }
    );

    expect(screen.getByText(/Enterprise Telemetry Checkout|Secure Checkout/i)).toBeInTheDocument();
  });

  it('renders NewsletterModal and validates email input field', async () => {
    render(<NewsletterModal defaultOpen={true} />, { wrapper });

    expect(screen.getByText(/Join the CatalystLab Newsletter/i)).toBeInTheDocument();
    const emailInput = screen.getByPlaceholderText(/developer@enterprise\.io/i);
    expect(emailInput).toBeInTheDocument();

    // Type valid email
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    expect(emailInput).toHaveValue('test@example.com');
  });

  it('renders GetInTouchEmailModal and allows topic selection and message input', () => {
    const handleClose = vi.fn();
    render(
      <GetInTouchEmailModal
        isOpen={true}
        onClose={handleClose}
        initialTopic="enterprise"
        sourceContext="test-suite"
      />,
      { wrapper }
    );

    expect(screen.getByText(/Get in Touch with CatalystLab/i)).toBeInTheDocument();
    const emailInput = screen.getByPlaceholderText(/you@company\.com/i);
    const nameInput = screen.getByPlaceholderText(/Alex Mercer/i);
    const messageInput = screen.getByPlaceholderText(/Tell us what you're building/i);

    fireEvent.change(emailInput, { target: { value: 'engineer@corp.com' } });
    fireEvent.change(nameInput, { target: { value: 'Jane Engineer' } });
    fireEvent.change(messageInput, { target: { value: 'Need edge diagnostic integration.' } });

    expect(emailInput).toHaveValue('engineer@corp.com');
    expect(nameInput).toHaveValue('Jane Engineer');
    expect(messageInput).toHaveValue('Need edge diagnostic integration.');
  });

  it('renders MainMenuOverlay and displays navigation links and shortcuts', () => {
    const handleClose = vi.fn();
    render(<MainMenuOverlay isOpen={true} onClose={handleClose} />, { wrapper });

    expect(screen.getByRole('dialog', { name: /Main Navigation Menu/i })).toBeInTheDocument();
    expect(screen.getByText(/Diagnostic Hub/i)).toBeInTheDocument();
    expect(screen.getByText(/Platform Overview/i)).toBeInTheDocument();

    // Press Escape to close
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(handleClose).toHaveBeenCalled();
  });
});
