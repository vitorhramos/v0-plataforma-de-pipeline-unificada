'use client';

import { useEffect } from 'react';

interface ShortcutConfig {
  key: string; // e.g., 'ctrl+e', 'ctrl+f', 'ctrl+z'
  handler: () => void;
  description?: string;
}

export function useKeyboardShortcuts(shortcuts: ShortcutConfig[]) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      const ctrl = event.ctrlKey || event.metaKey; // Support Cmd on Mac
      const shift = event.shiftKey;

      for (const shortcut of shortcuts) {
        const parts = shortcut.key.toLowerCase().split('+');
        let matches = true;

        for (const part of parts) {
          if (part === 'ctrl' && !ctrl) matches = false;
          else if (part === 'shift' && !shift) matches = false;
          else if (part === key && (key.length === 1 ? key : key === part)) continue;
          else if (part !== key) matches = false;
        }

        if (matches) {
          event.preventDefault();
          shortcut.handler();
          return;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts]);
}
