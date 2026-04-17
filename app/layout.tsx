import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { Analytics } from '@vercel/analytics/next';
import { AppProvider } from '@/context/AppContext';
import { NotificationCenter } from '@/components/ui/notification-center';
import { Breadcrumbs } from '@/components/ui/breadcrumbs';
import { AppHeader } from '@/components/common/app-header';
import { Sidebar } from '@/components/layout/sidebar';
import { SearchCmdK } from '@/components/common/search-cmd-k';
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
    <html lang="pt-BR" className="bg-gray-50 scroll-smooth">
      <body className="font-sans antialiased bg-gray-50">
        <AppProvider>
          <div className="flex min-h-screen">
            <Sidebar />
            <div className="flex-1 flex flex-col">
              <AppHeader />
              <SearchCmdK />
              <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8">
                <Breadcrumbs />
                {children}
              </main>
            </div>
          </div>
          <NotificationCenter />
          {process.env.NODE_ENV === 'production' && <Analytics />}
        </AppProvider>
      </body>
    </html>
  );
}
