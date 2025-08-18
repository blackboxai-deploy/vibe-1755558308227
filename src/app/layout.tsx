import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'AI Rap Video Generator',
  description: 'Create professional rap music videos with AI. Generate scripts and high-quality video scenes for your rap music concepts.',
  keywords: 'rap video, music video, AI generation, hip-hop, video creation, artificial intelligence',
  authors: [{ name: 'AI Rap Video Generator' }],
  viewport: 'width=device-width, initial-scale=1',
  robots: 'index, follow',
  openGraph: {
    title: 'AI Rap Video Generator',
    description: 'Create professional rap music videos with AI. Generate scripts and high-quality video scenes for your rap music concepts.',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Rap Video Generator',
    description: 'Create professional rap music videos with AI',
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🎬</text></svg>" />
      </head>
      <body className={inter.className} suppressHydrationWarning>
        <div id="__next">
          {children}
        </div>
      </body>
    </html>
  );
}