import { NewsletterModal } from "./components/common/NewsletterModal";
import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AnimatePresence } from "motion/react";
import { PageTransition } from "./components/common/LazyAnimate";
import { Navbar } from "./components/layout/Navbar";
import { TrialBanner } from "./components/common/TrialBanner";
import { TrialActivationModal } from "./components/common/TrialActivationModal";
import { GlobalBreadcrumb } from "./components/layout/GlobalBreadcrumb";
import { Footer } from "./components/layout/Footer";
import { AuthDomainModal } from "./components/auth/AuthDomainModal";
import {
  GetInTouchEmailModal,
  type GetInTouchModalEventDetail,
} from "./components/common/GetInTouchEmailModal";
import { MasterAuditPage } from "./pages/MasterAuditPage";
import { MasterAuditExecutionPage } from "./pages/MasterAuditExecutionPage";
import { UserDashboardPage } from "./pages/UserDashboardPage";
import { AdminDashboardPage } from "./pages/AdminDashboardPage";
import { AdminRoute } from "./components/auth/AdminRoute";
import { DomainReportArticlePage } from "./pages/DomainReportArticlePage";
import { ReportsDirectoryPage } from "./pages/ReportsDirectoryPage";
import { ComparePage } from "./pages/ComparePage";
import { ToolPage } from "./pages/ToolPage";
import { MethodologyPage } from "./pages/MethodologyPage";
import { BlogsPage } from "./pages/BlogsPage";
import { BlogPostPage } from "./pages/BlogPostPage";
import { ContactPage } from "./pages/ContactPage";
import { PrivacyPage } from "./pages/PrivacyPage";
import { TermsPage } from "./pages/TermsPage";
import { CookiePolicyPage } from "./pages/CookiePolicyPage";
import { SecurityPage } from "./pages/SecurityPage";
import { PricingPage } from "./pages/PricingPage";
import { ProductsPage } from "./pages/ProductsPage";
import { DocsPage } from "./pages/DocsPage";
import { SystemOverviewDoc } from "./pages/docs/SystemOverviewDoc";
import { ArchitectureDoc } from "./pages/docs/ArchitectureDoc";
import { SecurityDoc } from "./pages/docs/SecurityDoc";
import { RateLimitingDoc } from "./pages/docs/RateLimitingDoc";
import { ScoringMatrixDoc } from "./pages/docs/ScoringMatrixDoc";
import { SynthShiftDoc } from "./pages/docs/SynthShiftDoc";
import { GitLygaseDoc } from "./pages/docs/GitLygaseDoc";
import { EcoHoloDoc } from "./pages/docs/EcoHoloDoc";
import { VitalZymeDoc } from "./pages/docs/VitalZymeDoc";
import { EdgeVmaxDoc } from "./pages/docs/EdgeVmaxDoc";
import { RiskProteaseDoc } from "./pages/docs/RiskProteaseDoc";
import { LlmKinaseDoc } from "./pages/docs/LlmKinaseDoc";
import { AllosterSearchDoc } from "./pages/docs/AllosterSearchDoc";
import { OrchestratorDoc } from "./pages/docs/OrchestratorDoc";
import { ApiReferenceDoc } from "./pages/docs/ApiReferenceDoc";
import { CicdDevOpsDoc } from "./pages/docs/CicdDevOpsDoc";
import { ApiDocsPage } from "./pages/ApiDocsPage";
import { PlaygroundPage } from "./pages/PlaygroundPage";

const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [pathname]);

  return null;
};

