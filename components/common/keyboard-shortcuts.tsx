'use client';

import { useEffect } from 'react';

const KEYBOARD_SHORTCUTS = [
  { keys: 'Ctrl+E', action: 'Export dados' },
  { keys: 'Ctrl+S', action: 'Salvar alterações' },
  { keys: 'Ctrl+F', action: 'Abrir filtros' },
  { keys: 'Ctrl+Z', action: 'Desfazer' },
  { keys: 'Ctrl+Y', action: 'Refazer' },
  { keys: '/', action: 'Abrir search global' },
  { keys: 'Esc', action: 'Fechar dialog' },
];

export function useKeyboardShortcuts(handlers: Record<string, () => void>) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = `${e.ctrlKey ? 'Ctrl+' : ''}${e.shiftKey ? 'Shift+' : ''}${e.key.toUpperCase()}`;
      
      if (key === 'CTRL+E') {
        e.preventDefault();
        handlers['export']?.();
      } else if (key === 'CTRL+S') {
        e.preventDefault();
        handlers['save']?.();
      } else if (key === 'CTRL+F') {
        e.preventDefault();
        handlers['filter']?.();
      } else if (key === 'CTRL+Z') {
        e.preventDefault();
        handlers['undo']?.();
      } else if (key === 'CTRL+Y') {
        e.preventDefault();
        handlers['redo']?.();
      } else if (e.key === '/') {
        e.preventDefault();
        handlers['search']?.();
      } else if (e.key === 'Escape') {
        handlers['close']?.();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handlers]);
}

export function KeyboardShortcutsHelp() {
  return (
    <div className="space-y-2">
      {KEYBOARD_SHORTCUTS.map((shortcut, idx) => (
        <div key={idx} className="flex items-center justify-between text-sm">
          <span className="text-gray-600">{shortcut.action}</span>
          <kbd className="px-2 py-1 bg-gray-100 border border-gray-300 rounded text-xs font-mono">
            {shortcut.keys}
          </kbd>
        </div>
      ))}
    </div>
  );
}
