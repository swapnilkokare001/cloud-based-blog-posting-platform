import type { Metadata } from 'next';
import { Playfair_Display, Source_Sans_3, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import ReduxProvider from '@/redux/Provider';
import AuthProvider from '@/components/auth/AuthProvider';
import { ThemeProvider } from '@/components/shared/ThemeProvider';
import { Toaster } from 'react-hot-toast';

const displayFont = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
});

const bodyFont = Source_Sans_3({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
});

const monoFont = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'BlogCloud — Lightweight Blog Hosting',
    template: '%s | BlogCloud',
  },
  description:
    'A modern, cloud-powered blog hosting platform. Write, share, and discover stories.',
  keywords: ['blog', 'writing', 'cloud', 'articles', 'stories'],
  authors: [{ name: 'BlogCloud' }],
  openGraph: {
    type: 'website',
    siteName: 'BlogCloud',
    title: 'BlogCloud — Lightweight Blog Hosting',
    description: 'Write, share, and discover stories on BlogCloud.',
  },
  twitter: {
    card: 'summary_large_image',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${displayFont.variable} ${bodyFont.variable} ${monoFont.variable}`}
    >
      <body className="font-sans bg-background text-foreground antialiased">
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <AuthProvider>
            <ReduxProvider>
              {children}
              <Toaster
                position="bottom-right"
                toastOptions={{
                  duration: 4000,
                  style: {
                    fontFamily: 'var(--font-body)',
                    borderRadius: '8px',
                  },
                }}
              />
            </ReduxProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
