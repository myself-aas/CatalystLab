import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { SystemOverviewDoc } from './docs/SystemOverviewDoc';

/**
 * DocsPage: Main entry point for /docs
 * Handles legacy anchor hashes and serves the SystemOverviewDoc with full DocsLayout navigation.
 */
export const DocsPage: React.FC = () => {
 const location = useLocation();
 const navigate = useNavigate();

 useEffect(() => {
 // Map legacy anchor hashes to their dedicated URLs
 if (location.hash) {
 const hash = location.hash.replace('#', '').toLowerCase();
 const routeMap: Record<string, string> = {
 'engine-synthshift': '/docs/synthshift',
 'engine-gitlygase': '/docs/gitlygase',
 'engine-ecoholo': '/docs/ecoholo',
 'engine-vitalzyme': '/docs/vitalzyme',
 'engine-edgevmax': '/docs/edgevmax',
 'engine-riskprotease': '/docs/riskprotease',
 'engine-llmkinase': '/docs/llm-kinase',
 'engine-allostersearch': '/docs/allostersearch',
 'engine-master': '/docs/orchestrator',
 'architecture-gateway': '/docs/architecture',
 'security-sandbox': '/docs/security-sandbox',
 'rate-limiting': '/docs/rate-limiting',
 'scoring-matrix': '/docs/scoring-matrix',
 'cicd-automation': '/docs/cicd',
 'api-reference': '/docs/api',
 };

 if (routeMap[hash]) {
 navigate(routeMap[hash], { replace: true });
 }
 }
 }, [location.hash, navigate]);

 return <SystemOverviewDoc />;
};

export default DocsPage;
