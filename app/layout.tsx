import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { Analytics } from '@vercel/analytics/next';
import { AppProvider } from '@/context/AppContext';
import { SidebarWrapper } from '@/components/layout/sidebar-wrapper';
import { ToastContainer } from '@/components/common/toast';
import './globals.css';

const _geist = Geist({ subsets: ['latin'] });
const _geistMono = Geist_Mono({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'TD SYNNEX Pipeline UPP',
  description: 'Unified Pipeline Platform - Gestão integrada de pipeline comercial com BI e operações',
  generator: 'v0.app',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="scroll-smooth">
      <body className="font-sans antialiased bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors">
        <AppProvider>
          <div className="flex min-h-screen">
            <SidebarWrapper />
            <main className="flex-1">
              {children}
            </main>
          </div>
          <ToastContainer />
          {process.env.NODE_ENV === 'production' && <Analytics />}
        </AppProvider>
      </body>
    </html>
  );
}
