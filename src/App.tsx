import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'motion/react';
import { PageTransition } from './components/common/LazyAnimate';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { AuthDomainModal } from './components/auth/AuthDomainModal';
import { MasterAuditPage } from './pages/MasterAuditPage';
import { UserDashboardPage } from './pages/UserDashboardPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { DomainReportArticlePage } from './pages/DomainReportArticlePage';
import { ReportsDirectoryPage } from './pages/ReportsDirectoryPage';
import { ComparePage } from './pages/ComparePage';
import { ToolPage } from './pages/ToolPage';
import { MethodologyPage } from './pages/MethodologyPage';
import { BlogsPage } from './pages/BlogsPage';
import { BlogPostPage } from './pages/BlogPostPage';
import { ContactPage } from './pages/ContactPage';
import { PrivacyPage } from './pages/PrivacyPage';
import { TermsPage } from './pages/TermsPage';
import { CookiePolicyPage } from './pages/CookiePolicyPage';
import { SecurityPage } from './pages/SecurityPage';
import { PricingPage } from './pages/PricingPage';
import { DocsPage } from './pages/DocsPage';
import { ApiDocsPage } from './pages/ApiDocsPage';
import { PlaygroundPage } from './pages/PlaygroundPage';

export const App: React.FC = () => {
  const location = useLocation();

  return (
    <div className="flex min-h-screen flex-col bg-[#f4f6fa] text-[#0b192c] selection:bg-[#415a77]/25 selection:text-[#0b192c]">
      <Navbar />
      <div className="flex-1">
        <AnimatePresence mode="wait">
          <PageTransition key={location.pathname} className="min-h-full">
            <Routes location={location} key={location.pathname}>
              <Route path="/" element={<MasterAuditPage />} />
              <Route path="/index.html" element={<Navigate to="/" replace />} />
              
              {/* Main Navigation Pages */}
              <Route path="/pricing" element={<PricingPage />} />
              <Route path="/pricing.html" element={<PricingPage />} />
              
              <Route path="/docs" element={<DocsPage />} />
              <Route path="/docs.html" element={<DocsPage />} />

              {/* Comprehensive API Reference & Test Playground */}
              <Route path="/api-docs" element={<ApiDocsPage />} />
              <Route path="/api-docs.html" element={<ApiDocsPage />} />
              <Route path="/api-reference" element={<ApiDocsPage />} />
              <Route path="/api-reference.html" element={<ApiDocsPage />} />
              <Route path="/developer/api" element={<ApiDocsPage />} />
              <Route path="/playground" element={<PlaygroundPage />} />
              <Route path="/playground.html" element={<PlaygroundPage />} />

              <Route path="/about" element={<MethodologyPage />} />
              <Route path="/about.html" element={<MethodologyPage />} />
              
              {/* User Dashboard & Reports */}
              <Route path="/dashboard" element={<UserDashboardPage />} />
              <Route path="/dashboard.html" element={<UserDashboardPage />} />
              <Route path="/user-dashboard" element={<UserDashboardPage />} />
              <Route path="/user-dashboard.html" element={<UserDashboardPage />} />

              {/* Admin Command Center & Monitoring Studio */}
              <Route path="/admin" element={<AdminDashboardPage />} />
              <Route path="/admin.html" element={<AdminDashboardPage />} />
              <Route path="/admin/monitoring" element={<AdminDashboardPage />} />
              <Route path="/admin/blogs" element={<AdminDashboardPage />} />
              
              {/* Dedicated Blog-Style Audit Report Dossier Pages (Unique URL: /reports/{domain-ext}) */}
              <Route path="/reports/:slug" element={<DomainReportArticlePage />} />
              <Route path="/report/:id" element={<DomainReportArticlePage />} />
              <Route path="/report" element={<ReportsDirectoryPage />} />
              <Route path="/report.html" element={<ReportsDirectoryPage />} />
              
              <Route path="/reports" element={<ReportsDirectoryPage />} />
              <Route path="/reports.html" element={<ReportsDirectoryPage />} />
              
              <Route path="/compare" element={<ComparePage />} />
              <Route path="/compare.html" element={<ComparePage />} />
              
              {/* 8 Specialized Diagnostic Engines */}
              <Route path="/health" element={<ToolPage engineType="health" />} />
              <Route path="/health.html" element={<ToolPage engineType="health" />} />
              
              <Route path="/latency" element={<ToolPage engineType="latency" />} />
              <Route path="/latency.html" element={<ToolPage engineType="latency" />} />
              
              <Route path="/ai-readiness" element={<ToolPage engineType="ai_ready" />} />
              <Route path="/ai-readiness.html" element={<ToolPage engineType="ai_ready" />} />
              
              <Route path="/repo-scanner" element={<ToolPage engineType="repo" />} />
              <Route path="/repo-scanner.html" element={<ToolPage engineType="repo" />} />
              
              <Route path="/eco-audit" element={<ToolPage engineType="eco" />} />
              <Route path="/eco-audit.html" element={<ToolPage engineType="eco" />} />
              
              <Route path="/compliance" element={<ToolPage engineType="compliance" />} />
              <Route path="/compliance.html" element={<ToolPage engineType="compliance" />} />
              
              <Route path="/migration" element={<ToolPage engineType="migration" />} />
              <Route path="/migration.html" element={<ToolPage engineType="migration" />} />
              
              <Route path="/llmo" element={<ToolPage engineType="llmo" />} />
              <Route path="/llmo.html" element={<ToolPage engineType="llmo" />} />
              
              {/* Educational & Blog Articles */}
              <Route path="/methodology" element={<MethodologyPage />} />
              <Route path="/methodology.html" element={<MethodologyPage />} />
              
              <Route path="/blogs" element={<BlogsPage />} />
              <Route path="/blogs.html" element={<BlogsPage />} />
              <Route path="/blogs/:slug" element={<BlogPostPage />} />
              <Route path="/blog/:slug" element={<BlogPostPage />} />
              
              {/* Dedicated Support Hub */}
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/contact.html" element={<ContactPage />} />
              
              {/* Dedicated Legal & Trust Pages */}
              <Route path="/privacy" element={<PrivacyPage />} />
              <Route path="/privacy.html" element={<PrivacyPage />} />
              
              <Route path="/terms" element={<TermsPage />} />
              <Route path="/terms.html" element={<TermsPage />} />
              
              <Route path="/cookies" element={<CookiePolicyPage />} />
              <Route path="/cookies.html" element={<CookiePolicyPage />} />
              
              <Route path="/security" element={<SecurityPage />} />
              <Route path="/security.html" element={<SecurityPage />} />

              {/* Catch-all */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </PageTransition>
        </AnimatePresence>
      </div>
      <Footer />
      <AuthDomainModal />
    </div>
  );
};
export default App;
