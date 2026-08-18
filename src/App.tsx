import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { MasterAuditPage } from './pages/MasterAuditPage';
import { UserDashboardPage } from './pages/UserDashboardPage';
import { ReportPermalinkPage } from './pages/ReportPermalinkPage';
import { ReportsDirectoryPage } from './pages/ReportsDirectoryPage';
import { ComparePage } from './pages/ComparePage';
import { ToolPage } from './pages/ToolPage';
import { MethodologyPage } from './pages/MethodologyPage';
import { BlogsPage } from './pages/BlogsPage';
import { ContactPage } from './pages/ContactPage';
import { LegalPage } from './pages/LegalPage';

export const App: React.FC = () => {
  return (
    <div className="flex min-h-screen flex-col bg-slate-950 text-slate-100 selection:bg-cyan-500/30 selection:text-cyan-200">
      <Navbar />
      <div className="flex-1">
        <Routes>
          <Route path="/" element={<MasterAuditPage />} />
          <Route path="/index.html" element={<Navigate to="/" replace />} />
          
          {/* User Dashboard & Reports */}
          <Route path="/dashboard" element={<UserDashboardPage />} />
          <Route path="/dashboard.html" element={<UserDashboardPage />} />
          
          <Route path="/report/:id" element={<ReportPermalinkPage />} />
          <Route path="/report" element={<ReportPermalinkPage />} />
          <Route path="/report.html" element={<ReportPermalinkPage />} />
          
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
          
          {/* Educational & Trust Pages */}
          <Route path="/methodology" element={<MethodologyPage />} />
          <Route path="/methodology.html" element={<MethodologyPage />} />
          
          <Route path="/blogs" element={<BlogsPage />} />
          <Route path="/blogs.html" element={<BlogsPage />} />
          
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/contact.html" element={<ContactPage />} />
          
          <Route path="/privacy" element={<LegalPage />} />
          <Route path="/terms" element={<LegalPage />} />
          <Route path="/cookies" element={<LegalPage />} />
          <Route path="/security" element={<LegalPage />} />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
      <Footer />
    </div>
  );
};
export default App;
