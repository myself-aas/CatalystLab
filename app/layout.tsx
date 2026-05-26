import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });
const jetbrainsMono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono' });

export const metadata: Metadata = {
  title: 'CatalystLab | AI-powered research brainstorming',
  description: 'AI-powered research brainstorming and parallel literature discovery platform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="antialiased bg-[#F4F9F5] text-[#253D2C] transition-colors duration-200 font-sans selection:bg-[#CFFFDC]">
        <main className="min-h-screen">
          {children}
        </main>
      </body>
    </html>
  );
}
