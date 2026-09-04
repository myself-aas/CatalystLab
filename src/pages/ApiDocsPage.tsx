import React, { useState } from 'react';
import { ApiPlayground } from '../components/api/ApiPlayground';
import { SEOHead } from '../components/common/SEOHead';

export const ApiDocsPage: React.FC = () => {
 return (
 <div className="pt-24 pb-16 min-h-screen bg-background">
 <SEOHead 
 title="API Documentation - CatalystLab"
 description="Integrate CatalystLab diagnostics into your CI/CD pipelines."
 />
 
 <div className="ds-page-shell: lg:">
 <div className="text-center mb-16">
 <h1 className="text-4xl md:text-5xl font-extrabold text-foreground tracking-tight mb-6">
 API Documentation
 </h1>
 <p className="text-xl text-muted-foreground max-w-3xl mx-auto mx-auto">
 Build custom integrations and automate your security auditing workflows with the CatalystLab REST API.
 </p>
 </div>

 <ApiPlayground />
 </div>
 </div>
 );
};
