import { NewsletterModal } from "./components/common/NewsletterModal";
import { PaymentCheckoutModal } from "./components/common/PaymentCheckoutModal";
import React, { useState, useEffect, Suspense } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AnimatePresence } from "motion/react";
import { PageTransition } from "./components/common/LazyAnimate";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { Sidebar } from './components/layout/Sidebar';
import { Navbar } from './components/layout/Navbar';
import { MobileBottomNav } from './components/layout/MobileBottomNav';
import { LinearAmbientBackground } from "./components/layout/LinearAmbientBackground";
import { StickyHUD } from "./components/layout/StickyHUD";
import { TrialBanner } from "./components/common/TrialBanner";
import { TrialActivationModal } from "./components/common/TrialActivationModal";
import { GlobalBreadcrumb } from "./components/layout/GlobalBreadcrumb";
import { Footer } from "./components/layout/Footer";
import { DevSiteLayout } from "./components/layout/DevSiteLayout";

import { AuthDomainModal } from "./components/auth/AuthDomainModal";
import {
  GetInTouchEmailModal,
  type GetInTouchModalEventDetail,
} from "./components/common/GetInTouchEmailModal";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { RoleSimulatorFloatingBar } from "./components/common/RoleSimulatorFloatingBar";
import { RouteLoadingSkeleton } from "./components/common/RouteLoadingSkeleton";
import type { SubscriptionPlanId } from "./types";
import { useTheme } from "./context/ThemeContext";

// Critical landing page kept synchronous for instant FCP / LCP
import { MasterAuditPage } from "./pages/MasterAuditPage";
import { AdminRoute } from "./components/auth/AdminRoute";

