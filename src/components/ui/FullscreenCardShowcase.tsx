import React from 'react';
import { FullscreenCard } from './FullscreenCard';
import { FullscreenImageCard } from './FullscreenImageCard';

export const FullscreenCardShowcase: React.FC = () => {
  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12">
      <div className="text-center space-y-4">
        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
          Fullscreen 3D Parallax Telemetry Cards
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto text-base">
          Interactive full-bleed diagnostic units with multi-layered depth, responsive cursor tilt,
          and WCAG AA high-contrast gradient scrims.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <FullscreenCard
          imageUrl="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop"
          imageAlt="DOM Telemetry"
          badge="Engine 01"
          score="99.4/100"
          subtitle="Structural Performance"
          title="VitalZyme DOM Inspector"
          metric="14ms"
          metricLabel="Latency"
          description="Analyzes total DOM tree depth, mutation recalculations, and layout shifts."
        />

        <FullscreenCard
          imageUrl="https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?q=80&w=1200&auto=format&fit=crop"
          imageAlt="Network Jitter"
          badge="Engine 02"
          score="98.1/100"
          subtitle="Edge Infrastructure"
          title="EdgeVmax CDN Latency"
          metric="0.4ms"
          metricLabel="Jitter"
          description="Edge compute distributed ping and network jitter telemetry."
        />

        <FullscreenImageCard
          imageUrl="https://images.unsplash.com/photo-1579783902614-a3fb3927b675?q=80&w=1200&auto=format&fit=crop"
          imageAlt="Security Protease"
          badge="Engine 03"
          score="A+ Grade"
          subtitle="Vulnerability Scanner"
          title="RiskProtease Security"
        >
          Continuous OWASP Top 10 and SSL/TLS certificate chain integrity auditor.
        </FullscreenImageCard>
      </div>
    </section>
  );
};

export default FullscreenCardShowcase;
