'use client';

import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Download, Filter, RotateCcw } from 'lucide-react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface Quote {
  id: number;
  cpo_id: string;
  master_customer_name: string;
  cif_value: number;
  probability_percentage: number;
  quote_stage: string;
  close_date: string;
  is_lost: boolean;
  vendor_name: string;
}

const mockData: Quote[] = [
  {
    id: 1,
    cpo_id: 'CPO-2024-001',
    master_customer_name: 'Revenda ABC',
    cif_value: 250000,
    probability_percentage: 75,
    quote_stage: '75%',
    close_date: '2024-04-30',
    is_lost: false,
    vendor_name: 'Dell',
  },
  {
    id: 2,
    cpo_id: 'CPO-2024-002',
    master_customer_name: 'Revenda XYZ',
    cif_value: 180000,
    probability_percentage: 50,
    quote_stage: '50%',
    close_date: '2024-05-15',
    is_lost: false,
    vendor_name: 'HP',
  },
  {
    id: 3,
    cpo_id: 'CPO-2024-003',
    master_customer_name: 'Revenda Global',
    cif_value: 95000,
    probability_percentage: 25,
    quote_stage: '25%',
    close_date: '2024-06-01',
    is_lost: false,
    vendor_name: 'Lenovo',
  },
  {
    id: 4,
    cpo_id: 'CPO-2024-004',
    master_customer_name: 'Revenda Master',
    cif_value: 320000,
    probability_percentage: 75,
    quote_stage: '75%',
    close_date: '2024-04-15',
    is_lost: false,
    vendor_name: 'Cisco',
  },
  {
    id: 5,
    cpo_id: 'CPO-2024-005',
    master_customer_name: 'Revenda Tech',
    cif_value: 450000,
    probability_percentage: 50,
    quote_stage: '50%',
    close_date: '2024-05-20',
    is_lost: false,
    vendor_name: 'EMC',
  },
];

export function LandingPageDashboard() {
  const [selectedReseller, setSelectedReseller] = useState<string>('');
  const [selectedVendor, setSelectedVendor] = useState<string>('');

  const filteredData = useMemo(() => {
    return mockData.filter((item) => {
      const matchReseller = !selectedReseller || item.master_customer_name.includes(selectedReseller);
      const matchVendor = !selectedVendor || item.vendor_name.includes(selectedVendor);
      return matchReseller && matchVendor;
    });
  }, [selectedReseller, selectedVendor]);

  const totalValues = useMemo(() => {
    const all = mockData.reduce((sum, item) => sum + item.cif_value, 0);
    const classified = mockData.filter((item) => !item.is_lost).reduce((sum, item) => sum + item.cif_value, 0);
    const committed = mockData.filter((item) => item.probability_percentage === 75).reduce((sum, item) => sum + item.cif_value, 0);
    const upSelling = mockData.filter((item) => item.probability_percentage === 50).reduce((sum, item) => sum + item.cif_value, 0);
    const pricing = mockData.filter((item) => item.probability_percentage === 25).reduce((sum, item) => sum + item.cif_value, 0);
    const lost = mockData.filter((item) => item.is_lost).reduce((sum, item) => sum + item.cif_value, 0);

    return { all, classified, committed, upSelling, pricing, lost };
  }, []);

  const resellerData = useMemo(() => {
    const grouped = mockData.reduce((acc, item) => {
      const existing = acc.find((x) => x.name === item.master_customer_name);
      if (existing) {
        existing.value += item.cif_value;
      } else {
        acc.push({ name: item.master_customer_name, value: item.cif_value });
      }
      return acc;
    }, [] as Array<{ name: string; value: number }>);
    return grouped.sort((a, b) => b.value - a.value).slice(0, 10);
  }, []);

  const vendorData = useMemo(() => {
    const grouped = mockData.reduce((acc, item) => {
      const existing = acc.find((x) => x.name === item.vendor_name);
      if (existing) {
        existing.value += item.cif_value;
      } else {
        acc.push({ name: item.vendor_name, value: item.cif_value });
      }
      return acc;
    }, [] as Array<{ name: string; value: number }>);
    return grouped.sort((a, b) => b.value - a.value).slice(0, 5);
  }, []);

  const stageDistribution = [
    { name: '75% (Committed)', value: totalValues.committed, fill: '#059669' },
    { name: '50% (Up Selling)', value: totalValues.upSelling, fill: '#3b82f6' },
    { name: '25% (Pricing)', value: totalValues.pricing, fill: '#f59e0b' },
    { name: 'Lost', value: totalValues.lost, fill: '#ef4444' },
  ];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(
      value,
    );
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">Filtros</h3>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSelectedReseller('');
              setSelectedVendor('');
            }}
            className="flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Limpar
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-2">Revendas/Canais</label>
            <Input
              placeholder="Filtrar revenda..."
              value={selectedReseller}
              onChange={(e) => setSelectedReseller(e.target.value)}
              className="border-gray-300"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-2">Fabricantes</label>
            <Input
              placeholder="Filtrar fabricante..."
              value={selectedVendor}
              onChange={(e) => setSelectedVendor(e.target.value)}
              className="border-gray-300"
            />
          </div>
        </div>
      </Card>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6">
          <p className="text-sm text-gray-600 mb-1">Total Classificado</p>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalValues.classified)}</p>
        </Card>
        <Card className="p-6">
          <p className="text-sm text-gray-600 mb-1">Committed (75%)</p>
          <p className="text-2xl font-bold text-green-600">{formatCurrency(totalValues.committed)}</p>
        </Card>
        <Card className="p-6">
          <p className="text-sm text-gray-600 mb-1">Up Selling (50%)</p>
          <p className="text-2xl font-bold text-blue-600">{formatCurrency(totalValues.upSelling)}</p>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top 10 Revendas */}
        <Card className="p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Top 10 Revendas</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={resellerData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} angle={-45} textAnchor="end" height={80} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip formatter={(value: number) => formatCurrency(value)} />
              <Bar dataKey="value" fill="#3b82f6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Distribuição por Estágio */}
        <Card className="p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Distribuição por Estágio</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={stageDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${formatCurrency(value)}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {stageDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => formatCurrency(value)} />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Top Fabricantes */}
      <Card className="p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Volume por Fabricante</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={vendorData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis type="number" tick={{ fontSize: 12 }} />
            <YAxis dataKey="name" type="category" tick={{ fontSize: 12 }} width={80} />
            <Tooltip formatter={(value: number) => formatCurrency(value)} />
            <Bar dataKey="value" fill="#10b981" radius={[0, 8, 8, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}
