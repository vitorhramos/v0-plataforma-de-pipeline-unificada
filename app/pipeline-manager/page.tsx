'use client';

import Link from 'next/link';
import { useState } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card } from '@/components/ui/card';

const mockData = {
  revendas: [
    { name: 'Revenda A', value: 24500000 },
    { name: 'Revenda B', value: 18900000 },
    { name: 'Revenda C', value: 15600000 },
    { name: 'Revenda D', value: 12300000 },
    { name: 'Revenda E', value: 10200000 },
  ],
  vendors: [
    { name: 'Vendor X', value: 35200000 },
    { name: 'Vendor Y', value: 28900000 },
    { name: 'Vendor Z', value: 15600000 },
  ],
  stageDistribution: [
    { name: 'Pricing', value: 32100000 },
    { name: 'Up Selling', value: 28900000 },
    { name: 'Committed', value: 18500000 },
  ],
  monthlyTrend: [
    { name: 'Jan', committed: 5200000, upselling: 8900000, pricing: 12500000 },
    { name: 'Feb', committed: 6100000, upselling: 9800000, pricing: 13200000 },
    { name: 'Mar', committed: 5800000, upselling: 9200000, pricing: 12600000 },
    { name: 'Apr', committed: 7200000, upselling: 10500000, pricing: 14800000 },
    { name: 'May', committed: 8100000, upselling: 11300000, pricing: 15200000 },
    { name: 'Jun', committed: 9500000, upselling: 12800000, pricing: 16000000 },
  ],
};

export default function PipelineManagerPage() {
  const [view, setView] = useState<'charts' | 'table'>('charts');

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="sticky top-0 z-40 bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="font-bold text-blue-600 hover:text-blue-700">← Home</Link>
            <h1 className="text-2xl font-bold text-gray-900">Pipeline Manager</h1>
          </div>
          <div className="flex gap-2">
            <Link href="/dashboard" className="px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition">
              Dashboard
            </Link>
            <Link href="/pipeline-details" className="px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition">
              Details
            </Link>
            <Link href="/batch-query" className="px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition">
              Batch
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <Card className="p-6 bg-white border-t-4 border-t-indigo-600">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900">Toggle View</h2>
            <div className="flex gap-2">
              <button
                onClick={() => setView('charts')}
                className={`px-4 py-2 rounded text-sm font-medium transition ${
                  view === 'charts'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                📊 Gráficos
              </button>
              <button
                onClick={() => setView('table')}
                className={`px-4 py-2 rounded text-sm font-medium transition ${
                  view === 'table'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                📋 Tabela
              </button>
            </div>
          </div>
        </Card>

        {view === 'charts' ? (
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="p-6 bg-white">
                <h3 className="text-sm font-bold text-gray-900 mb-4">Volume por Revenda (Top 10)</h3>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={mockData.revendas} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" tick={{ fontSize: 11 }} />
                    <YAxis dataKey="name" type="category" width={90} tick={{ fontSize: 10 }} />
                    <Tooltip formatter={(value) => `$${(value / 1000000).toFixed(1)}M`} />
                    <Bar dataKey="value" fill="#8b5cf6" radius={[0, 8, 8, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Card>

              <Card className="p-6 bg-white">
                <h3 className="text-sm font-bold text-gray-900 mb-4">Volume por Fabricante</h3>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={mockData.vendors}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-45} height={80} tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip formatter={(value) => `$${(value / 1000000).toFixed(1)}M`} />
                    <Bar dataKey="value" fill="#f59e0b" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            </div>

            <Card className="p-6 bg-white">
              <h3 className="text-sm font-bold text-gray-900 mb-4">Distribuição de Stages (6 meses)</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={mockData.monthlyTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => `$${(value / 1000000).toFixed(1)}M`} />
                  <Line type="monotone" dataKey="committed" stroke="#10b981" strokeWidth={2} name="Committed" />
                  <Line type="monotone" dataKey="upselling" stroke="#f59e0b" strokeWidth={2} name="Up Selling" />
                  <Line type="monotone" dataKey="pricing" stroke="#3b82f6" strokeWidth={2} name="Pricing" />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          </div>
        ) : (
          <Card className="overflow-hidden bg-white">
            <div className="p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Pipeline Summary Table</h3>
              <p className="text-gray-600 text-sm">Table view would show the same detailed data as Pipeline Details page with 19 columns and filtering options.</p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
