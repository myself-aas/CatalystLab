import React from 'react';
import { CoverFlowCarousel, CarouselItem } from './3-d-coverflow-carousel';

export default function Demo() {
  // Let's populate it with Unsplash stock images we know exist, matching our platform.
  const auditFeatures: CarouselItem[] = [
    {
      tag: "#Performance",
      titleLine1: "VITALZYME DOM",
      titleLine2: "– LATENCY AUDIT",
      desc: "Analyzes total DOM tree depth, mutation recalculations, and layout shifts.",
      img: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80",
      ctaText: "Explore Engine",
      ctaUrl: "/health",
    },
    {
      tag: "#Infrastructure",
      titleLine1: "EDGEVMAX CDN",
      titleLine2: "– JITTER TRACKING",
      desc: "Edge compute distributed ping and network jitter telemetry.",
      img: "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=800&auto=format&fit=crop&q=80",
      ctaText: "Explore Engine",
      ctaUrl: "/latency",
    },
    {
      tag: "#Security",
      titleLine1: "RISK PROTEASE",
      titleLine2: "– VULNERABILITY",
      desc: "Continuous OWASP Top 10 and SSL/TLS certificate chain integrity auditor.",
      img: "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=800&auto=format&fit=crop&q=80",
      ctaText: "Explore Engine",
      ctaUrl: "/compliance",
    },
    {
      tag: "#AI",
      titleLine1: "LLMO SEARCH",
      titleLine2: "– AI READINESS",
      desc: "Ensure your content is formatted for frontier AI model knowledge extraction.",
      img: "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=800&auto=format&fit=crop&q=80",
      ctaText: "Explore Engine",
      ctaUrl: "/llmo",
    },
    {
      tag: "#Code",
      titleLine1: "GIT LYGASE",
      titleLine2: "– STATIC ANALYSIS",
      desc: "Deep repository AST scanning for complexity and code smells.",
      img: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop&q=80",
      ctaText: "Explore Engine",
      ctaUrl: "/repo-scanner",
    },
  ];

  return (
    <div className="w-full min-h-screen bg-black flex items-center justify-center">
      <CoverFlowCarousel 
        items={auditFeatures} 
        sectionLabel="DIAGNOSTIC ENGINES" 
        autoplay={true} 
      />
    </div>
  );
}
