'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card } from '@/components/ui/card';

export function ProgressIndicator({ 
  current, 
  total, 
  label 
}: { 
  current: number;
  total: number;
  label: string;
}) {
  const percentage = Math.round((current / total) * 100);

  return (
    <Card className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50">
      <div className="flex items-center justify-between mb-2">
        <p className="font-semibold text-gray-900">{label}</p>
        <p className="text-sm text-gray-600">{current} de {total}</p>
      </div>
      <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 transition-all duration-300 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <p className="text-center mt-2 text-lg font-bold text-blue-700">{percentage}%</p>
    </Card>
  );
}