// Lazy-loaded routes for code-splitting & optimal bundle chunking
const MasterAuditExecutionPage = React.lazy(() => import("./pages/MasterAuditExecutionPage").then(m => ({ default: m.MasterAuditExecutionPage })));
const CommandCenterPage = React.lazy(() => import("./pages/CommandCenterPage").then(m => ({ default: m.CommandCenterPage })));
const UserDashboardPage = React.lazy(() => import("./pages/UserDashboardPage").then(m => ({ default: m.UserDashboardPage })));
const AdminDashboardPage = React.lazy(() => import("./pages/AdminDashboardPage").then(m => ({ default: m.AdminDashboardPage })));
const DomainReportArticlePage = React.lazy(() => import("./pages/DomainReportArticlePage").then(m => ({ default: m.DomainReportArticlePage })));
const ReportsDirectoryPage = React.lazy(() => import("./pages/ReportsDirectoryPage").then(m => ({ default: m.ReportsDirectoryPage })));
const ComparePage = React.lazy(() => import("./pages/ComparePage").then(m => ({ default: m.ComparePage })));
const ToolPage = React.lazy(() => import("./pages/ToolPage").then(m => ({ default: m.ToolPage })));
const MethodologyPage = React.lazy(() => import("./pages/MethodologyPage").then(m => ({ default: m.MethodologyPage })));
const BlogsPage = React.lazy(() => import("./pages/BlogsPage").then(m => ({ default: m.BlogsPage })));
const BlogPostPage = React.lazy(() => import("./pages/BlogPostPage").then(m => ({ default: m.BlogPostPage })));
const BlogEditorPage = React.lazy(() => import("./pages/BlogEditorPage").then(m => ({ default: m.BlogEditorPage })));
const ContactPage = React.lazy(() => import("./pages/ContactPage").then(m => ({ default: m.ContactPage })));
const PrivacyPage = React.lazy(() => import("./pages/PrivacyPage").then(m => ({ default: m.PrivacyPage })));
const TermsPage = React.lazy(() => import("./pages/TermsPage").then(m => ({ default: m.TermsPage })));
const CookiePolicyPage = React.lazy(() => import("./pages/CookiePolicyPage").then(m => ({ default: m.CookiePolicyPage })));
const LegalPage = React.lazy(() => import("./pages/LegalPage").then(m => ({ default: m.LegalPage })));
const SecurityPage = React.lazy(() => import("./pages/SecurityPage").then(m => ({ default: m.SecurityPage })));
const PricingPage = React.lazy(() => import("./pages/PricingPage").then(m => ({ default: m.PricingPage })));
const ProductsPage = React.lazy(() => import("./pages/ProductsPage").then(m => ({ default: m.ProductsPage })));
const DocsPage = React.lazy(() => import("./pages/DocsPage").then(m => ({ default: m.DocsPage })));
const SystemOverviewDoc = React.lazy(() => import("./pages/docs/SystemOverviewDoc").then(m => ({ default: m.SystemOverviewDoc })));
const ArchitectureDoc = React.lazy(() => import("./pages/docs/ArchitectureDoc").then(m => ({ default: m.ArchitectureDoc })));
const SecurityDoc = React.lazy(() => import("./pages/docs/SecurityDoc").then(m => ({ default: m.SecurityDoc })));
const RateLimitingDoc = React.lazy(() => import("./pages/docs/RateLimitingDoc").then(m => ({ default: m.RateLimitingDoc })));
const ScoringMatrixDoc = React.lazy(() => import("./pages/docs/ScoringMatrixDoc").then(m => ({ default: m.ScoringMatrixDoc })));
const SynthShiftDoc = React.lazy(() => import("./pages/docs/SynthShiftDoc").then(m => ({ default: m.SynthShiftDoc })));
const GitLygaseDoc = React.lazy(() => import("./pages/docs/GitLygaseDoc").then(m => ({ default: m.GitLygaseDoc })));
const EcoHoloDoc = React.lazy(() => import("./pages/docs/EcoHoloDoc").then(m => ({ default: m.EcoHoloDoc })));
const VitalZymeDoc = React.lazy(() => import("./pages/docs/VitalZymeDoc").then(m => ({ default: m.VitalZymeDoc })));
const EdgeVmaxDoc = React.lazy(() => import("./pages/docs/EdgeVmaxDoc").then(m => ({ default: m.EdgeVmaxDoc })));
const RiskProteaseDoc = React.lazy(() => import("./pages/docs/RiskProteaseDoc").then(m => ({ default: m.RiskProteaseDoc })));
const LlmKinaseDoc = React.lazy(() => import("./pages/docs/LlmKinaseDoc").then(m => ({ default: m.LlmKinaseDoc })));
const AllosterSearchDoc = React.lazy(() => import("./pages/docs/AllosterSearchDoc").then(m => ({ default: m.AllosterSearchDoc })));
const OrchestratorDoc = React.lazy(() => import("./pages/docs/OrchestratorDoc").then(m => ({ default: m.OrchestratorDoc })));
const ApiReferenceDoc = React.lazy(() => import("./pages/docs/ApiReferenceDoc").then(m => ({ default: m.ApiReferenceDoc })));
const CicdDevOpsDoc = React.lazy(() => import("./pages/docs/CicdDevOpsDoc").then(m => ({ default: m.CicdDevOpsDoc })));
const ApiDocsPage = React.lazy(() => import("./pages/ApiDocsPage").then(m => ({ default: m.ApiDocsPage })));
const PlaygroundPage = React.lazy(() => import("./pages/PlaygroundPage").then(m => ({ default: m.PlaygroundPage })));
const LoginPage = React.lazy(() => import("./pages/LoginPage").then(m => ({ default: m.LoginPage })));
const SignUpPage = React.lazy(() => import("./pages/SignUpPage").then(m => ({ default: m.SignUpPage })));
const NotFoundPage = React.lazy(() => import("./pages/NotFoundPage").then(m => ({ default: m.NotFoundPage })));

const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [pathname]);

  return null;
};

const DevSiteLayoutWrapper: React.FC<{ enabled: boolean; children: React.ReactNode }> = ({
  enabled,
  children,
}) => (enabled ? <DevSiteLayout>{children}</DevSiteLayout> : <>{children}</>);

/** App chrome (sidebar + mobile tab bar) — product surfaces only. */
const APP_CHROME_RE = /^\/(dashboard|admin|app|hud|user-dashboard)(\/|$|\.html$)/;

