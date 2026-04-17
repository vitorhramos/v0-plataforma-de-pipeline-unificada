'use client';

import { useAppContext } from '@/context/AppContext';

export function NotificationCenter() {
  const { notifications, removeNotification } = useAppContext();

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2 max-w-md">
      {notifications.map(notif => (
        <div
          key={notif.id}
          className={`p-4 rounded-lg shadow-lg text-white animate-slide-in ${
            notif.type === 'success'
              ? 'bg-green-500'
              : notif.type === 'error'
                ? 'bg-red-500'
                : 'bg-blue-500'
          }`}
        >
          <div className="flex items-center justify-between">
            <span>{notif.message}</span>
            <button onClick={() => removeNotification(notif.id)} className="ml-4 text-white hover:text-gray-200">
              ✕
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
