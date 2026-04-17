'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

let toastId = 0;
let listeners: ((toast: Toast) => void)[] = [];

export function useToast() {
  return {
    success: (message: string) => {
      const id = String(toastId++);
      const toast = { id, message, type: 'success' as const };
      listeners.forEach(l => l(toast));
    },
    error: (message: string) => {
      const id = String(toastId++);
      const toast = { id, message, type: 'error' as const };
      listeners.forEach(l => l(toast));
    },
    info: (message: string) => {
      const id = String(toastId++);
      const toast = { id, message, type: 'info' as const };
      listeners.forEach(l => l(toast));
    },
    warning: (message: string) => {
      const id = String(toastId++);
      const toast = { id, message, type: 'warning' as const };
      listeners.forEach(l => l(toast));
    },
  };
}

export function ToastContainer() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    const handler = (toast: Toast) => {
      setToasts(prev => [...prev, toast]);
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== toast.id));
      }, 3000);
    };

    listeners.push(handler);
    return () => {
      listeners = listeners.filter(l => l !== handler);
    };
  }, []);

  const bgColors = {
    success: 'bg-green-50 border-green-200',
    error: 'bg-red-50 border-red-200',
    info: 'bg-blue-50 border-blue-200',
    warning: 'bg-yellow-50 border-yellow-200',
  };

  const textColors = {
    success: 'text-green-800',
    error: 'text-red-800',
    info: 'text-blue-800',
    warning: 'text-yellow-800',
  };

  const iconColors = {
    success: 'text-green-600',
    error: 'text-red-600',
    info: 'text-blue-600',
    warning: 'text-yellow-600',
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2 max-w-sm">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className={`${bgColors[toast.type]} border rounded-lg p-4 flex items-start gap-3 animate-slideIn`}
        >
          <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${iconColors[toast.type]}`}>
            {toast.type === 'success' && '✓'}
            {toast.type === 'error' && '✕'}
            {toast.type === 'info' && 'ℹ'}
            {toast.type === 'warning' && '⚠'}
          </div>
          <p className={`text-sm font-medium ${textColors[toast.type]} flex-1`}>{toast.message}</p>
          <button
            onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
            className="text-gray-400 hover:text-gray-600 transition flex-shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
