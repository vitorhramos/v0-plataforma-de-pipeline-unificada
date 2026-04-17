'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface Quote {
  cpo_id: string;
  part_number: string;
  sales_terr: string;
  team: string;
  vendor: string;
  master_customer: string;
  customer: string;
  end_user: string;
  cif: number;
  net: number;
  fob: number;
  gm: number;
  probability_stage: string;
  lost: boolean;
  created_date: string;
  close_date: string;
  cpo_no: string;
  payment_method_name: string;
  opportunity_name: string;
  product_type: string;
  vpc_code: string;
  renew: boolean;
  po_comments: string;
}

const mockQuotes: Quote[] = [
  {
    cpo_id: 'PO-2024-001',
    part_number: 'HPE-SRV-001',
    sales_terr: 'AM01',
    team: 'Team A',
    vendor: 'HPE',
    master_customer: 'Tech Reseller Inc',
    customer: 'Tech Reseller Inc',
    end_user: 'Global Corp',
    cif: 125000,
    net: 95000,
    fob: 72000,
    gm: 18.5,
    probability_stage: '75',
    lost: false,
    created_date: '2024-01-15',
    close_date: '2024-02-28',
    cpo_no: 'CPO-001',
    payment_method_name: 'Credit Card',
    opportunity_name: 'Large Migration Project',
    product_type: 'HW',
    vpc_code: 'CAT-001',
    renew: false,
    po_comments: 'High priority account, closing this week',
  },
  {
    cpo_id: 'PO-2024-002',
    part_number: 'DELL-WRK-002',
    sales_terr: 'AM02',
    team: 'Team B',
    vendor: 'Dell',
    master_customer: 'Enterprise Solutions Ltd',
    customer: 'Enterprise Solutions Ltd',
    end_user: 'Finance Dept',
    cif: 85000,
    net: 68000,
    fob: 51000,
    gm: 14.2,
    probability_stage: '50',
    lost: false,
    created_date: '2024-01-20',
    close_date: '2024-03-15',
    cpo_no: 'CPO-002',
    payment_method_name: 'Net 30',
    opportunity_name: 'Workstation Refresh',
    product_type: 'HW',
    vpc_code: 'CAT-002',
    renew: true,
    po_comments: 'Waiting for budget approval',
  },
];

