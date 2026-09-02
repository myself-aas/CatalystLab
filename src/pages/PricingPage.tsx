import React, { useState } from 'react';
import { SEOHead } from '../components/common/SEOHead';
import { Check } from 'lucide-react';

export const PricingPage: React.FC = () => {
  return (
    <div className="pt-24 pb-16 min-h-screen bg-background">
      <SEOHead 
        title="Pricing - CatalystLab"
        description="Simple, transparent pricing for advanced security diagnostics."
      />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-extrabold text-foreground tracking-tight mb-6">
            Simple, Transparent Pricing
          </h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {['Starter', 'Pro', 'Enterprise'].map(plan => (
            <div key={plan} className="bg-muted border border-border p-8 rounded-2xl shadow-sm text-center">
              <h3 className="text-2xl font-bold text-foreground">{plan}</h3>
              <p className="text-4xl font-bold text-foreground mt-4">$99<span className="text-lg text-muted-foreground">/mo</span></p>
              <ul className="mt-8 space-y-4 text-left text-muted-foreground">
                <li className="flex items-center gap-2"><Check className="text-emerald-500 w-5 h-5"/> Up to 10 projects</li>
                <li className="flex items-center gap-2"><Check className="text-emerald-500 w-5 h-5"/> Daily automated audits</li>
                <li className="flex items-center gap-2"><Check className="text-emerald-500 w-5 h-5"/> API Access</li>
              </ul>
              <button className="mt-8 w-full bg-primary text-primary-foreground py-3 rounded-lg font-medium">Get Started</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
