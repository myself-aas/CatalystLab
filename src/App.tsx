import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { MasterAuditPage } from './pages/MasterAuditPage';
import { UserDashboardPage } from './pages/UserDashboardPage';
import { AdminDashboardPage } = require('./pages/AdminDashboardPage');
import { DomainReportArticlePage } = require('./pages/DomainReportArticlePage');
import { ReportsDirectoryPage } = require('./pages/ReportsDirectoryPage');
import { ComparePage } = require('./pages/ComparePage');
import { ToolPage } = require('./pages/ToolPage');
import { PricingPage } = require('./pages/PricingPage');
import { DocsPage } = require('./pages/DocsPage');
import { BlogsPage } = require('./pages/BlogsPage');
import { BlogPostPage } = require('./pages/BlogPostPage');
import { ContactPage } = require('./pages/ContactPage');

export const App: React.FC = () => {
  return (
    <div className="flex min-h-screen flex-col bg-slate-950 text-slate-100 selection:bg-cyan-500/30 selection:text-cyan-200">
      <Navbar />;
      <div className="flex-1">
        <Routes>
          <Route path="/" element={<MasterAuditPage />} />
          <Route path="/dashboard" element={<UserDashboardPage />} />
          <Route path="/admin" element={<AdminDashboardPage />} />
          <Route path="/report/:id" element={<DomainReportArticlePage />} />
          <Route path="/reports" element={<ReportsDirectoryPage />} />
          <Route path="/compare" element={<ComparePage />} />
          <Route path="/tool/:toolId" element={<ToolPage />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/docs" element={<DocsPage />} />
          <Route path="/blogs" element={<BlogsPage />} />
          <Route path="/blog/:slug" element={<BlogPostPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
      <Footer />
    </div>
  );
};