export const App: React.FC = () => {
  const location = useLocation();
  const [isGetInTouchOpen, setIsGetInTouchOpen] = useState(false);
  const [getInTouchTopic, setGetInTouchTopic] = useState("general");
  const [getInTouchSource, setGetInTouchSource] = useState("app-global");

  useEffect(() => {
    const handleOpenModal = (e: Event) => {
      const customEvent = e as CustomEvent<GetInTouchModalEventDetail>;
      if (customEvent.detail?.topic) {
        setGetInTouchTopic(customEvent.detail.topic);
      }
      if (customEvent.detail?.sourceContext) {
        setGetInTouchSource(customEvent.detail.sourceContext);
      }
      setIsGetInTouchOpen(true);
    };

    window.addEventListener("catalyst:open-get-in-touch", handleOpenModal);
    return () =>
      window.removeEventListener("catalyst:open-get-in-touch", handleOpenModal);
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-[#f4f6fa] text-[#0b192c] selection:bg-[#415a77]/25 selection:text-[#0b192c]">
      <ScrollToTop />
      <TrialBanner />
      <Navbar />
      <GlobalBreadcrumb />
      <div className="flex-1">
        <AnimatePresence mode="wait">
          <PageTransition key={location.pathname} className="min-h-full">
            <Routes location={location} key={location.pathname}>
              <Route path="/" element={<MasterAuditPage />} />
              <Route path="/index.html" element={<Navigate to="/" replace />} />
              <Route
                path="/launch-audit"
                element={<MasterAuditExecutionPage />}
              />
              <Route
                path="/launch-audit.html"
                element={<MasterAuditExecutionPage />}
              />
              <Route path="/audit" element={<MasterAuditExecutionPage />} />
              <Route
                path="/audit.html"
                element={<MasterAuditExecutionPage />}
              />
              <Route
                path="/master-audit"
                element={<MasterAuditExecutionPage />}
              />
              <Route
                path="/master-audit.html"
                element={<MasterAuditExecutionPage />}
              />

              {/* Services: Pricing & Products */}
              <Route path="/pricing" element={<PricingPage />} />
              <Route path="/pricing.html" element={<PricingPage />} />
              <Route path="/products" element={<ProductsPage />} />
              <Route path="/products.html" element={<ProductsPage />} />
              <Route path="/plugins" element={<ProductsPage />} />
              <Route path="/plugins.html" element={<ProductsPage />} />
              <Route path="/integrations" element={<ProductsPage />} />
              <Route path="/integrations.html" element={<ProductsPage />} />

              {/* Documentation Suite - Modular Pages with Dedicated URLs */}
              <Route path="/docs" element={<DocsPage />} />
              <Route path="/docs.html" element={<DocsPage />} />
              <Route path="/docs/overview" element={<SystemOverviewDoc />} />
              <Route path="/docs/architecture" element={<ArchitectureDoc />} />
              <Route path="/docs/security-sandbox" element={<SecurityDoc />} />
              <Route path="/docs/rate-limiting" element={<RateLimitingDoc />} />
              <Route path="/docs/scoring-matrix" element={<ScoringMatrixDoc />} />
              <Route path="/docs/synthshift" element={<SynthShiftDoc />} />
              <Route path="/docs/migration" element={<SynthShiftDoc />} />
              <Route path="/docs/gitlygase" element={<GitLygaseDoc />} />
              <Route path="/docs/repo-scanner" element={<GitLygaseDoc />} />
              <Route path="/docs/ecoholo" element={<EcoHoloDoc />} />
              <Route path="/docs/eco-audit" element={<EcoHoloDoc />} />
              <Route path="/docs/vitalzyme" element={<VitalZymeDoc />} />
              <Route path="/docs/health" element={<VitalZymeDoc />} />
              <Route path="/docs/edgevmax" element={<EdgeVmaxDoc />} />
              <Route path="/docs/latency" element={<EdgeVmaxDoc />} />
              <Route path="/docs/riskprotease" element={<RiskProteaseDoc />} />
              <Route path="/docs/compliance" element={<RiskProteaseDoc />} />
              <Route path="/docs/llm-kinase" element={<LlmKinaseDoc />} />
              <Route path="/docs/ai-readiness" element={<LlmKinaseDoc />} />
              <Route path="/docs/allostersearch" element={<AllosterSearchDoc />} />
              <Route path="/docs/llmo" element={<AllosterSearchDoc />} />
              <Route path="/docs/orchestrator" element={<OrchestratorDoc />} />
              <Route path="/docs/master-audit" element={<OrchestratorDoc />} />
              <Route path="/docs/api" element={<ApiReferenceDoc />} />
              <Route path="/docs/api-reference" element={<ApiReferenceDoc />} />
              <Route path="/docs/cicd" element={<CicdDevOpsDoc />} />
              <Route path="/docs/devops" element={<CicdDevOpsDoc />} />

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
              <Route
                path="/user-dashboard.html"
                element={<UserDashboardPage />}
              />

              {/* Admin Command Center & Monitoring Studio (Protected by AdminRoute with Superadmin Custom Claim Check) */}
              <Route
                path="/admin"
                element={
                  <AdminRoute>
                    <AdminDashboardPage />
                  </AdminRoute>
                }
              />
              <Route
                path="/admin.html"
                element={
                  <AdminRoute>
                    <AdminDashboardPage />
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/monitoring"
                element={
                  <AdminRoute>
                    <AdminDashboardPage />
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/blogs"
                element={
                  <AdminRoute>
                    <AdminDashboardPage />
                  </AdminRoute>
                }
              />

              {/* Dedicated Blog-Style Audit Report Dossier Pages (Unique URL: /reports/{domain-ext}) */}
              <Route
                path="/reports/:slug"
                element={<DomainReportArticlePage />}
              />
              <Route path="/report/:id" element={<DomainReportArticlePage />} />
              <Route path="/report" element={<ReportsDirectoryPage />} />
              <Route path="/report.html" element={<ReportsDirectoryPage />} />

              <Route path="/reports" element={<ReportsDirectoryPage />} />
              <Route path="/reports.html" element={<ReportsDirectoryPage />} />

              <Route path="/compare" element={<ComparePage />} />
              <Route path="/compare.html" element={<ComparePage />} />

              {/* 8 Specialized Diagnostic Engines */}
              <Route
                path="/health"
                element={<ToolPage engineType="health" />}
              />
              <Route
                path="/health.html"
                element={<ToolPage engineType="health" />}
              />

              <Route
                path="/latency"
                element={<ToolPage engineType="latency" />}
              />
              <Route
                path="/latency.html"
                element={<ToolPage engineType="latency" />}
              />

              <Route
                path="/ai-readiness"
                element={<ToolPage engineType="ai_ready" />}
              />
              <Route
                path="/ai-readiness.html"
                element={<ToolPage engineType="ai_ready" />}
              />

              <Route
                path="/repo-scanner"
                element={<ToolPage engineType="repo" />}
              />
              <Route
                path="/repo-scanner.html"
                element={<ToolPage engineType="repo" />}
              />

              <Route
                path="/eco-audit"
                element={<ToolPage engineType="eco" />}
              />
              <Route
                path="/eco-audit.html"
                element={<ToolPage engineType="eco" />}
              />

              <Route
                path="/compliance"
                element={<ToolPage engineType="compliance" />}
              />
              <Route
                path="/compliance.html"
                element={<ToolPage engineType="compliance" />}
              />

              <Route
                path="/migration"
                element={<ToolPage engineType="migration" />}
              />
              <Route
                path="/migration.html"
                element={<ToolPage engineType="migration" />}
              />

              <Route path="/llmo" element={<ToolPage engineType="llmo" />} />
              <Route
                path="/llmo.html"
                element={<ToolPage engineType="llmo" />}
              />

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
      <TrialActivationModal />
      <NewsletterModal />
      <GetInTouchEmailModal
        isOpen={isGetInTouchOpen}
        onClose={() => setIsGetInTouchOpen(false)}
        initialTopic={getInTouchTopic}
        sourceContext={getInTouchSource}
      />
    </div>
  );
};
export default App;
