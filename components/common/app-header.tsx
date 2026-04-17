'use client';

import { useAppContext } from '@/context/AppContext';
import { UndoRedoToolbar } from './undo-redo-toolbar';
import { DataDensityToggle } from './data-density-toggle';
import { KeyboardHelp } from './keyboard-help';

export function AppHeader() {
  const { darkMode, toggleDarkMode, history } = useAppContext();

  return (
    <div className="sticky top-0 z-40 bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          {/* Left: Logo */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">U</span>
            </div>
            <h1 className="text-lg font-bold text-gray-900">Pipeline UPP</h1>
          </div>

          {/* Center: Undo/Redo Toolbar */}
          <div className="hidden md:flex">
            <UndoRedoToolbar />
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-3">
            {/* History Badge */}
            {history.length > 0 && (
              <div className="text-xs bg-blue-50 text-blue-700 px-3 py-1 rounded-full border border-blue-200">
                {history.length} action{history.length !== 1 ? 's' : ''}
              </div>
            )}

            {/* Density Toggle */}
            <DataDensityToggle />

            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 text-gray-700"
              title={darkMode ? 'Light mode' : 'Dark mode'}
            >
              {darkMode ? (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 3v1m0 16v1m9-9h-1m-16 0H1m15.364 1.636l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
              )}
            </button>

            {/* Keyboard Help */}
            <KeyboardHelp />
          </div>
        </div>
      </div>
    </div>
  );
}
