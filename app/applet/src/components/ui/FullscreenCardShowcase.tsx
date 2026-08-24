import React from 'react';
import FullscreenImageCard from './FullscreenImageCard';
import { ArrowRight, ShieldCheck, Zap, Bot, Cpu } from 'lucide-react';

export default function FullscreenCardShowcase() {
  const showcaseItems = [
    {
      id: '1',
      title: 'Anycast Edge DNS Resolution & TLS 1.3 0-RTT',
      subtitle: 'Phase 1 • Global PoPs',
      description: 'Probes TLS handshakes and HTTP/3 viability across 42 global edge points of presence with sub-millisecond precision.',
      imageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=800',
      badge: 'Edge Acceleration',
      action: <Zap className="h-4 w-4" />,
      footer: (
        <div className="flex items-center justify-between w-full text-xs font-mono font-bold">
          <span className="text-emerald-400">● 140ms Latency</span>
          <span className="flex items-center gap-1 text-white group-hover:translate-x-1 transition-transform">
            <span>Explore Engine</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </span>
        </div>
      )
    },
    {
      id: '2',
      title: 'Autonomous OWASP Security & AST Scanning',
      subtitle: 'Phase 2 • Zero-Trust',
      description: 'Executes synchronous AST checks for dependency vulns, CSP headers, and enterprise compliance metrics automatically.',
      imageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=800',
      badge: 'DevSecOps',
      action: <ShieldCheck className="h-4 w-4" />,
      footer: (
        <div className="flex items-center justify-between w-full text-xs font-mono font-bold">
          <span className="text-sky-400">100% Strict Score</span>
          <span className="flex items-center gap-1 text-white group-hover:translate-x-1 transition-transform">
            <span>View Dossier</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </span>
        </div>
      )
    },
    {
      id: '3',
      title: 'LLMO & /llms.txt AI Discovery Pipeline',
      subtitle: 'Phase 3 • Semantic Indexing',
      description: 'Parses entity graphs and markdown manifests to ensure instant indexing by Perplexity, Claude, and GPT search bots.',
      imageUrl: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&q=80&w=800',
      badge: 'AI Engine',
      action: <Bot className="h-4 w-4" />,
      footer: (
        <div className="flex items-center justify-between w-full text-xs font-mono font-bold">
          <span className="text-amber-400">+140% Citations</span>
          <span className="flex items-center gap-1 text-white group-hover:translate-x-1 transition-transform">
            <span>Run AI Audit</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </span>
        </div>
      )
    }
  ];

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="text-center max-w-3xl mx-auto mb-12">
        <span className="px-3.5 py-1 rounded-full bg-slate-900 text-white font-mono text-xs uppercase tracking-widest font-bold">
          Dynamic UI/UX Showcase
        </span>
        <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mt-4 tracking-tight">
          Fullscreen Immersive Card Layouts
        </h2>
        <p className="text-slate-600 mt-2 text-base">
          Stunning fullscreen background imagery wrapped with smooth hover zoom animations, frosted glassmorphism overlays, and precise typography.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {showcaseItems.map((item) => (
          <FullscreenImageCard
            key={item.id}
            imageUrl={item.imageUrl}
            imageAlt={item.title}
            badge={item.badge}
            title={item.title}
            subtitle={item.subtitle}
            description={item.description}
            action={item.action}
            footer={item.footer}
            aspectRatio="h-[460px] w-full"
            overlayStyle="glass"
          />
        ))}
      </div>
    </section>
  );
}
