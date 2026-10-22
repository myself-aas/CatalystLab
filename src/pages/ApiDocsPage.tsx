import React, { useState } from 'react';
import apiImage from '../assets/images/page-api.jpg';
import { PlateImage } from '../components/common/PlateImage';
import apiImageWebp from '../assets/images/page-api.webp';
import apiImageAvif from '../assets/images/page-api.avif';
import { ApiPlayground } from '../components/api/ApiPlayground';
import { SEOHead } from '../components/common/SEOHead';

export const ApiDocsPage: React.FC = () => {
 return (
 <div className="min-h-screen ds-page-top bg-background text-foreground">
 <SEOHead 
 title="API Documentation - CatalystLab"
 description="Integrate CatalystLab diagnostics into your CI/CD pipelines."
 />
 
 <div className="ds-page-shell ds-section">
 <div className="text-center mb-16">
 <h1 className="framer-section-headline text-foreground mb-4">
 API Documentation
 </h1>
 <p className="framer-body-text max-w-3xl mx-auto">
 Build custom integrations and automate your security auditing workflows with the CatalystLab REST API.
 </p>
 </div>

 <figure className="mx-auto mb-12 max-w-4xl">
   <PlateImage src={apiImage} webp={apiImageWebp} avif={apiImageAvif} alt="Developers pair-programming against the CatalystLab API" className="w-full rounded-2xl border border-ink-navy/[0.08] object-cover aspect-[16/9]" />
 </figure>
 <ApiPlayground />
 </div>
 </div>
 );
};
