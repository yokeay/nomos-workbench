import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import { TooltipProvider } from '@/components/ui/tooltip';
import { ToastProvider } from '@/hooks/use-toast';
import { Toaster } from '@/components/ui/toaster';
import { ErrorBoundary } from '@/components/error-boundary';
import { I18nProvider } from '@/components/i18n-provider';
import './globals.css';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
});

const jetbrainsMono = JetBrains_Mono({
  variable: '--font-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'NOMOS AI Workbench',
  description: 'AI-powered workbench with chat, terminal, and real-time timeline',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh" className="dark">
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} h-full antialiased bg-background text-foreground font-sans`}
      >
        <I18nProvider>
          <ErrorBoundary>
            <ToastProvider>
              <TooltipProvider>{children}</TooltipProvider>
              <Toaster />
            </ToastProvider>
          </ErrorBoundary>
        </I18nProvider>
      </body>
    </html>
  );
}