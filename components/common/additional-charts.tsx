'use client';

import { BarChart, Bar, LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card } from '@/components/ui/card';

export function AdditionalCharts() {
  const probabilityData = [
    { name: '0-20%', value: 45 },
    { name: '20-40%', value: 67 },
    { name: '40-60%', value: 89 },
    { name: '60-80%', value: 120 },
    { name: '80-100%', value: 156 },
  ];

  const vendorTrendData = [
    { name: 'Jan', vendorX: 12, vendorY: 18, vendorZ: 8 },
    { name: 'Feb', vendorX: 15, vendorY: 21, vendorZ: 11 },
    { name: 'Mar', vendorX: 18, vendorY: 19, vendorZ: 14 },
    { name: 'Apr', vendorX: 22, vendorY: 25, vendorZ: 16 },
    { name: 'May', vendorX: 28, vendorY: 32, vendorZ: 20 },
    { name: 'Jun', vendorX: 35, vendorY: 38, vendorZ: 25 },
  ];

  const winRateData = [
    { name: 'Jan', rate: 62 },
    { name: 'Feb', rate: 65 },
    { name: 'Mar', rate: 63 },
    { name: 'Apr', rate: 68 },
    { name: 'May', rate: 71 },
    { name: 'Jun', rate: 75 },
  ];

  const quoteCountData = [
    { name: 'Week 1', count: 45 },
    { name: 'Week 2', count: 52 },
    { name: 'Week 3', count: 58 },
    { name: 'Week 4', count: 72 },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="p-6 bg-white">
        <h3 className="text-sm font-bold text-gray-900 mb-4">Quote Distribution by Probability</h3>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={probabilityData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="name" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip />
            <Bar dataKey="value" fill="#06b6d4" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <Card className="p-6 bg-white">
        <h3 className="text-sm font-bold text-gray-900 mb-4">Vendor Performance Trend (6 months)</h3>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={vendorTrendData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="name" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip />
            <Line type="monotone" dataKey="vendorX" stroke="#3b82f6" strokeWidth={2} name="Vendor X" />
            <Line type="monotone" dataKey="vendorY" stroke="#f59e0b" strokeWidth={2} name="Vendor Y" />
            <Line type="monotone" dataKey="vendorZ" stroke="#10b981" strokeWidth={2} name="Vendor Z" />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      <Card className="p-6 bg-white">
        <h3 className="text-sm font-bold text-gray-900 mb-4">Win Rate Trend</h3>
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={winRateData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="name" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} domain={[0, 100]} />
            <Tooltip formatter={(value) => `${value}%`} />
            <Area type="monotone" dataKey="rate" fill="#8b5cf6" stroke="#8b5cf6" fillOpacity={0.3} />
          </AreaChart>
        </ResponsiveContainer>
      </Card>

      <Card className="p-6 bg-white">
        <h3 className="text-sm font-bold text-gray-900 mb-4">Quote Count by Week</h3>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={quoteCountData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="name" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip />
            <Bar dataKey="count" fill="#ec4899" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}
