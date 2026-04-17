import Link from 'next/link';
import { Card } from '@/components/ui/card';

export const metadata = {
  title: 'TD SYNNEX Pipeline UPP - Home',
  description: 'Unified Pipeline Platform',
};

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      <nav className="border-b border-slate-700 bg-slate-900/50 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-white">U</div>
            <span className="text-white font-bold text-xl">Pipeline UPP</span>
          </div>
          <span className="text-slate-400 text-sm">TD SYNNEX</span>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-white mb-6">Unified Pipeline Platform</h1>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto mb-8">
            Gestão inteligente de pipeline comercial
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <Link href="/dashboard">
            <Card className="p-6 bg-white hover:shadow-lg hover:scale-105 transition cursor-pointer">
              <h3 className="text-lg font-bold text-gray-900 mb-2">Dashboard</h3>
              <p className="text-gray-600 text-sm">12 KPIs, 8 gráficos e 14 filtros</p>
            </Card>
          </Link>

          <Link href="/pipeline-manager">
            <Card className="p-6 bg-white hover:shadow-lg hover:scale-105 transition cursor-pointer">
              <h3 className="text-lg font-bold text-gray-900 mb-2">Manager</h3>
              <p className="text-gray-600 text-sm">Gráficos e tabelas com gerenciamento</p>
            </Card>
          </Link>

          <Link href="/pipeline-details">
            <Card className="p-6 bg-white hover:shadow-lg hover:scale-105 transition cursor-pointer">
              <h3 className="text-lg font-bold text-gray-900 mb-2">Details</h3>
              <p className="text-gray-600 text-sm">19 campos com edição e exportação</p>
            </Card>
          </Link>

          <Link href="/batch-query">
            <Card className="p-6 bg-white hover:shadow-lg hover:scale-105 transition cursor-pointer">
              <h3 className="text-lg font-bold text-gray-900 mb-2">Batch</h3>
              <p className="text-gray-600 text-sm">13 filtros avançados e edição em massa</p>
            </Card>
          </Link>
        </div>

        <Card className="p-8 bg-white">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Funcionalidades Principais</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-600 text-white font-bold">12</div>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">KPIs Executivos</h3>
                <p className="mt-2 text-gray-600 text-sm">Pipelined, Pricing, Up Selling, Committed, Net Lost, Total USD</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-indigo-600 text-white font-bold">14</div>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">Filtros Avançados</h3>
                <p className="mt-2 text-gray-600 text-sm">Range USD, Stage, Revenda, Territory, Budgetary, Date Range</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-amber-600 text-white font-bold">8</div>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">Gráficos Analíticos</h3>
                <p className="mt-2 text-gray-600 text-sm">Stage Distribution, Top Revendas, Territory, Trends, Win Rate</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-emerald-600 text-white font-bold">19</div>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">Campos de Análise</h3>
                <p className="mt-2 text-gray-600 text-sm">CPO ID, Part No, Vendor, USD, Probability, Close Date</p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <footer className="border-t border-slate-700 bg-slate-900/50 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center text-slate-400">
          <p>TD SYNNEX Pipeline UPP v2.0</p>
        </div>
      </footer>
    </div>
  );
}

