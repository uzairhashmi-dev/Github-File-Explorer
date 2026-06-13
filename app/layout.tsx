// app/layout.tsx
// Root layout — wraps every page with ThemeProvider + Navbar.

import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { ThemeProvider } from '@/components/ThemeProvider';
import Navbar from '@/components/Navbar';
import './globals.css';

const geist = Geist({
  subsets: ['latin'],
  variable: '--font-geist',
  display: 'swap',
});

const geistMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-geist-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'GitExplorer — GitHub Profile & File Explorer',
    template: '%s | GitExplorer',
  },
  description: 'Search any GitHub user — browse their repos, explore file trees, and read source code.',
  keywords: ['github', 'explorer', 'repository', 'code viewer', 'open source'],
  authors: [{ name: 'GitExplorer' }],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${geist.variable} ${geistMono.variable}`}>
      <body className="font-sans" suppressHydrationWarning>
        <ThemeProvider>
          <Navbar />
          <main className="min-h-[calc(100dvh-4rem)]">
            {children}
          </main>
        </ThemeProvider>
      </body>
    </html>
  );
}