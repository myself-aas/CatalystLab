import React from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, CheckCircle2 } from 'lucide-react';

const LOGOS = [
  { name: 'Vercel', slug: 'vercel' },
  { name: 'Stripe', slug: 'stripe' },
  { name: 'Cloudflare', slug: 'cloudflare' },
  { name: 'Linear', slug: 'linear' },
  { name: 'Supabase', slug: 'supabase' },
  { name: 'GitHub', slug: 'github' },
];

export const SocialProof: React.FC = () => {
  return (
    <section className="py-12 md:py-16 border-t border-white/6 bg-primary relative">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 md:px-8">
        
        {/* Subtle Top Header with Live Production Verification */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8 md:mb-10 border-b border-white/6 pb-4">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
              Trusted by infrastructure & platform teams worldwide
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono text-muted-foreground">
            <span className="inline-flex items-center gap-1.5 text-emerald-400">
              <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
              99.99% Diagnostic SLA
            </span>
            <span className="text-muted-foreground">|</span>
            <span className="inline-flex items-center gap-1 text-muted-foreground">
              <ShieldCheck className="size-3.5 text-cyan-400" />
              SOC2 Type II Aligned
            </span>
          </div>
        </div>

        {/* Enterprise Logos Grid */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-6 md:gap-10 items-center justify-items-center">
          {LOGOS.map((logo) => (
            <div
              key={logo.slug}
              className="group flex items-center justify-center p-3 rounded-xl border border-white/4 bg-background/[0.02] hover:bg-background/[0.06] hover:border-white/12 transition-all duration-300 w-full max-w-[160px] h-14"
            >
              <img
                src={`https://cdn.simpleicons.org/${logo.slug}/ffffff`}
                alt={logo.name}
                className="h-5 md:h-6 w-auto object-contain opacity-50 group-hover:opacity-100 group-hover:scale-105 transition-all duration-300 brightness-100 filter"
                loading="lazy"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SocialProof;

