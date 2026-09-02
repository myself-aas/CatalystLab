import React from 'react';

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
    <section className="py-12 md:py-24 border-t border-zinc-900 bg-black">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 md:px-8">
        <h2 className="text-center text-sm font-medium text-zinc-400 mb-8 md:mb-10">
          Trusted by engineering teams at
        </h2>
        <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-70">
          {LOGOS.map((logo) => (
            <img
              key={logo.slug}
              src={`https://cdn.simpleicons.org/${logo.slug}/ffffff`}
              alt={logo.name}
              className="h-7 w-auto object-contain hover:opacity-100 transition-opacity duration-300"
              loading="lazy"
            />
          ))}
        </div>
      </div>
    </section>
  );
};
