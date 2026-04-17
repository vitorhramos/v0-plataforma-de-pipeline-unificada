'use client';

import { useAppContext } from '@/context/AppContext';

export function DataDensityToggle() {
  const { dataCompactMode, toggleCompactMode } = useAppContext();

  return (
    <button
      onClick={toggleCompactMode}
      className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 text-gray-700"
      title={`Current: ${dataCompactMode ? 'Compact' : 'Comfortable'}`}
    >
      <div className="flex flex-col gap-0.5">
        <div className={`h-1 w-4 bg-gray-400 ${dataCompactMode ? 'opacity-100' : 'opacity-60'}`} />
        <div className={`h-1 w-4 bg-gray-400 ${dataCompactMode ? 'opacity-100' : 'opacity-60'}`} />
        <div className={`h-1 w-4 bg-gray-400 ${dataCompactMode ? 'opacity-100' : 'opacity-60'}`} />
      </div>
    </button>
  );
}
