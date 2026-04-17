'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

export function ModeToggle() {
  const [focusMode, setFocusMode] = useState(false);
  const [showSimulation, setShowSimulation] = useState(false);

  return (
    <>
      <div className="flex gap-2">
        <button
          onClick={() => setFocusMode(!focusMode)}
          title="Hide sidebar and show only content"
          className={`px-3 py-1 rounded text-sm font-medium transition-all ${
            focusMode
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          {focusMode ? '◀ Exit Focus' : 'Focus Mode'}
        </button>
        <button
          onClick={() => setShowSimulation(true)}
          title="Preview changes without saving"
          className="px-3 py-1 bg-purple-100 text-purple-700 rounded text-sm font-medium hover:bg-purple-200 transition-all"
        >
          Simulation Mode
        </button>
      </div>

      <Dialog open={showSimulation} onOpenChange={setShowSimulation}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Simulation Mode</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-gray-700">
              Neste modo, todas as mudanças são feitas "a seco" (dry-run) sem ser persistidas. Você pode visualizar o impacto antes de confirmar.
            </p>
            <div className="p-4 bg-purple-50 border border-purple-200 rounded">
              <p className="font-semibold text-purple-900 mb-2">Impacto previsto:</p>
              <ul className="text-sm text-purple-800 space-y-1">
                <li>• 15 cotações seriam atualizadas</li>
                <li>• Total USD impactado: $2.3M</li>
                <li>• Mudanças em estágio, data de fechamento, etc</li>
              </ul>
            </div>
            <button className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-all">
              Confirmar e Aplicar de Verdade
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
