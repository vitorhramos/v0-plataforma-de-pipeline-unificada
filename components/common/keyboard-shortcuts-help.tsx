'use client';

import { useState } from 'react';
import { X } from 'lucide-react';

export function KeyboardShortcutsHelp() {
  const [open, setOpen] = useState(false);

  const shortcuts = [
    { key: 'Cmd+K', action: 'Open search' },
    { key: 'Cmd+E', action: 'Export data' },
    { key: 'Cmd+Z', action: 'Undo' },
    { key: 'Cmd+Shift+Z', action: 'Redo' },
    { key: 'Cmd+Shift+F', action: 'Focus mode' },
    { key: 'Escape', action: 'Close modal' },
  ];

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-4 right-4 p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition shadow-lg"
        title="Keyboard shortcuts (Cmd+Shift+?)"
      >
        ?
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-md w-full animate-slide-in">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-lg font-bold">Keyboard Shortcuts</h2>
          <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 py-4 space-y-3">
          {shortcuts.map(shortcut => (
            <div key={shortcut.key} className="flex items-center justify-between">
              <span className="text-gray-600">{shortcut.action}</span>
              <kbd className="px-3 py-1 bg-gray-100 border border-gray-300 rounded text-sm font-mono">
                {shortcut.key}
              </kbd>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
