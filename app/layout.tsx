import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/Providers';
import { AppProvider } from '@/lib/context';
import { CommandPalette } from '@/components/CommandPalette';
import { SetupScreen } from '@/components/SetupScreen';
import { AuthProvider } from '@/components/AuthProvider';
import { MobileNavWrapper } from '@/components/MobileNavWrapper';
import { Suspense } from 'react';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'CatalystLab — Think at the edge of knowledge',
  description: 'AI brainstorming + live literature discovery for researchers',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body suppressHydrationWarning className="bg-[#0c0c0f] text-[#eeeef2] selection:bg-[var(--bg-selection)] overflow-x-hidden max-w-full">
        <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:bg-[#5b5bf6] focus:text-white focus:px-4 focus:py-2 focus:rounded-lg">
          Skip to content
        </a>
        <Providers>
          <AuthProvider>
            <AppProvider>
              <SetupScreen>
                <CommandPalette />
                <Suspense fallback={
                  <div className="min-h-screen bg-[#0c0c0f] flex items-center justify-center">
                    <div className="flex gap-1.5">
                      {[0, 1, 2].map(i => (
                        <div key={i} className="w-1.5 h-1.5 rounded-full bg-[#5b5bf6] animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                      ))}
                    </div>
                  </div>
                }>
                  {children}
                </Suspense>
                <MobileNavWrapper />
              </SetupScreen>
            </AppProvider>
          </AuthProvider>
        </Providers>
      </body>
    </html>
  );
}
