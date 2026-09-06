import React, { useState } from 'react';
import { ApiPlayground } from '../components/api/ApiPlayground';
import { SEOHead } from '../components/common/SEOHead';

export const ApiDocsPage: React.FC = () => {
 return (
 <div data-theme="dark" className="min-h-screen ds-page-top bg-background text-foreground">
 <SEOHead 
 title="API Documentation - CatalystLab"
 description="Integrate CatalystLab diagnostics into your CI/CD pipelines."
 />
 
 <div className="ds-page-shell pb-16">
 <div className="text-center mb-16">
 <h1 className="framer-section-headline text-foreground mb-4">
 API Documentation
 </h1>
 <p className="framer-body-text max-w-3xl mx-auto">
 Build custom integrations and automate your security auditing workflows with the CatalystLab REST API.
 </p>
 </div>

 <ApiPlayground />
 </div>
 </div>
 );
};
