'use client';

import { useState } from 'react';

const KEYBOARD_SHORTCUTS = [
  { key: 'Ctrl+E', action: 'Export data to CSV' },
  { key: 'Ctrl+F', action: 'Focus on filter' },
  { key: 'Ctrl+Z', action: 'Undo last action' },
  { key: 'Ctrl+Shift+Z', action: 'Redo action' },
  { key: '?', action: 'Show this help' },
];

export function KeyboardHelp() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="p-2 rounded-lg hover:bg-gray-100 text-gray-600"
        title="Keyboard shortcuts"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
        </svg>
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full">
            <div className="p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Keyboard Shortcuts</h2>
              <div className="space-y-3">
                {KEYBOARD_SHORTCUTS.map(({ key, action }) => (
                  <div key={key} className="flex justify-between">
                    <span className="text-gray-600">{action}</span>
                    <kbd className="px-2 py-1 bg-gray-100 rounded border border-gray-300 text-sm font-mono">
                      {key}
                    </kbd>
                  </div>
                ))}
              </div>
              <button
                onClick={() => setOpen(false)}
                className="mt-6 w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
