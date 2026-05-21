import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/Providers';
import { AppProvider } from '@/lib/context';
import { CommandPalette } from '@/components/CommandPalette';
import { SetupScreen } from '@/components/SetupScreen';
import { AuthProvider } from '@/components/AuthProvider';
import { MobileNavWrapper } from '@/components/MobileNavWrapper';
import ErrorBoundary from '@/components/ErrorBoundary';
import { Suspense } from 'react';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
  fallback: ['ui-sans-serif', 'system-ui', '-apple-system', 'sans-serif'],
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
  fallback: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'Liberation Mono', 'Courier New', 'monospace'],
});

export const metadata: Metadata = {
  // ── Core ──────────────────────────────────────────────
  metadataBase: new URL('https://catalystlab.tech'),
  title: {
    default: 'CatalystLab — Think at the edge of knowledge',
    template: '%s · CatalystLab',
  },
  description:
    'AI-powered research brainstorming and literature discovery. ' +
    '20 instruments · 9 academic sources · Free forever plan.',
  keywords: [
    'research tool',
    'AI brainstorming',
    'literature discovery',
    'academic research',
    'research instruments',
    'Gemini AI',
    'Semantic Scholar',
    'arXiv',
    'PhD tools',
    'graduate research',
    'thought collider',
    'pressure chamber',
    'research gap finder',
    'CatalystLab',
  ],
  authors: [{ name: 'CatalystLab', url: 'https://catalystlab.tech' }],
  creator: 'CatalystLab',
  publisher: 'CatalystLab',

  // ── Robots ────────────────────────────────────────────
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },

  // ── Canonical ─────────────────────────────────────────
  alternates: {
    canonical: 'https://catalystlab.tech',
  },

  // ── Open Graph (WhatsApp, LinkedIn, Facebook, Slack) ──
  openGraph: {
    type: 'website',
    url: 'https://catalystlab.tech',
    siteName: 'CatalystLab',
    title: 'CatalystLab — Think at the edge of knowledge',
    description:
      'AI-powered research brainstorming + automatic literature discovery. ' +
      '20 instruments · 9 academic sources · Free forever plan.',
    locale: 'en_US',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'CatalystLab — Think at the edge of knowledge',
        type: 'image/png',
      },
    ],
  },

  // ── Twitter / X ───────────────────────────────────────
  twitter: {
    card: 'summary_large_image',
    site: '@catalystlab',
    creator: '@catalystlab',
    title: 'CatalystLab — Think at the edge of knowledge',
    description:
      'AI brainstorming + live literature discovery for researchers. ' +
      '20 instruments · 9 sources · Free.',
    images: ['/og-image.png'],
  },

  // ── Icons (all sizes, no separate files needed) ───────
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon-32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-16.png', sizes: '16x16', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    shortcut: '/favicon.svg',
  },

  // ── PWA / theme ───────────────────────────────────────
  manifest: '/manifest.json',
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#0c0c0f' },
    { media: '(prefers-color-scheme: light)', color: '#0c0c0f' },
  ],
  colorScheme: 'dark',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    minimumScale: 1,
    viewportFit: 'cover',
  },

  // ── App info ──────────────────────────────────────────
  applicationName: 'CatalystLab',
  category: 'Education',
};

/**
 * Root Layout Component
 * 
 * Provides Material 3 themed wrapper with:
 * - Global font variables (Inter + JetBrains Mono)
 * - Hydration-safe rendering
 * - Authentication context
 * - Error boundary protection
 * - Accessibility features (skip to content, focus management)
 */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${jetbrainsMono.variable}`}
      style={{ colorScheme: 'dark' }}
    >
      <head>
        {/* Ensure Material 3 dark mode at HTML level */}
        <meta name="color-scheme" content="dark" />
        <meta name="theme-color" content="#0c0c0f" media="(prefers-color-scheme: dark)" />
      </head>
      <body
        suppressHydrationWarning
        className="
          bg-surface text-on-surface
          font-sans antialiased
          overflow-x-hidden max-w-full
          selection:bg-primary-container selection:text-on-primary-container
        "
      >
        {/* Skip to content link (accessibility) */}
        <a
          href="#main-content"
          className="
            sr-only
            focus:not-sr-only
            focus:fixed focus:top-4 focus:left-4 focus:z-[9999]
            focus:bg-primary focus:text-on-primary
            focus:px-4 focus:py-2 focus:rounded-lg
            focus:outline-offset-0
            transition-all duration-200
          "
        >
          Skip to main content
        </a>

        {/* Root Provider Stack */}
        <Providers>
          <ErrorBoundary>
            <AuthProvider>
              <AppProvider>
                <SetupScreen>
                  {/* Command Palette (⌘K) */}
                  <CommandPalette />

                  {/* Main Content with Suspense Fallback */}
                  <Suspense
                    fallback={
                      <div className="
                        min-h-screen
                        bg-surface
                        flex items-center justify-center
                        animate-fade-in
                      ">
                        {/* Loading Skeleton */}
                        <div className="flex items-center justify-center gap-3">
                          {[0, 1, 2].map((i) => (
                            <div
                              key={i}
                              className="
                                w-2 h-2 rounded-full
                                bg-primary
                                animate-bounce-gentle
                              "
                              style={{
                                animationDelay: `${i * 150}ms`,
                              }}
                            />
                          ))}
                        </div>
                      </div>
                    }
                  >
                    <main id="main-content" className="contents">
                      {children}
                    </main>
                  </Suspense>

                  {/* Mobile Navigation Wrapper */}
                  <MobileNavWrapper />
                </SetupScreen>
              </AppProvider>
            </AuthProvider>
          </ErrorBoundary>
        </Providers>

        {/* Viewport Meta Adjustments for Safe Area */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                const viewport = document.querySelector('meta[name="viewport"]');
                if (viewport) {
                  viewport.setAttribute('content', 
                    'width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover, user-scalable=no'
                  );
                }
              })();
            `,
          }}
        />
      </body>
    </html>
  );
}
