import { Navigation } from '@/components/navigation';
import { LandingPageDashboard } from '@/components/landing-dashboard';

export const metadata = {
  title: 'Pipeline UPP - Dashboard',
  description: 'Unified Pipeline Platform Dashboard',
};

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Pipeline Dashboard</h1>
          <p className="text-gray-600 mt-2">Monitore seu pipeline de oportunidades em tempo real</p>
        </div>
        <LandingPageDashboard />
      </main>
    </div>
  );
}
