import React from 'react';

interface PartnerLogo {
  id: string;
  name: string;
  url: string;
  icon: React.ReactNode;
}

export const PARTNER_LOGOS: PartnerLogo[] = [
  {
    id: 'github',
    name: 'GitHub',
    url: 'https://github.com',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-6 sm:h-7 w-auto shrink-0" aria-hidden="true">
        <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
      </svg>
    ),
  },
  {
    id: 'vercel',
    name: 'Vercel',
    url: 'https://vercel.com',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 sm:h-6 w-auto shrink-0" aria-hidden="true">
        <path d="M12 1L24 22H0L12 1Z" />
      </svg>
    ),
  },
  {
    id: 'cloudflare',
    name: 'Cloudflare',
    url: 'https://cloudflare.com',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-6 sm:h-7 w-auto shrink-0" aria-hidden="true">
        <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z" />
      </svg>
    ),
  },
  {
    id: 'supabase',
    name: 'Supabase',
    url: 'https://supabase.com',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-6 sm:h-7 w-auto shrink-0" aria-hidden="true">
        <path d="M13.35 23.49C12.87 24.12 11.83 23.85 11.75 23.06L10.3 9.77H1.83C0.84 9.77 0.35 8.57 1.05 7.87L11.53 0.44C12.01 -0.19 13.05 0.08 13.13 0.87L14.58 14.16H23.05C24.04 14.16 24.53 15.36 23.83 16.06L13.35 23.49Z" />
      </svg>
    ),
  },
  {
    id: 'google',
    name: 'Google',
    url: 'https://cloud.google.com',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-6 sm:h-7 w-auto shrink-0" aria-hidden="true">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
      </svg>
    ),
  },
  {
    id: 'aws',
    name: 'AWS',
    url: 'https://aws.amazon.com',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-6 sm:h-7 w-auto shrink-0" aria-hidden="true">
        <path d="M18.8 17.5c-2.3 1.7-5.5 2.6-8.5 2.6-4.2 0-8-1.6-10.3-4.3-.2-.2-.2-.5 0-.7.3-.3.7-.3.9 0 2.1 2.4 5.6 3.9 9.4 3.9 2.7 0 5.7-.8 7.8-2.3.3-.2.7-.1.9.2.2.3.1.7-.2.9zm1.3-.9c-.3-.4-1.8-.2-2.7 0-.3 0-.4-.3-.1-.5 1.5-1.1 4-1 4.3-.6.3.3.1 2.8-1.3 4.1-.3.2-.5.1-.4-.2.4-.8.5-2.4.2-2.8zm-9.3-5.2c-.3 0-.6-.1-.8-.3-.5-.4-.7-1.1-.7-2 0-.8.2-1.5.7-1.9.4-.4 1-.6 1.7-.6.6 0 1.2.2 1.6.5v3.8c-.7.3-1.6.5-2.5.5zm1.6-6.4c-.8-.6-2-.9-3.2-.9-2.3 0-4.1 1.1-4.7 2.9-.1.4.1.7.5.8.4.1.7-.1.8-.4.4-1.3 1.8-2.1 3.4-2.1.9 0 1.8.2 2.4.6.6.4.9 1 .9 1.7v1.1c-.8-.2-1.8-.3-2.8-.3-1.6 0-3 .4-4 1.2-.9.7-1.4 1.8-1.4 3.1 0 1.3.5 2.4 1.4 3.1.9.7 2.2 1.1 3.7 1.1 1.5 0 2.8-.4 3.7-1.2.3-.3.6-.6.8-1v1.6c0 .4.3.7.7.7.4 0 .7-.3.7-.7v-8.2c0-1.5-.7-2.6-2-3.4z" />
      </svg>
    ),
  },
  {
    id: 'docker',
    name: 'Docker',
    url: 'https://docker.com',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-6 sm:h-7 w-auto shrink-0" aria-hidden="true">
        <path d="M13.98 9.38h2.05V7.33h-2.05v2.05zm-2.51 0h2.05V7.33h-2.05v2.05zm-2.5 0h2.04V7.33H8.97v2.05zm-2.5 0h2.05V7.33H6.47v2.05zm-2.5 0h2.04V7.33H3.97v2.05zm7.5-2.51h2.05V4.82h-2.05v2.05zm-2.5 0h2.04V4.82H8.97v2.05zm-2.5 0h2.05V4.82H6.47v2.05zm15.42 5.09c-.39-.28-1.28-.4-2.22-.19-.18-.46-.43-.88-.74-1.27-.08-.11-.2-.17-.33-.17-.06 0-.12.01-.17.04-1.07.57-1.39 1.76-1.41 1.86-.53-.28-1.28-.35-2.21-.14h-9.9c-.27 0-.52.12-.69.32-.17.2-.23.47-.18.73.66 3.49 3.44 6.27 7.02 6.88 4.29.73 8.35-1.47 9.87-5.34.85-.22 1.51-.71 1.76-1.31.06-.15.04-.32-.05-.44-.09-.13-.24-.2-.39-.23z" />
      </svg>
    ),
  },
  {
    id: 'stripe',
    name: 'Stripe',
    url: 'https://stripe.com',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-6 sm:h-7 w-auto shrink-0" aria-hidden="true">
        <path d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C18.252.975 15.697.357 12.87.357 6.643.357 2.65 3.652 2.65 8.913c0 5.494 4.887 6.84 8.784 8.232 2.378.847 3.25 1.543 3.25 2.502 0 .978-.89 1.475-2.28 1.475-2.531 0-5.394-1.07-7.214-2.147l-.924 5.568c1.64.912 4.79 1.64 7.683 1.64 6.629 0 10.748-3.155 10.748-8.498 0-5.632-4.571-7.054-8.721-8.535z" />
      </svg>
    ),
  },
  {
    id: 'openai',
    name: 'OpenAI',
    url: 'https://openai.com',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-6 sm:h-7 w-auto shrink-0" aria-hidden="true">
        <path d="M22.28 10.05a5.98 5.98 0 0 0-.52-4.9 6.04 6.04 0 0 0-6.51-2.91A6.05 6.05 0 0 0 10.7 0a6.05 6.05 0 0 0-5.78 4.29 6.03 6.03 0 0 0-4.13 2.99 6.04 6.04 0 0 0 .75 7.04 5.98 5.98 0 0 0 .52 4.9 6.05 6.05 0 0 0 6.51 2.91A6.05 6.05 0 0 0 13.3 24a6.05 6.05 0 0 0 5.78-4.29 6.03 6.03 0 0 0 4.13-2.99 6.04 6.04 0 0 0-.75-7.04zM12 21.6c-2.3 0-4.32-1.32-5.28-3.26l2.12-1.22c.62 1.25 1.93 2.08 3.44 2.08 1.93 0 3.52-1.46 3.7-3.34h2.46c-.2 3.25-2.92 5.74-6.44 5.74zm-6.24-5.34a3.86 3.86 0 0 1-.36-1.63c0-.68.18-1.32.49-1.88l2.12 1.22c-.1.2-.16.42-.16.66 0 .86.5 1.6 1.23 1.94v2.44a5.99 5.99 0 0 1-3.32-2.75zm.9-6.48c.45-.78 1.14-1.38 1.97-1.7l1.22 2.12c-.52.2-.95.58-1.22 1.07l-2.12-1.22c.05-.09.1-.18.15-.27zm10.74 3.7c0 .86-.5 1.6-1.23 1.94v2.44a5.99 5.99 0 0 0 3.32-2.75c.24-.48.36-1.04.36-1.63 0-.68-.18-1.32-.49-1.88l-2.12 1.22c.1.2.16.42.16.66zm.6-4.52l-1.22 2.12c-.52-.2-.95-.58-1.22-1.07l2.12-1.22c.1.18.21.35.32.53zm-5.7-4.21c2.3 0 4.32 1.32 5.28 3.26l-2.12 1.22c-.62-1.25-1.93-2.08-3.44-2.08-1.93 0-3.52 1.46-3.7 3.34H8.3c.2-3.25 2.92-5.74 6.44-5.74z" />
      </svg>
    ),
  },
];

