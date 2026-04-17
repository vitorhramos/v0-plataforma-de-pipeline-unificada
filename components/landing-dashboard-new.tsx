'use client';

import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card } from '@/components/ui/card';

interface FilterState {
  valueRange: [number, number];
  selectedVendors: string[];
  selectedResellers: string[];
  selectedTerritory: string[];
  selectedBU: string[];
  selectedStatus: string[];
  dateRangeStart?: string;
  dateRangeEnd?: string;
}

interface KPIData {
  pipelined: number;
  notClassified: number;
  pricing25: number;
  upSelling50: number;
  committed75: number;
  netLost: number;
}

interface ChartDataPoint {
  name: string;
  value: number;
}

export default function LandingDashboard() {
  const [filters, setFilters] = useState<FilterState>({
    valueRange: [0, 500000],
    selectedVendors: [],
    selectedResellers: [],
    selectedTerritory: [],
    selectedBU: [],
    selectedStatus: [],
  });

  const [showFilters, setShowFilters] = useState(false);

  // Mock data - in production this comes from the API
  const kpiData: KPIData = {
    pipelined: 1045000,
    notClassified: 125000,
    pricing25: 286000,
    upSelling50: 365000,
    committed75: 394000,
    netLost: 63000,
  };

  const top10Resellers: ChartDataPoint[] = [
    { name: 'Tech Reseller Inc', value: 125000 },
    { name: 'Enterprise Solutions', value: 85000 },
    { name: 'Network Plus', value: 225000 },
    { name: 'Tech Consulting', value: 150000 },
    { name: 'Business Tech Dist', value: 65000 },
    { name: 'Cloud Solutions Ltd', value: 200000 },
    { name: 'Office Equipment', value: 35000 },
    { name: 'Digital Transform Inc', value: 110000 },
    { name: 'Data Storage Experts', value: 320000 },
    { name: 'Network Innovation', value: 180000 },
  ];

  const top10Vendors: ChartDataPoint[] = [
    { name: 'NetApp', value: 320000 },
    { name: 'Arista', value: 180000 },
    { name: 'VMware', value: 200000 },
    { name: 'HPE', value: 125000 },
    { name: 'IBM', value: 150000 },
    { name: 'Dell', value: 85000 },
    { name: 'Cisco', value: 45000 },
    { name: 'Lenovo', value: 65000 },
    { name: 'Microsoft', value: 110000 },
    { name: 'Canon', value: 35000 },
  ];

  const monthlyEvolution: ChartDataPoint[] = [
    { name: 'Jan', value: 450000 },
    { name: 'Feb', value: 595000 },
    { name: 'Mar', value: 625000 },
  ];

  const stageDistribution: ChartDataPoint[] = [
    { name: 'Committed (75%)', value: 394000 },
    { name: 'Up Selling (50%)', value: 365000 },
    { name: 'Pricing (25%)', value: 286000 },
  ];

  const expiringRanges: ChartDataPoint[] = [
    { name: '0-30 days', value: 185000 },
    { name: '30-60 days', value: 220000 },
    { name: '60-90 days', value: 195000 },
    { name: '90+ days', value: 445000 },
  ];

  const clearFilters = useCallback(() => {
    setFilters({
      valueRange: [0, 500000],
      selectedVendors: [],
      selectedResellers: [],
      selectedTerritory: [],
      selectedBU: [],
      selectedStatus: [],
    });
  }, []);

  const COLORS = ['#3b82f6', '#1d4ed8', '#0c2340', '#2563eb', '#1e40af', '#1e3a8a'];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Pipeline Executive Dashboard</h1>
        <p className="text-gray-600 mt-2">Visão consolidada do pipeline comercial TD SYNNEX</p>
      </div>

      {/* Filters Section */}
      <div className="mb-8">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          <span>Slicers</span>
        </button>

        {showFilters && (
          <div className="mt-4 p-4 bg-white border border-gray-200 rounded-lg space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Range de Valores (USD)</label>
                <Input
                  type="number"
                  placeholder="Min"
                  className="mt-1"
                  onChange={(e) => setFilters({ ...filters, valueRange: [parseInt(e.target.value) || 0, filters.valueRange[1]] })}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Revendas/Canais</label>
                <Input type="text" placeholder="Buscar..." className="mt-1" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Fabricantes</label>
                <Input type="text" placeholder="Buscar..." className="mt-1" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Território AM</label>
                <Input type="text" placeholder="Buscar..." className="mt-1" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">BU de Vendas</label>
                <Input type="text" placeholder="Buscar..." className="mt-1" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Status da Cotação</label>
                <Input type="text" placeholder="Buscar..." className="mt-1" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">PO ID</label>
                <Input type="text" placeholder="Buscar..." className="mt-1" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Renovação</label>
                <Input type="text" placeholder="Buscar..." className="mt-1" />
              </div>
            </div>
            <Button onClick={clearFilters} variant="outline" className="w-full">Limpar Filtros</Button>
          </div>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        <Card className="p-4 bg-white">
          <p className="text-xs font-semibold text-gray-600 uppercase">Pipelined</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">${(kpiData.pipelined / 1000).toFixed(0)}K</p>
        </Card>
        <Card className="p-4 bg-white">
          <p className="text-xs font-semibold text-gray-600 uppercase">Not Classified</p>
          <p className="text-2xl font-bold text-yellow-600 mt-2">${(kpiData.notClassified / 1000).toFixed(0)}K</p>
        </Card>
        <Card className="p-4 bg-white">
          <p className="text-xs font-semibold text-gray-600 uppercase">Pricing 25%</p>
          <p className="text-2xl font-bold text-blue-400 mt-2">${(kpiData.pricing25 / 1000).toFixed(0)}K</p>
        </Card>
        <Card className="p-4 bg-white">
          <p className="text-xs font-semibold text-gray-600 uppercase">Up Selling 50%</p>
          <p className="text-2xl font-bold text-blue-600 mt-2">${(kpiData.upSelling50 / 1000).toFixed(0)}K</p>
        </Card>
        <Card className="p-4 bg-white">
          <p className="text-xs font-semibold text-gray-600 uppercase">Committed 75%</p>
          <p className="text-2xl font-bold text-green-600 mt-2">${(kpiData.committed75 / 1000).toFixed(0)}K</p>
        </Card>
        <Card className="p-4 bg-white">
          <p className="text-xs font-semibold text-gray-600 uppercase">Net Lost</p>
          <p className="text-2xl font-bold text-red-600 mt-2">${(kpiData.netLost / 1000).toFixed(0)}K</p>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Top 10 Resellers */}
        <Card className="p-6 bg-white">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Top 10 Revendas em Pipeline</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={top10Resellers}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} interval={0} tick={{ fontSize: 12 }} />
              <YAxis />
              <Tooltip formatter={(value) => `$${value}`} />
              <Bar dataKey="value" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Top 10 Vendors */}
        <Card className="p-6 bg-white">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Top 10 Fabricantes em Pipeline</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={top10Vendors}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} interval={0} tick={{ fontSize: 12 }} />
              <YAxis />
              <Tooltip formatter={(value) => `$${value}`} />
              <Bar dataKey="value" fill="#1d4ed8" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Monthly Evolution */}
        <Card className="p-6 bg-white">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Evolução Mensal (USD)</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyEvolution}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value) => `$${value}`} />
              <Line type="monotone" dataKey="value" stroke="#2563eb" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Stage Distribution */}
        <Card className="p-6 bg-white">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Distribuição por Estágio</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={stageDistribution} cx="50%" cy="50%" labelLine={false} label={({ name, value }) => `${name}: $${value}`} outerRadius={80} fill="#8884d8" dataKey="value">
                {stageDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `$${value}`} />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        {/* Expiring Ranges */}
        <Card className="p-6 bg-white col-span-1 lg:col-span-2">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Cotações Próximas de Expirar (Ranges)</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={expiringRanges}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value) => `$${value}`} />
              <Legend />
              <Bar dataKey="value" fill="#f59e0b" name="Volume (USD)" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  );
}
