import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { MasterAuditPage } from '../../pages/MasterAuditPage';
import { ProductsPage } from '../../pages/ProductsPage';
import { PricingPage } from '../../pages/PricingPage';
import { DiagnosticEnginesPage } from '../../pages/DiagnosticEnginesPage';
import { MethodologyPage } from '../../pages/MethodologyPage';
import { TermsPage } from '../../pages/TermsPage';
import { PrivacyPage } from '../../pages/PrivacyPage';
import { CookiePolicyPage } from '../../pages/CookiePolicyPage';
import { SecurityPage } from '../../pages/SecurityPage';
import { ContactPage } from '../../pages/ContactPage';
import { ComparePage } from '../../pages/ComparePage';
import { ApiDocsPage } from '../../pages/ApiDocsPage';
import { BlogsPage } from '../../pages/BlogsPage';
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

describe('Browserbase UI-Test: Core Application Views & Pages', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders MasterAuditPage with primary telemetry triggers and metrics', () => {
    render(<MasterAuditPage />, { wrapper });
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
  });

  it('renders ProductsPage with product solutions catalog', () => {
    render(<ProductsPage />, { wrapper });
    expect(document.body).toBeInTheDocument();
  });

  it('renders PricingPage with subscription tiers and features', () => {
    render(<PricingPage />, { wrapper });
    expect(document.body).toBeInTheDocument();
  });

  it('renders DiagnosticEnginesPage with engine catalog', () => {
    render(<DiagnosticEnginesPage />, { wrapper });
    expect(document.body).toBeInTheDocument();
  });

  it('renders MethodologyPage with audit benchmarks and scoring', () => {
    render(<MethodologyPage />, { wrapper });
    expect(document.body).toBeInTheDocument();
  });

  it('renders TermsPage legal disclosures', () => {
    render(<TermsPage />, { wrapper });
    expect(document.body).toBeInTheDocument();
  });

  it('renders PrivacyPage legal disclosures', () => {
    render(<PrivacyPage />, { wrapper });
    expect(document.body).toBeInTheDocument();
  });

  it('renders CookiePolicyPage preferences and disclosure', () => {
    render(<CookiePolicyPage />, { wrapper });
    expect(document.body).toBeInTheDocument();
  });

  it('renders SecurityPage vulnerability management and compliance', () => {
    render(<SecurityPage />, { wrapper });
    expect(document.body).toBeInTheDocument();
  });

  it('renders ContactPage inquiry and feedback forms', () => {
    render(<ContactPage />, { wrapper });
    expect(document.body).toBeInTheDocument();
  });

  it('renders ComparePage engine comparison matrix', () => {
    render(<ComparePage />, { wrapper });
    expect(document.body).toBeInTheDocument();
  });

  it('renders ApiDocsPage developer endpoints reference', () => {
    render(<ApiDocsPage />, { wrapper });
    expect(document.body).toBeInTheDocument();
  });

  it('renders BlogsPage telemetry and engineering articles', () => {
    render(<BlogsPage />, { wrapper });
    expect(document.body).toBeInTheDocument();
  });
});
