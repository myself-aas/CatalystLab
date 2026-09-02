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
      img: "https://images.pexels.com/photos/1181675/pexels-photo-1181675.jpeg?auto=compress&cs=tinysrgb&w=800&dpr=1",
      ctaText: "Explore Engine",
      ctaUrl: "/health",
    },
    {
      tag: "#Infrastructure",
      titleLine1: "EDGEVMAX CDN",
      titleLine2: "– JITTER TRACKING",
      desc: "Edge compute distributed ping and network jitter telemetry.",
      img: "https://images.pexels.com/photos/1181675/pexels-photo-1181675.jpeg?auto=compress&cs=tinysrgb&w=800&dpr=1",
      ctaText: "Explore Engine",
      ctaUrl: "/latency",
    },
    {
      tag: "#Security",
      titleLine1: "RISK PROTEASE",
      titleLine2: "– VULNERABILITY",
      desc: "Continuous OWASP Top 10 and SSL/TLS certificate chain integrity auditor.",
      img: "https://images.pexels.com/photos/3182781/pexels-photo-3182781.jpeg?auto=compress&cs=tinysrgb&w=800&dpr=1",
      ctaText: "Explore Engine",
      ctaUrl: "/compliance",
    },
    {
      tag: "#AI",
      titleLine1: "LLMO SEARCH",
      titleLine2: "– AI READINESS",
      desc: "Ensure your content is formatted for frontier AI model knowledge extraction.",
      img: "https://images.pexels.com/photos/3183132/pexels-photo-3183132.jpeg?auto=compress&cs=tinysrgb&w=800&dpr=1",
      ctaText: "Explore Engine",
      ctaUrl: "/llmo",
    },
    {
      tag: "#Code",
      titleLine1: "GIT LYGASE",
      titleLine2: "– STATIC ANALYSIS",
      desc: "Deep repository AST scanning for complexity and code smells.",
      img: "https://images.pexels.com/photos/2599244/pexels-photo-2599244.jpeg?auto=compress&cs=tinysrgb&w=800&dpr=1",
      ctaText: "Explore Engine",
      ctaUrl: "/repo-scanner",
    },
  ];

  return (
    <div className="w-full min-h-screen bg-primary flex items-center justify-center">
      <CoverFlowCarousel 
        items={auditFeatures} 
        sectionLabel="DIAGNOSTIC ENGINES" 
        autoplay={true} 
      />
    </div>
  );
}