export const App: React.FC = () => {
  const location = useLocation();
  const showAppChrome = APP_CHROME_RE.test(location.pathname);
  const { resolvedTheme } = useTheme();
  const isDocsRoute = /^\/docs(\/|$|\.html$)/.test(location.pathname);
  const isAuthRoute = /^\/(login|signin|signup|register)(\.html)?$/.test(location.pathname);
  const useDevSiteLayout = !isDocsRoute && !showAppChrome && !isAuthRoute;
  const pagePolarity = resolvedTheme === "dark" ? "theme-dark" : "theme-light";
  const [isGetInTouchOpen, setIsGetInTouchOpen] = useState(false);
  const [getInTouchTopic, setGetInTouchTopic] = useState("general");
  const [getInTouchSource, setGetInTouchSource] = useState("app-global");

  const [isPaymentCheckoutOpen, setIsPaymentCheckoutOpen] = useState(false);
  const [paymentPlanId, setPaymentPlanId] = useState<SubscriptionPlanId>('pro');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

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

    const handleOpenPayment = (e: Event) => {
      const customEvent = e as CustomEvent<{ planId?: SubscriptionPlanId }>;
      if (customEvent.detail?.planId) {
        setPaymentPlanId(customEvent.detail.planId);
      }
      setIsPaymentCheckoutOpen(true);
    };

    window.addEventListener("catalyst:open-get-in-touch", handleOpenModal);
    window.addEventListener("catalyst:open-payment-checkout", handleOpenPayment);
    return () => {
      window.removeEventListener("catalyst:open-get-in-touch", handleOpenModal);
      window.removeEventListener("catalyst:open-payment-checkout", handleOpenPayment);
    };
  }, []);

  return (
    <>
      <div className={`app-shell flex min-h-screen text-foreground animate-app-fade-in relative ${showAppChrome ? "pb-16 lg:pb-0" : ""} ${resolvedTheme === "dark" ? "bg-transparent" : "bg-background"}`}>
        {resolvedTheme === "dark" && <LinearAmbientBackground />}
        {showAppChrome && (
          <Sidebar mobileOpen={isMobileSidebarOpen} onCloseMobile={() => setIsMobileSidebarOpen(false)} />
        )}
        {showAppChrome && (
          <MobileBottomNav onOpenMenu={() => setIsMobileSidebarOpen(true)} />
        )}
        <div className="flex-1 flex flex-col min-w-0 relative z-10">
          <a
            href="#main-content"
            className="sr-only rounded-br-lg p-4 font-semibold text-primary shadow-lg focus:not-sr-only focus:absolute focus:z-[100] focus:bg-background focus:text-foreground focus:outline focus:outline-2 focus:outline-primary"
          >
            Skip to main content
          </a>
          <ScrollToTop />
          <TrialBanner />
          <Navbar onOpenMobileMenu={showAppChrome ? () => setIsMobileSidebarOpen(true) : undefined} />
          {!useDevSiteLayout && !isDocsRoute && <GlobalBreadcrumb />}
          <main id="main-content" className={`${pagePolarity} flex-1`}>
            <AnimatePresence mode="wait">
              <PageTransition key={location.pathname} className="min-h-full">
            <Suspense fallback={<RouteLoadingSkeleton />}>
              <ErrorBoundary variant="route">
              <DevSiteLayoutWrapper enabled={useDevSiteLayout}>
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

              {/* Authentication: Sign In & Registration Suite */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/login.html" element={<LoginPage />} />
              <Route path="/signin" element={<LoginPage />} />
              <Route path="/signin.html" element={<LoginPage />} />
              <Route path="/signup" element={<SignUpPage />} />
              <Route path="/signup.html" element={<SignUpPage />} />
              <Route path="/register" element={<SignUpPage />} />
              <Route path="/register.html" element={<SignUpPage />} />

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

              {/* User Dashboard & Telemetry Command Center HUD */}
              <Route path="/app" element={<CommandCenterPage />} />
              <Route path="/hud" element={<CommandCenterPage />} />
              <Route path="/dashboard/hud" element={<CommandCenterPage />} />
              <Route path="/insights" element={<BlogsPage />} />

              {/* User Dashboard & Reports (Protected) */}
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute requiredPermission="page:view_dashboard">
                    <UserDashboardPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/dashboard/:tab" 
                element={
                  <ProtectedRoute requiredPermission="page:view_dashboard">
                    <UserDashboardPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/dashboard.html" 
                element={
                  <ProtectedRoute requiredPermission="page:view_dashboard">
                    <UserDashboardPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/user-dashboard" 
                element={
                  <ProtectedRoute requiredPermission="page:view_dashboard">
                    <UserDashboardPage />
                  </ProtectedRoute>
                } 
              />
              <Route
                path="/user-dashboard.html"
                element={
                  <ProtectedRoute requiredPermission="page:view_dashboard">
                    <UserDashboardPage />
                  </ProtectedRoute>
                }
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
              <Route
                path="/admin/blogs/create"
                element={
                  <AdminRoute>
                    <BlogEditorPage />
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/blogs/new"
                element={
                  <AdminRoute>
                    <BlogEditorPage />
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/blogs/edit/:id"
                element={
                  <AdminRoute>
                    <BlogEditorPage />
                  </AdminRoute>
                }
              />

              {/* User Dashboard Blog Editor Routes (Protected: Requires Pro or higher permissions) */}
              <Route 
                path="/dashboard/blogs/create" 
                element={
                  <ProtectedRoute requiredPermission="feature:write_blogs" minPlan="Pro">
                    <BlogEditorPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/dashboard/blogs/new" 
                element={
                  <ProtectedRoute requiredPermission="feature:write_blogs" minPlan="Pro">
                    <BlogEditorPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/dashboard/blogs/edit/:id" 
                element={
                  <ProtectedRoute requiredPermission="feature:write_blogs" minPlan="Pro">
                    <BlogEditorPage />
                  </ProtectedRoute>
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

              {/* Dedicated Blog Creation & Editing Studio Pages (Protected: Requires Pro or higher) */}
              <Route 
                path="/blogs/create" 
                element={
                  <ProtectedRoute requiredPermission="feature:write_blogs" minPlan="Pro">
                    <BlogEditorPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/blogs/new" 
                element={
                  <ProtectedRoute requiredPermission="feature:write_blogs" minPlan="Pro">
                    <BlogEditorPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/blogs/edit/:id" 
                element={
                  <ProtectedRoute requiredPermission="feature:write_blogs" minPlan="Pro">
                    <BlogEditorPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/blog/create" 
                element={
                  <ProtectedRoute requiredPermission="feature:write_blogs" minPlan="Pro">
                    <BlogEditorPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/blog/new" 
                element={
                  <ProtectedRoute requiredPermission="feature:write_blogs" minPlan="Pro">
                    <BlogEditorPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/blog/edit/:id" 
                element={
                  <ProtectedRoute requiredPermission="feature:write_blogs" minPlan="Pro">
                    <BlogEditorPage />
                  </ProtectedRoute>
                } 
              />

              <Route path="/blogs" element={<BlogsPage />} />
              <Route path="/blogs.html" element={<BlogsPage />} />
              <Route path="/blogs/:slug" element={<BlogPostPage />} />
              <Route path="/blog/:slug" element={<BlogPostPage />} />

              {/* Dedicated Support Hub */}
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/contact.html" element={<ContactPage />} />

              {/* Dedicated Legal & Trust Pages */}
              <Route path="/legal" element={<LegalPage />} />
              <Route path="/legal.html" element={<LegalPage />} />
              <Route path="/privacy" element={<PrivacyPage />} />
              <Route path="/privacy.html" element={<PrivacyPage />} />

              <Route path="/terms" element={<TermsPage />} />
              <Route path="/terms.html" element={<TermsPage />} />

              <Route path="/cookies" element={<CookiePolicyPage />} />
              <Route path="/cookies.html" element={<CookiePolicyPage />} />

              <Route path="/security" element={<SecurityPage />} />
              <Route path="/security.html" element={<SecurityPage />} />

              {/* 404 Not Found Handling */}
              <Route path="/404" element={<NotFoundPage />} />
              <Route path="/404.html" element={<NotFoundPage />} />

              {/* Catch-all */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
              </DevSiteLayoutWrapper>
              </ErrorBoundary>
          </Suspense>
        </PageTransition>
      </AnimatePresence>
      </main>
      <Footer />
      <StickyHUD />
      <RoleSimulatorFloatingBar />
      <AuthDomainModal />
      <TrialActivationModal />
      <NewsletterModal />
      <PaymentCheckoutModal
        isOpen={isPaymentCheckoutOpen}
        onClose={() => setIsPaymentCheckoutOpen(false)}
        initialPlanId={paymentPlanId}
      />
      <GetInTouchEmailModal
        isOpen={isGetInTouchOpen}
        onClose={() => setIsGetInTouchOpen(false)}
        initialTopic={getInTouchTopic}
        sourceContext={getInTouchSource}
      />
      </div>
    </div>
    </>
  );
};
export default App;
