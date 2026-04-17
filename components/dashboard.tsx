'use client';

import GlobalNavigation from './global-navigation';
import { Card } from '@/components/ui/card';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const kpiData = [
  { label: 'Pipelined', value: '$2.5M', color: 'bg-blue-100 text-blue-700' },
  { label: 'Not Classified', value: '$1.2M', color: 'bg-yellow-100 text-yellow-700' },
  { label: 'Pricing 25%', value: '$890K', color: 'bg-purple-100 text-purple-700' },
  { label: 'Up Selling 50%', value: '$1.5M', color: 'bg-indigo-100 text-indigo-700' },
  { label: 'Committed 75%', value: '$3.2M', color: 'bg-green-100 text-green-700' },
  { label: 'Net Lost', value: '$420K', color: 'bg-red-100 text-red-700' },
];

const stageData = [
  { stage: 'Pipelined', value: 45 },
  { stage: 'Pricing', value: 28 },
  { stage: 'UpSelling', value: 18 },
  { stage: 'Committed', value: 65 },
  { stage: 'Lost', value: 12 },
];

const manufacturerData = [
  { name: 'Cisco', value: 45 },
  { name: 'HPE', value: 30 },
  { name: 'VMware', value: 25 },
  { name: 'NetApp', value: 18 },
  { name: 'Dell', value: 12 },
];

const trendData = [
  { month: 'Jan', value: 1200 },
  { month: 'Feb', value: 1900 },
  { month: 'Mar', value: 1600 },
  { month: 'Apr', value: 2200 },
  { month: 'May', value: 2800 },
  { month: 'Jun', value: 3200 },
];

const COLORS = ['#3b82f6', '#f59e0b', '#8b5cf6', '#6366f1', '#10b981'];

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gray-50">
      <GlobalNavigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Executivo</h1>
          <p className="text-gray-600 mt-2">Visão consolidada de KPIs e análise de pipeline</p>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {kpiData.map((kpi) => (
            <Card key={kpi.label} className={`p-6 ${kpi.color} bg-opacity-10`}>
              <p className="text-sm font-medium text-gray-600">{kpi.label}</p>
              <p className="text-2xl font-bold mt-2">{kpi.value}</p>
            </Card>
          ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Stage Distribution */}
          <Card className="p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Distribuição por Estágio</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stageData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="stage" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* Manufacturer Distribution */}
          <Card className="p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Top 5 Fabricantes</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={manufacturerData} cx="50%" cy="50%" labelLine={false} label dataKey="value">
                  {manufacturerData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>

          {/* Pipeline Trend */}
          <Card className="p-6 lg:col-span-2">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Evolução do Pipeline (6 meses)</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} dot={{ fill: '#3b82f6' }} />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </div>
      </main>
    </div>
  );
}
