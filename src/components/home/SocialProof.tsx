import React from 'react';

const LOGOS = [
  { name: 'Cloudflare', slug: 'cloudflare' },
  { name: 'Fastly', slug: 'fastly' },
  { name: 'Vercel', slug: 'vercel' },
  { name: 'Stripe', slug: 'stripe' },
  { name: 'Linear', slug: 'linear' },
];

export const SocialProof: React.FC = () => {
  return (
    <section className="relative py-12 md:py-16">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6 items-center justify-items-center py-6">
          {LOGOS.map((logo) => (
            <div
              key={logo.slug}
              className="group flex items-center justify-center w-full"
            >
              <img
                src={`https://cdn.simpleicons.org/${logo.slug}/ffffff`}
                alt={logo.name}
                className="h-6 w-auto object-contain opacity-40 hover:opacity-100 transition-opacity duration-300"
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