export const PartnerMarquee: React.FC = () => {
  return (
    <div
      role="region"
      aria-label="Partner Logos Marquee"
      className="w-full h-full flex items-center justify-center relative overflow-hidden select-none"
    >
      {/* Ambient Bilateral Gradient Masks (Fades logos into pure black canvas on both edges) */}
      <div className="pointer-events-none absolute left-0 inset-y-0 w-16 sm:w-32 bg-gradient-to-r from-background via-background/80 to-transparent z-10" />
      <div className="pointer-events-none absolute right-0 inset-y-0 w-16 sm:w-32 bg-gradient-to-l from-background via-background/80 to-transparent z-10" />

      {/* Horizontal One-Row Marquee Container */}
      <div className="relative w-full overflow-hidden marquee-hover-pause flex items-center">
        <div className="flex w-fit items-center">
          {/* Track 1 */}
          <div className="animate-marquee-horizontal flex items-center gap-12 sm:gap-20 pr-12 sm:pr-20">
            {PARTNER_LOGOS.map((partner) => (
              <a
                key={partner.id}
                href={partner.url}
                target="_blank" rel="noopener noreferrer"
                aria-label={partner.name}
                title={partner.name}
                className="flex items-center justify-center p-1.5 rounded-lg opacity-50 hover:opacity-100 focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-foreground/40 focus:outline-none transition-all duration-200 text-foreground shrink-0 hover:scale-110 transform"
              >
                {partner.icon}
              </a>
            ))}
          </div>

          {/* Track 2 (Duplicate for infinite seamless loop) */}
          <div
            aria-hidden="true"
            className="animate-marquee-horizontal flex items-center gap-12 sm:gap-20 pr-12 sm:pr-20"
          >
            {PARTNER_LOGOS.map((partner) => (
              <a
                key={`dup-${partner.id}`}
                href={partner.url}
                target="_blank" rel="noopener noreferrer"
                tabIndex={-1}
                aria-label={partner.name}
                title={partner.name}
                className="flex items-center justify-center p-1.5 rounded-lg opacity-50 hover:opacity-100 focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-foreground/40 focus:outline-none transition-all duration-200 text-foreground shrink-0 hover:scale-110 transform"
              >
                {partner.icon}
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PartnerMarquee;