export default function PipelineDetails() {
  const [quotes, setQuotes] = useState<Quote[]>(mockQuotes);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  const filteredQuotes = quotes.filter((q) =>
    q.cpo_id.includes(searchTerm) ||
    q.opportunity_name.includes(searchTerm) ||
    q.master_customer.includes(searchTerm) ||
    q.vendor.includes(searchTerm)
  );

  const exportToExcel = () => {
    const headers = [
      'CPO_ID', 'Part Number', 'Sales Terr', 'Team', 'Vendor', 'Master Customer',
      'Customer', 'End User', 'CIF', 'NET', 'FOB', 'GM', 'Probability Stage',
      'Lost', 'Created Date', 'Close Date', 'CPO No', 'Payment Method',
      'Opportunity Name', 'Product Type', 'VPC Code', 'Renew', 'PO Comments'
    ];

    const rows = filteredQuotes.map((q) => [
      q.cpo_id, q.part_number, q.sales_terr, q.team, q.vendor, q.master_customer,
      q.customer, q.end_user, q.cif, q.net, q.fob, q.gm, q.probability_stage,
      q.lost ? 'Yes' : 'No', q.created_date, q.close_date, q.cpo_no,
      q.payment_method_name, q.opportunity_name, q.product_type, q.vpc_code,
      q.renew ? 'Yes' : 'No', q.po_comments
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'pipeline-details.csv';
    a.click();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Pipeline Details</h1>
        <p className="text-gray-600 mt-2">Visão analítica linha a linha do pipeline comercial</p>
      </div>

      {/* Search and Export */}
      <div className="mb-8 flex gap-4">
        <input
          type="text"
          placeholder="Buscar por CPO ID, Oportunidade, Revenda ou Fabricante..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <Button onClick={exportToExcel} className="gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Exportar Excel
        </Button>
      </div>

      {/* Table */}
      <Card className="p-6 bg-white overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 border-b-2 border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">CPO ID</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">Part Number</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">Revenda</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">Fabricante</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">End User</th>
              <th className="px-4 py-3 text-right font-semibold text-gray-700">CIF</th>
              <th className="px-4 py-3 text-center font-semibold text-gray-700">Probability</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">Oportunidade</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">Close Date</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">Status</th>
              <th className="px-4 py-3 text-center font-semibold text-gray-700">Ações</th>
            </tr>
          </thead>
          <tbody>
            {filteredQuotes.map((quote) => (
              <tr key={quote.cpo_id} className="border-t border-gray-200 hover:bg-gray-50">
                <td className="px-4 py-3 font-mono text-blue-600 cursor-pointer hover:underline">{quote.cpo_id}</td>
                <td className="px-4 py-3 text-gray-700">{quote.part_number}</td>
                <td className="px-4 py-3 text-gray-700">{quote.master_customer}</td>
                <td className="px-4 py-3 text-gray-700">{quote.vendor}</td>
                <td className="px-4 py-3 text-gray-700 truncate max-w-xs">{quote.end_user}</td>
                <td className="px-4 py-3 text-right font-semibold text-gray-900">${(quote.cif / 1000).toFixed(0)}K</td>
                <td className="px-4 py-3 text-center">
                  <span className={`px-2 py-1 rounded-md text-xs font-semibold ${
                    quote.probability_stage === '75'
                      ? 'bg-green-100 text-green-800'
                      : quote.probability_stage === '50'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {quote.probability_stage}%
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-700 truncate max-w-xs">{quote.opportunity_name}</td>
                <td className="px-4 py-3 text-gray-700">{quote.close_date}</td>
                <td className="px-4 py-3">
                  {quote.lost ? (
                    <span className="px-2 py-1 rounded-md text-xs font-semibold bg-red-100 text-red-800">Lost</span>
                  ) : (
                    <span className="px-2 py-1 rounded-md text-xs font-semibold bg-green-100 text-green-800">Active</span>
                  )}
                </td>
                <td className="px-4 py-3 text-center">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setEditingId(editingId === quote.cpo_id ? null : quote.cpo_id)}
                  >
                    {editingId === quote.cpo_id ? 'Fechar' : 'Editar'}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {/* Detail View */}
      {editingId && (
        <Card className="mt-8 p-6 bg-white">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Detalhes da Cotação</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredQuotes
              .filter((q) => q.cpo_id === editingId)
              .map((quote) => (
                <React.Fragment key={quote.cpo_id}>
                  <div>
                    <label className="text-sm font-semibold text-gray-700">CPO ID</label>
                    <input
                      type="text"
                      value={quote.cpo_id}
                      disabled
                      className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-700">Opportunity Name</label>
                    <input
                      type="text"
                      defaultValue={quote.opportunity_name}
                      className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-700">Probability Stage</label>
                    <select
                      defaultValue={quote.probability_stage}
                      className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="25">25% - Pricing</option>
                      <option value="50">50% - Up Selling</option>
                      <option value="75">75% - Committed</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-700">Close Date</label>
                    <input
                      type="date"
                      defaultValue={quote.close_date}
                      className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-700">EU Company Name</label>
                    <input
                      type="text"
                      defaultValue={quote.end_user}
                      className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-700">
                      <input type="checkbox" defaultChecked={quote.lost} className="mr-2" />
                      Lost
                    </label>
                  </div>
                  <div className="lg:col-span-3">
                    <label className="text-sm font-semibold text-gray-700">PO Comments</label>
                    <textarea
                      defaultValue={quote.po_comments}
                      rows={3}
                      className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="lg:col-span-3 flex gap-2 mt-4">
                    <Button className="flex-1">Salvar Linha</Button>
                    <Button variant="outline" className="flex-1">Cancelar</Button>
                  </div>
                </React.Fragment>
              ))}
          </div>
        </Card>
      )}

      <p className="text-sm text-gray-600 mt-6">Total: {filteredQuotes.length} cotações</p>
    </div>
  );
}
