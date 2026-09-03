import React from 'react';
import { ShieldCheck } from 'lucide-react';

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
    <section className="relative border-t border-white/[0.06] py-12 md:py-16">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 md:px-8">
        <div className="mb-8 flex flex-col items-center justify-between gap-4 border-b border-white/[0.06] pb-4 sm:flex-row md:mb-10">
          <p className="font-mono text-xs uppercase tracking-widest text-[#8A8F98]">
            Trusted by infrastructure &amp; platform teams
          </p>
          <div className="flex items-center gap-4 font-mono text-xs text-[#8A8F98]">
            <span className="inline-flex items-center gap-1.5 text-[#6872D9]">
              <span className="size-1.5 rounded-full bg-[#5E6AD2]" />
              99.99% diagnostic SLA
            </span>
            <span className="text-white/20">|</span>
            <span className="inline-flex items-center gap-1">
              <ShieldCheck className="size-3.5 text-[#5E6AD2]" />
              SOC2 Type II aligned
            </span>
          </div>
        </div>

        <div className="grid grid-cols-3 items-center justify-items-center gap-6 sm:grid-cols-6 md:gap-10">
          {LOGOS.map((logo) => (
            <div
              key={logo.slug}
              className="group flex h-14 w-full max-w-[160px] items-center justify-center rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 transition-all duration-300 hover:border-white/10 hover:bg-white/[0.06]"
            >
              <img
                src={`https://cdn.simpleicons.org/${logo.slug}/ffffff`}
                alt={logo.name}
                className="h-5 w-auto object-contain opacity-40 brightness-100 transition-all duration-300 group-hover:scale-[1.04] group-hover:opacity-100 md:h-6"
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
